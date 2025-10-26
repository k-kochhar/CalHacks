import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import clientPromise from "@/lib/mongo";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  try {
    const { contentType = "video/mp4" } = await req.json().catch(() => ({}));
    const id = randomUUID(); // your videoId
    const key = `original/${id}.mp4`; // path in S3
    const origUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;

    // Generate presigned URL for S3 upload
    const cmd = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 900 }); // 15 min

    // Insert video record into MongoDB
    const client = await clientPromise;
    const db = client.db("video-rows");
    const videosCollection = db.collection("videos");
    
    const videoDoc = {
      _id: id,
      origUrl: origUrl,
      status: "uploaded",
      optUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await videosCollection.insertOne(videoDoc);

    return NextResponse.json({ 
      id, 
      uploadUrl, 
      origUrl 
    });
  } catch (error) {
    console.error('Error in upload API:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL or save video record' },
      { status: 500 }
    );
  }
}
