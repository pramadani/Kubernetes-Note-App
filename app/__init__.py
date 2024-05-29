from flask import Flask
from .config import Config
from .db import db
from flask_jwt_extended import JWTManager
from sqlalchemy.exc import OperationalError
from time import sleep

MAX_RETRIES = 3
RETRY_DELAY = 5

def retry_operation(operation, max_retries, delay):
    retries = 0
    while retries < max_retries:
        try:
            operation()
            return
        except OperationalError as e:
            print(f"Failed to connect to database. Retrying in {delay} seconds... ({retries+1}/{max_retries})")
            sleep(delay)
            retries += 1
    print("Max retries exceeded. Exiting...")

def create_tables():
    from .models import User, Note
    db.create_all()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt = JWTManager(app)

    with app.app_context():
        retry_operation(create_tables, MAX_RETRIES, RETRY_DELAY)

    from .routes import main
    app.register_blueprint(main)

    return app
