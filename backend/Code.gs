/**
 * スプレッドシート掲示板アプリ - バックエンドコード
 * Google Apps Script (GAS) を使用したRESTful APIの実装
 */

// グローバル変数
const SHEET_NAME = "Messages";
const HEADERS = ["id", "username", "message", "timestamp"];

/**
 * doGet - GETリクエストを処理する関数
 * すべてのメッセージを取得して返す
 * 
 * @param {Object} e - リクエストパラメータ
 * @return {Object} JSONレスポンス
 */
function doGet(e) {
  return handleResponse(getAllMessages());
}

/**
 * doPost - POSTリクエストを処理する関数
 * 新しいメッセージを追加する
 * 
 * @param {Object} e - リクエストパラメータ（username, messageを含む）
 * @return {Object} JSONレスポンス
 */
function doPost(e) {
  // リクエストパラメータの取得
  const params = JSON.parse(e.postData.contents);
  
  // 必須パラメータのチェック
  if (!params.username || !params.message) {
    return handleResponse({
      status: "error",
      message: "ユーザー名とメッセージは必須です"
    });
  }
  
  // 新しいメッセージを追加
  const result = addMessage(params.username, params.message);
  return handleResponse(result);
}

/**
 * getAllMessages - すべてのメッセージを取得する関数
 * 
 * @return {Object} メッセージの配列を含むオブジェクト
 */
function getAllMessages() {
  try {
    // スプレッドシートを取得
    const sheet = getMessagesSheet();
    
    // データ範囲を取得（ヘッダー行を除く）
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length);
    const values = dataRange.getValues();
    
    // メッセージの配列を作成
    const messages = values.map(row => {
      const message = {};
      HEADERS.forEach((header, index) => {
        message[header] = row[index];
      });
      return message;
    });
    
    return {
      status: "success",
      messages: messages
    };
  } catch (error) {
    return {
      status: "error",
      message: error.toString()
    };
  }
}

/**
 * addMessage - 新しいメッセージを追加する関数
 * 
 * @param {string} username - ユーザー名
 * @param {string} message - メッセージ内容
 * @return {Object} 追加したメッセージを含むオブジェクト
 */
function addMessage(username, message) {
  try {
    // スプレッドシートを取得
    const sheet = getMessagesSheet();
    
    // 新しいIDを生成（最後の行のID + 1）
    let newId = 1;
    if (sheet.getLastRow() > 1) {
      newId = sheet.getRange(sheet.getLastRow(), 1).getValue() + 1;
    }
    
    // タイムスタンプを生成
    const timestamp = new Date().toISOString();
    
    // 新しい行を追加
    sheet.appendRow([newId, username, message, timestamp]);
    
    return {
      status: "success",
      message: {
        id: newId,
        username: username,
        message: message,
        timestamp: timestamp
      }
    };
  } catch (error) {
    return {
      status: "error",
      message: error.toString()
    };
  }
}

/**
 * getMessagesSheet - メッセージシートを取得する関数
 * 
 * @return {Object} スプレッドシートのシートオブジェクト
 */
function getMessagesSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  // シートが存在しない場合は作成
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    // ヘッダー行を設定
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * handleResponse - レスポンスをJSONとして整形する関数
 * 
 * @param {Object} data - レスポンスデータ
 * @return {Object} ContentServiceのJSONレスポンス
 */
function handleResponse(data) {
  // CORSヘッダーを設定
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
