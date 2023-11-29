import json
import os
from app import app, db
from models import LootTable

def load_loot_table():
    with app.app_context():
        db.session.query(LootTable).delete()

        loot_table_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'loot_table.json')
        with open(loot_table_file_path, 'r') as file:
            loot_data = json.load(file)

        for data in loot_data:
            loot_entry = LootTable(**data)
            db.session.add(loot_entry)

        try:
            db.session.commit()
            print("Loot table loaded successfully.")
        except Exception as e:
            db.session.rollback()
            print(f"Error occurred: {e}")

if __name__ == "__main__":
    load_loot_table()
