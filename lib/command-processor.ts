import { db, auth } from "./firebase"
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore"
import type { CommandIntent } from "./groq-api"

export interface Command {
  id?: string
  intent: CommandIntent
  status: "pending" | "running" | "completed" | "failed"
  timestamp: any
  response?: string
  result?: any
  userId: string
}

// Store a command in Firebase
export async function storeCommand(intent: CommandIntent, response: string): Promise<Command | null> {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.error("No authenticated user")
      return null
    }

    const userId = auth.currentUser.uid

    // Create command object
    const command: Omit<Command, "id"> = {
      intent,
      status: "pending",
      timestamp: serverTimestamp(),
      response,
      userId,
    }

    // Store in Firestore
    const docRef = await addDoc(collection(db, "commands"), command)

    return {
      id: docRef.id,
      ...command,
    }
  } catch (error) {
    console.error("Error storing command:", error)
    return null
  }
}

// Update command status
export async function updateCommandStatus(
  commandId: string,
  status: Command["status"],
  result?: any,
): Promise<boolean> {
  try {
    const commandRef = doc(db, "commands", commandId)

    await updateDoc(commandRef, {
      status,
      result,
      updatedAt: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error("Error updating command status:", error)
    return false
  }
}

// Get command by ID
export async function getCommand(commandId: string): Promise<Command | null> {
  try {
    const commandRef = doc(db, "commands", commandId)
    const commandSnap = await getDoc(commandRef)

    if (commandSnap.exists()) {
      return {
        id: commandSnap.id,
        ...commandSnap.data(),
      } as Command
    }

    return null
  } catch (error) {
    console.error("Error getting command:", error)
    return null
  }
}
