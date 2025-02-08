'use client'

import React from 'react'
import { useState } from 'react'
import { Upload } from 'lucide-react'

interface ImageUploadProps {
  onFileChange: (file: File | null) => void
  imageUrl: string | null
}

const ImageUpload = ({ onFileChange, imageUrl }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true)
      setError(null)

      // ✅ Set local preview immediately
      const previewUrl = URL.createObjectURL(file)
      setLocalPreview(previewUrl)

      // Trigger parent upload handler
      await onFileChange(file)

      // ✅ Cleanup local preview URL after successful upload
      setTimeout(() => {
        URL.revokeObjectURL(previewUrl)
        setLocalPreview(null)
      }, 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  // ✅ Show local preview while uploading, otherwise show S3 URL
  const displayUrl = isUploading ? localPreview : imageUrl

  return (
    <div className="space-y-4">
      <label 
        htmlFor="image-upload"
        className="relative flex flex-col items-center justify-center w-full min-h-[16rem] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
        tabIndex={0}
        role="button"
        aria-label="Upload image"
      >
        <input
          id="image-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleUpload(file)
          }}
          disabled={isUploading}
        />
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Upload preview"
            className="max-w-full max-h-[32rem] object-contain rounded-lg"
          />
        ) : (
          <>
            <Upload className="w-12 h-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isUploading ? 'Uploading...' : 'Click or drag and drop to upload image'}
            </p>
          </>
        )}
      </label>
      
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  )
}

export default ImageUpload 