  // 全域變數設定
  let pokemonData = [];
  let selectedTypes = [];
  let filteredPokemon = [];
  let selectedGeneration = null;
  let isAllSelected = false;

  /* ---------- 資料載入與狀態管理 ---------- */
  // 從 JSON 載入寶可夢資料
  fetch('data/pokemon.json')
    .then(response => response.json())
    .then(data => {
      pokemonData = data;
      loadCollectedStatus();
      console.log("載入完成，共有", pokemonData.length, "筆資料");
    });
  // 儲存蒐集狀態至 localStorage
  function saveCollectedStatus() {
    const collectedMap = {};
    pokemonData.forEach(p => {
      if (p.collected) collectedMap[p.index] = true;
    });
    localStorage.setItem('collectedPokemon', JSON.stringify(collectedMap));
  }
  // 載入蒐集狀態
  function loadCollectedStatus() {
    const collectedMap = JSON.parse(localStorage.getItem('collectedPokemon')) || {};
    pokemonData.forEach(p => {
      if (collectedMap[p.index]) p.collected = true;
    });
  }
  /* ---------- 畫面更新 ---------- */
  // 顯示寶可夢列表
  function displayPokemon() {
    const listContainer = document.getElementById('pokemon-list');
    const countContainer = document.getElementById('pokemon-count');
    const generationDisplay = document.getElementById('generation-display');
    
    // 清空現有內容
    listContainer.innerHTML = '';
    
    // 創建表格頭部
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // 定義表頭欄位
    const headers = [
      '✔', '編號', '寶可夢', '屬性', '最高CP', 
      '攻擊', '防禦', '耐力', '世代'
    ];
    
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    listContainer.appendChild(thead);
    
    // 創建表格主體
    const tbody = document.createElement('tbody');
    const fragment = document.createDocumentFragment(); // ✅ 新增這個
    
    // 統計已蒐集數量
    const collectedCount = filteredPokemon.filter(p => p.collected).length;
    
    // 顯示目前選擇的世代
    if (isAllSelected) {
      generationDisplay.textContent = '「世代」查看：全部寶可夢';
    } else if (selectedGeneration !== null) {
      generationDisplay.textContent = `「世代」查看：第 ${selectedGeneration} 世代`;
    } else {
      generationDisplay.textContent = '「世代」查看：未選擇';
    }
    
    // 添加每一行寶可夢資料
    filteredPokemon.forEach(pokemon => {
      const row = document.createElement('tr');
      // 蒐集勾選框
      const checkCell = document.createElement('td');
      const checkboxWrapper = document.createElement('div');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `pokemon-${pokemon.index}`;
      checkbox.checked = pokemon.collected || false;
      checkbox.addEventListener('change', () => {
        pokemon.collected = checkbox.checked;
        const globalPokemon = pokemonData.find(p => p.index === pokemon.index);
        if (globalPokemon) {
          globalPokemon.collected = checkbox.checked;
        }
        saveCollectedStatus();
        generateStats();
        const collectedCount = filteredPokemon.filter(p => p.collected).length;
        document.getElementById('pokemon-count').textContent = 
          `目前篩選共有 ${filteredPokemon.length} 隻寶可夢，已蒐集 ${collectedCount} 隻`;
      });
      const checkboxLabel = document.createElement('label');
      checkboxLabel.setAttribute('for', checkbox.id);
      checkboxWrapper.append(checkbox, checkboxLabel);
      checkCell.appendChild(checkboxWrapper);
      // 編號
      const indexCell = document.createElement('td');
      indexCell.textContent = pokemon.index;
      // 名稱與圖片
      const nameCell = document.createElement('td');
      const img = document.createElement('img');
      img.src = `images/pokemon_images/${pokemon.index}_${pokemon.name}.png`;
      img.alt = pokemon.name;
      img.loading = 'lazy'; 
      img.style.maxWidth = '50px';
      img.style.maxHeight = '50px';
      img.style.marginRight = '8px';      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = pokemon.name;
      nameCell.appendChild(img);
      nameCell.appendChild(nameSpan);
      // 其他欄位
      const typeCell = document.createElement('td');
      typeCell.textContent = pokemon.types.join('/');
      const cpCell = document.createElement('td');
      cpCell.textContent = pokemon.cp;
      const atkCell = document.createElement('td');
      atkCell.textContent = pokemon.atk;
      const defCell = document.createElement('td');
      defCell.textContent = pokemon.def;
      const staCell = document.createElement('td');
      staCell.textContent = pokemon.sta;
      const genCell = document.createElement('td');
      genCell.textContent = pokemon.generation;
      // 加入所有 cell 到 row
      row.append(
        checkCell, indexCell, nameCell, typeCell, 
        cpCell, atkCell, defCell, staCell, genCell
      );
      fragment.appendChild(row);
    });
    tbody.appendChild(fragment); // ✅ 最後整批加入 tbody
    listContainer.appendChild(tbody);
    listContainer.appendChild(tbody);
    countContainer.textContent = `目前篩選共有 ${filteredPokemon.length} 隻寶可夢，已蒐集 ${collectedCount} 隻`;
    document.getElementById('pokemon-list-section').style.display = 'block';
  }
  /* ---------- 篩選邏輯 ---------- */
  // 應用篩選條件
  function applyFilters() {
    let tempFiltered = [...pokemonData];
    if (selectedGeneration !== null) {
      tempFiltered = tempFiltered.filter(p => p.generation === String(selectedGeneration));
    }
    if (selectedTypes.length > 0) {
      tempFiltered = tempFiltered.filter(p => {
        const lowerTypes = p.types.map(t => t.toLowerCase());
        return selectedTypes.every(type => lowerTypes.includes(type));
      });
    }
    filteredPokemon = tempFiltered;
    if (selectedGeneration !== null || selectedTypes.length > 0 || isAllSelected) {
      displayPokemon();
    } else {
      document.getElementById('pokemon-list-section').style.display = 'none';
    }
  }

  // 世代篩選
  function filterByGen(gen) {
    // 如果選擇了 "全部" 這個按鈕，則清除世代選擇
    if (gen === 'all') {
      isAllSelected = !isAllSelected;
      selectedGeneration = null;
    } else {
      if (selectedGeneration === gen) {
        selectedGeneration = null;
        isAllSelected = false;
      } else {
        selectedGeneration = gen;
        isAllSelected = false;
      }
    }

    // 更新所有 gen-btn 的 selected 狀態
    document.querySelectorAll('.gen-btn').forEach(btn => {
      const btnGen = btn.id.split('-')[1]; // 取得按鈕的世代數字（例如 "gen-1" → "1"）
      const isSelected = 
        (btn.id === 'All' && isAllSelected) || // 檢查是否為「全部」按鈕且被選中
        (parseInt(btnGen) === selectedGeneration); // 檢查是否為當前選中的世代
      btn.classList.toggle('selected', isSelected);
    });

    applyFilters();
  }



  // 屬性篩選
  function filterByType(type) {
    if (!selectedTypes.includes(type) && selectedTypes.length >= 2) {
      alert('最多只能選擇兩種屬性！');
      return;
    }
    selectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    document.querySelectorAll('.type-btn').forEach(btn => {
      const btnType = btn.id.replace('-button', '');
      btn.classList.toggle('selected', selectedTypes.includes(btnType));
    });
    document.querySelectorAll('.type-btn.selected').forEach((btn, index) => {
      btn.setAttribute('data-order', index + 1);
    });
    const typeDisplay = document.getElementById('selected-types-display');
    const typeLabels = {
      normal: '一般', fire: '火', water: '水', grass: '草', electric: '電',
      ice: '冰', fighting: '格鬥', poison: '毒', ground: '地面', flying: '飛行',
      psychic: '超能', bug: '蟲', rock: '岩石', ghost: '幽靈', dragon: '龍',
      dark: '惡', steel: '鋼', fairy: '妖精'
    };
    typeDisplay.textContent = selectedTypes.length > 0
      ? `依屬性：${selectedTypes.map(t => typeLabels[t]).join(' 跟 ')}`
      : '依屬性：';
    applyFilters();
  }

  /* ---------- 其他操作 ---------- */
  // 顯示特定世代（給按鈕綁定）
  function showGeneration(gen) {
    filterByGen(gen);
  }
  // 清除所有蒐集資料
  document.getElementById('clear-collection-btn').addEventListener('click', () => {
    if (confirm('你確定要清除所有蒐集資料嗎？這將無法恢復！')) {
      pokemonData.forEach(p => p.collected = false);
      localStorage.removeItem('collectedPokemon');
      location.reload(); // ⬅️ 加這行會整頁重新載入
    }
  });
  
