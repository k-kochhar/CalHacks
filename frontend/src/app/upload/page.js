'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('Preparing upload...');

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
    setUploadStatus('Preparing upload...');
    
    try {
      // Step 1: Request presigned URL and create MongoDB record
      setUploadStatus('Requesting upload URL...');
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
      setUploadProgress(25);
      
      // Step 2: Upload to S3
      setUploadStatus('Uploading video to cloud...');
      setUploadProgress(40);
      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "video/mp4" },
        body: file,
      });

      if (!put.ok) {
        throw new Error('Upload failed');
      }
      
      setUploadProgress(65);
      
      // Step 3: Finalize upload (set status to processing)
      setUploadStatus('Finalizing upload...');
      const finalizeRes = await fetch(`/api/videos/${id}/finalize`, {
        method: "POST",
      });
      
      if (!finalizeRes.ok) {
        throw new Error('Failed to finalize upload');
      }
      
      setUploadProgress(75);
      
      // Step 4: Start processing (call saliency model) - with simulated progress
      setUploadStatus('Analyzing video with AI model...');
      
      // Simulate gradual progress during ML processing
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 95) {
            return prev + 1;
          }
          return prev;
        });
      }, 300); // Increment every 300ms
      
      const processRes = await fetch(`/api/videos/${id}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origUrl: origUrl }),
      });
      
      clearInterval(progressInterval);
      
      if (!processRes.ok) {
        throw new Error('Failed to start processing');
      }
      
      setUploadStatus('Complete!');
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
      setUploadStatus('Upload failed');
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen" style={{
      background: `linear-gradient(135deg, var(--surface) 0%, var(--background) 100%)`
    }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-xl border-b z-50" style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)"
      }}>
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Salient Labs</Link>
            <Link href="/" className="font-medium transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
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
            <h1 className="text-5xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
              Upload your video to see Salient Labs in action
            </h1>
            <p className="text-xl font-light" style={{ color: "var(--text-secondary)" }}>
              Experience AI-driven video optimization in real-time
            </p>
          </div>

          {/* Upload Card */}
          <div className="rounded-lg p-12 mb-12 shadow-lg" style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
            border: "1px solid"
          }}>
            {!uploadComplete ? (
              <>
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-16 text-center transition-all duration-200 ${
                    isDragOver 
                      ? 'border-accent bg-accent/5 shadow-accent/20' 
                      : 'border-border-light hover:border-accent hover:bg-accent/5'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-8xl mb-6">📁</div>
                  <h3 className="text-3xl font-semibold text-secondary mb-4">
                    Drag and drop or click to upload
                  </h3>
                  <p className="text-secondary text-lg mb-8">
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
                    className="inline-block px-10 py-4 bg-accent text-bg rounded-lg font-semibold hover:bg-accent-hover transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 shadow-accent/25"
                  >
                    Choose File
                  </label>
                </div>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="mt-12">
                    <div className="flex justify-between text-lg text-secondary mb-4">
                      <span className="font-medium">{uploadStatus}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-surface-elevated rounded-lg h-3">
                      <div 
                        className="bg-accent h-3 rounded-lg transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    {uploadProgress >= 75 && uploadProgress < 100 && (
                      <p className="text-sm text-text-muted mt-3 text-center">
                        This may take a moment while our AI model analyzes your video...
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Results */
              <div className="text-center">
                <div className="text-8xl mb-6">✅</div>
                <h3 className="text-3xl font-semibold text-secondary mb-8">
                  Upload Complete!
                </h3>
                

                {/* Side-by-side thumbnails */}
                <div className="grid md:grid-cols-2 gap-12 mb-12">
                  {/* Original */}
                  <div className="text-center">
                    <div className="w-full h-64 bg-gradient-to-br from-surface-elevated to-surface border border-border rounded-lg mb-6 flex items-center justify-center">
                      <div className="text-text-muted font-medium text-lg">Original Video</div>
                    </div>
                    <h4 className="text-xl font-semibold text-secondary mb-3">Original</h4>
                    <p className="text-secondary text-lg">2.4 MB • 1080p</p>
                  </div>

                  {/* Optimized */}
                  <div className="text-center">
                    <div className="w-full h-64 bg-gradient-to-br from-surface-elevated to-surface border border-accent rounded-lg mb-6 flex items-center justify-center shadow-accent/20">
                      <div className="text-accent font-medium text-lg">Optimized with Salient Labs</div>
                    </div>
                    <h4 className="text-xl font-semibold text-secondary mb-3">Optimized</h4>
                    <p className="text-secondary text-lg">1.2 MB • 1080p • 50% smaller</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link 
                    href="/demo"
                    className="px-10 py-4 bg-accent text-bg rounded-lg font-semibold hover:bg-accent-hover transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 shadow-accent/25"
                  >
                    See Full Demo
                  </Link>
                  <Link 
                    href="/test-foveated"
                    className="px-10 py-4 bg-accent text-bg rounded-lg font-semibold hover:bg-accent-hover transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 shadow-accent/25"
                  >
                    Test Reconstruction
                  </Link>
                  <button
                    onClick={() => {
                      setUploadComplete(false);
                      setUploadProgress(0);
                      setUploadStatus('Preparing upload...');
                    }}
                    className="px-10 py-4 border border-border-light text-secondary rounded-lg font-semibold hover:bg-surface transition-all duration-200"
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
                className="text-secondary hover:text-accent transition-colors text-lg"
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
