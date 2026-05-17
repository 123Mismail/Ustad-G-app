import httpx

def handle_google_api_error(e: Exception) -> str:
    if isinstance(e, httpx.HTTPStatusError):
        if e.response.status_code == 403:
            return "Error: Google API key is invalid or missing permissions. Check credentials."
        if e.response.status_code == 429:
            return "Error: Google API quota exceeded. Wait before retrying or upgrade the API plan."
        return f"Error: Google API returned status {e.response.status_code}."
    if isinstance(e, httpx.TimeoutException):
        return "Error: Google API request timed out (30s). Check network or try again."
    return f"Error: Unexpected error — {type(e).__name__}: {str(e)}"
