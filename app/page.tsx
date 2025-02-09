'use client'

import { Suspense, useState } from 'react'
import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import Loading from '@/app/components/ui/loading'
import AnalysisResults from '@/app/components/AnalysisResults'
import ImageUpload from '@/app/components/ImageUpload'
import type { AnalysisResult } from '@/app/types'

export default function Page() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [fileId, setFileId] = useState<string | null>(null) // Store correct S3-generated ID
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (file: File | null) => {
    if (!file) return
  
    setResults(null)
    setError(null)
  
    try {
      // Show local preview first
      const localPreviewUrl = URL.createObjectURL(file)
      setImageUrl(localPreviewUrl)  // ✅ Show local preview immediately

      // Step 1: Get pre-signed URL & unique file ID from backend
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      })
  
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Upload failed')
      }
  
      const { url, fields, id, imageUrl } = await uploadResponse.json()
  
      // Step 2: Upload the file using the pre-signed URL
      const formData = new FormData()
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string)
      })
      formData.append('file', file) // Append the actual file
  
      const uploadToS3 = await fetch(url, {
        method: 'POST',
        body: formData,
      })
  
      if (!uploadToS3.ok) throw new Error('S3 upload failed')
  
      console.log('✅ Uploaded Image ID:', id)
  
       // Step 3: Update imageUrl to S3 URL AFTER upload completes
      setTimeout(() => {
        setImageUrl(imageUrl) // ✅ Update to S3 URL after successful upload
      }, 500) // Delay slightly for smooth transition

      setFileId(id)
  
    } catch (error) {
      console.error('File upload error:', error)
      setError('Failed to upload image')
    }
  }
  

  const handleAnalyze = async () => {
    if (!fileId) return // Ensure correct fileId is available

    setIsAnalyzing(true)
    setError(null)

    try {
      console.log('📤 Sending for analysis:', imageUrl)

      const resultResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }) // Send correct S3 image URL
      })

      if (!resultResponse.ok) {
        const errorData = await resultResponse.json()
        throw new Error(errorData.error || 'Failed to analyze image')
      }

      const result = await resultResponse.json()
      console.log('✅ Analysis result:', result)
      setResults(result)
    } catch (error) {
      console.error('Error analyzing image:', error)
      setError(error instanceof Error ? error.message : 'Failed to analyze image')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Rice Disease Detection App
          </h1>
          <p className="text-gray-600">
            Upload your rice images for instant disease detection
          </p>
        </header>

        <Card className="bg-white shadow-md">
          <CardContent className="p-6">
            <Suspense fallback={<Loading />}>
              <div className="space-y-6">
                <ImageUpload 
                  onFileChange={handleFileChange} 
                  imageUrl={imageUrl}
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={!fileId || isAnalyzing} // Ensure correct ID is available
                  className="w-full"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Crop"}
                </Button>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
              </div>
            </Suspense>
          </CardContent>
        </Card>

        {isAnalyzing && (
          <div className="mt-4 text-center text-gray-600">
            Analyzing image...
          </div>
        )}

        {results && (
          <Card className="bg-white shadow-md">
            <CardContent className="p-6">
              <Suspense fallback={<Loading />}>
                <AnalysisResults initialResult={results} />
              </Suspense>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
