import pandas as pd
import json

# 讀取剛才輸出的 CSV
df = pd.read_csv('pokemon_full_data.csv')

# 建立轉換後的 JSON 資料格式
pokemon_list = []
for _, row in df.iterrows():
    types = []
    if pd.notna(row['屬性1']):
        types.append(row['屬性1'])
    if pd.notna(row['屬性2']) and row['屬性2'] != row['屬性1']:
        types.append(row['屬性2'])

    pokemon = {
        'index': str(row['編號']),
        'name': row['寶可夢'],
        'types': types,
        'generation': str(row['代']),
        'cp': str(row['最高CP']),
        'atk': str(row['攻擊']),
        'def': str(row['防禦']),
        'sta': str(row['耐力']),
        'image': row['圖片連結'],
        'detail': row['詳情頁']
    }
    pokemon_list.append(pokemon)

# 輸出為 JSON 檔案
with open('pokemon.json', 'w', encoding='utf-8-sig') as f:
    json.dump(pokemon_list, f, ensure_ascii=False, indent=2)

print("✅ 已成功轉換為 pokemon.json")
