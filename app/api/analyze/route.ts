import { NextResponse } from 'next/server'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import type { AnalysisResult } from '@/app/types'

const dynamoClient = new DynamoDB({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
})

const docClient = DynamoDBDocument.from(dynamoClient)

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json()
    console.log('Received URL:', imageUrl)

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Extract image ID from the URL
    const imageId = imageUrl.split('/uploads/').pop()?.split('.')[0]
    console.log('Extracted ID:', imageId)
    if (!imageId) {
      return NextResponse.json(
        { error: 'Invalid image URL' },
        { status: 400 }
      )
    }

    // Wait for initial processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Poll DynamoDB for results
    let attempts = 0
    const maxAttempts = 20 // Increased attempts
    const pollInterval = 3000 // 3 seconds

    while (attempts < maxAttempts) {
      const result = await docClient.get({
        TableName: process.env.DYNAMODB_TABLE_NAME!,
        Key: {
          id: imageId
        }
      })

      if (result.Item) {
        // Transform the result to ensure recommendations is always an array
        const analysisResult: AnalysisResult = {
          id: result.Item.id,
          status: result.Item.status,
          confidenceScore: result.Item.confidenceScore,
          detectedDisease: result.Item.detectedDisease,
          imageUrl: result.Item.imageUrl,
          createdAt: result.Item.createdAt,
          recommendations: Array.isArray(result.Item.recommendations) 
            ? result.Item.recommendations 
            : [
                'Monitor plant health regularly',
                'Ensure proper irrigation',
                'Maintain good air circulation'
              ]
        }
        return NextResponse.json(analysisResult)
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, pollInterval))
      attempts++
    }

    throw new Error('Analysis timeout - Please try again')

  } catch (error) {
    console.error('Error analyzing image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze image' },
      { status: 500 }
    )
  }
} 