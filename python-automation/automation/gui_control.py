import pyautogui
import subprocess
import time
import psutil
import pygetwindow as gw


def open_app(app_path):
    """
    Opens an application using its executable path.
    """
    try:
        subprocess.Popen(app_path, shell=True)
        time.sleep(2)  # Wait for the application to launch
        return {"status": f"Opened application: {app_path}"}
    except Exception as e:
        return {"error": f"Failed to open application: {str(e)}"}


def type_text(text):
    """
    Types the given text using the keyboard.
    """
    try:
        time.sleep(1)  # Allow time for the active window to be ready
        pyautogui.typewrite(text, interval=0.05)
        return {"status": f"Typed: {text}"}
    except Exception as e:
        return {"error": f"Failed to type text: {str(e)}"}


def move_mouse(x, y, duration=1):
    """
    Moves the mouse to the specified coordinates.
    """
    try:
        pyautogui.moveTo(x, y, duration=duration)
        return {"status": f"Mouse moved to ({x}, {y})"}
    except Exception as e:
        return {"error": f"Failed to move mouse: {str(e)}"}


def click_mouse(x=None, y=None, button="left"):
    """
    Clicks the mouse at the specified coordinates or the current position.
    """
    try:
        if x is not None and y is not None:
            pyautogui.click(x, y, button=button)
        else:
            pyautogui.click(button=button)
        return {"status": f"Mouse clicked at ({x}, {y}) with {button} button"}
    except Exception as e:
        return {"error": f"Failed to click mouse: {str(e)}"}


def send_hotkey(*keys):
    """
    Sends a keyboard shortcut (hotkey).
    """
    try:
        pyautogui.hotkey(*keys)
        return {"status": f"Hotkey {' + '.join(keys)} sent"}
    except Exception as e:
        return {"error": f"Failed to send hotkey: {str(e)}"}


def close_app_by_name(app_name):
    """
    Closes an application by its process name.
    """
    try:
        for proc in psutil.process_iter(['name']):
            if proc.info['name'] == app_name:
                proc.terminate()
                return {"status": f"Closed application: {app_name}"}
        return {"error": f"Application {app_name} not found"}
    except Exception as e:
        return {"error": f"Failed to close application: {str(e)}"}


def maximize_window(window_title):
    """
    Maximizes a window by its title.
    """
    try:
        window = gw.getWindowsWithTitle(window_title)
        if window:
            window[0].maximize()
            return {"status": f"Maximized window: {window_title}"}
        return {"error": f"Window with title '{window_title}' not found"}
    except Exception as e:
        return {"error": f"Failed to maximize window: {str(e)}"}
