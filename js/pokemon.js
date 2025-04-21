let pokemonData = [];
let selectedTypes = [];
let filteredPokemon = [];
let selectedGeneration = null;
let isAllSelected = false;

// 從 JSON 檔案載入寶可夢資料
fetch('data/pokemon.json')
  .then(response => response.json())
  .then(data => {
    pokemonData = data;
    loadCollectedStatus();
    console.log("載入完成，共有", pokemonData.length, "筆資料");
  });

// 顯示寶可夢列表
function displayPokemon() {
  const listContainer = document.getElementById('pokemon-list');
  const countContainer = document.getElementById('pokemon-count');
  listContainer.innerHTML = ''; // 清空列表內容

  // 計算已蒐集的寶可夢數量
  const collectedCount = filteredPokemon.filter(pokemon => pokemon.collected).length;

  filteredPokemon.forEach(pokemon => {
    const row = document.createElement('tr');

    // 已收藏
    const checkCell = document.createElement('td');
    const checkboxWrapper = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `pokemon-${pokemon.index}`;
    checkbox.checked = pokemon.collected || false;
    checkbox.addEventListener('change', () => {
      // 更新 pokemonData 和 filteredPokemon 的 collected 狀態
      pokemon.collected = checkbox.checked;
      const globalPokemon = pokemonData.find(p => p.index === pokemon.index);
      if (globalPokemon) globalPokemon.collected = checkbox.checked;
      saveCollectedStatus();
      displayPokemon(); // 重新渲染列表以更新計數
    });

    const checkboxLabel = document.createElement('label');
    checkboxLabel.setAttribute('for', `pokemon-${pokemon.index}`);
    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(checkboxLabel);
    checkCell.appendChild(checkboxWrapper);
    row.appendChild(checkCell);

    // 編號
    const idCell = document.createElement('td');
    idCell.textContent = pokemon.index;
    row.appendChild(idCell);

    // 名稱與圖片
    const nameCell = document.createElement('td');
    const img = document.createElement('img');
    img.src = pokemon.image;
    img.alt = pokemon.name;
    img.width = 50;
    img.style.marginRight = '8px';
    nameCell.appendChild(img);
    const nameText = document.createElement('span');
    nameText.textContent = pokemon.name;
    nameCell.appendChild(nameText);
    row.appendChild(nameCell);

    // 屬性
    const typeCell = document.createElement('td');
    typeCell.textContent = pokemon.types.join('/');
    row.appendChild(typeCell);

    // 最高CP
    const cpCell = document.createElement('td');
    cpCell.textContent = pokemon.cp;
    row.appendChild(cpCell);

    // 攻擊
    const atkCell = document.createElement('td');
    atkCell.textContent = pokemon.atk;
    row.appendChild(atkCell);

    // 防禦
    const defCell = document.createElement('td');
    defCell.textContent = pokemon.def;
    row.appendChild(defCell);

    // 耐力
    const staCell = document.createElement('td');
    staCell.textContent = pokemon.sta;
    row.appendChild(staCell);

    // 世代
    const genCell = document.createElement('td');
    genCell.textContent = pokemon.generation;
    row.appendChild(genCell);

    listContainer.appendChild(row);
  });

  // 顯示寶可夢數量及已蒐集數量
  countContainer.textContent = `目前篩選共有 ${filteredPokemon.length} 隻寶可夢，已蒐集 ${collectedCount} 隻`;

  // 顯示寶可夢列表區塊
  document.getElementById('pokemon-list-section').style.display = 'block';
}

// 依世代篩選
function filterByGen(gen) {
  if (gen === 'all') {
    if (isAllSelected) {
      // 再次點擊 ALL 按鈕，取消所有篩選
      selectedGeneration = null;
      isAllSelected = false;
    } else {
      // 初次點擊 ALL 按鈕，顯示所有世代
      selectedGeneration = null;
      isAllSelected = true;
    }
  } else {
    // 選擇特定世代
    if (selectedGeneration === gen) {
      // 再次點擊已選世代，取消選取
      selectedGeneration = null;
      isAllSelected = false;
    } else {
      selectedGeneration = gen;
      isAllSelected = false;
    }
  }

  // 更新選取樣式
  document.querySelectorAll('.gen-btn').forEach(button => {
    if (button.id === 'All') {
      button.classList.toggle('selected', isAllSelected);
    } else {
      button.classList.toggle('selected', parseInt(button.textContent.split(' ')[1]) === selectedGeneration);
    }
  });

  // 執行篩選
  applyFilters();
}

