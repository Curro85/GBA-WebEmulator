import os
import uuid
import hashlib
import traceback
from datetime import datetime, timedelta
from pathlib import Path, PurePath
from flask import Flask, jsonify, request, send_file
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, set_access_cookies, unset_jwt_cookies, \
    get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from models import db, User, Profile, Rom, Save
from config import Config
from flasgger import Swagger
from utils import allowed_file, create_user_directories

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
swagger = Swagger(app)
CORS(app, supports_credentials=True)

with app.app_context():
    os.makedirs(app.config['ROM_FOLDER'], exist_ok=True)


@app.after_request
def refresh_jwt(response):
    """
    Actualiza el JWT si está cerca de expirar
    ---
    tags:
      - Autenticación
    responses:
      200:
        description: JWT refrescado exitosamente
    """
    try:
        exp_timestamp_jwt = get_jwt()['exp']
        now = datetime.now()
        refresh_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if refresh_timestamp > exp_timestamp_jwt:
            access_token = create_access_token(identity=get_jwt_identity())
            set_access_cookies(response, access_token)
        return response
    except (RuntimeError, KeyError):
        return response


@app.route('/api/register', methods=['POST'])
def register():
    """
    Registra un nuevo usuario
    ---
    tags:
      - Usuarios
    parameters:
      - in: body
        name: body
        required: true
        schema:
          id: Register
          required:
            - username
            - password
          properties:
            username:
              type: string
              description: Nombre de usuario
            password:
              type: string
              description: Contraseña
    responses:
      200:
        description: Usuario registrado exitosamente
        schema:
          properties:
            msg:
              type: string
      400:
        description: Error en datos enviados o usuario ya existe
      500:
        description: Error interno del servidor
    """
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
        db.session.flush()

        new_profile = Profile(user_id=new_user.id, name='', bio='', image='')
        db.session.add(new_profile)
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
    """
    Login de usuario
    ---
    tags:
      - Autenticación
    parameters:
      - name: body
        in: body
        required: true
        schema:
          id: Login
          required:
            - username
            - password
          properties:
            username:
              type: string
              description: Nombre de usuario
            password:
              type: string
              description: Contraseña
    responses:
      200:
        description: Login exitoso
        schema:
          properties:
            msg:
              type: string
      401:
        description: Credenciales incorrectas
      500:
        description: Error interno del servidor
    """
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
    """
    Cierre de sesión de usuario
    ---
    tags:
      - Autenticación
    responses:
      200:
        description: Logout exitoso
    """
    response = jsonify({'msg': 'Logout exitoso'})
    unset_jwt_cookies(response)
    return response, 200


@app.route('/api/user', methods=['GET'])
@jwt_required()
def user():
    """
    Obtiene el usuario autenticado para mantener su sesión
    ---
    tags:
      - Usuarios
    security:
      - cookieAuth: []
    responses:
      200:
        description: Usuario
        schema:
          properties:
            username:
              type: string
    """
    username = get_jwt_identity()
    return jsonify({'username': username}), 200


@app.route('/api/profile', methods=['GET'])
@jwt_required()
def profile():
    """
    Obtiene el perfil del usuario para mostrar sus datos
    ---
    tags:
      - Usuarios
    security:
      - cookieAuth: []
    responses:
      200:
        description: Perfil del usuario
        schema:
          properties:
            name:
              type: string
            bio:
              type: string
            image:
              type: string
    """
    try:
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()

        if not user:
            return jsonify({
                'success': False,
                'message': 'Usuario no encontrado'
            }), 404

        if not user.profile:
            return jsonify({
                'success': False,
                'message': 'Perfil no encontrado. Debes crear un perfil primero.'
            }), 404

        total_roms = len(user.roms)
        total_saves = sum(len(rom.saves) for rom in user.roms)
        total_storage_used = sum(rom.size for rom in user.roms)

        recent_roms = sorted(
            user.roms,
            key=lambda x: x.upload_date,
            reverse=True
        )[:3]

        recent_roms_data = [{
            'name': rom.name,
            'upload_date': rom.upload_date.isoformat() if rom.upload_date else None
        } for rom in recent_roms]

        response_data = {
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'register_date': user.register_date.isoformat() if user.register_date else None
            },
            'profile': {
                'id': user.profile.id,
                'name': user.profile.name,
                'bio': user.profile.bio,
                'image': user.profile.image
            },
            'stats': {
                'total_roms': total_roms,
                'total_saves': total_saves,
                'total_storage_used': total_storage_used,
                'recent_roms': recent_roms_data
            }
        }

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor',
            'error': str(e) if app.debug else None
        }), 500