// 在 DOM 加載完成後綁定事件
document.addEventListener('DOMContentLoaded', () => {
  const searchToggle = document.getElementById('search-toggle');
  const searchPanel = document.getElementById('search-panel');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const statsToggle = document.getElementById('stats-toggle');
  const statsPanel = document.getElementById('stats-panel');
  // 確認元素存在
  if (!statsToggle || !statsPanel) {
    console.error('statsToggle 或 statsPanel 未找到');
    return;
  }
  // 搜尋按鈕事件
  if (searchToggle && searchPanel && searchInput) {
    searchToggle.addEventListener('click', () => {
      searchPanel.classList.toggle('hidden');
      const rect = searchToggle.getBoundingClientRect();
      searchPanel.style.left = `${rect.right + 10}px`;
      searchPanel.style.top = `${rect.top}px`;
      if (!searchPanel.classList.contains('hidden')) {
        searchInput.focus();
      }
    });
  }
  // 搜尋邏輯
  if (searchInput && searchResults) {
    searchInput.addEventListener('input', function () {
      const query = this.value.trim().toLowerCase();
      searchResults.innerHTML = '';
      if (query.length === 0) return;
      const results = pokemonData.filter(p =>
        p.name.toLowerCase().includes(query) || String(p.index).includes(query)
      );
      results.forEach(p => {
        const li = document.createElement('li');
        li.textContent = `#${p.index} ${p.name}`;
        li.addEventListener('click', () => {
          filteredPokemon = [p];
          displayPokemon();
          searchPanel.classList.add('hidden');
        });
        searchResults.appendChild(li);
      });
    });
  }

  
  statsToggle.addEventListener('click', () => {
    statsPanel.classList.toggle('hidden');
    if (!statsPanel.classList.contains('hidden')) {
      generateStats(); // 顯示前重新統計
    }
  });
});

