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

// Инициализация приложения
function initApp() {
    loadData();
    setupEventListeners();
    renderChat();
    startDialogue();
}

// Загрузка данных
function loadData() {
    const savedData = localStorage.getItem(CONFIG.storageKey);
    if (savedData) {
        const { messages } = JSON.parse(savedData);
        state.messages = messages;
    } else {
        fetch('../data/dialogue.json')
            .then(res => res.json())
            .then(schedule => {
                state.messages = schedule;
                saveData();
            });
    }
}

// Сохранение данных
function saveData() {
    localStorage.setItem(
        CONFIG.storageKey,
        JSON.stringify({ messages: state.messages })
    );
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
}

// Работа с сообщениями
function sendMessage() {
    const sender = document.getElementById('msg-sender').value;
    const text = document.getElementById('msg-text').value;

    if (!text.trim()) return;

    const newMessage = {
        sender,
        type: 'text',
        content: text,
        timestamp: Date.now()
    };

    state.messages.push(newMessage);
    renderMessage(newMessage);
    saveData();
    document.getElementById('msg-text').value = '';
}

function renderMessage(message) {
    const messagesContainer = document.getElementById('messages');
    const msgElement = document.createElement('div');

    msgElement.classList.add('message');
    msgElement.classList.add(message.sender === CONFIG.currentUser.name ? 'outgoing' : 'incoming');
    msgElement.textContent = message.content;

    messagesContainer.appendChild(msgElement);
    scrollToBottom();
}

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

// Работа с участниками
function addParticipant() {
    const name = prompt('Имя участника (макс. 4 символа):', 'User');
    if (name && name.length <= 4) {
        CONFIG.participants.push(name);
        populateAdminPanel();
    }
}

// Админ-панель
let longPressTimer = null;

function startLongPress() {
    longPressTimer = setTimeout(() => {
        state.isAdminPanelOpen = true;
        document.getElementById('admin-panel').classList.remove('hidden');
        populateAdminPanel();
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
        participantDiv.textContent = name;
        participantsContainer.appendChild(participantDiv);

        // Для выбора отправителя
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        senderSelect.appendChild(option);
    });

    // Установка текущего пользователя по умолчанию
    senderSelect.value = CONFIG.currentUser.name;
}

// Вспомогательные функции
function showTypingIndicator(user) {
    state.typingUser = user;
    const indicator = document.getElementById('typing-indicator');
    indicator.classList.remove('hidden');
    document.getElementById('typing-user').textContent = user;
}

function hideTypingIndicator() {
    state.typingUser = null;
    document.getElementById('typing-indicator').classList.add('hidden');
}

function scrollToBottom() {
    const messages = document.getElementById('messages');
    messages.scrollTop = messages.scrollHeight;
}

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', initApp);