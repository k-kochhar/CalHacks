import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { optUrl, saliencyResults } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("video-rows");
    const videosCollection = db.collection("videos");

    // Update video with completion data
    const result = await videosCollection.updateOne(
      { _id: id },
      { 
        $set: { 
          status: "completed",
          optUrl: optUrl,
          saliencyResults: saliencyResults,
          completedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Video marked as completed',
      id: id
    });
  } catch (error) {
    console.error('Error completing video:', error);
    return NextResponse.json(
      { error: 'Failed to complete video' },
      { status: 500 }
    );
  }
}
