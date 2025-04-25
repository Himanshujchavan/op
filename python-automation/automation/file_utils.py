import os
from datetime import datetime


def get_output_path(extension: str, prefix: str = "GeneratedFile", output_dir: str = None) -> str:
    """
    Generate a unique file path for output files.
    :param extension: File extension (e.g., 'txt', 'xlsx').
    :param prefix: Prefix for the file name.
    :param output_dir: Custom output directory (default is 'output' in the current working directory).
    :return: Full file path.
    """
    if output_dir is None:
        output_dir = os.path.join(os.getcwd(), "output")
    os.makedirs(output_dir, exist_ok=True)  # Ensure the directory exists
    filename = f"{prefix}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{extension}"
    return os.path.join(output_dir, filename)


def write_text_to_file(text: str, filename: str) -> str:
    """
    Save text to a file.
    :param text: Text content to save.
    :param filename: Full path of the file to save.
    :return: Success message with the file path.
    """
    try:
        with open(filename, "w", encoding="utf-8") as f:
            f.write(text)
        return f"File saved at: {filename}"
    except Exception as e:
        return f"Error saving file: {str(e)}"


def read_text_from_file(filename: str) -> str:
    """
    Read text content from a file.
    :param filename: Full path of the file to read.
    :return: Text content of the file.
    """
    try:
        with open(filename, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return f"Error: File not found at {filename}"
    except Exception as e:
        return f"Error reading file: {str(e)}"


def append_text_to_file(text: str, filename: str) -> str:
    """
    Append text to an existing file.
    :param text: Text content to append.
    :param filename: Full path of the file to append to.
    :return: Success message with the file path.
    """
    try:
        with open(filename, "a", encoding="utf-8") as f:
            f.write(text)
        return f"Text appended to file at: {filename}"
    except Exception as e:
        return f"Error appending to file: {str(e)}"


def file_exists(filepath: str) -> bool:
    """
    Check if a file exists.
    :param filepath: Full path of the file to check.
    :return: True if the file exists, False otherwise.
    """
    return os.path.exists(filepath)


def delete_file(filepath: str) -> str:
    """
    Delete a file if it exists.
    :param filepath: Full path of the file to delete.
    :return: Success or error message.
    """
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            return f"File deleted: {filepath}"
        return f"File not found: {filepath}"
    except Exception as e:
        return f"Error deleting file: {str(e)}"
