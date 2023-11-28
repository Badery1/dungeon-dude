from app import app
from extensions import db
from models import NPC

with app.app_context():
    NPC.query.delete()

    guild_master = NPC(
        name="Guild Master",
        role="Guild Master",
        dialogue="Welcome to the Guild Hall! Do you have any monster components to sell?"
    )

    shady_mercenary = NPC(
        name="Shady Mercenary",
        role="Quest Giver",
        dialogue="Psst, looking for some work? I've got some quests if you're interested."
    )

    bartender = NPC(
        name="Bartender",
        role="Bartender",
        dialogue="Welcome to the tavern! How can I assist you?"
    )

    potion_shop = NPC(
        name="Potion Seller",
        role="Merchant",
        dialogue="Need some potions? Come and take a look!"
    )

    blacksmith = NPC(
        name="Blacksmith",
        role="Merchant",
        dialogue="Looking to arm yourself? You've come to the right place."
    )

    db.session.add(guild_master)
    db.session.add(shady_mercenary)
    db.session.add(bartender)
    db.session.add(potion_shop)
    db.session.add(blacksmith)

    db.session.commit()
