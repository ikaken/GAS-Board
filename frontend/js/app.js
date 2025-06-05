/**
 * スプレッドシート掲示板アプリ - フロントエンドコード
 */

// Google Apps Script WebアプリのURL（デプロイ後に更新する必要があります）
const GAS_API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
    // 要素の取得
    const messageForm = document.getElementById('message-form');
    const messageList = document.getElementById('message-list');
    const loadingElement = document.getElementById('loading');
    
    // メッセージ一覧を読み込む
    loadMessages();
    
    // フォーム送信イベントのリスナー
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        postMessage();
    });
    
    /**
     * メッセージ一覧を取得して表示する関数
     */
    async function loadMessages() {
        try {
            loadingElement.style.display = 'block';
            
            // APIからデータを取得
            const response = await fetch(GAS_API_URL);
            const data = await response.json();
            
            // エラーチェック
            if (data.status !== 'success') {
                throw new Error(data.message || 'メッセージの取得に失敗しました');
            }
            
            // メッセージ一覧を表示
            displayMessages(data.messages);
            
        } catch (error) {
            console.error('エラー:', error);
            messageList.innerHTML = `<div class="error">エラーが発生しました: ${error.message}</div>`;
        } finally {
            loadingElement.style.display = 'none';
        }
    }
    
    /**
     * 新しいメッセージを投稿する関数
     */
    async function postMessage() {
        try {
            // フォームからデータを取得
            const username = document.getElementById('username').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // 入力チェック
            if (!username || !message) {
                alert('ユーザー名とメッセージを入力してください');
                return;
            }
            
            // 送信中の表示
            const submitButton = messageForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = '送信中...';
            submitButton.disabled = true;
            
            // APIにデータを送信
            const response = await fetch(GAS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, message })
            });
            
            const data = await response.json();
            
            // エラーチェック
            if (data.status !== 'success') {
                throw new Error(data.message || '投稿に失敗しました');
            }
            
            // フォームをリセット
            messageForm.reset();
            
            // メッセージ一覧を再読み込み
            loadMessages();
            
        } catch (error) {
            console.error('エラー:', error);
            alert(`エラーが発生しました: ${error.message}`);
        } finally {
            // ボタンを元に戻す
            const submitButton = messageForm.querySelector('button[type="submit"]');
            submitButton.textContent = '投稿する';
            submitButton.disabled = false;
        }
    }
    
    /**
     * メッセージ一覧を表示する関数
     * @param {Array} messages - メッセージの配列
     */
    function displayMessages(messages) {
        // メッセージがない場合
        if (!messages || messages.length === 0) {
            messageList.innerHTML = '<div class="no-messages">まだ投稿がありません</div>';
            return;
        }
        
        // 日時をフォーマットする関数
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // メッセージを新しい順にソート
        const sortedMessages = [...messages].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // HTMLを生成
        const html = sortedMessages.map(msg => `
            <div class="message-item" data-id="${msg.id}">
                <div class="message-header">
                    <span class="username">${escapeHtml(msg.username)}</span>
                    <span class="timestamp">${formatDate(msg.timestamp)}</span>
                </div>
                <div class="message-content">${escapeHtml(msg.message)}</div>
            </div>
        `).join('');
        
        // DOMに追加
        messageList.innerHTML = html;
    }
    
    /**
     * HTMLエスケープ関数
     * @param {string} text - エスケープする文字列
     * @return {string} エスケープされた文字列
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
