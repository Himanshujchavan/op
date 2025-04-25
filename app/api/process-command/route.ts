import { type NextRequest, NextResponse } from "next/server"
import { processUserCommand, generateCommandResponse } from "@/lib/groq-api"
import { storeCommand } from "@/lib/command-processor"
import { auth } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Parse request body
    const { command } = await request.json()

    if (!command || typeof command !== "string") {
      return NextResponse.json({ error: "Invalid command" }, { status: 400 })
    }

    // Process command with Groq
    const intent = await processUserCommand(command)

    // Generate a response
    const response = await generateCommandResponse(intent)

    // Store command in Firebase
    const storedCommand = await storeCommand(intent, response)

    if (!storedCommand) {
      return NextResponse.json({ error: "Failed to store command" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      intent,
      response,
      commandId: storedCommand.id,
    })
  } catch (error) {
    console.error("Error processing command:", error)
    return NextResponse.json({ error: "Failed to process command" }, { status: 500 })
  }
}
