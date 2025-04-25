from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from automation.office_automation import create_excel_with_data, create_word_doc, send_outlook_email
from automation.email_handler import summarize_emails
from automation.gui_control import open_app, type_text, move_mouse, click_mouse
from automation.terminator_control import execute_terminator_command
from ..lib.groq import process_groq_command
import pyautogui
import psutil
import os

app = FastAPI()

# CORS setup to allow requests from your Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with ["http://localhost:3000"] for safety in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enhanced error handling for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": "Invalid request", "details": exc.errors()},
    )

# Enhanced logging for assistant endpoint
@app.post("/assistant")
async def assistant(request: Request):
    """
    AI-powered assistant endpoint to process user requests.
    """
    try:
        user_request = await request.json()
        user_command = user_request.get("command", "")

        if not user_command:
            return JSONResponse(
                status_code=400,
                content={"error": "Command is required"},
            )

        # Process the user command using Groq
        groq_result = process_groq_command(user_command)

        # Determine the action based on Groq result
        action = groq_result.get("action")
        parameters = groq_result.get("parameters", {})

        if action == "summarize_emails":
            email_count = parameters.get("email_count", 5)
            folder = parameters.get("folder", "inbox")
            mark_as_read = parameters.get("mark_as_read", False)
            return summarize_emails(email_count, folder, mark_as_read)

        elif action == "fetch_crm_interactions":
            # Placeholder for CRM API integration
            return {"result": "Fetching recent customer interactions from CRM is not yet implemented."}

        elif action == "fetch_calendar_events":
            # Placeholder for Calendar API integration
            return {"result": "Fetching calendar events is not yet implemented."}

        elif action == "open_app":
            app_path = parameters.get("app_path")
            if not app_path:
                return JSONResponse(
                    status_code=400,
                    content={"error": "App path is required for open_app action"},
                )
            return open_app(app_path)

        elif action == "type_text":
            text = parameters.get("text", "")
            if not text:
                return JSONResponse(
                    status_code=400,
                    content={"error": "Text is required for type_text action"},
                )
            return type_text(text)

        elif action == "move_mouse":
            x = parameters.get("x", 0)
            y = parameters.get("y", 0)
            duration = parameters.get("duration", 1)
            return move_mouse(x, y, duration)

        elif action == "click_mouse":
            x = parameters.get("x")
            y = parameters.get("y")
            button = parameters.get("button", "left")
            if x is None or y is None:
                return JSONResponse(
                    status_code=400,
                    content={"error": "Coordinates (x, y) are required for click_mouse action"},
                )
            return click_mouse(x, y, button)

        elif action == "execute_terminator_command":
            command = parameters.get("command")
            if not command:
                return JSONResponse(
                    status_code=400,
                    content={"error": "Command is required for execute_terminator_command action"},
                )
            return execute_terminator_command(command)

        return JSONResponse(
            status_code=400,
            content={"error": "Invalid or unsupported action"},
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error", "details": str(e)},
        )



