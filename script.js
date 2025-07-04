// --- ПЕРЕМЕННЫЕ ---
let allChallenges = []; 
let selectedChallengeData = {}; 
let timer;
let timerCount = 10;
const chosenEffects = []; 

// Переменные для рулетки и выбранной экипировки
let playerArmorList = [];
let playerWeaponList = [];
const playerLocationList = [
    'Домашняя локация',
    'Приток / Шахты',
    'Тихая заводь',
    'Любеч',
    'Лабиринт',
    'Объезд / Отражение'
];
let selectedRandomArmor = 'Не выбрано'; 
let selectedRandomWeapon = 'Не выбрано'; 
let selectedRandomLocation = 'Не выбрано'; 
let rouletteSpinInterval; 

// --- ЭЛЕМЕНТЫ СТРАНИЦЫ ---
const setupScreen = document.getElementById('setup-screen');
const equipmentScreen = document.getElementById('equipment-screen'); 
const gameScreen = document.getElementById('game-screen');

const proceedToEquipmentBtn = document.getElementById('proceed-to-equipment'); 
const startGameBtn = document.getElementById('start-game-btn'); 
const backToSetupBtn = document.getElementById('back-to-setup-btn'); 

const nicknameInput = document.getElementById('nickname');
const challengeSelect = document.getElementById('challenge-select');
const challengeDescriptionDisplay = document.getElementById('challenge-description-display'); 
const setupChallengeRulesDisplay = document.getElementById('setup-challenge-rules-display'); 
const gameChallengeRulesDisplay = document.getElementById('game-challenge-rules-display'); 

// Элементы для ввода списков брони и оружия
const armorListInput = document.getElementById('armor-list-input');
const weaponListInput = document.getElementById('weapon-list-input');

// Элементы рулетки
const rouletteSection = document.getElementById('roulette-section');
const rouletteArmorDisplay = document.getElementById('roulette-armor-display');
const rouletteWeaponDisplay = document.getElementById('roulette-weapon-display');
const rouletteLocationDisplay = document.getElementById('roulette-location-display'); 
const spinRouletteBtn = document.getElementById('spin-roulette-btn');
const rerollLocationBtn = document.getElementById('reroll-location-btn'); 

// Элементы для постоянного отображения выбранной экипировки и локации
const currentArmorDisplay = document.getElementById('current-armor-display');
const currentWeaponDisplay = document.getElementById('current-weapon-display');
const currentLocationDisplay = document.getElementById('current-location-display'); 

const playerNameDisplay = document.getElementById('player-name');
const cardsContainer = document.getElementById('cards-container');
const timerValueDisplay = document.getElementById('timer-value');
const playerEffectsList = document.getElementById('player-effects');

const endChallengeBtn = document.getElementById('end-challenge-btn'); 
const backToRouletteBtn = document.getElementById('back-to-roulette-btn'); 

// Аудио элементы
const buttonClickSound = document.getElementById('button-click-sound');
const rouletteSpinSound = document.getElementById('roulette-spin-sound');
const rouletteStopSound = document.getElementById('roulette-stop-sound');
const cardSelectSound = document.getElementById('card-select-sound');
const timerTickSound = document.getElementById('timer-tick-sound');
const timerEndSound = document.getElementById('timer-end-sound');

// --- ФУНКЦИИ УПРАВЛЕНИЯ АУДИО ---

function playSound(audioElement) {
    if (audioElement) {
        audioElement.currentTime = 0; // Сбрасываем на начало, чтобы можно было проиграть снова
        audioElement.play().catch(e => console.error("Ошибка воспроизведения аудио:", e));
    }
}

function stopSound(audioElement) {
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
    }
}

// --- ФУНКЦИИ УПРАВЛЕНИЯ ЭКРАНАМИ С АНИМАЦИЯМИ ---

function showScreen(screenToShow) {
    const screens = [setupScreen, equipmentScreen, gameScreen];
    screens.forEach(screen => {
        if (screen === screenToShow) {
            screen.classList.remove('hidden', 'fade-out');
            screen.classList.add('fade-in');
        } else {
            screen.classList.add('hidden');
            screen.classList.remove('fade-in', 'fade-out');
        }
    });
}

