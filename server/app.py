from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify, session
from flask_cors import CORS
import random
from sqlalchemy import func
from config import DevelopmentConfig, MAX_DUNGEON_LEVEL
from flask_migrate import Migrate
from datetime import datetime, timedelta
from extensions import db, bcrypt

app = Flask(__name__)
app.config.from_object(DevelopmentConfig)

app.permanent_session_lifetime = timedelta(days=7)

db.init_app(app)
bcrypt.init_app(app)
migrate = Migrate(app, db)
CORS(app, supports_credentials=True)

from models import Character, User, Item, LootTable, NPC, Quest, CharacterQuest, Monster, calculate_damage_reduction

# Register new user route
@app.route('/register', methods=['POST'])
def register():
    username = request.json.get('username')
    password = request.json.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 400

    new_user = User(username=username)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

# Login route
@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        session['user_id'] = user.id
        return jsonify({'message': 'Login successful', 'user_id': user.id}), 200

    return jsonify({'message': 'Invalid username or password'}), 401

# Logout route
@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

# Update user account route
@app.route('/update_account', methods=['PATCH'])
def update_account():
    if 'user_id' not in session:
        return jsonify({'message': 'User not logged in'}), 401

    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.json
    new_username = data.get('username')
    new_password = data.get('password')

    if new_username:
        user.username = new_username
    if new_password:
        user.set_password(new_password)

    db.session.commit()
    return jsonify({'message': 'Account updated successfully'}), 200

