import requests
from bs4 import BeautifulSoup
import pandas as pd

def scrape_pokemon_data():
    base_url = "http://db.pokemonhubs.com/zh/list.php"
    detail_base = "http://db.pokemonhubs.com/zh/"
    all_pokemon = []

    for gen in range(1, 10):  # gid 1~9
        print(f"正在處理第 {gen} 代寶可夢...")
        page = 1
        has_next_page = True

        while has_next_page:
            params = {'gid': gen, 'page': page} if page > 1 else {'gid': gen}
            response = requests.get(base_url, params=params)

            if response.status_code != 200:
                print(f"[第{gen}代] 請求失敗，狀態碼: {response.status_code}")
                break

            soup = BeautifulSoup(response.text, 'html.parser')
            table = soup.find('table', class_='TabelJS')

            if not table:
                print(f"[第{gen}代] 找不到數據表格")
                break

            rows = table.find('tbody').find_all('tr')

            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 7:
                    # 圖片連結
                    img_tag = cols[1].find('img')
                    img_url = detail_base + img_tag['src'] if img_tag and img_tag.get('src') else ''

                    # 詳情頁連結
                    link_tag = cols[1].find('a')
                    detail_url = detail_base + link_tag['href'] if link_tag and link_tag.get('href') else ''

                    # 屬性
                    type_imgs = cols[1].select('.listText p img')
                    types = []
                    for img in type_imgs:
                        alt = img['alt']
                        if alt not in types:
                            types.append(alt)

                    type1 = types[0] if len(types) > 0 else ''
                    type2 = types[1] if len(types) > 1 else ''

                    pokemon_data = {
                        '編號': cols[0].get_text(strip=True),
                        '寶可夢': cols[1].find('h4').get_text(strip=True) if cols[1].find('h4') else '',
                        '屬性1': type1,
                        '屬性2': type2,
                        '最高CP': cols[2].get_text(strip=True),
                        '攻擊': cols[3].get_text(strip=True),
                        '防禦': cols[4].get_text(strip=True),
                        '耐力': cols[5].get_text(strip=True),
                        '代': cols[6].get_text(strip=True),
                        '圖片連結': img_url,
                        '詳情頁': detail_url
                    }
                    all_pokemon.append(pokemon_data)

            # 分頁邏輯
            pagination = soup.find('div', class_='dataTables_paginate')
            if pagination:
                current_page_btn = pagination.find('a', class_='current')
                if current_page_btn:
                    next_page_btn = current_page_btn.find_next_sibling('a')
                    if next_page_btn and 'paginate_button' in next_page_btn.get('class', []):
                        page += 1
                    else:
                        has_next_page = False
                else:
                    has_next_page = False
            else:
                has_next_page = False

            print(f"第 {gen} 代 - 第 {page} 頁 完成，已收集 {len(all_pokemon)} 隻寶可夢")

    return all_pokemon

# 執行爬蟲
pokemon_data = scrape_pokemon_data()

# 輸出成 CSV
df = pd.DataFrame(pokemon_data)
df.to_csv('pokemon_full_data.csv', index=False, encoding='utf-8-sig')
print("所有數據已儲存為 pokemon_full_data.csv")
print(df.head())
