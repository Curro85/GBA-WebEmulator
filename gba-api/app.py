from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, set_access_cookies, unset_jwt_cookies, \
    get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from models import db, User, Profile
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
jwt = JWTManager(app)
CORS(app, supports_credentials=True)

with app.app_context():
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
    data = request.get_json()
    print(data.get('selectedRoms'))
    return jsonify({'msg': 'ROMs subidos'}), 200


@app.route('/api/protected')
@jwt_required()
def protected():
    return jsonify({'message': 'Acceso concedido'}), 200


@app.route('/api/users')
def get_users():
    return jsonify([{'id': 1, 'name': 'Pruebita'},
                    {'id': 2, 'name': 'Francisco'}])


if __name__ == '__main__':
    app.run(debug=True)
