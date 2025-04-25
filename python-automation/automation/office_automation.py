import win32com.client as win32
from automation.file_utils import get_output_path
import os


def create_word_doc(text: str, font_size: int = 12, bold: bool = False):
    try:
        word = win32.gencache.EnsureDispatch('Word.Application')
        doc = word.Documents.Add()
        word.Visible = False

        # Add text and apply formatting
        doc.Content.Text = text
        if bold:
            doc.Content.Font.Bold = True
        doc.Content.Font.Size = font_size

        filename = get_output_path("docx", "GeneratedDoc")
        os.makedirs(os.path.dirname(filename), exist_ok=True)  # Ensure directory exists
        doc.SaveAs(filename)
        doc.Close()
        word.Quit()
        return f"Word document created at: {filename}"
    except Exception as e:
        return f"Error creating Word document: {str(e)}"


def create_excel_with_data(data, sheet_name: str = "Sheet1"):
    try:
        excel = win32.gencache.EnsureDispatch('Excel.Application')
        wb = excel.Workbooks.Add()
        ws = wb.Worksheets(1)  # Use the default worksheet
        ws.Name = sheet_name
        excel.Visible = False

        # Write data to the worksheet
        for row_idx, row in enumerate(data, start=1):
            for col_idx, value in enumerate(row, start=1):
                ws.Cells(row_idx, col_idx).Value = value

        # Apply formatting (e.g., bold headers)
        for col_idx in range(1, len(data[0]) + 1):
            ws.Cells(1, col_idx).Font.Bold = True

        filename = get_output_path("xlsx", "GeneratedExcel")
        os.makedirs(os.path.dirname(filename), exist_ok=True)  # Ensure directory exists
        wb.SaveAs(filename)
        wb.Close()
        excel.Quit()
        return f"Excel file created at: {filename}"
    except Exception as e:
        return f"Error creating Excel file: {str(e)}"
    finally:
        # Ensure Excel quits if an error occurs
        try:
            excel.Quit()
        except:
            pass


def send_outlook_email(to, subject, body, attachments=None):
    try:
        outlook = win32.Dispatch('outlook.application')
        mail = outlook.CreateItem(0)
        mail.To = to
        mail.Subject = subject
        mail.Body = body

        # Add attachments if provided
        if attachments:
            for attachment in attachments:
                if os.path.exists(attachment):
                    mail.Attachments.Add(attachment)
                else:
                    print(f"Warning: Attachment not found: {attachment}")  # Log missing attachment

        mail.Send()
        return f"Email sent to {to}"
    except Exception as e:
        return f"Error sending email: {str(e)}"


