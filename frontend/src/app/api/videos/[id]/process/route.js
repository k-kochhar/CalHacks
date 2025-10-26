import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const { origUrl } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    if (!origUrl) {
      return NextResponse.json(
        { error: 'Original URL is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("video-rows");
    const videosCollection = db.collection("videos");

    // Verify video exists and is in processing status
    const video = await videosCollection.findOne({ _id: id });
    
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    if (video.status !== "processing") {
      return NextResponse.json(
        { error: 'Video is not in processing status' },
        { status: 400 }
      );
    }

    if (!process.env.BASETEN_API_KEY) {
      return NextResponse.json(
        { error: 'Saliency API key not configured' },
        { status: 500 }
      );
    }

    // Call saliency model API
    const saliencyResponse = await fetch(
      process.env.BASETEN_API_URL,
      {
        method: "POST",
        headers: {
          "Authorization": `Api-Key ${process.env.BASETEN_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          video_url: origUrl
        }),
        timeout: 600000 // 10 minutes timeout
      }
    );

    if (!saliencyResponse.ok) {
      // Update status to failed
      await videosCollection.updateOne(
        { _id: id },
        { 
          $set: { 
            status: "failed",
            error: `Saliency API failed: ${saliencyResponse.status}`,
            updatedAt: new Date()
          } 
        }
      );

      return NextResponse.json(
        { error: 'Saliency model API failed' },
        { status: 500 }
      );
    }

    const saliencyData = await saliencyResponse.json();

    // Update video with results
    await videosCollection.updateOne(
      { _id: id },
      { 
        $set: { 
          status: "completed",
          saliencyResults: saliencyData,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Video processing completed',
      id: id,
      results: saliencyData
    });

  } catch (error) {
    console.error('Error processing video:', error);
    
    // Update status to failed
    try {
      const client = await clientPromise;
      const db = client.db("video-rows");
      const videosCollection = db.collection("videos");
      
      await videosCollection.updateOne(
        { _id: id },
        { 
          $set: { 
            status: "failed",
            error: error.message,
            updatedAt: new Date()
          } 
        }
      );
    } catch (updateError) {
      console.error('Error updating failed status:', updateError);
    }

    return NextResponse.json(
      { error: 'Video processing failed' },
      { status: 500 }
    );
  }
}
