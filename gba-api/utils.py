import os
import hashlib

from flask import Response

from config import Config


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in {
        "gba",
        "gbc",
        "gb",
    }


def create_user_directories(user_id):
    base_dir = Config.ROM_FOLDER
    dirs = [
        os.path.join(base_dir, str(user_id)),
        os.path.join(base_dir, str(user_id), "roms"),
        os.path.join(base_dir, str(user_id), "saves"),
    ]

    for directory in dirs:
        os.makedirs(directory, exist_ok=True)


def get_file_size(file):
    current_pos = file.tell()
    file.seek(0, 2)
    size = file.tell()
    file.seek(current_pos)
    return size


def calculate_hash_and_save_streaming(file, file_path, chunk_size=16384):
    hash_sha256 = hashlib.sha256()
    file.seek(0)

    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "wb") as f:
        while True:
            chunk = file.read(chunk_size)
            if not chunk:
                break
            hash_sha256.update(chunk)
            f.write(chunk)

    file.seek(0)
    return hash_sha256.hexdigest()


def save_file_streaming(file, file_path, chunk_size=16384):
    file.seek(0)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "wb") as f:
        while True:
            chunk = file.read(chunk_size)
            if not chunk:
                break
            f.write(chunk)

    file.seek(0)


def stream_file_response(file_path, filename, chunk_size=16384, cache_timeout=3600):
    def generate_chunks():
        try:
            with open(file_path, "rb") as f:
                while True:
                    chunk = f.read(chunk_size)
                    if not chunk:
                        break
                    yield chunk
        except Exception as e:
            print.error(f"Error streaming file {file_path}: {str(e)}")
            return

    file_size = os.path.getsize(file_path)

    return Response(
        generate_chunks(),
        mimetype="application/octet-stream",
        headers={
            "Content-Disposition": f"inline; filename={filename}",
            "Content-Length": str(file_size),
            "Cache-Control": f"public, max-age={cache_timeout}",
            "Accept-Ranges": "bytes",
            "X-Content-Type-Options": "nosniff",
        },
    )
