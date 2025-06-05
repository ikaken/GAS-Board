// API URL
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbypE_l1bEF7uQAXucGRR1Ku3Puz_bgZOv6O9kdsPQEZ5wnyXGPDeRTrRMlfXtdnSvnJGA/exec';

document.addEventListener('DOMContentLoaded', () => {
  const messageForm = document.getElementById('message-form');
  const messageList = document.getElementById('message-list');
  const loadingElement = document.getElementById('loading');
  
  // 初期読み込み
  loadMessages();
  
  // フォーム送信
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    postMessage();
  });
  
  // メッセージ読み込み
  async function loadMessages() {
    try {
      loadingElement.style.display = 'block';
      const response = await fetch(GAS_API_URL);
      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || '読み込み失敗');
      }
      
      displayMessages(data.messages);
    } catch (error) {
      console.error(error);
      messageList.innerHTML = `<div class="error">エラー: ${error.message}</div>`;
    } finally {
      loadingElement.style.display = 'none';
    }
  }
  
  // 投稿処理
  async function postMessage() {
    const username = document.getElementById('username').value.trim();
    const message = document.getElementById('message').value.trim();
    
    if (!username || !message) {
      alert('名前とメッセージを入力してください');
      return;
    }
    
    const submitButton = messageForm.querySelector('button');
    submitButton.disabled = true;
    submitButton.textContent = '送信中';
    
    try {
      // CORS回避のためapplication/x-www-form-urlencodedを使用
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('message', message);
      
      const response = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: params
      });
      
      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || '投稿失敗');
      }
      
      messageForm.reset();
      loadMessages();
    } catch (error) {
      console.error(error);
      alert(`エラー: ${error.message}`);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = '投稿';
    }
  }
  
  // メッセージ表示
  function displayMessages(messages) {
    if (!messages || messages.length === 0) {
      messageList.innerHTML = '<div>投稿がありません</div>';
      return;
    }
    
    // 新しい順にソート
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp));
    
    // HTML生成
    messageList.innerHTML = sortedMessages.map(msg => `
      <div class="message-item">
        <div class="message-header">
          <span class="username">${escapeHtml(msg.username)}</span>
          <span class="timestamp">${formatDate(msg.timestamp)}</span>
        </div>
        <div>${escapeHtml(msg.message)}</div>
      </div>
    `).join('');
  }
  
  // 日付フォーマット
  function formatDate(dateString) {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }
  
  // HTMLエスケープ
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
