import imaplib
import email
import os


def summarize_emails(email_count=5, folder="inbox", mark_as_read=False):
    """
    Fetch and summarize the most recent emails from the specified folder.
    :param email_count: Number of recent emails to fetch.
    :param folder: Email folder to fetch emails from (default is 'inbox').
    :param mark_as_read: Whether to mark fetched emails as read.
    :return: A dictionary containing email summaries or an error message.
    """
    try:
        # Use environment variables for credentials
        email_user = os.getenv("EMAIL_USER")
        email_password = os.getenv("EMAIL_PASSWORD")

        if not email_user or not email_password:
            return {"error": "Email credentials not found in environment variables"}

        # Connect to the email server
        mail = imaplib.IMAP4_SSL('imap.gmail.com')
        mail.login(email_user, email_password)

        # Select the folder
        status, messages = mail.select(folder)
        if status != "OK":
            return {"error": f"Failed to select folder: {folder}"}

        # Search for all emails in the folder
        status, message_ids = mail.search(None, 'ALL')
        if status != "OK":
            return {"error": "Failed to search for emails"}

        message_ids = message_ids[0].split()
        if not message_ids:
            return {"error": f"No emails found in folder: {folder}"}

        summaries = []

        # Fetch the most recent emails
        for msg_id in message_ids[-email_count:]:
            status, data = mail.fetch(msg_id, '(RFC822)')
            if status != "OK":
                return {"error": f"Failed to fetch email with ID: {msg_id}"}

            raw_email = data[0][1]
            msg = email.message_from_bytes(raw_email)

            # Parse email content
            email_summary = {
                "From": msg["From"],
                "Subject": msg["Subject"],
                "Date": msg["Date"]
            }

            # Extract email body (plain text or HTML)
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    email_summary["Body"] = part.get_payload(decode=True).decode()
                    break
                elif part.get_content_type() == "text/html":
                    email_summary["Body"] = part.get_payload(decode=True).decode()
                    break

            summaries.append(email_summary)

            # Mark email as read if specified
            if mark_as_read:
                mail.store(msg_id, '+FLAGS', '\\Seen')

        mail.logout()
        return {"emails": summaries}
    except imaplib.IMAP4.error as e:
        return {"error": f"IMAP error: {str(e)}"}
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}
