Pokémon GO 收藏追蹤器
🎯 一個用於追蹤 Pokémon GO 收藏進度的網頁應用程式，使用者可以依照世代、屬性等條件瀏覽寶可夢列表，並標記已捕捉的寶可夢。

🔗 線上體驗

🧩 功能特色
📋 寶可夢列表：顯示所有寶可夢的編號、名稱、屬性、最高 CP、攻擊、防禦、耐力等資訊。

🗂️ 分類篩選：依照世代（第一至第八世代）或屬性（如火、水、草等）篩選寶可夢。

✅ 收藏標記：點擊寶可夢項目，可標記為已收藏，並儲存於本地瀏覽器。

♻️ 資料重置：提供清除所有收藏標記的功能，方便重新整理收藏進度。

📁 專案結構
bash
複製
編輯
pokemon/
├── css/             # 樣式表
├── js/              # JavaScript 腳本
├── data/            # 寶可夢資料（如 JSON 檔案）
├── images/          # 圖片資源
├── index.html       # 主頁面
├── Server.bat       # 啟動本地伺服器的批次檔（Windows）
└── tree.txt         # 專案結構說明
🚀 安裝與執行
克隆專案：

bash
複製
編輯
git clone https://github.com/boss7609/pokemon.git
cd pokemon
啟動本地伺服器：

Windows 使用者：雙擊 Server.bat。

或手動啟動：

bash
複製
編輯
python -m http.server
開啟應用程式：

在瀏覽器中輸入 http://localhost:8000，開始使用收藏追蹤器。

🧠 技術知識點
HTML/CSS/JavaScript：構建網頁結構、樣式與互動功能。

本地儲存（LocalStorage）：儲存使用者的收藏標記，避免資料遺失。

JSON 資料處理：載入並解析寶可夢資料，動態生成列表。

事件監聽與 DOM 操作：實現點擊標記、篩選功能等互動效果。
