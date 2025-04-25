def process_groq_command(command: str) -> dict:
    """
    Process the user command and return the action and parameters.
    :param command: User command as a string.
    :return: Dictionary with action and parameters.
    """
    command = command.lower()

    if "summarize emails" in command:
        return {"action": "summarize_emails", "parameters": {"email_count": 5, "folder": "inbox"}}
    elif "fetch crm interactions" in command:
        return {"action": "fetch_crm_interactions", "parameters": {}}
    elif "fetch calendar events" in command:
        return {"action": "fetch_calendar_events", "parameters": {}}
    elif "open notepad" in command:
        return {"action": "open_app", "parameters": {"app_path": "notepad.exe"}}
    elif "type hello world" in command:
        return {"action": "type_text", "parameters": {"text": "Hello, World!"}}
    else:
        return {"action": "unknown", "parameters": {"raw_command": command}}