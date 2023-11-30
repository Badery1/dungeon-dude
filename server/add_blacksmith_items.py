from app import app, db
from models import NPC, Item, npc_items

def add_items_to_blacksmith():
    blacksmith_id = 5
    item_ids = range(8, 35)

    with app.app_context():
        blacksmith = NPC.query.get(blacksmith_id)
        if not blacksmith:
            print("Blacksmith not found!")
            return

        for item_id in item_ids:
            item = Item.query.get(item_id)
            if item:
                new_stock_item = npc_items.insert().values(npc_id=blacksmith_id, item_id=item_id)
                db.session.execute(new_stock_item)
            else:
                print(f"Item with ID {item_id} not found.")

        db.session.commit()
        print("Items added to blacksmith.")

if __name__ == "__main__":
    add_items_to_blacksmith()