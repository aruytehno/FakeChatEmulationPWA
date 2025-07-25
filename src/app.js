// Эмуляция загрузки диалога
fetch('../data/dialogue.json')
  .then(res => res.json())
  .then(schedule => {
    const msgContainer = document.getElementById('messages');
    schedule.forEach(item => {
      setTimeout(() => renderMessage(item), item.timeOffsetSec * 1000);
    });
  });

function renderMessage({ sender, content, type }) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.classList.add(sender === currentUser.name ? 'outgoing' : 'incoming');
  div.textContent = content;
  document.getElementById('messages').append(div);
  scrollToBottom();
}

function scrollToBottom() {
  const msgs = document.getElementById('messages');
  msgs.scrollTop = msgs.scrollHeight;
}

// Настройки текущего пользователя (можно взять из админ-панели)
const currentUser = { name: 'You' };