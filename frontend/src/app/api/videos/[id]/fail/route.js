import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { error: errorMessage } = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("video-rows");
    const videosCollection = db.collection("videos");

    // Update video with failure data
    const result = await videosCollection.updateOne(
      { _id: id },
      { 
        $set: { 
          status: "failed",
          error: errorMessage || "Processing failed",
          failedAt: new Date(),
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
      message: 'Video marked as failed',
      id: id
    });
  } catch (error) {
    console.error('Error marking video as failed:', error);
    return NextResponse.json(
      { error: 'Failed to mark video as failed' },
      { status: 500 }
    );
  }
}
