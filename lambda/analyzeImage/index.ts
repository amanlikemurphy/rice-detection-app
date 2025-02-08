import { Context, S3Event } from 'aws-lambda'
import { S3Client } from '@aws-sdk/client-s3'
import { 
  RekognitionClient, 
  DetectCustomLabelsCommand,
  CustomLabel
} from '@aws-sdk/client-rekognition'
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'

const s3Client = new S3Client({ region: process.env.AWS_REGION })
const rekognitionClient = new RekognitionClient({ region: process.env.AWS_REGION })
const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION })

const MODEL_ARN = process.env.MODEL_ARN! // Full ARN

interface HealthStatus {
  status: 'healthy' | 'diseased'
  confidence: number
  disease: string | null
}

interface AnalysisResult {
  id: string
  status: string
  confidenceScore: number
  detectedDisease: string | null
  recommendations: string[]
  imageUrl: string
  createdAt: string
}

export const handler = async (event: S3Event, context: Context) => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2))
    console.log('Context:', JSON.stringify(context, null, 2))

    const results = await Promise.all(event.Records.map(async (record) => {
      const bucket = record.s3.bucket.name
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '))

      console.log(`Processing: ${bucket}/${key}`)

      const rekognitionResponse = await rekognitionClient.send(
        new DetectCustomLabelsCommand({
          Image: {
            S3Object: {
              Bucket: bucket,
              Name: key
            }
          },
          ProjectVersionArn: MODEL_ARN,
          MinConfidence: 50
        })
      )

      const labels = rekognitionResponse.CustomLabels || []
      console.log('Detected labels:', JSON.stringify(labels, null, 2))

      const healthStatus = determineHealthStatus(labels)
      const recommendations = generateRecommendations(healthStatus)

      const result: AnalysisResult = {
        id: key.split('/')[1].split('.')[0],
        status: healthStatus.status,
        confidenceScore: healthStatus.confidence || 0,
        detectedDisease: healthStatus.disease,
        recommendations,
        imageUrl: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        createdAt: new Date().toISOString()
      }

      await dynamoDbClient.send(
        new PutItemCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Item: {
            id: { S: result.id },
            status: { S: result.status },
            confidenceScore: { N: String(Math.max(0, Math.min(100, result.confidenceScore || 0))) },
            detectedDisease: { S: result.detectedDisease || 'none' },
            recommendations: { SS: result.recommendations },
            imageUrl: { S: result.imageUrl },
            createdAt: { S: result.createdAt }
          }
        })
      )

      console.log(`Analysis complete for ${key}:`, result)
      return result
    }))

    return {
      statusCode: 200,
      body: JSON.stringify({ results })
    }
  } catch (error) {
    console.error('Lambda error:', error)
    throw error
  }
}

function determineHealthStatus(labels: CustomLabel[]): HealthStatus {
  // Update disease indicators to match your trained model labels
  const diseaseLabels = ['bacterial-leaf-blight', 'brown-spot', 'leaf-smut']
  const healthyLabel = 'healthy'

  let detectedDisease: string | null = null
  let highestConfidence = 0

  labels.forEach((label) => {
    const name = label.Name?.toLowerCase() || ''
    const confidence = label.Confidence || 0

    if (confidence > highestConfidence) {
      highestConfidence = confidence
      if (name === healthyLabel) {
        detectedDisease = null
      } else if (diseaseLabels.includes(name)) {
        detectedDisease = name
      }
    }
  })

  return {
    status: detectedDisease ? 'diseased' : 'healthy',
    confidence: highestConfidence,
    disease: detectedDisease
  }
}

function generateRecommendations(healthStatus: HealthStatus): string[] {
  if (healthStatus.status === 'healthy') {
    return [
      'Continue current maintenance practices',
      'Regular monitoring for early disease detection',
      'Maintain proper irrigation schedule'
    ]
  }
  return [
    'Isolate affected plants to prevent spread',
    'Apply appropriate fungicide treatment',
    'Improve air circulation around plants',
    'Adjust watering practices to avoid leaf wetness'
  ]
} 