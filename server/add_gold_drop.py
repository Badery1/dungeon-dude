from app import app, db
from models import LootTable

def calculate_gold_drop(level):
    return round(100 * (1.1 ** level))

def update_loot_table_with_gold():
    loot_entries = LootTable.query.all()
    for loot in loot_entries:
        loot.gold_drop = calculate_gold_drop(loot.monster_level)
    db.session.commit()

if __name__ == "__main__":
    with app.app_context():
        update_loot_table_with_gold()