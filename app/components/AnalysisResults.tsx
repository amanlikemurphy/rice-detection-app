'use client'

import type { AnalysisResult } from '@/app/types'

interface AnalysisResultsProps {
  initialResult: AnalysisResult
}

export default function AnalysisResults({ initialResult }: AnalysisResultsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Analysis Results</h2>
      
      <div className="grid gap-4">
        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Status</h3>
          <p className={`text-lg ${initialResult.status === 'diseased' ? 'text-red-600' : 'text-green-600'}`}>
            {initialResult.status === 'diseased' ? 'Disease Detected' : 'Healthy'}
          </p>
        </div>

        {initialResult.status === 'diseased' && (
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2">Detected Disease</h3>
            <p className="text-lg">{initialResult.detectedDisease}</p>
            <p className="text-sm text-gray-600 mt-1">
              Confidence: {initialResult.confidenceScore.toFixed(1)}%
            </p>
          </div>
        )}

        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Recommendations</h3>
          <ul className="list-disc list-inside space-y-2">
            {initialResult.recommendations.map((rec, index) => (
              <li key={index} className="text-gray-700">{rec}</li>
            ))}
          </ul>
        </div>

        <div className="text-sm text-gray-500 text-center">
          Analysis completed at: {new Date(initialResult.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  )
} 