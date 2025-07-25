let longPressTimer;
document.getElementById('header-left').addEventListener('mousedown', startPress);
document.getElementById('header-left').addEventListener('touchstart', startPress);
document.addEventListener('mouseup', cancelPress);
document.addEventListener('touchend', cancelPress);

function startPress(e) {
  longPressTimer = setTimeout(() => {
    document.getElementById('admin-panel').classList.remove('hidden');
    populateAdmin();
  }, 3000);
}
function cancelPress() { clearTimeout(longPressTimer); }

function populateAdmin() {
  // Участники
  const partCont = document.getElementById('participants');
  partCont.innerHTML = '';
  [currentUser.name].forEach(name => {
    const div = document.createElement('div');
    div.textContent = name;
    partCont.append(div);
    const onlineToggle = document.createElement('input');
    onlineToggle.type = 'checkbox';
    onlineToggle.checked = true;
    div.append(onlineToggle);
  });
  // Список отправителей
  const sel = document.getElementById('msg-sender');
  sel.innerHTML = '';
  [currentUser.name].forEach(name => {
    const o = document.createElement('option'); o.value = name; o.text = name;
    sel.append(o);
  });
}

document.getElementById('send-msg').onclick = () => {
  const sender = document.getElementById('msg-sender').value;
  const text = document.getElementById('msg-text').value;
  renderMessage({ sender, content: text });
};