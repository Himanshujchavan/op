// lib/groq.ts
import { groq } from '@ai-sdk/groq';

export async function interpretCommand(userInput: string) {
  const response = await groq.chat.completions.create({
    messages: [{ role: 'user', content: userInput }],
    model: 'mixtral-8x7b-32768',
  });

  const raw = response.choices[0].message.content;
  return parseGroqResponse(raw);
}

function parseGroqResponse(content: string) {
  const lower = content.toLowerCase();

  if (lower.includes("summarize") && lower.includes("email"))
    return { action: "summarize_emails", targetApp: "Outlook" };

  if (lower.includes("crm") && lower.includes("interaction"))
    return { action: "fetch_crm_interactions", targetApp: "CRM" };

  if (lower.includes("calendar") && lower.includes("event"))
    return { action: "fetch_calendar_events", targetApp: "Calendar" };

  if (lower.includes("open") && lower.includes("notepad"))
    return { action: "open_app", targetApp: "Notepad" };

  return { action: "unknown", raw: content };
}
