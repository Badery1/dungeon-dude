from app import app, db
from models import NPC, Item, npc_items

def add_items_to_potion_seller():
    potion_seller_id = 4
    item_ids = range(1, 8)

    with app.app_context():
        potion_seller = NPC.query.get(potion_seller_id)
        if not potion_seller:
            print("Potion Seller not found!")
            return

        for item_id in item_ids:
            item = Item.query.get(item_id)
            if item:
                new_stock_item = npc_items.insert().values(npc_id=potion_seller_id, item_id=item_id)
                db.session.execute(new_stock_item)
            else:
                print(f"Item with ID {item_id} not found.")

        db.session.commit()
        print("Items added to potion seller.")

if __name__ == "__main__":
    add_items_to_potion_seller()