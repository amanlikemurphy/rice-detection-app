export type DiseaseType = 'bacterial-leaf-blight' | 'brown-spot' | 'leaf-smut' | null;

export interface AnalysisResult {
  id: string
  status: 'healthy' | 'diseased'
  confidenceScore: number
  detectedDisease: DiseaseType
  recommendations: string[]
  imageUrl: string
  createdAt: string
}

export interface UploadResponse {
  imageUrl: string
  id: string
}

export interface AnalysisResponse {
  success: boolean
  data: AnalysisResult
} 