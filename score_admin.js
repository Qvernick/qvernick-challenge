// --- КОНСТАНТЫ И ПЕРЕМЕННЫЕ ---
const ADMIN_PASSWORD = "1234"; // Секретный код для входа

// Элементы экрана входа
const loginScreen = document.getElementById('login-screen');
const adminPasswordInput = document.getElementById('admin-password');
const loginBtn = document.getElementById('login-btn');

// Элементы основной панели подсчета
const scorePanel = document.getElementById('score-panel');
const victoryConditionSelect = document.getElementById('victory-condition-select');
const sumCalculator = document.getElementById('sum-calculator');
const pointsCalculator = document.getElementById('points-calculator');
const resultsDisplay = document.getElementById('results-display'); // Новый блок результатов

// Элементы для калькулятора суммы (Игрок 1 и Игрок 2)
const runMoneyInputsP1 = [
    document.getElementById('run1-money-p1'),
    document.getElementById('run2-money-p1'),
    document.getElementById('run3-money-p1'),
    document.getElementById('run4-money-p1'),
    document.getElementById('run5-money-p1')
];
const runMoneyInputsP2 = [
    document.getElementById('run1-money-p2'),
    document.getElementById('run2-money-p2'),
    document.getElementById('run3-money-p2'),
    document.getElementById('run4-money-p2'),
    document.getElementById('run5-money-p2')
];
const calculateSumBtn = document.getElementById('calculate-sum-btn');
let totalMoneyP1 = 0; // Переменная для хранения результата Игрока 1
let totalMoneyP2 = 0; // Переменная для хранения результата Игрока 2

// Элементы для калькулятора баллов (Игрок 1 и Игрок 2)
const completedPodlyankiInputP1 = document.getElementById('completed-podlyanki-p1');
const successfulVynosInputP1 = document.getElementById('successful-vynos-p1');
const moneyAboveTargetInputP1 = document.getElementById('money-above-target-p1');
const firstAttemptVynosInputP1 = document.getElementById('first-attempt-vynos-p1');

const completedPodlyankiInputP2 = document.getElementById('completed-podlyanki-p2');
const successfulVynosInputP2 = document.getElementById('successful-vynos-p2');
const moneyAboveTargetInputP2 = document.getElementById('money-above-target-p2');
const firstAttemptVynosInputP2 = document.getElementById('first-attempt-vynos-p2');

const calculatePointsBtn = document.getElementById('calculate-points-btn');
let totalPointsP1 = 0; // Переменная для хранения результата Игрока 1
let totalPointsP2 = 0; // Переменная для хранения результата Игрока 2

// Элементы для отображения результатов
const player1FinalScoreSpan = document.getElementById('player1-final-score');
const player2FinalScoreSpan = document.getElementById('player2-final-score');
const winnerDisplay = document.getElementById('winner-display');
const winnerText = document.querySelector('.winner-text');
const congratulationsText = document.querySelector('.congratulations-text');

// --- ФУНКЦИИ ---

// Функция входа в админку подсчета
function login() {
    if (adminPasswordInput.value === ADMIN_PASSWORD) {
        loginScreen.classList.add('hidden');
        scorePanel.classList.remove('hidden');
    } else {
        alert('Неверный код доступа!'); 
    }
}

// Функция для расчета суммы за 5 ходок
function calculateSumValues() {
    totalMoneyP1 = 0;
    runMoneyInputsP1.forEach(input => {
        totalMoneyP1 += parseInt(input.value) || 0;
    });

    totalMoneyP2 = 0;
    runMoneyInputsP2.forEach(input => {
        totalMoneyP2 += parseInt(input.value) || 0;
    });
}

// Функция для расчета баллов
function calculatePointsValues() {
    totalPointsP1 = 0;
    const podlyankiP1 = parseInt(completedPodlyankiInputP1.value) || 0;
    const vynosP1 = parseInt(successfulVynosInputP1.value) || 0;
    const moneyAboveP1 = parseInt(moneyAboveTargetInputP1.value) || 0;
    const firstAttemptP1 = parseInt(firstAttemptVynosInputP1.value) || 0;

    totalPointsP1 += podlyankiP1 * 1;
    totalPointsP1 += vynosP1 * 2;
    totalPointsP1 += Math.floor(moneyAboveP1 / 30000) * 1;
    totalPointsP1 += firstAttemptP1 * 3;

    totalPointsP2 = 0;
    const podlyankiP2 = parseInt(completedPodlyankiInputP2.value) || 0;
    const vynosP2 = parseInt(successfulVynosInputP2.value) || 0;
    const moneyAboveP2 = parseInt(moneyAboveTargetInputP2.value) || 0;
    const firstAttemptP2 = parseInt(firstAttemptVynosInputP2.value) || 0;

    totalPointsP2 += podlyankiP2 * 1;
    totalPointsP2 += vynosP2 * 2;
    totalPointsP2 += Math.floor(moneyAboveP2 / 30000) * 1;
    totalPointsP2 += firstAttemptP2 * 3;
}

