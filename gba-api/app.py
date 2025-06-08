import os
import uuid
import traceback
from datetime import datetime, timedelta
from pathlib import Path, PurePath

from flask import Flask, jsonify, request
from flask_migrate import Migrate
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    set_access_cookies,
    unset_jwt_cookies,
    get_jwt_identity,
    get_jwt,
)
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flasgger import Swagger, swag_from
from google import genai
from google.genai import types

from models import db, User, Profile, Rom, Save
from config import Config
from validators import validate_password
from utils import (
    allowed_file,
    create_user_directories,
    get_file_size,
    save_file_streaming,
    stream_file_response,
    calculate_hash_and_save_streaming,
)

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
swagger = Swagger(app)
client = genai.Client(api_key=app.config["GEMINI_API_KEY"])
CORS(app, supports_credentials=True)

with app.app_context():
    os.makedirs(app.config["ROM_FOLDER"], exist_ok=True)


@app.after_request
def refresh_jwt(response):
    """
    Actualiza el JWT si está cerca de expirar
    """
    try:
        exp_timestamp_jwt = get_jwt()["exp"]
        now = datetime.now()
        refresh_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if refresh_timestamp > exp_timestamp_jwt:
            access_token = create_access_token(identity=get_jwt_identity())
            set_access_cookies(response, access_token)
        return response
    except (RuntimeError, KeyError):
        return response


@app.route("/gemini", methods=["POST"])
def gemini():
    data = request.get_json()
    content = data.get("content")
    history = data.get("history", [])

    contents = []

    if history:
        for msg in history:
            contents.append(
                {
                    "role": "user" if msg["type"] == "user" else "model",
                    "parts": [{"text": msg["content"]}],
                }
            )

    contents.append({"role": "user", "parts": [{"text": content}]})

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            config=types.GenerateContentConfig(
                system_instruction="Eres un señor mayor que le gustan los videojuegos y entiendes mucho sobre ellos"
            ),
            contents=contents,
        )

        return jsonify({"response": response.text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/register", methods=["POST"])
@swag_from("docs/register.yml")
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Usuario y contraseña requeridos"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "El usuario ya existe"}), 400

    password_error = validate_password(password)
    if password_error:
        return jsonify({"error": password_error}), 400

    try:
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.flush()

        new_profile = Profile(user_id=new_user.id, name="", bio="", image="")
        db.session.add(new_profile)
        db.session.commit()

        create_user_directories(new_user.id)
        access_token = create_access_token(identity=new_user.username)
        response = jsonify({"msg": "Usuario registrado"})
        set_access_cookies(response, access_token)
        return response, 201
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Error al registrar el usuario"}), 500


@app.route("/api/login", methods=["POST"])
@swag_from("docs/login.yml")
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get("username")).first()
    password = data.get("password")

    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Credenciales incorrectas"}), 401

    access_token = create_access_token(identity=user.username)
    response = jsonify({"msg": "Login exitoso"})
    set_access_cookies(response, access_token)
    return response, 200


@app.route("/api/logout", methods=["POST"])
@swag_from("docs/logout.yml")
def logout():
    response = jsonify({"msg": "Logout exitoso"})
    unset_jwt_cookies(response)
    return response, 200


@app.route("/api/user", methods=["GET"])
@jwt_required()
@swag_from("docs/user.yml")
def user():
    username = get_jwt_identity()
    return jsonify({"username": username}), 200


@app.route("/api/profile", methods=["GET"])
@jwt_required()
@swag_from("docs/profile.yml")
def profile():
    try:
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()

        if not user:
            return jsonify({"success": False, "message": "Usuario no encontrado"}), 404

        if not user.profile:
            return jsonify(
                {
                    "success": False,
                    "message": "Perfil no encontrado. Debes crear un perfil primero.",
                }
            ), 404

        total_roms = len(user.roms)
        total_saves = sum(len(rom.saves) for rom in user.roms)
        total_storage_used = sum(rom.size for rom in user.roms)

        recent_roms = sorted(user.roms, key=lambda x: x.upload_date, reverse=True)[:3]

        recent_roms_data = [
            {
                "name": rom.name,
                "upload_date": rom.upload_date.isoformat() if rom.upload_date else None,
            }
            for rom in recent_roms
        ]

        response_data = {
            "success": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "register_date": user.register_date.isoformat()
                if user.register_date
                else None,
            },
            "profile": {
                "id": user.profile.id,
                "name": user.profile.name,
                "bio": user.profile.bio,
                "image": user.profile.image,
            },
            "stats": {
                "total_roms": total_roms,
                "total_saves": total_saves,
                "total_storage_used": total_storage_used,
                "recent_roms": recent_roms_data,
            },
        }

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify(
            {
                "success": False,
                "message": "Error interno del servidor",
                "error": str(e) if app.debug else None,
            }
        ), 500


