from config import Config
import os


def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in {'gba', 'gbc', 'gb'}


def create_user_directories(user_id):
    base_dir = Config.ROM_FOLDER
    dirs = [
        os.path.join(base_dir, str(user_id)),
        os.path.join(base_dir, str(user_id), 'roms'),
        os.path.join(base_dir, str(user_id), 'saves'),
    ]

    for directory in dirs:
        os.makedirs(directory, exist_ok=True)
