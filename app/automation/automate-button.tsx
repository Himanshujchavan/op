"use client"

import { useState } from "react"

interface AutomateButtonProps {
  command: {
    type: string
    action: string
    parameters?: Record<string, any>
  }
  label: string
}

export default function AutomateButton({ command, label }: AutomateButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/automate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      })

      if (!response.ok) {
        throw new Error(`Failed to execute automation: ${response.statusText}`)
      }

      const result = await response.json()
      alert(`Automation Result: ${JSON.stringify(result)}`)
    } catch (error: any) {
      console.error("Automation Error:", error)
      setError(error.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        className={`p-3 rounded-md text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        disabled={loading}
        aria-busy={loading}
        aria-disabled={loading}
      >
        {loading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          label
        )}
      </button>
      {error && <p className="mt-2 text-red-500 text-sm">Error: {error}</p>}
    </div>
  )
}