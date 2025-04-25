import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

// Define the command structure
export interface CommandIntent {
  type: string // 'open_app', 'summarize', 'search', 'type', etc.
  action: string // The specific action to perform
  target?: string // Target application or website
  parameters?: Record<string, any> // Additional parameters
  rawInput: string // Original user input
}

// Process user input through Groq to understand intent
export async function processUserCommand(input: string): Promise<CommandIntent> {
  try {
    console.log("Processing command with Groq:", input)

    const systemPrompt = `
      You are an AI assistant that interprets user commands for a desktop automation system.
      Analyze the user's input and extract the following information in JSON format:
      
      {
        "type": "The command type (open_app, summarize, search, type, fetch_data, automate, etc.)",
        "action": "The specific action to perform",
        "target": "Target application or website (if applicable)",
        "parameters": {
          // Any additional parameters needed to execute the command
        }
      }
      
      Examples:
      - "summarize my emails" → {"type": "summarize", "action": "summarize_content", "target": "email", "parameters": {}}
      - "open notepad and type meeting notes" → {"type": "open_app", "action": "open_and_type", "target": "notepad", "parameters": {"text": "meeting notes"}}
      - "search LinkedIn for John Doe" → {"type": "search", "action": "search_query", "target": "linkedin", "parameters": {"query": "John Doe"}}
      - "automate email responses for customer inquiries" → {"type": "automate", "action": "create_rule", "target": "email", "parameters": {"condition": "subject_contains", "value": "inquiry", "response": "auto_reply"}}
      - "create a workflow to organize downloaded files" → {"type": "automate", "action": "create_workflow", "target": "files", "parameters": {"trigger": "file_created", "location": "downloads"}}
      
      Only respond with the JSON object, no additional text.
    `

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt: input,
      system: systemPrompt,
      temperature: 0.2,
      maxTokens: 500,
    })

    // Parse the JSON response
    try {
      const parsedResponse = JSON.parse(text.trim())
      return {
        ...parsedResponse,
        rawInput: input,
      }
    } catch (parseError) {
      console.error("Error parsing Groq response:", parseError)
      console.log("Raw response:", text)

      // Fallback to a basic intent if parsing fails
      return {
        type: "unknown",
        action: "process_text",
        parameters: { text: input },
        rawInput: input,
      }
    }
  } catch (error) {
    console.error("Error processing command with Groq:", error)

    // Return a fallback intent
    return {
      type: "error",
      action: "report_error",
      parameters: { error: "Failed to process command" },
      rawInput: input,
    }
  }
}

// Function to generate a response based on the command intent
export async function generateCommandResponse(intent: CommandIntent): Promise<string> {
  try {
    const { type, action, target, parameters, rawInput } = intent

    const prompt = `
      Based on the user's command: "${rawInput}"
      
      Which has been interpreted as:
      - Type: ${type}
      - Action: ${action}
      - Target: ${target || "None"}
      - Parameters: ${JSON.stringify(parameters || {})}
      
      Generate a brief, helpful response explaining what will be done.
    `

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      temperature: 0.7,
      maxTokens: 150,
    })

    return text.trim()
  } catch (error) {
    console.error("Error generating command response:", error)
    return "I'll process your request, but I encountered an issue understanding the details."
  }
}

// Also, let's add a new function to handle automation-specific commands
export async function processAutomationCommand(intent: CommandIntent): Promise<string> {
  try {
    const { type, action, target, parameters, rawInput } = intent

    const prompt = `
      You are an AI assistant specializing in automation workflows. A user has requested to set up automation with this command:
      "${rawInput}"
      
      Based on this command, generate a detailed response explaining:
      1. What type of automation will be created (${type}, ${action}, ${target})
      2. How the automation will work
      3. What triggers and actions will be involved
      4. The benefits of this automation
      
      Keep your response under 150 words, conversational, and helpful.
    `

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      temperature: 0.7,
      maxTokens: 200,
    })

    return text.trim()
  } catch (error) {
    console.error("Error processing automation command:", error)
    return "I can help you set up that automation. Would you like me to create a custom workflow for this task?"
  }
}