@app.route("/api/uploadroms", methods=["POST"])
@jwt_required()
@swag_from("docs/uploadroms.yml")
def uploadroms():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    include_saves = request.form.get("include_saves", "false") == "true"

    if "roms" not in request.files:
        return jsonify({"error": "No se han seleccionado ROMs"}), 400

    roms = request.files.getlist("roms")
    saves = request.files.getlist("saves")
    user_directory = os.path.join(app.config["ROM_FOLDER"], str(user.id))

    rom_ids = {}
    new_roms = []

    for rom in roms:
        if not allowed_file(rom.filename):
            continue

        try:
            rom_size = get_file_size(rom)
            if rom_size < (32 * 1024) or rom_size > (32 * 1024 * 1024):
                continue

            rom_name = rom.filename
            file_path = os.path.join(user_directory, "roms", rom_name)
            rom_path = os.path.join(str(user.id), "roms", rom_name)

            rom_hash = calculate_hash_and_save_streaming(rom, file_path)
            existing_rom = Rom.query.filter_by(hash=rom_hash, user_id=user.id).first()
            if existing_rom:
                rom_ids[existing_rom.name] = existing_rom.id
                if os.path.exists(file_path):
                    os.replace(rom_name, file_path)
                continue

            new_rom = Rom(
                name=rom_name,
                hash=rom_hash,
                size=rom_size,
                path=rom_path,
                user_id=user.id,
            )
            new_roms.append(new_rom)

        except Exception as e:
            app.logger.error(f"Error processing ROM {rom.filename}: {str(e)}")
            continue

    try:
        if new_roms:
            db.session.add_all(new_roms)
            db.session.flush()

            for rom in new_roms:
                rom_ids[rom.name] = rom.id
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Error al subir ROMs"}), 500

    new_saves = []
    if include_saves and rom_ids:
        for save in saves:
            try:
                base_save_name = os.path.splitext(save.filename)[0]
                save_extension = os.path.splitext(save.filename)[1]
                matching_roms = [
                    name for name in rom_ids if name.startswith(base_save_name)
                ]

                if matching_roms:
                    rom_name = matching_roms[0]
                    rom_id = rom_ids[rom_name]

                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    unique_id = str(uuid.uuid4())[:8]
                    save_size = get_file_size(save)
                    save_name = save.filename
                    unique_save_name = (
                        f"{base_save_name}_{timestamp}_{unique_id}{save_extension}"
                    )
                    file_save_path = os.path.join(
                        user_directory, "saves", unique_save_name
                    )
                    save_path = os.path.join(str(user.id), "saves", unique_save_name)

                    save_file_streaming(save, file_save_path)

                    new_save = Save(
                        name=save_name,
                        size=save_size,
                        path=save_path,
                        user_id=user.id,
                        rom_id=rom_id,
                    )
                    new_saves.append(new_save)

            except Exception as e:
                app.logger.error(f"Error processing save{save.filename}: {str(e)}")

        if new_saves:
            db.session.add_all(new_saves)

    try:
        db.session.commit()
    except Exception:
        traceback.print_exc()
        db.session.rollback()
        return jsonify({"error": "Error al subir las ROMs"}), 500

    return jsonify({"msg": "ROMs subidos"}), 200


