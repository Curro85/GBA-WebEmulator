import os
import hashlib
from pathlib import Path, PurePath
import traceback

from flask import Flask, jsonify, request, send_file
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, set_access_cookies, unset_jwt_cookies, \
    get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_cors import CORS
from models import db, User, Profile, Rom, Save
from config import Config
from utils import allowed_file, create_user_directories

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
    include_saves = request.form.get('include_saves', 'false') == 'true'

    if 'roms' not in request.files:
        return jsonify({'error': 'No se han seleccionado ROMs'}), 400

    create_user_directories(user.id)

    roms = request.files.getlist('roms')
    saves = request.files.getlist('saves')
    user_directory = os.path.join(app.config['ROM_FOLDER'], str(user.id))

    rom_ids = {}
    new_roms = []

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
            rom_ids[existing_rom.name] = existing_rom.id
            continue

        rom_name = rom.filename
        file_path = os.path.join(user_directory, rom_name)
        rom_path = os.path.join(str(user.id), rom_name)

        with open(file_path, 'wb') as f:
            f.write(rom_data)

        new_rom = Rom(name=rom_name, hash=rom_hash, size=rom_size, path=rom_path, user_id=user.id)
        db.session.add(new_rom)
        new_roms.append(new_rom)

    try:
        db.session.flush()
        for rom in new_roms:
            rom_ids[rom.name] = rom.id
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al subir ROMs'}), 500

    if include_saves and rom_ids:
        for save in saves:
            base_save_name = os.path.splitext(save.filename)[0]

            matching_roms = [name for name in rom_ids if name.startswith(base_save_name)]

            if matching_roms:
                rom_name = matching_roms[0]
                rom_id = rom_ids[rom_name]

                save_data = save.read()
                save_size = len(save_data)
                save_name = save.filename
                file_save_path = os.path.join(user_directory, 'saves', save_name)
                save_path = os.path.join(str(user.id), 'saves', save_name)

                with open(file_save_path, 'wb') as f:
                    f.write(save_data)

                new_save = Save(
                    name=save_name,
                    size=save_size,
                    path=save_path,
                    user_id=user.id,
                    rom_id=rom_id,
                )
                db.session.add(new_save)

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

        relative = PurePath(rom.path)
        safe_path = Path(app.config['ROM_FOLDER']) / relative

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


@app.route('/api/loadsaves/<string:rom_hash>', methods=['GET'])
@jwt_required()
def loadsaves(rom_hash):
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    rom = Rom.query.filter_by(hash=rom_hash, user_id=user.id).first()

    if not rom:
        return jsonify({'error': 'ROM no encontrada'}), 404

    saves = Save.query.filter_by(rom_id=rom.id).order_by(Save.upload_date.desc()).limit(3).all()
    return jsonify([{
        'id': save.id,
        'name': save.name,
        'size': save.size,
        'upload_date': save.upload_date,
    } for save in saves])


@app.route('/api/loadsave/<int:save_id>', methods=['GET'])
@jwt_required()
def loadsave(save_id):
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    save = Save.query.filter_by(id=save_id, user_id=user.id).first()

    if not save:
        return jsonify({'error': 'Save no encontrada'}), 404

    try:
        if not save.path.startswith(str(user.id)):
            return jsonify({'error': 'Acceso denegado'}), 403

        safe_path = os.path.join(app.config['ROM_FOLDER'], save.path)
        if not os.path.isfile(safe_path):
            return jsonify({'error': 'Archivo de partida no encontrado'}), 404

        return send_file(
            safe_path,
            mimetype='application/octet-stream',
            as_attachment=False,
            download_name=save.name,
        )
    except Exception as e:
        return jsonify({'error': 'Hubo un error inesperado'}), 500


if __name__ == '__main__':
    app.run(debug=True)
    # app.run(host='0.0.0.0', debug=True, port=5000)
