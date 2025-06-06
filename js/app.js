/**
 * スプレッドシート掲示板アプリ - フロントエンドJavaScript
 * 学習用コメント付き
 */

// Google Apps Script WebアプリのURL
// このURLにGET/POSTリクエストを送信してメッセージの取得・投稿を行う
// 下記のURLをバックエンドセットアップでコピーしたウェブアプリのURLに変更してください
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbypE_l1bEF7uQAXucGRR1Ku3Puz_bgZOv6O9kdsPQEZ5wnyXGPDeRTrRMlfXtdnSvnJGA/exec';

// DOMの読み込みが完了したら実行
document.addEventListener('DOMContentLoaded', () => {
  // 必要なDOM要素を取得
  const messageForm = document.getElementById('message-form');  // 投稿フォーム
  const messageList = document.getElementById('message-list');  // メッセージ一覧表示エリア
  const loadingElement = document.getElementById('loading');    // ローディング表示
  
  // ページ読み込み時にメッセージ一覧を取得
  loadMessages();
  
  // フォーム送信イベントの設定
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();  // デフォルトの送信動作をキャンセル
    postMessage();       // 投稿処理関数を呼び出し
  });
  
  /**
   * メッセージ一覧を取得して表示する関数
   * Google Apps ScriptのWebアプリにGETリクエストを送信
   */
  async function loadMessages() {
    try {
      // ローディング表示を開始
      loadingElement.style.display = 'block';
      
      // GAS WebアプリにGETリクエストを送信
      const response = await fetch(GAS_API_URL);
      const data = await response.json();  // レスポンスをJSON形式で解析
      
      // エラーチェック
      if (data.status !== 'success') {
        throw new Error(data.message || '読み込み失敗');
      }
      
      // メッセージ一覧を表示
      displayMessages(data.messages);
    } catch (error) {
      // エラー処理
      console.error(error);
      messageList.innerHTML = `<div class="error">エラー: ${error.message}</div>`;
    } finally {
      // ローディング表示を終了
      loadingElement.style.display = 'none';
    }
  }
  
  /**
   * 新規メッセージを投稿する関数
   * Google Apps ScriptのWebアプリにPOSTリクエストを送信
   */
  async function postMessage() {
    // フォームの入力値を取得（前後の空白を削除）
    const username = document.getElementById('username').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // 入力値のバリデーション
    if (!username || !message) {
      alert('名前とメッセージを入力してください');
      return;
    }
    
    // 送信ボタンを無効化して送信中の表示に変更
    const submitButton = messageForm.querySelector('button');
    submitButton.disabled = true;
    submitButton.textContent = '送信中';
    
    try {
      // CORS問題を回避するためapplication/x-www-form-urlencoded形式でデータを送信
      // GASではJSONデータを直接受け取るとCORSエラーが発生するため
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('message', message);
      
      // GAS WebアプリにPOSTリクエストを送信
      const response = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: params
      });
      
      // レスポンスをJSON形式で解析
      const data = await response.json();
      
      // エラーチェック
      if (data.status !== 'success') {
        throw new Error(data.message || '投稿失敗');
      }
      
      // 投稿成功時の処理
      messageForm.reset();  // フォームをリセット
      loadMessages();       // メッセージ一覧を再読み込み
    } catch (error) {
      // エラー処理
      console.error(error);
      alert(`エラー: ${error.message}`);
    } finally {
      // 送信ボタンを元に戻す
      submitButton.disabled = false;
      submitButton.textContent = '投稿';
    }
  }
  
  /**
   * メッセージ一覧を表示する関数
   * @param {Array} messages - メッセージオブジェクトの配列
   */
  function displayMessages(messages) {
    // メッセージがない場合
    if (!messages || messages.length === 0) {
      messageList.innerHTML = '<div>投稿がありません</div>';
      return;
    }
    
    // メッセージを新しい順（タイムスタンプの降順）にソート
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp));
    
    // メッセージごとにHTMLを生成して表示
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
  
  /**
   * 日付を読みやすい形式にフォーマットする関数
   * @param {string} dateString - ISO形式の日付文字列
   * @return {string} フォーマットされた日付文字列
   */
  function formatDate(dateString) {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }
  
  /**
   * HTMLインジェクション（XSS）対策のためのエスケープ処理を行う関数
   * @param {string} text - エスケープする文字列
   * @return {string} エスケープされた文字列
   */
  function escapeHtml(text) {
    const div = document.createElement('div');  // 一時的なDOM要素を作成
    div.textContent = text;                    // textContentにセットすることでエスケープ
    return div.innerHTML;                      // エスケープされたHTMLを取得
  }
});