# Delete account route
@app.route('/delete_account', methods=['DELETE'])
def delete_account():
    if 'user_id' not in session:
        return jsonify({'message': 'User not logged in'}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)

    if not user:
        return jsonify({'message': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()
    session.clear()

    return jsonify({'message': 'Account deleted successfully'}), 200

# Get current username route
@app.route('/current_user', methods=['GET'])
def get_current_user():
    if 'user_id' not in session:
        return jsonify({'message': 'User not logged in'}), 401

    user = db.session.query(User).filter_by(id=session['user_id']).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify({'username': user.username}), 200

# Create character route
@app.route('/create_character', methods=['POST'])
def create_character():
    if 'user_id' not in session:
        return jsonify({'message': 'User not logged in'}), 401

    user_id = session['user_id']

    data = request.json
    name = data.get('name')

    new_character = Character(name=name, user_id=user_id)

    db.session.add(new_character)
    db.session.commit()

    return jsonify({'message': f'Character {name} created successfully', 'character_id': new_character.id}), 201

# Character deletion route
@app.route('/delete_character/<int:character_id>', methods=['DELETE'])
def delete_character(character_id):
    if 'user_id' not in session:
        return jsonify({'message': 'User not logged in'}), 401

    character = Character.query.filter_by(id=character_id, user_id=session['user_id']).first()
    if character:
        db.session.delete(character)
        db.session.commit()
        return jsonify({'message': 'Character deleted successfully'}), 200
    else:
        return jsonify({'message': 'Character not found or unauthorized'}), 404

# List all account characters route
@app.route('/characters', methods=['GET'])
def list_characters():
    if 'user_id' not in session:
        return jsonify({'message': 'User not logged in'}), 401

    user_id = session['user_id']
    characters = Character.query.filter_by(user_id=user_id).all()

    if characters:
        return jsonify([character.custom_serialize() for character in characters]), 200
    else:
        return jsonify({'message': 'No characters found'}), 404
    
# Update character name route
@app.route('/update_character/<int:character_id>', methods=['PATCH'])
def update_character(character_id):
    if 'user_id' not in session:
        return jsonify({'message': 'User not logged in'}), 401

    character = Character.query.filter_by(id=character_id, user_id=session['user_id']).first()
    if not character:
        return jsonify({'message': 'Character not found or unauthorized access'}), 404

    data = request.json
    new_name = data.get('name')
    if not new_name:
        return jsonify({'message': 'No new name provided'}), 400

    character.name = new_name
    db.session.commit()
    return jsonify({'message': f'Character name updated to {new_name}'}), 200

# Route to detail character information
@app.route('/character', methods=['GET'])
def get_character():
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not identified'}), 401

    character_id = session['character_id']
    character = Character.query.get(character_id)
    if not character or character.user_id != session.get('user_id'):
        return jsonify({'message': 'Character not found'}), 404

    return jsonify(character.custom_serialize()), 200

# Player data route
@app.route('/player_data', methods=['GET'])
def get_player_data():
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not identified'}), 401

    character = Character.query.get(session['character_id'])
    if not character:
        return jsonify({'message': 'Character not found'}), 404

    return jsonify(character.custom_serialize()), 200

# Character selection route
@app.route('/select_character/<int:character_id>', methods=['POST'])
def select_character(character_id):
    if 'user_id' not in session:
        return jsonify({'message': 'User not logged in'}), 401

    character = Character.query.get(character_id)
    if not character or character.user_id != session['user_id']:
        return jsonify({'message': 'Character not found or unauthorized'}), 404

    session['character_id'] = character_id
    session['combat_state'] = None
    
    return jsonify({'message': 'Character selected successfully'}), 200

# Intro route
@app.route('/character_seen_intro', methods=['POST'])
def character_seen_intro():
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not logged in'}), 401

    character = Character.query.get(session['character_id'])
    if character and character.user_id == session['user_id']:
        character.has_seen_intro = True
        db.session.commit()
        return jsonify({'message': 'Character intro updated successfully'}), 200
    else:
        return jsonify({'message': 'Character not found or unauthorized'}), 404

# Save game route
@app.route('/save_game', methods=['POST'])
def save_game():
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not logged in'}), 401

    character = Character.query.get(session['character_id'])
    if not character:
        return jsonify({'message': 'Character not found'}), 404

    character.last_saved = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Game saved'}), 200

# Load game route
@app.route('/load_game', methods=['GET'])
def load_game():
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not logged in'}), 401

    character = Character.query.get(session['character_id'])
    if not character:
        return jsonify({'message': 'Character not found'}), 404

    character_data = character.to_dict()
    character_data['inventory'] = [item.to_dict() for item in character.inventory]
    character_data['quests'] = [quest.to_dict() for quest in character.quests]
    return jsonify(character_data), 200

# Start quest route
@app.route('/start_quest/<int:quest_id>', methods=['POST'])
def start_quest(quest_id):
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not logged in'}), 401

    character = Character.query.get(session['character_id'])
    quest = Quest.query.get(quest_id)

    if not character or not quest:
        return jsonify({'message': 'Character or quest not found'}), 404

    if quest.required_dungeon_level and character.highest_dungeon_level < quest.required_dungeon_level:
        return jsonify({'message': 'Dungeon level requirement not met for this quest'}), 400

    active_quests = CharacterQuest.query.filter_by(character_id=character.id, status='In Progress').count()
    if active_quests >= 5:
        return jsonify({'message': 'Maximum number of active quests reached'}), 400

    existing_quest = CharacterQuest.query.filter_by(character_id=character.id, quest_id=quest_id).first()
    if existing_quest:
        return jsonify({'message': 'Quest already started or completed'}), 400

    new_quest = CharacterQuest(character_id=character.id, quest_id=quest_id, status='In Progress')
    db.session.add(new_quest)
    db.session.commit()

    return jsonify({'message': f'Quest {quest.title} started successfully'}), 200

# Update quest progress route
@app.route('/update_quest/<int:quest_id>', methods=['PATCH'])
def update_quest_progress(quest_id):
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not logged in'}), 401

    character_quest = CharacterQuest.query.filter_by(character_id=session['character_id'], quest_id=quest_id).first()
    if character_quest is None or character_quest.status != 'In Progress':
        return jsonify({'message': 'Quest not found or not in progress'}), 404

    character_quest.progress += 1

    if character_quest.progress >= character_quest.quest.target_amount:
        character_quest.status = 'Completed'

    db.session.commit()
    return jsonify({'message': 'Quest progress updated'}), 200

# Abandon quest route
@app.route('/abandon_quest/<int:quest_id>', methods=['POST'])
def abandon_quest(quest_id):
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not logged in'}), 401

    character_quest = CharacterQuest.query.filter_by(character_id=session['character_id'], quest_id=quest_id).first()
    if character_quest is None or character_quest.status != 'In Progress':
        return jsonify({'message': 'Quest not found or not in progress'}), 404

    db.session.delete(character_quest)
    db.session.commit()
    return jsonify({'message': 'Quest abandoned successfully'}), 200

# Quest complete route
@app.route('/complete_quest/<int:quest_id>', methods=['POST'])
def complete_quest(quest_id):
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not logged in'}), 401

    character_quest = CharacterQuest.query.filter_by(character_id=session['character_id'], quest_id=quest_id).first()
    if character_quest is None or character_quest.status != 'In Progress':
        return jsonify({'message': 'Quest not found or not in progress'}), 404

    quest = Quest.query.get(quest_id)
    character = Character.query.get(session['character_id'])

    if quest.required_item_id and character.inventory.count(quest.required_item_id) < quest.target_amount:
        return jsonify({'message': 'Required items not collected'}), 400

    character_quest.status = 'Completed'
    character.gold += quest.gold_reward
    if quest.item_reward:
        character.inventory.append(quest.item_reward)
    character.add_exp(quest.exp_reward)

    db.session.commit()
    return jsonify({
        'message': 'Quest completed!',
        'gold_awarded': quest.gold_reward,
        'item_awarded': quest.item_reward.name if quest.item_reward else None,
        'exp_awarded': quest.exp_reward
    }), 200

# Add item to inventory route
@app.route('/add_item/<int:item_id>', methods=['POST'])
def add_item_to_inventory(item_id):
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not logged in'}), 401

    character = Character.query.get(session['character_id'])
    if character is None:
        return jsonify({'message': 'Character not found'}), 404

    item = Item.query.get(item_id)
    if item is None:
        return jsonify({'message': 'Item not found'}), 404

    character.inventory.append(item)
    db.session.commit()

    return jsonify({'message': f'Item {item.name} added to inventory'}), 200

# Remove item from inventory route
@app.route('/remove_item/<int:item_id>', methods=['POST'])
def remove_item_from_inventory(item_id):
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not logged in'}), 401

    character = Character.query.get(session['character_id'])
    if character is None:
        return jsonify({'message': 'Character not found'}), 404

    item = next((item for item in character.inventory if item.id == item_id), None)
    if item is None:
        return jsonify({'message': 'Item not found in inventory'}), 404

    character.inventory.remove(item)
    db.session.commit()

    return jsonify({'message': f'Item {item.name} removed from inventory'}), 200

# Sell item route
@app.route('/sell_item/<int:item_id>', methods=['POST'])
def sell_item(item_id):
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not logged in'}), 401

    character = Character.query.get(session['character_id'])
    item = Item.query.get(item_id)

    if character is None or item is None:
        return jsonify({'message': 'Character or item not found'}), 404

    character.gold += item.price

    character.inventory.remove(item)
    db.session.commit()

    return jsonify({'message': f'Item {item.name} sold for {item.price} gold'}), 200

# Npc interaction route
@app.route('/npc/<int:npc_id>/interact', methods=['GET'])
def interact_with_npc(npc_id):
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not identified'}), 401

    npc = NPC.query.get(npc_id)
    character = Character.query.get(session['character_id'])

    POTION_SHOP_ID = 4
    BLACKSMITH_ID = 5

    if npc is None or character is None:
        return jsonify({'message': 'NPC or character not found'}), 404

    if npc.role == 'Quest Giver':
        available_quests = Quest.query.filter_by(npc_id=npc_id).all()
        quests_data = [quest.to_dict() for quest in available_quests]
        return jsonify({'npc_name': npc.name, 'quests': quests_data}), 200
    
    if npc.role == 'Merchant':
        if npc_id == POTION_SHOP_ID:
            items_data = [item.to_dict() for item in npc.stock if item.type == 'Consumable']

        elif npc_id == BLACKSMITH_ID:
            items_data = [item.to_dict() for item in npc.stock if item.type in ['Melee Weapon', 'Ranged Weapon', 'Armor', 'Ring', 'Necklace']]

        else:
            items_data = [item.to_dict() for item in npc.stock]

        return jsonify({'npc_name': npc.name, 'items_for_sale': items_data}), 200
    
    elif npc.role == 'Guild Master':
        sellable_items = [item for item in character.inventory if item.type == 'Monster Drop']
        sellable_items_data = [item.custom_serialize() for item in sellable_items]
        return jsonify({'npc_name': npc.name, 'sellable_items': sellable_items_data}), 200
    
    else:
        return jsonify({'npc_name': npc.name, 'dialogue': npc.dialogue}), 200
    
# Buy item route
@app.route('/buy_item/<int:npc_id>/<int:item_id>', methods=['POST'])
def buy_item(npc_id, item_id):
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not logged in'}), 401

    npc = NPC.query.get(npc_id)
    character = Character.query.get(session['character_id'])
    item = Item.query.get(item_id)

    if item not in npc.stock:
        return jsonify({'message': 'Item not available from this NPC'}), 404

    if character.gold < item.price:
        return jsonify({'message': 'Not enough gold'}), 400

    character.gold -= item.price
    character.inventory.append(item)
    db.session.commit()

    return jsonify({'message': f'Bought {item.name} for {item.price} gold'}), 200
    
# Combat start route
@app.route('/initiate_combat', methods=['POST'])
def initiate_combat():
    print("Session data:", session) 
    if 'character_id' not in session:
        return jsonify({'message': 'Character not found or unauthorized'}), 401

    character_id = session['character_id']
    character = Character.query.get(character_id)
    if not character:
        return jsonify({'message': 'Character not found'}), 404

    monster = Monster.query.filter_by(level=character.dungeon_level).first()
    if not monster:
        return jsonify({'message': 'No monster found for this level'}), 404

    combat_state = {
        'character_id': character.id,
        'monster_id': monster.id,
        'character_turn': True,
        'turn': 'Character'
    }

    monster.current_hp = monster.max_hp
    db.session.commit()

    session['combat_state'] = combat_state

    return jsonify({
        'combat_state': combat_state,
        'character': character.custom_serialize(),
        'monster': monster.custom_serialize()
    }), 200

# Combat logic route for player route
@app.route('/player_combat_action', methods=['POST'])
def player_combat_action():
    if 'user_id' not in session:
        return jsonify({'message': 'Not logged in'}), 401

    if 'combat_state' not in session:
        return jsonify({'message': 'Combat state not found in session'}), 401

    combat_state = session['combat_state']

    if 'character_turn' not in combat_state:
        return jsonify({'message': 'Character turn not found in combat state'}), 401

    if not combat_state['character_turn']:
        return jsonify({'message': 'It is not the character\'s turn'}), 401

    character = Character.query.get(combat_state['character_id'])
    monster = Monster.query.get(combat_state['monster_id'])

    if not character or not monster:
        return jsonify({'message': 'Character or Monster not found'}), 404

    action = request.json.get('action')
    item_id = request.json.get('item_id', None)

    outcome = ""

    if action in ['Attack Melee', 'Attack Ranged']:
        critical_chance = character.luck / 100
        is_critical = random.random() < critical_chance
        attack_multiplier = 2 if is_critical else 1

        base_damage = (character.strength if action == 'Attack Melee' else character.dexterity) * attack_multiplier
        damage_reduction = 0
        damage = max(0, base_damage * (1 - damage_reduction))

        monster.current_hp -= damage
        crit_message = " Critical hit!" if is_critical else ""
        outcome = f'Monster hit with {damage} damage!{crit_message} Monster HP: {monster.current_hp}'

        if monster.current_hp <= 0:
            outcome = 'Monster defeated!'
        else:
            session['combat_state']['character_turn'] = False

    elif action == 'Flee':
        flee_chance = 0.50 + character.speed / 1000.0
        flee_chance = min(flee_chance, 1.0)

        if random.random() < flee_chance:
            outcome = 'Successfully fled from combat.'
            session.pop('combat_state', None)
        else:
            outcome = 'Failed to flee. Monster\'s turn.'
            session['combat_state']['character_turn'] = False

    else:
        return jsonify({'message': 'Invalid action'}), 400
    
    session['combat_state']['character_turn'] = False
    session['combat_state']['turn'] = 'Monster'

    db.session.commit()
    return jsonify({'message': 'Player action processed', 'outcome': outcome}), 200


def handle_equipment_change(character, new_equipment_id):
    if new_equipment_id is None:
        return remove_current_equipment(character)

    new_equipment = next((item for item in character.inventory if item.id == new_equipment_id), None)
    if not new_equipment:
        return jsonify({'message': 'Invalid or unavailable equipment'}), 404

    equipment_slots = {
        'Melee Weapon': 'equipped_melee_weapon',
        'Ranged Weapon': 'equipped_ranged_weapon',
        'Armor': 'equipped_armor',
        'Ring': 'equipped_ring',
        'Necklace': 'equipped_necklace'
    }

    slot = equipment_slots.get(new_equipment.type)
    if slot:
        swap_equipment(character, slot, new_equipment)
        db.session.commit()
        return jsonify({'message': f'Equipped {new_equipment.name} successfully'}), 200
    else:
        return jsonify({'message': 'Unrecognized equipment type'}), 400

def remove_current_equipment(character):
    equipment_slots = ['equipped_melee_weapon', 'equipped_ranged_weapon', 'equipped_armor', 'equipped_ring', 'equipped_necklace']
    for slot in equipment_slots:
        current_equipped = getattr(character, slot)
        if current_equipped:
            update_stats(character, current_equipped, apply_bonus=False)
            character.inventory.append(current_equipped)
            setattr(character, slot, None)

    db.session.commit()
    return jsonify({'message': 'Equipment removed successfully'}), 200

def swap_equipment(character, slot, new_item=None):
    current_equipped = getattr(character, slot)

    if current_equipped:
        update_stats(character, current_equipped, apply_bonus=False)
        character.inventory.append(current_equipped)

    if new_item:
        setattr(character, slot, new_item)
        update_stats(character, new_item, apply_bonus=True)
        character.inventory.remove(new_item)

def update_stats(character, item, apply_bonus=True):
    modifiers = ['strength_bonus', 'vitality_bonus', 'armor_bonus', 'luck_bonus', 'dexterity_bonus', 'speed_bonus']
    for mod in modifiers:
        bonus = getattr(item, mod)
        if apply_bonus:
            setattr(character, mod.replace('_bonus', ''), getattr(character, mod.replace('_bonus', '')) + bonus)
        else:
            setattr(character, mod.replace('_bonus', ''), getattr(character, mod.replace('_bonus', '')) - bonus)

def handle_consumable_use(character, item_id):
    consumable = next((item for item in character.inventory if item.id == item_id and item.type == 'Consumable'), None)
    if not consumable:
        return jsonify({'message': 'Invalid or unavailable consumable'}), 404

    if consumable.name == 'Health Potion':
        character.current_hp += 20
        character.current_hp = min(character.current_hp, character.max_hp)

    character.inventory.remove(consumable)
    db.session.commit()
    return jsonify({'message': f'{consumable.name} used successfully'}), 200

# Combat logic for monster route
@app.route('/monster_combat_action', methods=['POST'])
def monster_combat_action():
    if 'character_id' not in session:
        return jsonify({'message': 'No character selected or unauthorized'}), 401

    data = request.json

    request_character_id = data.get('character_id')
    session_character_id = session.get('character_id')

    if not request_character_id:
        return jsonify({'message': 'Character ID not provided'}), 400

    if request_character_id != session_character_id:
        return jsonify({'message': 'Character ID does not match the session'}), 403

    monster_id = data.get('monster_id')
    character = Character.query.get(request_character_id)
    monster = Monster.query.get(monster_id)

    if not character or not monster:
        return jsonify({'message': 'Character or Monster not found'}), 404

    damage = monster.strength
    character.current_hp -= damage

    if character.current_hp <= 0:
        outcome = handle_character_defeat(request_character_id)
        db.session.commit()
        return jsonify({'message': outcome, 'characterDefeated': True}), 200
    else:
        outcome = f'Character hit with {damage} damage! Character HP: {character.current_hp}'
        next_turn = 'Character'

        db.session.commit()
        return jsonify({'message': 'Monster action processed', 'outcome': outcome, 'nextTurn': next_turn}), 200

def handle_character_defeat(character_id):
    outcome = revert_to_last_save(character_id)
    return f'Game Over. {outcome}'

def revert_to_last_save(character_id):
    character = Character.query.get(character_id)
    character.current_hp = character.max_hp

    db.session.commit()
    return 'You have been restored to full health.'

# Combat state route
@app.route('/set_combat_state', methods=['POST'])
def set_combat_state():
    if 'character_id' not in session:
        return jsonify({'message': 'Character not found or unauthorized'}), 401

    data = request.json

    try:
        character = Character.query.get(session['character_id'])
        if not character:
            return jsonify({'message': 'Character not found'}), 404

        character.is_in_combat = data.get('isInCombat', False)
        db.session.commit()

        session['isInCombat'] = character.is_in_combat

        return jsonify({'message': 'Combat state updated', 'isInCombat': character.is_in_combat}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'An error occurred while processing the request'}), 500

# Combat end route
@app.route('/end_combat', methods=['POST'])
def end_combat():
    if 'user_id' not in session or 'combat_state' not in session or 'character_id' not in session:
        return jsonify({'message': 'Combat state not found'}), 401

    character = Character.query.get(session['character_id'])
    monster_id = session['combat_state'].get('monster_id')
    monster = Monster.query.get(monster_id)

    if not character or not monster:
        return jsonify({'message': 'Character or monster not found'}), 404

    outcome = {
        'message': 'Combat ended',
        'level_up': None,
        'loot': None,
        'new_dungeon_level': None
    }

    if monster.current_hp <= 0:
        level_up_info = character.add_exp(monster.exp_drop)
        if level_up_info:
            outcome['level_up'] = level_up_info

        outcome['message'] = 'Monster defeated!'
        monster_loot = distribute_loot(character, monster.level)
        outcome['loot'] = monster_loot

        active_kill_quests = CharacterQuest.query.filter_by(character_id=session['character_id'], status='In Progress').all()
        for quest in active_kill_quests:
            if "kill" in quest.quest.description.lower() and quest.progress < quest.quest.target_amount:
                quest.progress += 1
                if quest.progress >= quest.quest.target_amount:
                    quest.status = 'Completed'

        if character.dungeon_level == character.highest_dungeon_level:
            character.highest_dungeon_level += 1
            outcome['new_dungeon_level'] = character.highest_dungeon_level

    db.session.commit()
    
    return jsonify(outcome), 200

    
def distribute_loot(character, monster_level=None):
    if monster_level is None:
        return []

    loot_items = LootTable.query.filter_by(monster_level=monster_level).all()
    acquired_loot = []

    for loot in loot_items:
        modified_drop_chance = loot.drop_chance * (1 + character.luck * 0.01)
        if random.random() < modified_drop_chance:
            if loot.item:
                character.inventory.append(loot.item)
                acquired_loot.append(loot.item.name)
            if loot.gold_drop:
                character.gold += loot.gold_drop
                acquired_loot.append(f"{loot.gold_drop} gold")

    return acquired_loot

# Floor logic route
@app.route('/dungeon/choose_floor', methods=['POST'])
def choose_floor():
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not identified'}), 401

    character = Character.query.get(session['character_id'])
    data = request.json
    desired_floor = data.get('floor')

    if desired_floor < 1:
        return jsonify({'message': 'Invalid floor number'}), 400

    if character.highest_dungeon_level == 0:
        character.highest_dungeon_level = 1

    if desired_floor > character.highest_dungeon_level:
        return jsonify({'message': 'Floor not accessible'}), 403

    character.dungeon_level = desired_floor
    monster = Monster.query.get(desired_floor)

    if not monster:
        return jsonify({'message': 'Monster not found for this floor'}), 404

    try:
        session['combat_state'] = {
            'character_id': character.id,
            'turn': 'Character',
            'monster_id': monster.id
        }

        db.session.commit()

        return jsonify({'message': f'Moved to floor {desired_floor}. Encounter started with {monster.name}!', 'monster': monster.custom_serialize()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'An error occurred while processing the request'}), 500

# Next dungeon level route
@app.route('/next_floor', methods=['POST'])
def handleNextFloor():
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'Authentication required'}), 401

    character = Character.query.get(session['character_id'])
    if not character:
        return jsonify({'message': 'Character not found'}), 404

    next_level = min(character.dungeon_level + 1, MAX_DUNGEON_LEVEL)
    character.dungeon_level = next_level

    monster = Monster.query.filter(Monster.level == next_level).first()
    if not monster:
        return jsonify({'message': f'No monster found for level {next_level}'}), 404

    turn_order = 'Monster' if character.speed < monster.speed else 'Character'

    combat_state = {
        'character_id': character.id,
        'monster_id': monster.id,
        'turn': turn_order
    }

    with db.session:
        db.session.commit()
        session['combat_state'] = combat_state

    return jsonify({'message': 'Next floor combat initiated', 'combat_state': combat_state}), 200

