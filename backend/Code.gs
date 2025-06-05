/**
 * スプレッドシートを使った投稿掲示板アプリ - バックエンドコード
 * 学習用コメント付き
 */

// シートの設定値（定数）
// シート名と列ヘッダーを定義
const SHEET_NAME = "Messages";  // スプレッドシートのシート名
const HEADERS = ["id", "username", "message", "timestamp"];  // 列ヘッダー名

/**
 * GETリクエストを処理する関数
 * すべてのメッセージをJSON形式で返す
 * 
 * @param {Object} e - リクエストパラメーターオブジェクト
 * @return {TextOutput} JSON形式のレスポンス
 */
function doGet(e) {
  // OPTIONSリクエスト（プリフライトリクエスト）の場合は空のレスポンスを返す
  // これはCORS対応のための処理
  if (e.method === 'OPTIONS') return ContentService.createTextOutput('');
  
  // すべてのメッセージを取得
  const result = getAllMessages();
  
  // JSON形式でレスポンスを返す
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POSTリクエストを処理する関数
 * 新しいメッセージを追加する
 * 
 * @param {Object} e - リクエストパラメーターオブジェクト
 * @return {TextOutput} JSON形式のレスポンス
 */
function doPost(e) {
  // OPTIONSリクエスト（プリフライトリクエスト）の場合は空のレスポンスを返す
  if (e.method === 'OPTIONS') return ContentService.createTextOutput('');
  
  // フォームから送信されたパラメーターを取得
  // application/x-www-form-urlencoded形式で送信されたデータはe.parameterから取得できる
  const username = e.parameter.username;
  const message = e.parameter.message;
  
  let result;
  // 必須パラメーターのチェック
  if (!username || !message) {
    result = { status: "error", message: "名前とメッセージは必須です" };
  } else {
    // メッセージを追加
    result = addMessage(username, message);
  }
  
  // JSON形式でレスポンスを返す
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * すべてのメッセージを取得する関数
 * 
 * @return {Object} ステータスとメッセージ一覧を含むオブジェクト
 */
function getAllMessages() {
  try {
    // メッセージシートを取得
    const sheet = getMessagesSheet();
    
    // データがない場合（ヘッダー行のみの場合）は空配列を返す
    if (sheet.getLastRow() <= 1) {
      return { status: "success", messages: [] };
    }
    
    // データ範囲を取得（2行目から最終行まで、すべての列）
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length);
    const values = dataRange.getValues();  // 2次元配列でデータを取得
    
    // 各行をオブジェクトに変換
    const messages = values.map(row => {
      const message = {};
      // ヘッダー名をキーとして値を設定
      HEADERS.forEach((header, index) => message[header] = row[index]);
      return message;
    });
    
    return { status: "success", messages: messages };
  } catch (error) {
    // エラー発生時の処理
    return { status: "error", message: error.toString() };
  }
}

/**
 * 新しいメッセージを追加する関数
 * 
 * @param {string} username - ユーザー名
 * @param {string} message - メッセージ内容
 * @return {Object} 処理結果を含むオブジェクト
 */
function addMessage(username, message) {
  try {
    const sheet = getMessagesSheet();
    
    // 新しいIDを生成（最終行のID + 1）
    let newId = 1;
    if (sheet.getLastRow() > 1) {
      newId = sheet.getRange(sheet.getLastRow(), 1).getValue() + 1;
    }
    
    // 現在の日時をISO形式で取得
    const timestamp = new Date().toISOString();
    
    // シートに新しい行を追加
    sheet.appendRow([newId, username, message, timestamp]);
    
    // 成功レスポンスを返す
    return {
      status: "success",
      message: { id: newId, username, message, timestamp }
    };
  } catch (error) {
    // エラー発生時の処理
    return { status: "error", message: error.toString() };
  }
}

/**
 * メッセージシートを取得または作成する関数
 * 
 * @return {Sheet} スプレッドシートのシートオブジェクト
 */
function getMessagesSheet() {
  // 現在のスプレッドシートを取得
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  // シートが存在しない場合は新規作成
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    // ヘッダー行を設定
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    // ヘッダー行を固定
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