function hideCurrentScreenAndShow(screenToShow) {
    const currentActiveScreen = document.querySelector('.fade-in');
    if (currentActiveScreen) {
        currentActiveScreen.classList.remove('fade-in');
        currentActiveScreen.classList.add('fade-out');
        currentActiveScreen.addEventListener('animationend', () => {
            currentActiveScreen.classList.add('hidden');
            currentActiveScreen.classList.remove('fade-out');
            showScreen(screenToShow);
        }, { once: true });
    } else {
        showScreen(screenToShow);
    }
}


// --- ФУНКЦИИ ИГРОВОЙ ЛОГИКИ ---

// Загружает челленджи из Firebase в выпадающий список
async function loadChallengesIntoSelect() {
    challengeSelect.innerHTML = '<option value="">-- Выберите челлендж --</option>';
    challengeDescriptionDisplay.classList.add('hidden'); 
    setupChallengeRulesDisplay.classList.add('hidden'); 

    try {
        const snapshot = await window.db.collection('challenges').get();
        allChallenges = []; 
        snapshot.forEach(doc => {
            allChallenges.push({ id: doc.id, ...doc.data() }); 
        });

        if (allChallenges.length === 0) {
            challengeSelect.innerHTML = '<option value="">-- Нет доступных челленджей (создайте в админке) --</option>';
            return;
        }

        allChallenges.forEach((challenge, index) => {
            const option = document.createElement('option');
            option.value = index; 
            option.textContent = challenge.name;
            challengeSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Ошибка при загрузке челленджей для игрока: ", error);
        challengeSelect.innerHTML = '<option value="">-- Ошибка загрузки челленджей --</option>';
    }
}

// Запускает новый раунд игры (теперь начинается с рулетки)
function startNewRound() {
    cardsContainer.classList.add('hidden'); 
    rouletteSection.classList.remove('hidden'); 
    spinRouletteBtn.disabled = false; 
    rerollLocationBtn.classList.add('hidden'); 
    proceedAfterRouletteBtn.classList.add('hidden'); 

    rouletteArmorDisplay.textContent = 'Броня...';
    rouletteWeaponDisplay.textContent = 'Оружие...';
    rouletteLocationDisplay.textContent = 'Локация...'; 

    resetTimer(); 
}

// Функция для запуска анимации рулетки и выбора предметов
function spinRoulette() {
    playSound(buttonClickSound); // Звук нажатия кнопки
    if (playerArmorList.length === 0 || playerWeaponList.length === 0) {
        alert('Списки брони и оружия пусты. Пожалуйста, вернитесь на предыдущий экран и введите их.');
        return;
    }

    spinRouletteBtn.disabled = true; 
    rerollLocationBtn.classList.add('hidden'); 
    proceedAfterRouletteBtn.classList.add('hidden'); 

    // Добавляем класс анимации и запускаем звук вращения
    rouletteArmorDisplay.classList.add('spinning');
    rouletteWeaponDisplay.classList.add('spinning');
    rouletteLocationDisplay.classList.add('spinning');
    playSound(rouletteSpinSound);

    let spinCount = 0;
    const maxSpinCount = 30; 
    const spinDuration = 100; 

    rouletteSpinInterval = setInterval(() => {
        rouletteArmorDisplay.textContent = playerArmorList[Math.floor(Math.random() * playerArmorList.length)];
        rouletteWeaponDisplay.textContent = playerWeaponList[Math.floor(Math.random() * playerWeaponList.length)];
        rouletteLocationDisplay.textContent = playerLocationList[Math.floor(Math.random() * playerLocationList.length)]; 

        spinCount++;
        if (spinCount >= maxSpinCount) {
            clearInterval(rouletteSpinInterval);
            finalizeRouletteSelection();
        }
    }, spinDuration);
}

// Функция для окончательного выбора и отображения предметов рулетки
function finalizeRouletteSelection() {
    // Удаляем класс анимации и останавливаем звук вращения
    rouletteArmorDisplay.classList.remove('spinning');
    rouletteWeaponDisplay.classList.remove('spinning');
    rouletteLocationDisplay.classList.remove('spinning');
    stopSound(rouletteSpinSound);
    playSound(rouletteStopSound); // Звук остановки рулетки

    selectedRandomArmor = playerArmorList[Math.floor(Math.random() * playerArmorList.length)];
    selectedRandomWeapon = playerWeaponList[Math.floor(Math.random() * playerWeaponList.length)];
    selectedRandomLocation = playerLocationList[Math.floor(Math.random() * playerLocationList.length)]; 

    rouletteArmorDisplay.textContent = `Выбрана броня: ${selectedRandomArmor}`;
    rouletteWeaponDisplay.textContent = `Выбрано оружие: ${selectedRandomWeapon}`;
    rouletteLocationDisplay.textContent = `Выбрана локация: ${selectedRandomLocation}`; 

    currentArmorDisplay.textContent = selectedRandomArmor;
    currentWeaponDisplay.textContent = selectedRandomWeapon;
    currentLocationDisplay.textContent = selectedRandomLocation;

    rerollLocationBtn.classList.remove('hidden'); 
    proceedAfterRouletteBtn.classList.remove('hidden'); 
}

// Функция для переброса локации
function rerollLocation() {
    playSound(buttonClickSound); // Звук нажатия кнопки
    selectedRandomLocation = playerLocationList[Math.floor(Math.random() * playerLocationList.length)];
    rouletteLocationDisplay.textContent = `Выбрана локация: ${selectedRandomLocation}`;
    currentLocationDisplay.textContent = selectedRandomLocation;
    alert(`Локация переброшена! Новая локация: ${selectedRandomLocation}`);
    playSound(rouletteStopSound); // Звук переброса
}

// Функция для перехода к карточкам после рулетки/переброса
function proceedToCards() {
    playSound(buttonClickSound); // Звук нажатия кнопки
    rouletteSection.classList.add('hidden');
    cardsContainer.classList.remove('hidden');
    generateCards(); 
}


// Генерирует две карточки для выбора
function generateCards() {
    cardsContainer.innerHTML = ''; 

    let posEffects = [...selectedChallengeData.positiveEffects];
    let negEffects = [...selectedChallengeData.negativeEffects];

    for (let i = 0; i < 2; i++) {
        if (posEffects.length === 0 || negEffects.length === 0) {
            cardsContainer.innerHTML = '<h3 class="text-xl font-semibold text-red-400 text-center">Эффекты закончились! Начните новый челлендж.</h3>';
            clearInterval(timer); 
            return;
        }

        const posIndex = Math.floor(Math.random() * posEffects.length);
        const randomPositive = posEffects.splice(posIndex, 1)[0];

        const negIndex = Math.floor(Math.random() * negEffects.length);
        const randomNegative = negEffects.splice(negIndex, 1)[0];

        const card = document.createElement('div');
        card.classList.add('card', 'flex-1', 'p-6', 'border-2', 'border-gray-600', 'rounded-2xl', 'bg-gray-700', 'cursor-pointer', 'transition', 'transform', 'hover:scale-105', 'hover:border-green-500', 'shadow-lg', 'flex', 'flex-col', 'justify-between', 'items-center', 'text-center');
        card.innerHTML = `
            <div class="positive text-green-400 font-semibold text-lg mb-4">+ ${randomPositive}</div>
            <div class="negative text-red-400 font-semibold text-lg">- ${randomNegative}</div>
        `;
        
        card.addEventListener('click', (event) => selectCard(randomPositive, randomNegative, event.currentTarget));
        cardsContainer.appendChild(card);
    }
}

// Обрабатывает выбор карточки игроком
function selectCard(positive, negative, clickedCardElement) {
    playSound(cardSelectSound); // Звук выбора карточки
    chosenEffects.push({ positive, negative }); 
    updatePlayerEffects(); 

    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('selected-card');
    });
    clickedCardElement.classList.add('selected-card');

    setTimeout(() => {
        cardsContainer.innerHTML = `
            <div class="card selected-card flex-1 p-6 border-2 border-green-500 rounded-2xl bg-gray-700 shadow-lg flex flex-col justify-between items-center text-center transition transform scale-100">
                <p class="text-gray-300 text-lg mb-4">Вы выбрали:</p>
                <div class="positive text-green-400 font-semibold text-xl mb-2">+ ${positive}</div>
                <div class="negative text-red-400 font-semibold text-xl">- ${negative}</div>
            </div>
        `;
    }, 300); 

    clearInterval(timer); 
    startTimer(); 
}