# Reset current floor route
@app.route('/reset_current_floor', methods=['POST'])
def reset_current_floor():
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not identified'}), 401

    character = Character.query.get(session['character_id'])
    if character is None:
        return jsonify({'message': 'Character not found'}), 404

    monster = Monster.query.filter(Monster.level == character.dungeon_level).order_by(func.random()).first()
    if monster is None:
        return jsonify({'message': 'No monsters found for this dungeon level'}), 404

    turn_order = 'Monster' if character.speed < monster.speed else 'Character'
    combat_state = {
        'character_id': character.id,
        'monster_id': monster.id,
        'turn': turn_order
    }

    with db.session:
        db.session.commit()
        session['combat_state'] = combat_state

    return jsonify({'message': 'Combat reset for current floor', 'combat_state': combat_state}), 200

# Current monster route
@app.route('/current_monster', methods=['GET'])
def current_monster():
    if 'combat_state' not in session:
        return jsonify({'message': 'No combat in progress'}), 404

    monster_id = session['combat_state']['monster_id']
    monster = Monster.query.get(monster_id)

    if monster is None:
        return jsonify({'message': 'Monster not found'}), 404

    return jsonify(monster.custom_serialize()), 200

# Rest and heal route
@app.route('/rest', methods=['POST'])
def rest_at_home():
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User not logged in or character not identified'}), 401

    character = Character.query.get(session['character_id'])

    if character.location != 'Home':
        return jsonify({'message': 'You can only rest at home'}), 403

    character.current_hp = character.max_hp
    db.session.commit()

    return jsonify({'message': 'You slept and now your life threatening injuries are gone!'}), 200

