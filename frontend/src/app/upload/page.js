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

  const handleFileUpload = (file) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#111111]/80 backdrop-blur-xl border-b border-[#262626] z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">Salient</Link>
            <Link href="/" className="text-[#a3a3a3] hover:text-white transition-colors font-medium">
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
            <h1 className="text-5xl font-bold text-white mb-6">
              Upload your video to see Salient in action
            </h1>
            <p className="text-xl text-[#a3a3a3] font-light">
              Experience AI-driven video optimization in real-time
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-[#111111] border border-[#262626] rounded-lg p-12 mb-12">
            {!uploadComplete ? (
              <>
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-16 text-center transition-all duration-200 ${
                    isDragOver 
                      ? 'border-[#3b82f6] bg-[#3b82f6]/5' 
                      : 'border-[#404040] hover:border-[#3b82f6] hover:bg-[#3b82f6]/5'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-8xl mb-6">📁</div>
                  <h3 className="text-3xl font-semibold text-white mb-4">
                    Drag and drop or click to upload
                  </h3>
                  <p className="text-[#a3a3a3] text-lg mb-8">
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
                    className="inline-block px-10 py-4 bg-[#3b82f6] text-white rounded-lg font-semibold hover:bg-[#2563eb] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Choose File
                  </label>
                </div>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="mt-12">
                    <div className="flex justify-between text-lg text-[#a3a3a3] mb-4">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-[#262626] rounded-lg h-3">
                      <div 
                        className="bg-[#3b82f6] h-3 rounded-lg transition-all duration-300"
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
                <h3 className="text-3xl font-semibold text-white mb-8">
                  Upload Complete!
                </h3>
                
                {/* Side-by-side thumbnails */}
                <div className="grid md:grid-cols-2 gap-12 mb-12">
                  {/* Original */}
                  <div className="text-center">
                    <div className="w-full h-64 bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-[#262626] rounded-lg mb-6 flex items-center justify-center">
                      <div className="text-[#737373] font-medium text-lg">Original Video</div>
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-3">Original</h4>
                    <p className="text-[#a3a3a3] text-lg">2.4 MB • 1080p</p>
                  </div>

                  {/* Optimized */}
                  <div className="text-center">
                    <div className="w-full h-64 bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-[#3b82f6] rounded-lg mb-6 flex items-center justify-center">
                      <div className="text-[#3b82f6] font-medium text-lg">Optimized with Salient</div>
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-3">Optimized</h4>
                    <p className="text-[#a3a3a3] text-lg">1.2 MB • 1080p • 50% smaller</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link 
                    href="/demo"
                    className="px-10 py-4 bg-[#3b82f6] text-white rounded-lg font-semibold hover:bg-[#2563eb] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    See Full Demo
                  </Link>
                  <button
                    onClick={() => {
                      setUploadComplete(false);
                      setUploadProgress(0);
                    }}
                    className="px-10 py-4 border border-[#404040] text-white rounded-lg font-semibold hover:bg-[#1a1a1a] hover:border-[#3b82f6] transition-all duration-200"
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
                className="text-[#a3a3a3] hover:text-white transition-colors text-lg"
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