// Обновляет список эффектов на экране игрока
function updatePlayerEffects() {
    playerEffectsList.innerHTML = ''; 
    chosenEffects.forEach((effect, index) => {
        const li = document.createElement('li');
        li.classList.add('bg-gray-700', 'p-3', 'rounded-lg', 'shadow-sm', 'text-gray-200', 'flex', 'justify-between', 'items-center');
        li.innerHTML = `
            <span>
                <span class="text-green-400">[+ ${effect.positive}]</span> и <span class="text-red-400">[- ${effect.negative}]</span>
            </span>
            <button class="delete-effect-btn bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded-full text-xs transition-colors duration-200" data-index="${index}">X</button>
        `;
        playerEffectsList.appendChild(li);
    });

    // Добавляем обработчики для новых кнопок удаления
    document.querySelectorAll('.delete-effect-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            playSound(buttonClickSound); // Звук нажатия кнопки
            const indexToRemove = parseInt(event.target.dataset.index);
            removeEffect(indexToRemove);
        });
    });
}

// Новая функция для удаления эффекта
function removeEffect(index) {
    if (index >= 0 && index < chosenEffects.length) {
        chosenEffects.splice(index, 1); // Удаляем эффект по индексу
        updatePlayerEffects(); // Обновляем список на экране
    }
}