# Inventory route
@app.route('/character/<int:character_id>/inventory', methods=['GET'])
def get_inventory(character_id):
    if 'user_id' not in session:
        return jsonify({'message': 'User not logged in'}), 401

    character = Character.query.get(character_id)
    if not character or character.user_id != session['user_id']:
        return jsonify({'message': 'Character not found or unauthorized'}), 404

    inventory_items = [item.custom_serialize() for item in character.inventory]

    equipped_items = {
        'meleeWeapon': character.equipped_melee_weapon.custom_serialize() if character.equipped_melee_weapon else None,
        'rangedWeapon': character.equipped_ranged_weapon.custom_serialize() if character.equipped_ranged_weapon else None,
        'armor': character.equipped_armor.custom_serialize() if character.equipped_armor else None,
        'ring': character.equipped_ring.custom_serialize() if character.equipped_ring else None,
        'necklace': character.equipped_necklace.custom_serialize() if character.equipped_necklace else None
    }

    return jsonify({'inventory': inventory_items, 'equippedItems': equipped_items}), 200

# Swap equipment route
@app.route('/character/change_equipment', methods=['POST'])
def change_equipment():
    if 'user_id' not in session or 'character_id' not in session:
        return jsonify({'message': 'User or character not identified'}), 401

    character = Character.query.get(session['character_id'])
    if not character:
        return jsonify({'message': 'Character not found'}), 404

    new_equipment_id = request.json.get('item_id')
    return handle_equipment_change(character, new_equipment_id)

def handle_equipment_change(character, new_equipment_id):
    new_equipment = next((item for item in character.inventory if item.id == new_equipment_id), None)
    if not new_equipment:
        return jsonify({'message': 'Invalid or unavailable equipment'}), 404

    equipment_slots = {
        'Melee Weapon': 'equipped_melee_weapon',
        'Ranged Weapon': 'equipped_ranged_weapon',
        'Armor': 'equipped_armor',
        'Ring': 'equipped_ring',
        'Necklace': 'equipped_necklace'
    }

    slot = equipment_slots.get(new_equipment.type)
    if slot:
        swap_equipment(character, slot, new_equipment)
        db.session.commit()
        return jsonify({'message': f'Equipped {new_equipment.name} successfully'}), 200
    else:
        return jsonify({'message': 'Unrecognized equipment type'}), 400
    
# Combat ending route
@app.route('/end_combat2', methods=['POST'])
def end_combat2():
    session.pop('combat_state', None)

    return jsonify({'message': 'Combat ended successfully'}), 200

# Testing route
@app.route('/session_test')
def session_test():
    return jsonify({'session_data': dict(session)})

if __name__ == '__main__':
    app.run(port=5555, debug=True)
