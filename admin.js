// --- КОНСТАНТЫ И ПЕРЕМЕННЫЕ ---
const ADMIN_PASSWORD = "1234"; // Секретный код для входа

// Элементы экрана входа
const loginScreen = document.getElementById('login-screen');
const adminPasswordInput = document.getElementById('admin-password');
const loginBtn = document.getElementById('login-btn');

// Элементы основной панели
const adminPanel = document.getElementById('admin-panel');
const challengeNameInput = document.getElementById('challenge-name');
const challengeDescriptionInput = document.getElementById('challenge-description'); 
const challengeRulesInput = document.getElementById('challenge-rules'); 
const positiveEffectsInput = document.getElementById('positive-effects');
const negativeEffectsInput = document.getElementById('negative-effects');
const createChallengeBtn = document.getElementById('create-challenge-btn');
const challengesListContainer = document.getElementById('challenges-list');

// Глобальная переменная для отслеживания редактируемого челленджа
let editingChallengeId = null;

// --- ФУНКЦИИ ---

// Функция входа в админку
function login() {
    if (adminPasswordInput.value === ADMIN_PASSWORD) {
        loginScreen.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        loadAndDisplayChallenges(); 
    } else {
        alert('Неверный код доступа!'); 
    }
}

// Функция сохранения или обновления челленджа в Firebase
async function saveOrUpdateChallenge(challengeData, id = null) {
    try {
        if (id) {
            // Обновляем существующий челлендж
            await window.db.collection('challenges').doc(id).set(challengeData, { merge: true });
            alert(`Челлендж "${challengeData.name}" успешно обновлен!`);
        } else {
            // Добавляем новый челлендж
            await window.db.collection('challenges').add(challengeData);
            alert(`Челлендж "${challengeData.name}" успешно сохранен!`); 
        }
        
        // Очищаем форму и сбрасываем режим редактирования
        challengeNameInput.value = '';
        challengeDescriptionInput.value = '';
        challengeRulesInput.value = '';
        positiveEffectsInput.value = '';
        negativeEffectsInput.value = '';
        editingChallengeId = null;
        createChallengeBtn.textContent = 'Создать и сохранить'; // Возвращаем текст кнопки
        
        loadAndDisplayChallenges(); 
    } catch (error) {
        console.error("Ошибка при сохранении/обновлении челленджа: ", error);
        alert("Ошибка при сохранении/обновлении челленджа. Попробуйте еще раз."); 
    }
}

// Функция загрузки и отображения челленджей из Firebase
async function loadAndDisplayChallenges() {
    challengesListContainer.innerHTML = ''; 

    try {
        const snapshot = await window.db.collection('challenges').get();
        const challenges = [];
        snapshot.forEach(doc => {
            challenges.push({ id: doc.id, ...doc.data() }); 
        });

        if (challenges.length === 0) {
            challengesListContainer.innerHTML = '<p class="text-gray-400">Пока нет созданных челленджей.</p>';
            return;
        }

        challenges.forEach((challenge) => { 
            const challengeDiv = document.createElement('div');
            // Применяем новые классы для элементов списка челленджей
            challengeDiv.classList.add('challenge-item', 'p-4', 'rounded-lg', 'shadow-md', 'flex', 'flex-col', 'md:flex-row', 'justify-between', 'items-start', 'md:items-center', 'space-y-2', 'md:space-y-0');
            challengeDiv.innerHTML = `
                <div class="flex-1">
                    <h3 class="text-xl font-semibold text-green-300">${challenge.name}</h3>
                    <p class="text-gray-400 text-sm">Положительных: ${challenge.positiveEffects ? challenge.positiveEffects.length : 0}, Отрицательных: ${challenge.negativeEffects ? challenge.negativeEffects.length : 0}</p>
                </div>
                <div class="flex space-x-2 mt-2 md:mt-0">
                    <button class="edit-btn btn-blue py-2 px-4 rounded-lg transition-colors duration-200" data-id="${challenge.id}">Редактировать</button>
                    <button class="delete-btn btn-danger py-2 px-4 rounded-lg transition-colors duration-200" data-id="${challenge.id}">Удалить</button>
                </div>
            `;
            challengesListContainer.appendChild(challengeDiv);
        });

        // Добавляем обработчики для кнопок удаления
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const challengeId = event.target.dataset.id; 
                deleteChallenge(challengeId);
            });
        });

        // Добавляем обработчики для кнопок редактирования
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const challengeId = event.target.dataset.id;
                editChallenge(challengeId);
            });
        });

    } catch (error) {
        console.error("Ошибка при загрузке челленджей: ", error);
        challengesListContainer.innerHTML = '<p class="text-red-400">Не удалось загрузить челленджи.</p>';
    }
}

