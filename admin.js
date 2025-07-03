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
const challengeRulesInput = document.getElementById('challenge-rules'); // Новое поле для правил
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
async function saveOrUpdateChallenge(challengeData) {
    try {
        if (editingChallengeId) {
            await window.db.collection('challenges').doc(editingChallengeId).update(challengeData);
            alert(`Челлендж "${challengeData.name}" успешно обновлен!`);
        } else {
            await window.db.collection('challenges').add(challengeData);
            alert(`Челлендж "${challengeData.name}" успешно сохранен!`);
        }

        // Очищаем форму и сбрасываем состояние редактирования
        challengeNameInput.value = '';
        challengeDescriptionInput.value = ''; 
        challengeRulesInput.value = ''; // Очищаем поле правил
        positiveEffectsInput.value = '';
        negativeEffectsInput.value = '';
        editingChallengeId = null; 
        createChallengeBtn.textContent = 'Создать и сохранить'; 

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
            challengesListContainer.innerHTML = '<p>Пока нет созданных челленджей.</p>';
            return;
        }

        challenges.forEach((challenge) => {
            const challengeDiv = document.createElement('div');
            challengeDiv.classList.add('challenge-item');
            challengeDiv.innerHTML = `
                <h3>${challenge.name}</h3>
                <p><strong>Положительных эффектов:</strong> ${challenge.positiveEffects ? challenge.positiveEffects.length : 0}</p>
                <p><strong>Отрицательных эффектов:</strong> ${challenge.negativeEffects ? challenge.negativeEffects.length : 0}</p>
                <button class="edit-btn" data-id="${challenge.id}">Редактировать</button>
                <button class="delete-btn" data-id="${challenge.id}">Удалить</button>
            `;
            challengesListContainer.appendChild(challengeDiv);
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const challengeId = event.target.dataset.id;
                editChallenge(challengeId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const challengeId = event.target.dataset.id;
                deleteChallenge(challengeId);
            });
        });

    } catch (error) {
        console.error("Ошибка при загрузке челленджей: ", error);
        challengesListContainer.innerHTML = '<p>Не удалось загрузить челленджи.</p>';
    }
}

// Функция для загрузки данных челленджа в форму для редактирования
async function editChallenge(id) {
    try {
        const doc = await window.db.collection('challenges').doc(id).get();
        if (doc.exists) {
            const challenge = doc.data();
            challengeNameInput.value = challenge.name;
            challengeDescriptionInput.value = challenge.description || ''; 
            challengeRulesInput.value = challenge.rules ? challenge.rules.join('\n') : ''; // Загружаем правила
            positiveEffectsInput.value = challenge.positiveEffects ? challenge.positiveEffects.join('\n') : '';
            negativeEffectsInput.value = challenge.negativeEffects ? challenge.negativeEffects.join('\n') : '';

            editingChallengeId = id; 
            createChallengeBtn.textContent = 'Сохранить изменения'; 
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            alert('Челлендж не найден для редактирования.');
        }
    } catch (error) {
        console.error("Ошибка при загрузке челленджа для редактирования: ", error);
        alert("Ошибка при загрузке челленджа для редактирования.");
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
        description: description,
        rules: rules, // Добавляем правила в данные
        positiveEffects: positive,
        negativeEffects: negative
    };

    saveOrUpdateChallenge(challengeData); 
});