// 依屬性篩選
function filterByType(type) {
  // 切換選取狀態前先判斷是否已選兩個
  if (!selectedTypes.includes(type) && selectedTypes.length >= 2) {
    alert('最多只能選擇兩種屬性！');
    return;
  }

  // 切換選取狀態
  if (selectedTypes.includes(type)) {
    selectedTypes = selectedTypes.filter(t => t !== type);
  } else {
    selectedTypes.push(type);
  }

  // 更新按鈕樣式
  document.querySelectorAll('.type-btn').forEach(btn => {
    const btnType = btn.id.replace('-button', '');
    btn.classList.toggle('selected', selectedTypes.includes(btnType));
  });

  // 更新屬性顯示文字
  const typeDisplay = document.getElementById('selected-types-display');
  if (selectedTypes.length === 0) {
    typeDisplay.textContent = '依屬性：';
  } else {
    const typeLabels = {
      normal: '一般', fire: '火', water: '水', grass: '草', electric: '電',
      ice: '冰', fighting: '格鬥', poison: '毒', ground: '地面', flying: '飛行',
      psychic: '超能', bug: '蟲', rock: '岩石', ghost: '幽靈', dragon: '龍',
      dark: '惡', steel: '鋼', fairy: '妖精'
    };
    const translated = selectedTypes.map(t => typeLabels[t]).join(' 跟 ');
    typeDisplay.textContent = `依屬性：${translated}`;
  }

  // 執行篩選
  applyFilters();
}

// 應用所有篩選條件
function applyFilters() {
  // 先複製所有寶可夢資料
  let tempFiltered = [...pokemonData];

  // 如果有選擇世代，先篩選世代
  if (selectedGeneration !== null) {
    tempFiltered = tempFiltered.filter(pokemon => pokemon.generation === String(selectedGeneration));
  }

  // 如果有選擇屬性，再篩選屬性
  if (selectedTypes.length > 0) {
    tempFiltered = tempFiltered.filter(pokemon => {
      const pokemonTypes = pokemon.types.map(t => t.toLowerCase());
      return selectedTypes.every(selectedType => pokemonTypes.includes(selectedType));
    });
  }

  // 更新篩選結果
  filteredPokemon = tempFiltered;

  // 顯示或隱藏寶可夢列表
  if (selectedGeneration !== null || selectedTypes.length > 0 || isAllSelected) {
    displayPokemon();
    document.getElementById('pokemon-list-section').style.display = 'block';
  } else {
    document.getElementById('pokemon-list-section').style.display = 'none';
  }
}

// 顯示特定世代的寶可夢
function showGeneration(gen) {
  filterByGen(gen);
}

// 儲存收藏狀態
function saveCollectedStatus() {
  const collectedMap = {};
  pokemonData.forEach(p => {
    if (p.collected) {
      collectedMap[p.index] = true;
    }
  });
  localStorage.setItem('collectedPokemon', JSON.stringify(collectedMap));
}

// 載入收藏狀態
function loadCollectedStatus() {
  const collectedMap = JSON.parse(localStorage.getItem('collectedPokemon')) || {};
  pokemonData.forEach(p => {
    if (collectedMap[p.index]) {
      p.collected = true;
    }
  });
}

// 顯示懸停按鈕
document.getElementById('clear-collection-btn').classList.add('show-clear-btn');

// 按鈕點擊事件，清除所有蒐集資料
document.getElementById('clear-collection-btn').addEventListener('click', function() {
  const confirmClear = confirm('你確定要清除所有蒐集資料嗎？這將無法恢復！');
  
  if (confirmClear) {
    // 清除所有寶可夢的 collected 狀態
    pokemonData.forEach(pokemon => {
      pokemon.collected = false;
    });

    // 清除 localStorage 中的蒐集資料
    localStorage.removeItem('collectedPokemon');

    // 重新應用篩選並更新畫面
    applyFilters();
  }
});