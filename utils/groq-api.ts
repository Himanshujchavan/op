export async function analyzeDocument(fileContent: string, action: string): Promise<string | string[]> {
  // Simulate AI document analysis
  await new Promise((resolve) => setTimeout(resolve, 2000))

  if (action === "summarize") {
    return `This document discusses the key strategies for Q3, including increasing marketing spend, improving customer retention, and expanding into new markets.`
  } else if (action === "translate") {
    return `[Translated to English] This document discusses the key strategies for Q3, including increasing marketing spend, improving customer retention, and expanding into new markets.`
  } else if (action === "extract-keywords") {
    return ["Q3 strategies", "marketing spend", "customer retention", "new markets"]
  }

  return "Processing complete."
}

export async function summarizeEmail(emailContent: string): Promise<string> {
  // Simulate AI email summarization
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return `This email discusses the quarterly report, highlighting a 15% increase in revenue, a 22% rise in new client acquisition, and an 8% reduction in operating costs.`
}

export async function suggestTasksFromEmail(emailContent: string): Promise<string[]> {
  // Simulate AI task suggestion
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return ["Review quarterly report", "Schedule meeting to discuss next steps", "Outline ideas for next campaign"]
}
