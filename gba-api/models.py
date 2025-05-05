from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    register_date = db.Column(db.DateTime, default=datetime.now())
    profile = db.relationship('Profile', uselist=False, back_populates='user', cascade='all, delete-orphan')
    roms = db.relationship('Rom', back_populates='user', cascade='all, delete-orphan')
    saves = db.relationship('Save', back_populates='user', cascade='all, delete-orphan')


class Profile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    bio = db.Column(db.String(200), nullable=False)
    image = db.Column(db.String(20), nullable=False, default='default.jpg')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True)
    user = db.relationship('User', back_populates='profile')


class Rom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(256), nullable=False)
    hash = db.Column(db.String(64), nullable=False, index=True)
    size = db.Column(db.Integer, nullable=False)
    path = db.Column(db.String(512), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True)
    user = db.relationship('User', back_populates='roms')
    saves = db.relationship('Save', back_populates='rom')


class Save(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(256), nullable=False)
    size = db.Column(db.Integer, nullable=False)
    path = db.Column(db.String(512), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True)
    rom_id = db.Column(db.Integer, db.ForeignKey('rom.id'), index=True)
    user = db.relationship('User', back_populates='saves')
    rom = db.relationship('Rom', back_populates='saves')
