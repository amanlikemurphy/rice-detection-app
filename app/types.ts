export interface AnalysisResult {
  id: string
  status: 'healthy' | 'diseased'
  confidenceScore: number
  detectedDisease: string
  recommendations: string[]
  imageUrl: string
  createdAt: string
} 