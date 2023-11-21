from app import app
from models import Monster, db

def calculate_monster_exp(level):
    return round(50 * (1.2 ** (level - 1)))

def update_monsters_with_exp():
    monsters = Monster.query.all()
    for monster in monsters:
        monster.exp_drop = calculate_monster_exp(monster.level)
    db.session.commit()

if __name__ == "__main__":
    with app.app_context():
        update_monsters_with_exp()