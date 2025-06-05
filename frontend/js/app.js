/**
 * スプレッドシート掲示板アプリ - フロントエンドコード
 * 学習用にシンプルに実装したJavaScriptファイル
 */

// ======================================================
// 1. 初期設定
// ======================================================

// Google Apps Script WebアプリのURL
// 注意: デプロイ後に、このURLを自分のウェブアプリのURLに変更する必要があります
const GAS_API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

// ページの読み込みが完了したら実行される処理
document.addEventListener('DOMContentLoaded', () => {
    // HTML要素の取得
    const messageForm = document.getElementById('message-form');      // 投稿フォーム
    const messageList = document.getElementById('message-list');      // メッセージ一覧を表示する場所
    const loadingElement = document.getElementById('loading');        // 「読み込み中」の表示
    
    // ページ読み込み時にメッセージ一覧を取得して表示
    loadMessages();
    
    // フォームが送信されたときの処理を設定
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();  // フォームのデフォルト送信動作をキャンセル
        postMessage();       // 自作の投稿処理関数を呼び出す
    });
    
    // ======================================================
    // 2. メッセージ一覧を取得する関数
    // ======================================================
    
    /**
     * サーバーからメッセージ一覧を取得して画面に表示する関数
     */
    async function loadMessages() {
        try {
            // 読み込み中の表示を表示
            loadingElement.style.display = 'block';
            
            // Google Apps ScriptのAPIからデータを取得（GETリクエスト）
            // fetchはPromiseを返すので、awaitで結果を待つ
            const response = await fetch(GAS_API_URL);
            const data = await response.json();  // JSONとしてパース
            
            // サーバーからエラーが返された場合
            if (data.status !== 'success') {
                throw new Error(data.message || 'メッセージの取得に失敗しました');
            }
            
            // 取得したメッセージを画面に表示
            displayMessages(data.messages);
            
        } catch (error) {
            // エラーが発生した場合の処理
            console.error('エラー:', error);  // コンソールにエラーを表示
            messageList.innerHTML = `<div class="error">エラーが発生しました: ${error.message}</div>`;
        } finally {
            // 成功しても失敗しても最後に読み込み中の表示を非表示にする
            loadingElement.style.display = 'none';
        }
    }
    
    // ======================================================
    // 3. 新しいメッセージを投稿する関数
    // ======================================================
    
    /**
     * フォームの内容をサーバーに送信する関数
     */
    async function postMessage() {
        try {
            // フォームからユーザー名とメッセージを取得（前後の空白を削除）
            const username = document.getElementById('username').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // 入力値のチェック
            if (!username || !message) {
                alert('ユーザー名とメッセージを入力してください');
                return;  // 処理を中断
            }
            
            // 送信ボタンを「送信中...」に変更して、クリックできないようにする
            const submitButton = messageForm.querySelector('button[type="submit"]');
            submitButton.textContent = '送信中...';
            submitButton.disabled = true;
            
            // Google Apps ScriptのAPIにデータを送信（POSTリクエスト）
            const response = await fetch(GAS_API_URL, {
                method: 'POST',  // POSTメソッドを指定
                headers: {
                    'Content-Type': 'application/json',  // JSONデータを送ることを指定
                },
                body: JSON.stringify({ username, message })  // オブジェクトをJSON文字列に変換
            });
            
            // レスポンスをJSONとしてパース
            const data = await response.json();
            
            // サーバーからエラーが返された場合
            if (data.status !== 'success') {
                throw new Error(data.message || '投稿に失敗しました');
            }
            
            // 投稿成功時の処理
            messageForm.reset();  // フォームの内容をクリア
            loadMessages();       // メッセージ一覧を再読み込み
            
        } catch (error) {
            // エラーが発生した場合の処理
            console.error('エラー:', error);
            alert(`エラーが発生しました: ${error.message}`);
        } finally {
            // 成功しても失敗しても最後にボタンを元に戻す
            const submitButton = messageForm.querySelector('button[type="submit"]');
            submitButton.textContent = '投稿する';
            submitButton.disabled = false;
        }
    }
    
    // ======================================================
    // 4. メッセージ一覧を表示する関数
    // ======================================================
    
    /**
     * 取得したメッセージを画面に表示する関数
     * @param {Array} messages - サーバーから取得したメッセージの配列
     */
    function displayMessages(messages) {
        // メッセージがない場合の処理
        if (!messages || messages.length === 0) {
            messageList.innerHTML = '<div class="no-messages">まだ投稿がありません</div>';
            return;
        }
        
        /**
         * 日時を見やすい形式にフォーマットする関数
         * @param {string} dateString - ISOフォーマットの日時文字列
         * @return {string} フォーマットされた日時
         */
        function formatDate(dateString) {
            const date = new Date(dateString);  // 文字列から日時オブジェクトを作成
            // 日本語形式でフォーマット（例: 2025/06/05 18:30）
            return date.toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        // メッセージを新しい順（タイムスタンプの降順）にソート
        const sortedMessages = [...messages].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // メッセージごとにHTMLを生成し、連結する
        const html = sortedMessages.map(msg => `
            <div class="message-item" data-id="${msg.id}">
                <div class="message-header">
                    <span class="username">${escapeHtml(msg.username)}</span>
                    <span class="timestamp">${formatDate(msg.timestamp)}</span>
                </div>
                <div class="message-content">${escapeHtml(msg.message)}</div>
            </div>
        `).join('');
        
        // 生成したHTMLをページに挿入
        messageList.innerHTML = html;
    }
    
    // ======================================================
    // 5. ユーティリティ関数
    // ======================================================
    
    /**
     * HTMLの特殊文字をエスケープする関数（XSS対策）
     * @param {string} text - エスケープする文字列
     * @return {string} エスケープされた文字列
     */
    function escapeHtml(text) {
        // DOMのテキストノードを利用して安全にエスケープする
        const div = document.createElement('div');
        div.textContent = text;  // textContentを使うと自動的にエスケープされる
        return div.innerHTML;    // エスケープされた内容を取得
    }
});
