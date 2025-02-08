"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const client_rekognition_1 = require("@aws-sdk/client-rekognition");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const s3Client = new client_s3_1.S3Client({ region: process.env.AWS_REGION });
const rekognitionClient = new client_rekognition_1.RekognitionClient({ region: process.env.AWS_REGION });
const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: process.env.AWS_REGION });
const MODEL_ARN = process.env.MODEL_ARN; // Full ARN
const handler = async (event, context) => {
    try {
        console.log('Event:', JSON.stringify(event, null, 2));
        console.log('Context:', JSON.stringify(context, null, 2));
        const results = await Promise.all(event.Records.map(async (record) => {
            const bucket = record.s3.bucket.name;
            const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
            console.log(`Processing: ${bucket}/${key}`);
            const rekognitionResponse = await rekognitionClient.send(new client_rekognition_1.DetectCustomLabelsCommand({
                Image: {
                    S3Object: {
                        Bucket: bucket,
                        Name: key
                    }
                },
                ProjectVersionArn: MODEL_ARN,
                MinConfidence: 50
            }));
            const labels = rekognitionResponse.CustomLabels || [];
            console.log('Detected labels:', JSON.stringify(labels, null, 2));
            const healthStatus = determineHealthStatus(labels);
            const recommendations = generateRecommendations(healthStatus);
            const result = {
                id: key.split('/')[1].split('.')[0],
                status: healthStatus.status,
                confidenceScore: healthStatus.confidence || 0,
                detectedDisease: healthStatus.disease,
                recommendations,
                imageUrl: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
                createdAt: new Date().toISOString()
            };
            await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
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
            }));
            console.log(`Analysis complete for ${key}:`, result);
            return result;
        }));
        return {
            statusCode: 200,
            body: JSON.stringify({ results })
        };
    }
    catch (error) {
        console.error('Lambda error:', error);
        throw error;
    }
};
exports.handler = handler;
function determineHealthStatus(labels) {
    // Update disease indicators to match your trained model labels
    const diseaseLabels = ['bacterial-leaf-blight', 'brown-spot', 'leaf-smut'];
    const healthyLabel = 'healthy';
    let detectedDisease = null;
    let highestConfidence = 0;
    labels.forEach((label) => {
        var _a;
        const name = ((_a = label.Name) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        const confidence = label.Confidence || 0;
        if (confidence > highestConfidence) {
            highestConfidence = confidence;
            if (name === healthyLabel) {
                detectedDisease = null;
            }
            else if (diseaseLabels.includes(name)) {
                detectedDisease = name;
            }
        }
    });
    return {
        status: detectedDisease ? 'diseased' : 'healthy',
        confidence: highestConfidence,
        disease: detectedDisease
    };
}
function generateRecommendations(healthStatus) {
    if (healthStatus.status === 'healthy') {
        return [
            'Continue current maintenance practices',
            'Regular monitoring for early disease detection',
            'Maintain proper irrigation schedule'
        ];
    }
    return [
        'Isolate affected plants to prevent spread',
        'Apply appropriate fungicide treatment',
        'Improve air circulation around plants',
        'Adjust watering practices to avoid leaf wetness'
    ];
}
