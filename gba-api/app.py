from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from dotenv import load_dotenv
from flask_cors import CORS
from models import db, User
import os

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DB_URL')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
jwt = JWTManager(app)
CORS(app)

with app.app_context():
    db.create_all()


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'El usuario ya existe'}), 400

    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Usuario registrado'}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()

    if not user or user.password != data.get('password'):
        return jsonify({'error': 'Credenciales incorrectas'}), 401

    access_token = create_access_token(identity=user.username)
    return jsonify({'access_token': access_token}), 200


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
