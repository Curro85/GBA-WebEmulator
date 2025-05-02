import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_TOKEN_LOCATION = ['cookies']
    JWT_COOKIE_HTTPONLY = True
    JWT_COOKIE_SECURE = False  # Cambiar para producción
    JWT_COOKIE_SAMESITE = 'Lax'
    # JWT_COOKIE_DOMAIN = '.tudominio.com' dominio para produccion
    SQLALCHEMY_DATABASE_URI = os.getenv('DB_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
