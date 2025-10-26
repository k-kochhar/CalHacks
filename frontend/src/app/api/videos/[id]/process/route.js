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

    // Call FastAPI backend pipeline
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    const pipelineResponse = await fetch(
      `${fastApiUrl}/api/process-video`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          video_id: id,
          s3_url: origUrl
        })
      }
    );

    if (!pipelineResponse.ok) {
      const errorData = await pipelineResponse.json().catch(() => ({}));
      
      // Update status to failed
      await videosCollection.updateOne(
        { _id: id },
        { 
          $set: { 
            status: "failed",
            error: errorData.detail || `Pipeline failed: ${pipelineResponse.status}`,
            updatedAt: new Date()
          } 
        }
      );

      return NextResponse.json(
        { error: errorData.detail || 'Video processing pipeline failed' },
        { status: 500 }
      );
    }

    const pipelineData = await pipelineResponse.json();

    // Update video with results
    await videosCollection.updateOne(
      { _id: id },
      { 
        $set: { 
          status: "completed",
          optUrl: pipelineData.dropped_url,
          focalPointsSummary: pipelineData.focal_points_summary,
          performanceMetrics: pipelineData.performance_metrics,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Video processing completed',
      id: id,
      dropped_url: pipelineData.dropped_url,
      focal_points_summary: pipelineData.focal_points_summary,
      performance_metrics: pipelineData.performance_metrics
    });

  } catch (error) {
    console.error('Error processing video:', error);
    
    // Update status to failed
    try {
      const { id } = await params;
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
