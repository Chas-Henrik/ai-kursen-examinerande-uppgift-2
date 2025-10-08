'use client'

import { useState } from 'react'

interface TestResult {
  success: boolean
  message: string
  details?: Record<string, unknown>
  error?: string
}

export default function DatabaseTest() {
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)

  const testDatabase = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: 'Kunde inte testa databasen',
        error: error instanceof Error ? error.message : 'Okänt fel'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Databastest - Step 3 Verifiering
        </h2>
        
        <button
          onClick={testDatabase}
          disabled={loading}
          className="mb-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Testar databas...' : 'Testa Databasanslutning'}
        </button>

        {result && (
          <div className={`mt-4 p-4 rounded-lg ${
            result.success 
              ? 'bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700' 
              : 'bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700'
          }`}>
            <div className={`flex items-center gap-2 font-medium ${
              result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
            }`}>
              <span>{result.success ? '✅' : '❌'}</span>
              <span>{result.message}</span>
            </div>
            
            {result.details && (
              <div className="mt-3 space-y-2 text-sm">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Detaljer:</h4>
                <pre className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </div>
            )}
            
            {result.error && (
              <div className="mt-3 text-sm">
                <h4 className="font-medium text-red-800 dark:text-red-200">Felmeddelande:</h4>
                <p className="text-red-700 dark:text-red-300 mt-1">{result.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Step 3 Checkpoint-krav:</h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>Besök /api/test-db endpoint - returnerar success-meddelande</li>
            <li>MongoDB Atlas visar framgångsrika anslutningar i dashboard</li>
            <li>Kan skapa och hämta testanvändare från databasen</li>
            <li>Inga mongoose-anslutningsvarningar i konsolen</li>
          </ul>
        </div>
      </div>
    </div>
  )
}