// Конфигурация приложения
const CONFIG = {
    currentUser: { name: 'You' },
    participants: ['Alice', 'Bob'],
    storageKey: 'chatEmulatorData'
};

// Состояние приложения
const state = {
    messages: [],
    typingUser: null,
    isAdminPanelOpen: false
};

// Закрытие админ-панели
function closeAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    adminPanel.classList.remove('visible');
    setTimeout(() => {
        adminPanel.classList.add('hidden');
        state.isAdminPanelOpen = false;
    }, 300);
}

// Загрузка данных
async function loadData() {
    try {
        const savedData = localStorage.getItem(CONFIG.storageKey);
        if (savedData) {
            const { messages } = JSON.parse(savedData);
            state.messages = messages;
            return;
        }

        const response = await fetch('data/dialogue.json');
        if (!response.ok) throw new Error('Network response was not ok');

        const schedule = await response.json();
        state.messages = schedule;
        saveData();
    } catch (err) {
        console.error('Error loading data:', err);
        state.messages = []; // Установка пустого массива по умолчанию
    }
}

// Сохранение данных
function saveData() {
    try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify({messages: state.messages}));
    } catch (e) {
        console.error('LocalStorage error:', e);
    }
}

// Отправка сообщения
function sendMessage() {
    const sender = document.getElementById('msg-sender').value;
    const text = document.getElementById('msg-text').value.trim();

    if (!text) return;

    const newMessage = {
        sender,
        type: 'text',
        content: text,
        timestamp: Date.now(),
        simulateTyping: true
    };

    // Показать индикатор набора
    showTypingIndicator(sender);

    setTimeout(() => {
        hideTypingIndicator();
        state.messages.push(newMessage);
        renderMessage(newMessage);
        saveData();
        document.getElementById('msg-text').value = '';
    }, 1500);
}

// Отрисовка сообщения
function renderMessage(message) {
    const messagesContainer = document.getElementById('messages');
    const msgElement = document.createElement('div');

    msgElement.classList.add('message');
    msgElement.classList.add(message.sender === CONFIG.currentUser.name ? 'outgoing' : 'incoming');
    msgElement.textContent = message.content;

    messagesContainer.appendChild(msgElement);
    scrollToBottom();
}

// Запуск диалога
function startDialogue() {
    state.messages.forEach(msg => {
        setTimeout(() => {
            if (msg.simulateTyping) {
                showTypingIndicator(msg.sender);
                setTimeout(() => {
                    hideTypingIndicator();
                    renderMessage(msg);
                }, 1500);
            } else {
                renderMessage(msg);
            }
        }, msg.timeOffsetSec * 1000);
    });
}

// Добавление участника
function addParticipant() {
    const name = prompt('Имя участника (макс. 4 символа):', 'User');
    if (name && name.length <= 4) {
        CONFIG.participants.push(name);
        populateAdminPanel();
        saveData();
    }
}

// Админ-панель
let longPressTimer = null;

function startLongPress() {
    longPressTimer = setTimeout(() => {
        state.isAdminPanelOpen = true;
        const adminPanel = document.getElementById('admin-panel');
        adminPanel.classList.remove('hidden');
        setTimeout(() => adminPanel.classList.add('visible'), 10);
        populateAdminPanel();
        if (navigator.vibrate) navigator.vibrate(100);
    }, 3000);
}

function cancelLongPress() {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}

function populateAdminPanel() {
    const participantsContainer = document.getElementById('participants');
    const senderSelect = document.getElementById('msg-sender');

    // Очистка контейнеров
    participantsContainer.innerHTML = '';
    senderSelect.innerHTML = '';

    // Заполнение участников
    CONFIG.participants.forEach(name => {
        // Для контейнера участников
        const participantDiv = document.createElement('div');
        participantDiv.classList.add('participant');
        participantDiv.innerHTML = `
            <span>${name}</span>
            <label class="switch">
                <input type="checkbox" ${name === CONFIG.currentUser.name ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        `;
        participantsContainer.appendChild(participantDiv);

        // Для выбора отправителя
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        senderSelect.appendChild(option);
    });

    senderSelect.value = CONFIG.currentUser.name;
}

// Индикатор набора текста
function showTypingIndicator(user) {
    state.typingUser = user;
    const indicator = document.getElementById('typing-indicator');
    indicator.classList.remove('hidden');
    document.getElementById('typing-user').textContent = user;
    setTimeout(() => indicator.classList.add('visible'), 10);
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    indicator.classList.remove('visible');
    setTimeout(() => {
        indicator.classList.add('hidden');
        state.typingUser = null;
    }, 300);
}

// Прокрутка вниз
function scrollToBottom() {
    const messages = document.getElementById('messages');
    messages.scrollTo({
        top: messages.scrollHeight,
        behavior: 'smooth'
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    const header = document.getElementById('chat-header');
    header.addEventListener('mousedown', startLongPress);
    header.addEventListener('touchstart', startLongPress);
    document.addEventListener('mouseup', cancelLongPress);
    document.addEventListener('touchend', cancelLongPress);

    document.getElementById('send-msg').addEventListener('click', sendMessage);
    document.getElementById('add-participant').addEventListener('click', addParticipant);
    document.getElementById('close-admin').addEventListener('click', closeAdminPanel);

    // Закрытие при клике на фон
    document.getElementById('admin-panel').addEventListener('click', (e) => {
        if (e.target === document.getElementById('admin-panel')) {
            closeAdminPanel();
        }
    });
}

// Инициализация приложения
async function initApp() {
    await loadData();
    setupEventListeners();
    startDialogue();
}

// Запуск приложения
window.addEventListener('DOMContentLoaded', initApp);