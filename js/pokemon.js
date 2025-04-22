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
  listContainer.innerHTML = '';

  const collectedCount = filteredPokemon.filter(p => p.collected).length;

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
      if (globalPokemon) globalPokemon.collected = checkbox.checked;
      saveCollectedStatus();
      displayPokemon();
    });
    const checkboxLabel = document.createElement('label');
    checkboxLabel.setAttribute('for', checkbox.id);
    checkboxWrapper.append(checkbox, checkboxLabel);
    checkCell.appendChild(checkboxWrapper);
    row.appendChild(checkCell);

    // 編號與名稱圖片
    row.innerHTML += `
      <td>${pokemon.index}</td>
      <td>
        <img src="images/pokemon_images/${pokemon.index}_${pokemon.name}.png" alt="${pokemon.name}" width="50" style="margin-right: 8px;">
        <span>${pokemon.name}</span>
      </td>
      <td>${pokemon.types.join('/')}</td>
      <td>${pokemon.cp}</td>
      <td>${pokemon.atk}</td>
      <td>${pokemon.def}</td>
      <td>${pokemon.sta}</td>
      <td>${pokemon.generation}</td>
    `;

    listContainer.appendChild(row);
  });

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

  document.querySelectorAll('.gen-btn').forEach(btn => {
    const btnGen = btn.textContent.split(' ')[1];
    btn.classList.toggle('selected', (btn.id === 'All' && isAllSelected) || (parseInt(btnGen) === selectedGeneration));
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
    applyFilters();
  }
});

// 初始顯示懸浮清除按鈕
document.getElementById('clear-collection-btn').classList.add('show-clear-btn');
