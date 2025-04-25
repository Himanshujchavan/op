"use server"

export async function triggerAutomation(command: any) {
  const res = await fetch("http://localhost:5000/automate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  })

  if (!res.ok) {
    return { error: "Failed to trigger automation" }
  }

  return res.json()
}

  