function generateStats() {
  const statsPanel = document.getElementById('stats-panel');
  statsPanel.innerHTML = ''; // 清空舊內容

  const collected = pokemonData.filter(p => p.collected);
  const total = pokemonData.length;
  const collectedCount = collected.length;

  // 基本統計
  const baseStats = document.createElement('div');
  baseStats.innerHTML = `
    <h3>📊 統計資訊</h3>
    <p>已收集：${collectedCount} / ${total} 隻</p>
    <p>收集率：${((collectedCount / total) * 100).toFixed(1)}%</p>
    
    <!-- 進度條 -->
    <div class="progress-bar">
      <div class="progress" style="width: ${((collectedCount / total) * 100).toFixed(1)}%"></div>
    </div>
  `;

  // 按世代統計（1-8世代都顯示，若為0也顯示）
  const genStats = {};
  for (let i = 1; i <= 8; i++) {
    const gen = i.toString();
    genStats[gen] = collected.filter(p => p.generation === gen).length;
  }

  const genDiv = document.createElement('div');
  genDiv.innerHTML = '<h4>🧬 各世代收集數：</h4>';
  for (let i = 1; i <= 8; i++) {
    const gen = i.toString();
    const count = genStats[gen];
    const totalGen = pokemonData.filter(p => p.generation === gen).length;
    const percent = ((count / totalGen) * 100).toFixed(1);
    const p = document.createElement('p');
    p.textContent = `第 ${gen} 世代：${count} 隻（${percent}%）`;
    genDiv.appendChild(p);
  }
  statsPanel.appendChild(baseStats);
  statsPanel.appendChild(genDiv);
}



document.addEventListener('DOMContentLoaded', () => {
  const petContainer = document.getElementById('corner-pet-container');
  const pet = document.getElementById('corner-pet');
  
  // 確保容器可點擊
  petContainer.style.pointerEvents = 'auto';
  
  // 點擊事件處理
  petContainer.addEventListener('click', function(e) {
    e.stopPropagation(); // 防止事件冒泡
    
    // 移除現有的泡泡（如果存在）
    const existingBubble = document.querySelector('.pet-message-bubble');
    if (existingBubble) existingBubble.remove();
    
    // 創建新泡泡
    const bubble = document.createElement('div');
    bubble.className = 'pet-message-bubble';
    bubble.textContent = getRandomMessage();
    
    // 定位泡泡
    bubble.style.position = 'absolute';
    bubble.style.bottom = '100%';
    bubble.style.left = '50%';
    bubble.style.transform = 'translateX(-50%)';
    
    // 添加到容器
    petContainer.appendChild(bubble);
    
    // 3秒後淡出
    setTimeout(() => {
      bubble.style.opacity = '0';
      setTimeout(() => bubble.remove(), 500);
    }, 2000);
    
    // 點擊動畫
    pet.style.transform = 'scale(1.1)';
    setTimeout(() => pet.style.transform = '', 300);
  });
  
  // 隨機對話內容
  function getRandomMessage() {
    const messages = [
      '訓練家你好！',
      '今天抓到寶可夢了嗎？',
      '波導彈！',
      '一起冒險吧！'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
});