@app.route("/api/loadroms", methods=["GET"])
@jwt_required()
@swag_from("docs/loadroms.yml")
def loadroms():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    roms = Rom.query.filter_by(user_id=user.id).all()
    return jsonify(
        [
            {
                "name": rom.name,
                "hash": rom.hash,
                "size": rom.size,
                "upload_date": rom.upload_date,
            }
            for rom in roms
        ]
    )


@app.route("/api/loadrom/<string:rom_hash>", methods=["GET"])
@jwt_required()
@swag_from("docs/loadrom.yml")
def loadrom(rom_hash):
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    rom = Rom.query.filter_by(hash=rom_hash, user_id=user.id).first()

    if not rom:
        return jsonify({"error": "ROM no encontrada"}), 404

    try:
        if not rom.path.startswith(str(user.id)):
            return jsonify({"error": "Acceso denegado"}), 403

        relative = PurePath(rom.path)
        safe_path = Path(app.config["ROM_FOLDER"]) / relative

        if not os.path.isfile(safe_path):
            return jsonify({"error": "Archivo de ROM no encontrado"}), 404

        return stream_file_response(
            file_path=str(safe_path),
            filename=rom.name,
            chunk_size=32768,
            cache_timeout=3600,
        )
    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Error al cargar la ROM"}), 500


@app.route("/api/deleterom/<string:rom_hash>", methods=["DELETE"])
@jwt_required()
@swag_from("docs/deleterom.yml")
def deleterom(rom_hash):
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    rom = Rom.query.filter_by(hash=rom_hash, user_id=user.id).first()

    if not rom:
        return jsonify({"error": "ROM no encontrada"}), 404

    if not rom.path.startswith(str(user.id)):
        return jsonify({"error": "Acceso denegado"}), 403

    try:
        relative = PurePath(rom.path)
        safe_path = Path(app.config["ROM_FOLDER"]) / relative

        if not os.path.isfile(safe_path):
            return jsonify({"error": "Error al eliminar la ROM"}), 500

        os.remove(safe_path)
        db.session.delete(rom)
        db.session.commit()

    except Exception:
        db.session.rollback()
        return jsonify({"error": "No se ha podido eliminar la ROM"}), 500

    return jsonify({"msg": "ROM eliminada"}), 200


@app.route("/api/loadsaves/<string:rom_hash>", methods=["GET"])
@jwt_required()
@swag_from("docs/loadsaves.yml")
def loadsaves(rom_hash):
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    rom = Rom.query.filter_by(hash=rom_hash, user_id=user.id).first()

    if not rom:
        return jsonify({"error": "ROM no encontrada"}), 404

    saves = (
        Save.query.filter_by(rom_id=rom.id)
        .order_by(Save.upload_date.desc())
        .limit(3)
        .all()
    )
    return jsonify(
        [
            {
                "id": save.id,
                "name": save.name,
                "size": save.size,
                "upload_date": save.upload_date,
            }
            for save in saves
        ]
    )


@app.route("/api/loadsave/<int:save_id>", methods=["GET"])
@jwt_required()
@swag_from("docs/loadsave.yml")
def loadsave(save_id):
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    save = Save.query.filter_by(id=save_id, user_id=user.id).first()

    if not save:
        return jsonify({"error": "Save no encontrada"}), 404

    try:
        if not save.path.startswith(str(user.id)):
            return jsonify({"error": "Acceso denegado"}), 403

        relative = PurePath(save.path)
        safe_path = Path(app.config["ROM_FOLDER"]) / relative

        if not os.path.isfile(safe_path):
            return jsonify({"error": "Archivo de partida no encontrado"}), 404

        return stream_file_response(
            file_path=str(safe_path),
            filename=save.name,
            chunk_size=8192,
            cache_timeout=1800,
        )

    except Exception:
        return jsonify({"error": "Hubo un error inesperado"}), 500


# if __name__ == "__main__":
#     app.run(debug=True)
