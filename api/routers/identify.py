"""Plant identification endpoint using Claude Vision API."""

import base64
import json
import os
from fastapi import APIRouter, HTTPException, status, UploadFile, File
from pydantic import BaseModel
import anthropic

router = APIRouter(prefix="/identify", tags=["identify"])

# Allowed image types for identification
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


class IdentifyResponse(BaseModel):
    """Response model for plant identification results."""
    common_name: str
    scientific_name: str
    description: str
    confidence: float  # 0.0 to 1.0
    care_tips: list[str]


# Prompt that asks Claude to return structured JSON about the plant
IDENTIFY_PROMPT = """You are a plant identification expert. Analyze this image and identify the plant.

Return your response as a JSON object with exactly these fields:
- "common_name": the most common English name for this plant
- "scientific_name": the Latin/binomial scientific name
- "description": a 1-2 sentence description of the plant and its notable features
- "confidence": a number between 0.0 and 1.0 representing how confident you are in the identification (be honest — use lower values if the image is unclear or the plant is hard to distinguish)
- "care_tips": an array of 3-5 short care tips for this plant

Return ONLY the JSON object, no other text or markdown formatting."""


@router.post("/", response_model=IdentifyResponse, status_code=status.HTTP_200_OK)
async def identify_plant(file: UploadFile = File(...)):
    """
    Upload a plant photo and get an AI-powered identification.

    Sends the image to Claude Vision API and returns structured plant info.
    Requires ANTHROPIC_API_KEY environment variable to be set.
    """
    # Check that the API key is configured
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Plant identification service not configured (missing API key)"
        )

    # Validate file has a name
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided"
        )

    # Check file extension
    from pathlib import Path
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Must be: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read and validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024:.1f} MB"
        )

    # Map file extension to media type for the Claude API
    media_type_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
    }
    media_type = media_type_map[file_ext]

    # Base64-encode the image for the Claude API
    image_b64 = base64.b64encode(contents).decode("utf-8")

    # Call Claude Vision API
    try:
        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_b64,
                            },
                        },
                        {
                            "type": "text",
                            "text": IDENTIFY_PROMPT,
                        },
                    ],
                }
            ],
        )
    except anthropic.APIError as e:
        # Something went wrong calling the Claude API
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Plant identification service error: {str(e)}"
        )

    # Parse the JSON response from Claude
    raw_text = message.content[0].text.strip()
    try:
        # Strip markdown code fences if Claude wraps the response
        if raw_text.startswith("```"):
            raw_text = raw_text.split("\n", 1)[1]  # remove first line (```json)
            raw_text = raw_text.rsplit("```", 1)[0]  # remove closing ```
        result = json.loads(raw_text)
    except (json.JSONDecodeError, IndexError):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to parse plant identification response"
        )

    # Validate and return structured response
    try:
        return IdentifyResponse(
            common_name=result["common_name"],
            scientific_name=result["scientific_name"],
            description=result["description"],
            confidence=float(result["confidence"]),
            care_tips=result.get("care_tips", []),
        )
    except (KeyError, ValueError, TypeError) as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Unexpected response format from identification service: {str(e)}"
        )
