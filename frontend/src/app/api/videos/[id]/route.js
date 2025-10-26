import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("video-rows");
    const videosCollection = db.collection("videos");

    // Find video by ID
    const video = await videosCollection.findOne({ _id: id });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Remove MongoDB internal fields for cleaner response
    const { _id, ...videoData } = video;
    
    return NextResponse.json({
      id: _id,
      ...videoData
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video data' },
      { status: 500 }
    );
  }
}