// Сбрасывает таймер до начального значения
function resetTimer() {
    clearInterval(timer); 
    timerCount = 10; 
    timerValueDisplay.textContent = timerCount; 
    stopSound(timerTickSound); // Останавливаем тиканье, если оно было
}

// Запускает таймер обратного отсчета
function startTimer() {
    playSound(timerTickSound); // Начинаем тиканье таймера
    timer = setInterval(() => {
        timerCount--;
        timerValueDisplay.textContent = timerCount;
        if (timerCount <= 0) {
            clearInterval(timer); 
            stopSound(timerTickSound); // Останавливаем тиканье
            playSound(timerEndSound); // Звук окончания таймера
            startNewRound(); 
        }
    }, 1000); 
}

function resetGame() {
    if (confirm('Вы уверены, что хотите закончить текущий челлендж и начать заново?')) {
        clearInterval(timer); 
        stopSound(timerTickSound); // Останавливаем тиканье
        
        selectedChallengeData = {};
        chosenEffects.length = 0;
        selectedRandomArmor = 'Не выбрано';
        selectedRandomWeapon = 'Не выбрано';
        selectedRandomLocation = 'Не выбрано';

        nicknameInput.value = '';
        challengeSelect.value = '';
        armorListInput.value = '';
        weaponListInput.value = '';

        showScreen(setupScreen);
        
        challengeDescriptionDisplay.classList.add('hidden');
        setupChallengeRulesDisplay.classList.add('hidden');
        
        loadChallengesIntoSelect();
        updatePlayerEffects(); 
        currentArmorDisplay.textContent = 'Не выбрано';
        currentWeaponDisplay.textContent = 'Не выбрано';
        currentLocationDisplay.textContent = 'Не выбрано';
        playerNameDisplay.textContent = 'Игрок: ';
        timerValueDisplay.textContent = '10';
    }
}

// --- ОБРАБОТЧИКИ СОБЫТИЙ ---

// Кнопка "Продолжить" на экране настройки (переход на экран экипировки)
proceedToEquipmentBtn.addEventListener('click', () => {
    playSound(buttonClickSound); // Звук нажатия кнопки
    const nickname = nicknameInput.value.trim();
    const selectedIndex = challengeSelect.value;

    if (!nickname) {
        alert('Пожалуйста, введите никнейм!'); 
        return;
    }
    if (selectedIndex === "") {
        alert('Пожалуйста, выберите челлендж!'); 
        return;
    }

    selectedChallengeData = allChallenges[selectedIndex];
    hideCurrentScreenAndShow(equipmentScreen);
});


// Кнопка "Начать Челлендж!" на экране экипировки (переход на игровой экран)
startGameBtn.addEventListener('click', () => {
    playSound(buttonClickSound); // Звук нажатия кнопки
    playerArmorList = armorListInput.value.split('\n').map(function(item) {
        return item.trim();
    }).filter(function(item) {
        return item !== '';
    });
    playerWeaponList = weaponListInput.value.split('\n').map(function(item) {
        return item.trim();
    }).filter(function(item) {
        return item !== '';
    });

    if (playerArmorList.length === 0 || playerWeaponList.length === 0) {
        alert('Пожалуйста, введите списки брони и оружия!');
        return;
    }

    hideCurrentScreenAndShow(gameScreen);
    playerNameDisplay.textContent = `Игрок: ${nicknameInput.value.trim()}`; 
    
    const gameRulesList = gameChallengeRulesDisplay.querySelector('ul');
    gameRulesList.innerHTML = ''; 
    if (selectedChallengeData.rules && selectedChallengeData.rules.length > 0) {
        selectedChallengeData.rules.forEach(rule => {
            const li = document.createElement('li');
            li.textContent = rule;
            gameRulesList.appendChild(li);
        });
        gameChallengeRulesDisplay.classList.remove('hidden'); 
    } else {
        gameChallengeRulesDisplay.classList.add('hidden'); 
    }

    startNewRound(); 
});

