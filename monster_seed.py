import json

def calculate_stat(base, growth, level, extra_growth_interval=5, extra_growth_factor=1.15):
    stat = base * (1 + growth) ** (level - 1)
    if level % extra_growth_interval == 0:
        stat *= extra_growth_factor
    return round(stat)

monsters = []
for level in range(1, 101):
    monster = {
        "level": level,
        "name": f"Monster {level}",
        "strength": calculate_stat(5, 0.05, level),
        "vitality": calculate_stat(5, 0.05, level),
        "speed": calculate_stat(5, 0.03, level),
        "max_hp": calculate_stat(50, 0.10, level),
        "current_hp": calculate_stat(50, 0.10, level)
    }
    monsters.append(monster)

with open('monsters.json', 'w') as file:
    json.dump(monsters, file, indent=4)