// Функция для отображения результатов и объявления победителя с анимацией
function displayResults() {
    // Скрываем кнопки расчета
    calculateSumBtn.classList.add('hidden');
    calculatePointsBtn.classList.add('hidden');

    // Скрываем тексты победителя и поздравления
    winnerText.classList.add('hidden');
    congratulationsText.classList.add('hidden');
    
    // Сбрасываем анимации
    winnerText.classList.remove('winner-glow');
    congratulationsText.classList.remove('confetti-animation');

    // Показываем блок результатов
    resultsDisplay.classList.remove('hidden');

    const selectedCondition = victoryConditionSelect.value;
    let scoreP1, scoreP2;
    let winner = '';

    if (selectedCondition === 'sum_of_5_runs') {
        calculateSumValues();
        scoreP1 = totalMoneyP1.toLocaleString('ru-RU') + ' руб.';
        scoreP2 = totalMoneyP2.toLocaleString('ru-RU') + ' руб.';
        if (totalMoneyP1 > totalMoneyP2) {
            winner = 'Игрок 1';
        } else if (totalMoneyP2 > totalMoneyP1) {
            winner = 'Игрок 2';
        } else {
            winner = 'Ничья';
        }
    } else if (selectedCondition === 'point_system') {
        calculatePointsValues();
        scoreP1 = totalPointsP1;
        scoreP2 = totalPointsP2;
        if (totalPointsP1 > totalPointsP2) {
            winner = 'Игрок 1';
        } else if (totalPointsP2 > totalPointsP1) {
            winner = 'Игрок 2';
        } else {
            winner = 'Ничья';
        }
    }

    player1FinalScoreSpan.textContent = scoreP1;
    player2FinalScoreSpan.textContent = scoreP2;

    // Интригующая анимация перед объявлением победителя
    setTimeout(() => {
        winnerText.classList.remove('hidden');
        winnerText.classList.add('winner-glow'); // Анимация для текста победителя
        winnerDisplay.textContent = winner;
        
        setTimeout(() => {
            congratulationsText.classList.remove('hidden');
            congratulationsText.classList.add('confetti-animation'); // Анимация поздравления
        }, 1500); // Задержка перед показом поздравления
    }, 1000); // Задержка перед объявлением победителя
}

// Функция для переключения калькуляторов
function switchCalculator() {
    const selectedCondition = victoryConditionSelect.value;
    sumCalculator.classList.add('hidden');
    pointsCalculator.classList.add('hidden');
    resultsDisplay.classList.add('hidden'); // Скрываем результаты при смене калькулятора
    calculateSumBtn.classList.remove('hidden'); // Показываем кнопки расчета
    calculatePointsBtn.classList.remove('hidden'); // Показываем кнопки расчета

    if (selectedCondition === 'sum_of_5_runs') {
        sumCalculator.classList.remove('hidden');
    } else if (selectedCondition === 'point_system') {
        pointsCalculator.classList.remove('hidden');
    }
}

// --- ОБРАБОТЧИКИ СОБЫТИЙ ---

// Кнопка входа
loginBtn.addEventListener('click', login);
adminPasswordInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        login();
    }
});

// Выбор условия победы
victoryConditionSelect.addEventListener('change', switchCalculator);

// Кнопки расчета
calculateSumBtn.addEventListener('click', displayResults);
calculatePointsBtn.addEventListener('click', displayResults);

// Обновление значений при изменении любого поля ввода денег (для живого предпросмотра, если захотите)
runMoneyInputsP1.forEach(input => {
    input.addEventListener('input', () => { /* calculateSumValues(); */ }); // Убрал вызов, чтобы не обновлялось до нажатия
});
runMoneyInputsP2.forEach(input => {
    input.addEventListener('input', () => { /* calculateSumValues(); */ });
});

completedPodlyankiInputP1.addEventListener('input', () => { /* calculatePointsValues(); */ });
successfulVynosInputP1.addEventListener('input', () => { /* calculatePointsValues(); */ });
moneyAboveTargetInputP1.addEventListener('input', () => { /* calculatePointsValues(); */ });
firstAttemptVynosInputP1.addEventListener('input', () => { /* calculatePointsValues(); */ });

completedPodlyankiInputP2.addEventListener('input', () => { /* calculatePointsValues(); */ });
successfulVynosInputP2.addEventListener('input', () => { /* calculatePointsValues(); */ });
moneyAboveTargetInputP2.addEventListener('input', () => { /* calculatePointsValues(); */ });
firstAttemptVynosInputP2.addEventListener('input', () => { /* calculatePointsValues(); */ });


// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Убедимся, что калькуляторы и результаты скрыты по умолчанию
    sumCalculator.classList.add('hidden');
    pointsCalculator.classList.add('hidden');
    resultsDisplay.classList.add('hidden');
});