// Кнопка "Назад" на экране экипировки
backToSetupBtn.addEventListener('click', () => {
    playSound(buttonClickSound); // Звук нажатия кнопки
    hideCurrentScreenAndShow(setupScreen);
});

// Кнопка "Закончить Челлендж" на игровом экране
endChallengeBtn.addEventListener('click', () => {
    playSound(buttonClickSound); // Звук нажатия кнопки
    resetGame();
});

// Кнопка "Назад" на игровом экране (возврат к рулетке)
backToRouletteBtn.addEventListener('click', () => {
    playSound(buttonClickSound); // Звук нажатия кнопки
    cardsContainer.classList.add('hidden');
    rouletteSection.classList.remove('hidden');
    spinRouletteBtn.disabled = false; 
    rerollLocationBtn.classList.remove('hidden'); 
    proceedAfterRouletteBtn.classList.remove('hidden'); 
    clearInterval(timer); 
    stopSound(timerTickSound); // Останавливаем тиканье
});


// Загрузка челленджей при полной загрузке DOM
document.addEventListener('DOMContentLoaded', async () => {
    // Ждем, пока window.db будет определен, чтобы избежать ошибок Firebase
    let attempts = 0;
    while (!window.db && attempts < 10) { 
        await new Promise(resolve => setTimeout(resolve, 100)); // Ждем 100мс
        attempts++;
    }
    if (window.db) {
        await loadChallengesIntoSelect();
    } else {
        console.error("Firebase Firestore (window.db) is not available after multiple attempts.");
        challengeSelect.innerHTML = '<option value="">-- Ошибка загрузки челленджей (Firebase недоступен) --</option>';
    }
});

// Обработчик изменения выбора челленджа в выпадающем списке (для экрана настройки)
challengeSelect.addEventListener('change', () => {
    playSound(buttonClickSound); // Звук выбора в селекте
    const selectedIndex = challengeSelect.value;
    if (selectedIndex !== "") {
        const challenge = allChallenges[selectedIndex];
        
        challengeDescriptionDisplay.textContent = challenge.description || 'Описание отсутствует.';
        challengeDescriptionDisplay.classList.remove('hidden'); 

        const setupRulesList = setupChallengeRulesDisplay.querySelector('ul');
        setupRulesList.innerHTML = ''; 
        if (challenge.rules && challenge.rules.length > 0) {
            challenge.rules.forEach(rule => {
                const li = document.createElement('li');
                li.textContent = rule;
                setupRulesList.appendChild(li);
            });
            setupChallengeRulesDisplay.classList.remove('hidden'); 
        } else {
            setupChallengeRulesDisplay.classList.add('hidden'); 
        }

    } else {
        challengeDescriptionDisplay.classList.add('hidden'); 
        challengeDescriptionDisplay.textContent = '';
        setupChallengeRulesDisplay.classList.add('hidden');
        setupChallengeRulesDisplay.querySelector('ul').innerHTML = '';
    }
});

// Обработчик для кнопки "Крутить рулетку!"
spinRouletteBtn.addEventListener('click', spinRoulette);

// Обработчик для кнопки "Перебросить локацию"
rerollLocationBtn.addEventListener('click', rerollLocation);

// Добавляем новую кнопку "Продолжить" после рулетки
const proceedAfterRouletteBtn = document.createElement('button');
proceedAfterRouletteBtn.id = 'proceed-after-roulette-btn';
proceedAfterRouletteBtn.textContent = 'Продолжить к карточкам';
proceedAfterRouletteBtn.classList.add('w-full', 'py-3', 'px-6', 'rounded-lg', 'bg-green-600', 'text-white', 'font-bold', 'hover:bg-green-700', 'transition-colors', 'duration-300', 'shadow-md', 'hover:shadow-lg', 'mt-4', 'hidden'); 
rouletteSection.appendChild(proceedAfterRouletteBtn); 

proceedAfterRouletteBtn.addEventListener('click', proceedToCards);