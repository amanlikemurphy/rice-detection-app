# Rice Leaf Disease Detection Web Application

## Overview 🌾
This project is focused on building a **cloud-native web application** for AgroVisionLabs (a fictional agritech company). The application enables farmers to upload images of rice leaves to detect diseases using **AWS Rekognition** and serverless infrastructure.

[Full project link](https://murphyelo.com/posts/agrovisionlabs/project-overview/)
---

## Features ✨
### Functional Requirements
- **Image Upload & Analysis**:  
  - Farmers can upload single/multiple images (max 10MB).  
  - AWS Rekognition processes images to detect diseases.  
- **Data Storage**:  
  - Images stored in **AWS S3**.  
  - Metadata and analysis results stored in **AWS DynamoDB**.  
- **Results Display**:  
  - Users receive actionable insights (detected issues, recommendations) post-analysis.  

### Non-Functional Requirements
- **Performance**: Average response time <5 seconds for uploads and analysis.  
- **Security**:  
  - Encryption in transit (TLS) and at rest (S3 server-side encryption).  
- **Monitoring**: Centralized logging/metrics via **AWS CloudWatch**.  

---

## Architecture Diagram
![Rice Disease Detection Architecture](https://murphyelo.com/images/agro-arch.png)


### Workflow Steps
1. **Image Upload**:  
   - Farmers upload images via the Next.js frontend.  
   - Backend generates pre-signed URLs to securely store images in S3.  
2. **Analysis Trigger**:  
   - S3 triggers an AWS Lambda function upon upload.  
3. **Disease Detection**:  
   - Lambda fetches the image, uses AWS Rekognition for classification, and stores results in DynamoDB.  
4. **Results Display**:  
   - Users view analysis and recommendations via the frontend.  

---

**Built with**: AWS Serverless Services (Lambda, S3, DynamoDB, Rekognition, CloudWatch) | Next.js | Node.js  


