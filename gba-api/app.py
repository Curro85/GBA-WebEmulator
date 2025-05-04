import os
import hashlib
import traceback

from flask import Flask, jsonify, request, send_file
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, set_access_cookies, unset_jwt_cookies, \
    get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_cors import CORS
from models import db, User, Profile, Rom
from config import Config
from utils import allowed_file

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
jwt = JWTManager(app)
CORS(app, supports_credentials=True)

with app.app_context():
    os.makedirs(app.config['ROM_FOLDER'], exist_ok=True)
    db.create_all()


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Usuario y contraseña requeridos'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'El usuario ya existe'}), 400
    try:
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=new_user.username)
        response = jsonify({'msg': 'Usuario registrado'})
        set_access_cookies(response, access_token)
        return response, 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al registrar el usuario'}), 500


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    password = data.get('password')

    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Credenciales incorrectas'}), 401

    access_token = create_access_token(identity=user.username)
    response = jsonify({'msg': 'Login exitoso'})
    set_access_cookies(response, access_token)
    return response, 200


@app.route('/api/logout', methods=['POST'])
def logout():
    response = jsonify({'msg': 'Logout exitoso'})
    unset_jwt_cookies(response)
    return response, 200


@app.route('/api/profile', methods=['GET'])
@jwt_required()
def profile():
    username = get_jwt_identity()
    return jsonify({'username': username}), 200


@app.route('/api/uploadroms', methods=['POST'])
@jwt_required()
def uploadroms():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()

    if 'roms' not in request.files:
        return jsonify({'error': 'No se han seleccionado ROMs'}), 400

    roms = request.files.getlist('roms')
    user_directory = os.path.join(app.config['ROM_FOLDER'], str(user.id))
    os.makedirs(user_directory, exist_ok=True)

    for rom in roms:
        if not allowed_file(rom.filename):
            continue

        rom_data = rom.read()
        rom_size = len(rom_data)
        if rom_size < (32 * 1024) or rom_size > (32 * 1024 * 1024):  # De 32 kilobytes a 32 megabytes
            continue

        rom_hash = hashlib.sha256(rom_data).hexdigest()
        existing_rom = Rom.query.filter_by(hash=rom_hash, user_id=user.id).first()
        if existing_rom:
            continue

        rom_name = secure_filename(rom.filename)
        file_path = os.path.join(user_directory, rom_name)
        rom_path = os.path.join(str(user.id), rom_name)

        with open(file_path, 'wb') as f:
            f.write(rom_data)

        new_rom = Rom(name=rom_name, hash=rom_hash, size=rom_size, path=rom_path, user_id=user.id)
        db.session.add(new_rom)

    try:
        db.session.commit()
    except Exception as e:
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': 'Error al subir las ROMs'}), 500

    return jsonify({'msg': 'ROMs subidos'}), 200


@app.route('/api/loadroms', methods=['GET'])
@jwt_required()
def loadroms():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    roms = Rom.query.filter_by(user_id=user.id).all()
    return jsonify([{
        'name': rom.name,
        'hash': rom.hash,
        'size': rom.size,
        'upload_date': rom.upload_date,
    } for rom in roms])


@app.route('/api/loadrom/<string:rom_hash>', methods=['GET'])
@jwt_required()
def loadrom(rom_hash):
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    rom = Rom.query.filter_by(hash=rom_hash, user_id=user.id).first()

    if not rom:
        return jsonify({'error': 'ROM no encontrada'}), 404

    try:
        if not rom.path.startswith(str(user.id)):
            return jsonify({'error': 'Acceso denegado'}), 403
        safe_path = os.path.join(app.config['ROM_FOLDER'], rom.path)

        if not os.path.isfile(safe_path):
            return jsonify({'error': 'Archivo de ROM no encontrado'}), 404

        return send_file(
            safe_path,
            mimetype='application/octet-stream',
            as_attachment=False,
            download_name=rom.name,
        )
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': 'Error al cargar la ROM'}), 500


@app.route('/api/users')
def get_users():
    return jsonify([{'id': 1, 'name': 'Pruebita'},
                    {'id': 2, 'name': 'Francisco'}])


if __name__ == '__main__':
    app.run(debug=True)