@app.route('/api/uploadroms', methods=['POST'])
@jwt_required()
def uploadroms():
    """
    Subida de ROMs y partidas guardadas asociadas
    ---
    tags:
      - ROMs
    consumes:
      - multipart/form-data
    parameters:
      - name: include_saves
        in: formData
        type: boolean
        description: Incluir partidas guardadas
      - name: roms
        in: formData
        type: file
        required: true
        description: Archivos ROM (.gba, .zip, etc.)
      - name: saves
        in: formData
        type: file
        description: Archivos de partidas guardadas
    security:
      - cookieAuth: []
    responses:
      200:
        description: ROMs subidos exitosamente
        schema:
          properties:
            msg:
              type: string
      400:
        description: Error en la subida de archivos
      500:
        description: Error interno del servidor
    """
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
        # De 32 kilobytes a 32 megabytes
        if rom_size < (32 * 1024) or rom_size > (32 * 1024 * 1024):
            continue

        rom_hash = hashlib.sha256(rom_data).hexdigest()
        existing_rom = Rom.query.filter_by(
            hash=rom_hash, user_id=user.id).first()
        if existing_rom:
            rom_ids[existing_rom.name] = existing_rom.id
            continue

        rom_name = rom.filename
        file_path = os.path.join(user_directory, 'roms', rom_name)
        rom_path = os.path.join(str(user.id), 'roms', rom_name)

        with open(file_path, 'wb') as f:
            f.write(rom_data)

        new_rom = Rom(name=rom_name, hash=rom_hash,
                      size=rom_size, path=rom_path, user_id=user.id)
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
            save_extension = os.path.splitext(save.filename)[1]
            matching_roms = [
                name for name in rom_ids if name.startswith(base_save_name)]

            if matching_roms:
                rom_name = matching_roms[0]
                rom_id = rom_ids[rom_name]

                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                unique_id = str(uuid.uuid4())[:8]
                save_data = save.read()
                save_size = len(save_data)
                save_name = save.filename
                unique_save_name = f'{base_save_name}_{timestamp}_{unique_id}{save_extension}'
                print(unique_save_name)
                file_save_path = os.path.join(
                    user_directory, 'saves', unique_save_name)
                save_path = os.path.join(
                    str(user.id), 'saves', unique_save_name)

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
    """
    Lista de ROMs subidas por el usuario
    ---
    tags:
      - ROMs
    security:
      - cookieAuth: []
    responses:
      200:
        description: Lista de ROMs
        schema:
          type: array
          items:
            type: object
            properties:
              name:
                type: string
              hash:
                type: string
              size:
                type: integer
              upload_date:
                type: string
                format: date-time
    """
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
    """
    Inserta una ROM específica por hash al emulador
    ---
    tags:
      - ROMs
    parameters:
      - name: rom_hash
        in: path
        type: string
        required: true
        description: Hash de la ROM
    security:
      - cookieAuth: []
    responses:
      200:
        description: Archivo ROM enviado
      403:
        description: Acceso denegado
      404:
        description: ROM no encontrada
      500:
        description: Error interno del servidor
    """
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
    """
    Lista de últimas partidas guardadas para una ROM
    ---
    tags:
      - Datos de Guardado
    parameters:
      - name: rom_hash
        in: path
        type: string
        required: true
        description: Hash de la ROM
    security:
      - cookieAuth: []
    responses:
      200:
        description: Lista de partidas guardadas
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              name:
                type: string
              size:
                type: integer
              upload_date:
                type: string
                format: date-time
      404:
        description: ROM no encontrada
    """
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    rom = Rom.query.filter_by(hash=rom_hash, user_id=user.id).first()

    if not rom:
        return jsonify({'error': 'ROM no encontrada'}), 404

    saves = Save.query.filter_by(rom_id=rom.id).order_by(
        Save.upload_date.desc()).limit(3).all()
    return jsonify([{
        'id': save.id,
        'name': save.name,
        'size': save.size,
        'upload_date': save.upload_date,
    } for save in saves])


@app.route('/api/loadsave/<int:save_id>', methods=['GET'])
@jwt_required()
def loadsave(save_id):
    """
    Inserta una partida guardada por ID al emulador
    ---
    tags:
      - Datos de Guardado
    parameters:
      - name: save_id
        in: path
        type: integer
        required: true
        description: ID de la partida guardada
    security:
      - cookieAuth: []
    responses:
      200:
        description: Archivo de partida enviado
      403:
        description: Acceso denegado
      404:
        description: Partida no encontrada
      500:
        description: Error interno del servidor
    """
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    save = Save.query.filter_by(id=save_id, user_id=user.id).first()

    if not save:
        return jsonify({'error': 'Save no encontrada'}), 404

    try:
        if not save.path.startswith(str(user.id)):
            return jsonify({'error': 'Acceso denegado'}), 403
        relative = PurePath(save.path)
        safe_path = Path(app.config['ROM_FOLDER']) / relative
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


# if __name__ == '__main__':
#     app.run(debug=True)
