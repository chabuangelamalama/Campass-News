import os
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True,
)


def upload_image(file_bytes: bytes, folder: str = "yearbook") -> str:
    """Uploads raw image bytes to Cloudinary and returns the public URL."""
    result = cloudinary.uploader.upload(file_bytes, folder=folder)
    return result["secure_url"]