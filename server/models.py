from extensions import db, bcrypt
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime

# Table to handle accounts
class User(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    characters = db.relationship('Character', backref='user', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

# Character Item table
class CharacterItem(db.Model):
    character_id = db.Column(db.Integer, db.ForeignKey('character.id'), primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), primary_key=True)
    quantity = db.Column(db.Integer, default=1)

    character = db.relationship('Character', back_populates='inventory')
    item = db.relationship('Item', back_populates='character_items')

    def custom_serialize(self):
        return {
            'id': self.item_id,
            'character_id': self.character_id,
            'quantity': self.quantity,
            'item_name': self.item.name,
            'item_type': self.item.type,
            'item_rarity': self.item.rarity,
            'strength_bonus': self.item.strength_bonus,
            'vitality_bonus': self.item.vitality_bonus,
            'armor_bonus': self.item.armor_bonus,
            'luck_bonus': self.item.luck_bonus,
            'dexterity_bonus': self.item.dexterity_bonus,
            'speed_bonus': self.item.speed_bonus,
            'price': self.item.price
        }

# Helper table for npc stocks
npc_items = db.Table('npc_items',
    db.Column('npc_id', db.Integer, db.ForeignKey('npc.id'), primary_key=True),
    db.Column('item_id', db.Integer, db.ForeignKey('item.id'), primary_key=True)
)

# Armor damage reduction formula
def calculate_damage_reduction(armor, C=50):
    return armor / (armor + C)

# Table for tracking all player stats
def calculate_required_exp(level):
    return round(100 * (1.2 ** (level - 1)))

def calculate_stat(base, growth, level):
    return round(base + (base * growth * (level - 1)))

def level_up(self):
        old_stats = self.get_stats()
        self.level += 1
        self.update_stats_for_level()
        new_stats = self.get_stats()

        return {
            'level': self.level,
            'old_stats': old_stats,
            'new_stats': new_stats
        }

def get_stats(self):
        return {
            'strength': self.strength,
            'vitality': self.vitality,
            'luck': self.luck,
            'dexterity': self.dexterity,
            'speed': self.speed,
            'max_hp': self.max_hp
        }

class Character(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    level = db.Column(db.Integer, default=1)
    exp = db.Column(db.Integer, default=0)
    strength = db.Column(db.Integer, default=10)
    vitality = db.Column(db.Integer, default=10)
    armor = db.Column(db.Integer, default=0)
    luck = db.Column(db.Integer, default=10)
    dexterity = db.Column(db.Integer, default=10)
    speed = db.Column(db.Integer, default=10)
    max_hp = db.Column(db.Integer, default=100)
    current_hp = db.Column(db.Integer, default=100)
    dungeon_level = db.Column(db.Integer, default=0)
    highest_dungeon_level = db.Column(db.Integer, default=0)
    location = db.Column(db.String, nullable=False, default='Home')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    has_seen_intro = db.Column(db.Boolean, default=False)
    isInCombat = db.Column(db.Boolean, default=False)
    
    equipped_melee_weapon_id = db.Column(db.Integer, db.ForeignKey('item.id'))
    equipped_melee_weapon = db.relationship('Item', foreign_keys=[equipped_melee_weapon_id])
    equipped_ranged_weapon_id = db.Column(db.Integer, db.ForeignKey('item.id'))
    equipped_ranged_weapon = db.relationship('Item', foreign_keys=[equipped_ranged_weapon_id])
    equipped_armor_id = db.Column(db.Integer, db.ForeignKey('item.id'))
    equipped_armor = db.relationship('Item', foreign_keys=[equipped_armor_id])
    equipped_ring_id = db.Column(db.Integer, db.ForeignKey('item.id'))
    equipped_ring = db.relationship('Item', foreign_keys=[equipped_ring_id])
    equipped_necklace_id = db.Column(db.Integer, db.ForeignKey('item.id'))
    equipped_necklace = db.relationship('Item', foreign_keys=[equipped_necklace_id])

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_saved = db.Column(db.DateTime, onupdate=datetime.utcnow)

    inventory = db.relationship('CharacterItem', back_populates='character', cascade="delete, delete-orphan")
    quests = db.relationship('CharacterQuest', back_populates='character')
    gold = db.Column(db.Integer, default=0)

    def custom_serialize(self):
        required_exp = calculate_required_exp(self.level)
        serialized_inventory = []
        for character_item in self.inventory: 
            item = character_item.item
            serialized_inventory.append({
                'id': item.id,
                'name': item.name,
                'type': item.type,
                'quantity': character_item.quantity
        })
        return {
            'id': self.id,
            'name': self.name,
            'level': self.level,
            'exp': self.exp,
            'required_exp': required_exp,
            'strength': self.strength,
            'vitality': self.vitality,
            'armor': self.armor,
            'luck': self.luck,
            'dexterity': self.dexterity,
            'speed': self.speed,
            'max_hp': self.max_hp,
            'current_hp': self.current_hp,
            'dungeon_level': self.dungeon_level,
            'highest_dungeon_level': self.highest_dungeon_level,
            'location': self.location,
            'equipped_melee_weapon': self.equipped_melee_weapon.custom_serialize() if self.equipped_melee_weapon else None,
            'equipped_ranged_weapon': self.equipped_ranged_weapon.custom_serialize() if self.equipped_ranged_weapon else None,
            'equipped_armor': self.equipped_armor.custom_serialize() if self.equipped_armor else None,
            'equipped_ring': self.equipped_ring.custom_serialize() if self.equipped_ring else None,
            'equipped_necklace': self.equipped_necklace.custom_serialize() if self.equipped_necklace else None,
            'inventory': serialized_inventory,
            'quests': [character_quest.custom_serialize() for character_quest in self.quests],
            'gold': self.gold,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_saved': self.last_saved.isoformat() if self.last_saved else None,
            'has_seen_intro': self.has_seen_intro,
            'isInCombat': self.isInCombat
        }

    def add_exp(self, amount):
        self.exp += amount
        required_exp = calculate_required_exp(self.level)
        while self.exp >= required_exp:
            self.level_up()
            required_exp = calculate_required_exp(self.level)

    def level_up(self):
        current_equipment_bonuses = self.get_current_equipment_bonuses()
        self.level += 1
        self.update_stats_for_level()

        for bonus, value in current_equipment_bonuses.items():
            setattr(self, bonus, getattr(self, bonus) + value)

    def get_current_equipment_bonuses(self):
        equipment_slots = ['equipped_melee_weapon', 'equipped_ranged_weapon', 'equipped_armor', 'equipped_ring', 'equipped_necklace']
        bonuses = {
            'strength': 0,
            'vitality': 0,
            'armor': 0,
            'luck': 0,
            'dexterity': 0,
            'speed': 0
        }
    
        for slot in equipment_slots:
            equipment = getattr(self, slot)
            if equipment:
                for mod in ['strength_bonus', 'vitality_bonus', 'armor_bonus', 'luck_bonus', 'dexterity_bonus', 'speed_bonus']:
                    base_stat = mod.replace('_bonus', '')
                    bonuses[base_stat] += getattr(equipment, mod, 0)
        
        return bonuses

    def update_stats_for_level(self):
        self.strength = calculate_stat(10, 0.05, self.level)
        self.vitality = calculate_stat(10, 0.05, self.level)
        self.luck = calculate_stat(10, 0.03, self.level)
        self.dexterity = calculate_stat(10, 0.05, self.level)
        self.speed = calculate_stat(10, 0.03, self.level)
        self.max_hp = calculate_stat(100, 0.10, self.level)

# Table for all items including weapons / armor / and consumables
class Item(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    rarity = db.Column(db.String(50), nullable=False)
    strength_bonus = db.Column(db.Integer, default=0)
    vitality_bonus = db.Column(db.Integer, default=0)
    armor_bonus = db.Column(db.Integer, default=0)
    luck_bonus = db.Column(db.Integer, default=0)
    dexterity_bonus = db.Column(db.Integer, default=0)
    speed_bonus = db.Column(db.Integer, default=0)

    character_items = db.relationship('CharacterItem', back_populates='item')
    vendors = db.relationship('NPC', secondary='npc_items', back_populates='stock')
    price = db.Column(db.Integer)

    def custom_serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'rarity': self.rarity,
            'strength_bonus': self.strength_bonus,
            'vitality_bonus': self.vitality_bonus,
            'armor_bonus': self.armor_bonus,
            'luck_bonus': self.luck_bonus,
            'dexterity_bonus': self.dexterity_bonus,
            'speed_bonus': self.speed_bonus,
            'price': self.price
        }

# Table to handle loot drops
class LootTable(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'))
    item = db.relationship('Item')
    drop_chance = db.Column(db.Float)
    monster_level = db.Column(db.Integer)
    gold_drop = db.Column(db.Integer, default=0)

# Table for non player characters in town to get quests and materials from
class NPC(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(50))
    dialogue = db.Column(db.String(500))

    stock = db.relationship('Item', secondary='npc_items', back_populates='vendors')

    serialize_rules = ('-stock.vendors', )

# Table to handle quests
class Quest(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    exp_reward = db.Column(db.Integer)
    item_reward_id = db.Column(db.Integer, db.ForeignKey('item.id'))
    item_reward = db.relationship('Item')
    gold_reward = db.Column(db.Integer, default=0)
    required_dungeon_level = db.Column(db.Integer)
    target_amount = db.Column(db.Integer)
    type = db.Column(db.String(50), nullable=False)
    is_repeatable = db.Column(db.Boolean, default=False)

    npc_id = db.Column(db.Integer, db.ForeignKey('npc.id'))
    npc = db.relationship('NPC', backref='quests')

    characters = db.relationship('CharacterQuest', back_populates='quest')

    def custom_serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'exp_reward': self.exp_reward,
            'item_reward': self.item_reward.custom_serialize() if self.item_reward else None,
            'gold_reward': self.gold_reward,
            'required_dungeon_level': self.required_dungeon_level,
            'target_amount': self.target_amount,
            'type': self.type,
            'is_repeatable': self.is_repeatable,
            'npc_id': self.npc_id,
            'npc_name': self.npc.name if self.npc else None
        }

# Table to track taken quests
class CharacterQuest(db.Model):
    character_id = db.Column(db.Integer, db.ForeignKey('character.id'), primary_key=True)
    quest_id = db.Column(db.Integer, db.ForeignKey('quest.id'), primary_key=True)
    status = db.Column(db.String(50))
    progress = db.Column(db.Integer, default=0)
    completion_count = db.Column(db.Integer, default=0)

    character = db.relationship('Character', back_populates='quests')
    quest = db.relationship('Quest', back_populates='characters')

    def custom_serialize(self):
        return {
            'id': self.quest_id,
            'character_id': self.character_id,
            'title': self.quest.title if self.quest else None,
            'description': self.quest.description if self.quest else None,
            'status': self.status,
            'progress': self.progress,
            'exp_reward': self.quest.exp_reward if self.quest else None,
            'gold_reward': self.quest.gold_reward if self.quest else None,
            'item_reward': self.quest.item_reward.custom_serialize() if self.quest and self.quest.item_reward else None,
            'required_dungeon_level': self.quest.required_dungeon_level if self.quest else None,
            'target_amount': self.quest.target_amount if self.quest else None,
            'type': self.quest.type if self.quest else None,
            'is_repeatable': self.quest.is_repeatable if self.quest else None,
            'completion_count': self.completion_count
        }

# Table to handle monsters
class Monster(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    level = db.Column(db.Integer, nullable=False)
    strength = db.Column(db.Integer, nullable=False)
    vitality = db.Column(db.Integer, nullable=False)
    speed = db.Column(db.Integer, nullable=False)
    max_hp = db.Column(db.Integer)
    current_hp = db.Column(db.Integer)
    exp_drop = db.Column(db.Integer)

    def custom_serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'level': self.level,
            'strength': self.strength,
            'vitality': self.vitality,
            'speed': self.speed,
            'max_hp': self.max_hp,
            'current_hp': self.current_hp,
            'exp_drop': self.exp_drop
        }