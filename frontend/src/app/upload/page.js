'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e) => {
    handleFileUpload(e.target.files[0]);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Step 1: Request presigned URL and create MongoDB record
      setUploadProgress(10);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type || "video/mp4" }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const { uploadUrl, origUrl, id } = await res.json();
      setUploadProgress(30);
      
      // Step 2: Upload to S3
      setUploadProgress(50);
      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "video/mp4" },
        body: file,
      });

      if (!put.ok) {
        throw new Error('Upload failed');
      }
      
      setUploadProgress(70);
      
      // Step 3: Finalize upload (set status to processing)
      const finalizeRes = await fetch(`/api/videos/${id}/finalize`, {
        method: "POST",
      });
      
      if (!finalizeRes.ok) {
        throw new Error('Failed to finalize upload');
      }
      
      setUploadProgress(100);
      setIsUploading(false);
      setUploadComplete(true);
      
      // Store the video data for display
      window.uploadedVideoUrl = origUrl;
      window.uploadedVideoId = id;
      
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004E4E] to-[#002E2E]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#004E4E]/80 backdrop-blur-xl border-b border-[#003333] z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-[#F5F5F5]">Salient</Link>
            <Link href="/" className="text-[#E8E8E8] hover:text-[#00FFFF] transition-colors font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-40 pb-32 px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-[#F5F5F5] mb-6">
              Upload your video to see Salient in action
            </h1>
            <p className="text-xl text-[#E8E8E8] font-light">
              Experience AI-driven video optimization in real-time
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-[#004E4E] border border-[#003333] rounded-lg p-12 mb-12 shadow-lg">
            {!uploadComplete ? (
              <>
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-16 text-center transition-all duration-200 ${
                    isDragOver 
                      ? 'border-[#00FFFF] bg-[#00FFFF]/5 shadow-[#00FFFF]/20' 
                      : 'border-[#005555] hover:border-[#00FFFF] hover:bg-[#00FFFF]/5'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-8xl mb-6">📁</div>
                  <h3 className="text-3xl font-semibold text-[#F5F5F5] mb-4">
                    Drag and drop or click to upload
                  </h3>
                  <p className="text-[#E8E8E8] text-lg mb-8">
                    Supports MP4, MOV, AVI files up to 500MB
                  </p>
                  
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-10 py-4 bg-[#00FFFF] text-[#002E2E] rounded-lg font-semibold hover:bg-[#00E6E6] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 hover:shadow-[#00FFFF]/25"
                  >
                    Choose File
                  </label>
                </div>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="mt-12">
                    <div className="flex justify-between text-lg text-[#E8E8E8] mb-4">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-[#003333] rounded-lg h-3">
                      <div 
                        className="bg-[#00FFFF] h-3 rounded-lg transition-all duration-300 shadow-[#00FFFF]/30"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Results */
              <div className="text-center">
                <div className="text-8xl mb-6">✅</div>
                <h3 className="text-3xl font-semibold text-[#F5F5F5] mb-8">
                  Upload Complete!
                </h3>
                
                {/* Uploaded Video Preview */}
                {window.uploadedVideoUrl && (
                  <div className="mb-12">
                    <h4 className="text-2xl font-semibold text-[#F5F5F5] mb-6 text-center">Your Uploaded Video</h4>
                    <div className="w-full max-w-4xl mx-auto">
                      <video 
                        className="w-full rounded-lg shadow-lg" 
                        controls 
                        src={window.uploadedVideoUrl}
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  </div>
                )}

                {/* Side-by-side thumbnails */}
                <div className="grid md:grid-cols-2 gap-12 mb-12">
                  {/* Original */}
                  <div className="text-center">
                    <div className="w-full h-64 bg-gradient-to-br from-[#006666] to-[#004E4E] border border-[#003333] rounded-lg mb-6 flex items-center justify-center">
                      <div className="text-[#B8B8B8] font-medium text-lg">Original Video</div>
                    </div>
                    <h4 className="text-xl font-semibold text-[#F5F5F5] mb-3">Original</h4>
                    <p className="text-[#E8E8E8] text-lg">2.4 MB • 1080p</p>
                  </div>

                  {/* Optimized */}
                  <div className="text-center">
                    <div className="w-full h-64 bg-gradient-to-br from-[#006666] to-[#004E4E] border border-[#00FFFF] rounded-lg mb-6 flex items-center justify-center shadow-[#00FFFF]/20">
                      <div className="text-[#00FFFF] font-medium text-lg">Optimized with Salient</div>
                    </div>
                    <h4 className="text-xl font-semibold text-[#F5F5F5] mb-3">Optimized</h4>
                    <p className="text-[#E8E8E8] text-lg">1.2 MB • 1080p • 50% smaller</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link 
                    href="/demo"
                    className="px-10 py-4 bg-[#00FFFF] text-[#002E2E] rounded-lg font-semibold hover:bg-[#00E6E6] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 hover:shadow-[#00FFFF]/25"
                  >
                    See Full Demo
                  </Link>
                  <button
                    onClick={() => {
                      setUploadComplete(false);
                      setUploadProgress(0);
                    }}
                    className="px-10 py-4 border border-[#005555] text-[#F5F5F5] rounded-lg font-semibold hover:bg-[#006666] hover:border-[#00FFFF] transition-all duration-200"
                  >
                    Upload Another
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          {!uploadComplete && (
            <div className="text-center">
              <Link 
                href="/"
                className="text-[#E8E8E8] hover:text-[#00FFFF] transition-colors text-lg"
              >
                ← Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
