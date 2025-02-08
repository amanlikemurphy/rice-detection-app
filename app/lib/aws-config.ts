import { S3Client } from '@aws-sdk/client-s3'
import { RekognitionClient } from '@aws-sdk/client-rekognition'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const config = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}

export const s3Client = new S3Client(config)
export const rekognitionClient = new RekognitionClient(config)
export const dynamoDbClient = new DynamoDBClient(config) 