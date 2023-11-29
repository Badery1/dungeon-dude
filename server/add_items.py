import json
import os
from app import app, db
from models import Item

def load_items():
    with app.app_context():
        try:
            db.session.query(Item).delete()
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Error occurred while deleting items: {e}")

        items_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'items.json')
        with open(items_file_path, 'r') as file:
            items_data = json.load(file)

        for data in items_data:
            item = Item(**data)
            db.session.add(item)

        try:
            db.session.commit()
            print("Items successfully loaded into the database.")
        except Exception as e:
            db.session.rollback()
            print(f"Error occurred while adding items: {e}")

if __name__ == "__main__":
    load_items()
