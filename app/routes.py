from flask import Blueprint, request, jsonify
from .models import User, Note
from .db import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

main = Blueprint('main', __name__)

@main.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "User already exists"}), 400

    new_user = User(username=username)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201

@main.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']

    user = User.query.filter_by(username=username).first()

    if user is None or not user.check_password(password):
        return jsonify({"message": "Invalid username or password"}), 400

    access_token = create_access_token(identity=user.id, expires_delta=False)
    return jsonify(access_token=access_token), 200

@main.route('/api/notes', methods=['GET'])
@jwt_required()
def get_notes():
    user_id = get_jwt_identity()
    notes = Note.query.filter_by(user_id=user_id).all()
    return jsonify([{'id': note.id, 'title': note.title, 'content': note.content} for note in notes])

@main.route('/api/notes', methods=['POST'])
@jwt_required()
def add_note():
    user_id = get_jwt_identity()
    data = request.get_json()
    id = data['id']
    title = data['title']
    content = data['content']

    new_note = Note(id=id, title=title, content=content, user_id=user_id)

    db.session.add(new_note)
    db.session.commit()

    return jsonify({"message": "Note added successfully"}), 201

@main.route('/api/notes/<string:note_id>', methods=['PUT'])
@jwt_required()
def edit_note(note_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()

    if note is None:
        return jsonify({"message": "Note not found"}), 404

    note.title = data.get('title', note.title)
    note.content = data.get('content', note.content)

    db.session.commit()

    return jsonify({"message": "Note updated successfully"}), 200

@main.route('/api/notes/<string:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    user_id = get_jwt_identity()
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()

    if note is None:
        return jsonify({"message": "Note not found"}), 404

    db.session.delete(note)
    db.session.commit()

    return jsonify({"message": "Note deleted successfully"}), 200