// Функция для загрузки данных челленджа в форму для редактирования
async function editChallenge(id) {
    try {
        const doc = await window.db.collection('challenges').doc(id).get();
        if (doc.exists) {
            const challenge = doc.data();
            challengeNameInput.value = challenge.name || '';
            challengeDescriptionInput.value = challenge.description || '';
            challengeRulesInput.value = (challenge.rules || []).join('\n');
            positiveEffectsInput.value = (challenge.positiveEffects || []).join('\n');
            negativeEffectsInput.value = (challenge.negativeEffects || []).join('\n');
            editingChallengeId = id; // Устанавливаем ID редактируемого челленджа
            createChallengeBtn.textContent = 'Обновить челлендж'; // Меняем текст кнопки
        } else {
            alert('Челлендж не найден.');
        }
    } catch (error) {
        console.error("Ошибка при загрузке челленджа для редактирования: ", error);
        alert("Ошибка при загрузке челленджа для редактирования. Попробуйте еще раз.");
    }
}


// Функция удаления челленджа из Firebase
async function deleteChallenge(id) {
    if (!confirm('Вы уверены, что хотите удалить этот челлендж?')) {
        return;
    }
    
    try {
        await window.db.collection('challenges').doc(id).delete();
        alert('Челлендж успешно удален!'); 
        loadAndDisplayChallenges(); 
    } catch (error) {
        console.error("Ошибка при удалении челленджа: ", error);
        alert("Ошибка при удалении челленджа. Попробуйте еще раз."); 
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

// Кнопка создания/сохранения челленджа
createChallengeBtn.addEventListener('click', () => {
    const name = challengeNameInput.value.trim();
    const description = challengeDescriptionInput.value.trim();
    const rules = challengeRulesInput.value.split('\n').filter(line => line.trim() !== ''); // Получаем правила
    const positive = positiveEffectsInput.value.split('\n').filter(line => line.trim() !== '');
    const negative = negativeEffectsInput.value.split('\n').filter(line => line.trim() !== '');

    if (!name || positive.length === 0 || negative.length === 0) {
        alert('Пожалуйста, заполните все поля: название и хотя бы по одному эффекту.'); 
        return;
    }

    const challengeData = {
        name: name,
        description: description, // Добавляем описание
        rules: rules, // Добавляем правила
        positiveEffects: positive,
        negativeEffects: negative
    };

    saveOrUpdateChallenge(challengeData, editingChallengeId); // Вызываем функцию сохранения/обновления
});

// Загрузка челленджей при полной загрузке DOM (для админ-панели)
document.addEventListener('DOMContentLoaded', async () => {
    // Ждем, пока window.db будет определен, чтобы избежать ошибок Firebase
    let attempts = 0;
    while (!window.db && attempts < 10) { 
        await new Promise(resolve => setTimeout(resolve, 100)); // Ждем 100мс
        attempts++;
    }
    if (window.db) {
        loadAndDisplayChallenges();
    } else {
        console.error("Firebase Firestore (window.db) is not available after multiple attempts.");
        // Можно добавить сообщение об ошибке на UI, если Firebase не загрузился
    }
});