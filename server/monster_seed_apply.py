import os
import json
from app import db, app
from models import Monster

def load_monsters():
    with app.app_context():
        monsters_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'monsters.json')
        with open(monsters_file_path, 'r') as file:
            monsters_data = json.load(file)

        for data in monsters_data:
            monster = Monster(**data)
            db.session.add(monster)

        db.session.commit()

if __name__ == "__main__":
    load_monsters()