/**
 * スプレッドシート掲示板アプリ - バックエンドコード
 * Google Apps Script (GAS) を使用したRESTful APIの実装
 *
 * このスクリプトは、Googleスプレッドシートをデータベースとして使用し、
 * メッセージの表示と投稿ができるシンプルな掲示板アプリを実装します。
 * フロントエンドからのAPIリクエストを処理し、JSON形式でデータを返します。
 */

// グローバル変数
/**
 * メッセージを保存するシートの名前
 * @const {string}
 */
const SHEET_NAME = "Messages";

/**
 * スプレッドシートのヘッダー列
 * @const {Array<string>}
 * - id: メッセージの一意識別子
 * - username: 投稿者の名前
 * - message: 投稿内容
 * - timestamp: 投稿日時
 */
const HEADERS = ["id", "username", "message", "timestamp"];

/**
 * doGet - GETリクエストを処理する関数
 * すべてのメッセージを取得して返す
 * 
 * Google Apps Scriptのウェブアプリでは、HTTPのGETリクエストを受け取ると
 * 自動的にこの関数が実行されます。フロントエンドからのデータ取得リクエストを
 * 処理するためのエントリーポイントです。
 * 
 * @param {Object} e - リクエストパラメータ（クエリパラメータを含むオブジェクト）
 * @return {Object} JSONレスポンス（メッセージの配列を含む）
 */
function doGet(e) {
  // getAllMessages関数を呼び出してすべてのメッセージを取得し、
  // handleResponse関数でJSON形式に整形して返す
  return handleResponse(getAllMessages());
}

/**
 * doPost - POSTリクエストを処理する関数
 * 新しいメッセージを追加する
 * 
 * Google Apps Scriptのウェブアプリでは、HTTPのPOSTリクエストを受け取ると
 * 自動的にこの関数が実行されます。フロントエンドからの新規メッセージ投稿を
 * 処理するためのエントリーポイントです。
 * 
 * @param {Object} e - リクエストパラメータ（postData.contentsにJSON形式でusernameとmessageを含む）
 * @return {Object} JSONレスポンス（成功時は追加したメッセージ、失敗時はエラーメッセージを含む）
 */
function doPost(e) {
  // リクエストボディからJSONデータをパース
  // e.postData.contentsにはクライアントから送信されたJSON文字列が含まれている
  const params = JSON.parse(e.postData.contents);
  
  // 必須パラメータ（ユーザー名とメッセージ）が存在するかチェック
  // いずれかが空の場合はエラーを返す
  if (!params.username || !params.message) {
    return handleResponse({
      status: "error",
      message: "ユーザー名とメッセージは必須です"
    });
  }
  
  // addMessage関数を呼び出して新しいメッセージをスプレッドシートに追加
  const result = addMessage(params.username, params.message);
  
  // 結果をJSON形式でクライアントに返す
  return handleResponse(result);
}

/**
 * getAllMessages - すべてのメッセージを取得する関数
 * 
 * スプレッドシートからすべてのメッセージデータを取得し、
 * 整形したオブジェクトの配列として返します。
 * エラーが発生した場合は、エラーメッセージを含むオブジェクトを返します。
 * 
 * @return {Object} メッセージの配列を含むオブジェクト、またはエラーオブジェクト
 */
function getAllMessages() {
  try {
    // getMessagesSheet関数を呼び出してメッセージシートを取得
    const sheet = getMessagesSheet();
    
    // データ範囲を取得（ヘッダー行（1行目）を除く、全データを取得）
    // sheet.getLastRow() - 1: ヘッダー行を除いた行数
    // HEADERS.length: 列数（id, username, message, timestampの4列）
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length);
    const values = dataRange.getValues(); // 2次元配列でデータを取得
    
    // 取得した値をメッセージオブジェクトの配列に変換
    // map関数で各行を処理し、ヘッダー名をキーとしたオブジェクトを作成
    const messages = values.map(row => {
      const message = {};
      // 各ヘッダーと値をオブジェクトに設定
      HEADERS.forEach((header, index) => {
        message[header] = row[index];
      });
      return message;
    });
    
    // 成功時はメッセージ配列を含むオブジェクトを返す
    return {
      status: "success",
      messages: messages
    };
  } catch (error) {
    // エラー発生時はエラーメッセージを含むオブジェクトを返す
    return {
      status: "error",
      message: error.toString()
    };
  }
}

/**
 * addMessage - 新しいメッセージを追加する関数
 * 
 * ユーザー名とメッセージ内容を受け取り、新しいメッセージを
 * スプレッドシートに追加します。自動的にIDとタイムスタンプを
 * 生成し、追加したメッセージの情報を返します。
 * 
 * @param {string} username - ユーザー名
 * @param {string} message - メッセージ内容
 * @return {Object} 追加したメッセージを含むオブジェクト、またはエラーオブジェクト
 */
function addMessage(username, message) {
  try {
    // getMessagesSheet関数を呼び出してメッセージシートを取得
    const sheet = getMessagesSheet();
    
    // 新しいメッセージのIDを生成
    // データがない場合（ヘッダー行のみの場合）はID=1から開始
    // データがある場合は最後の行のIDに1を足した値を使用
    let newId = 1;
    if (sheet.getLastRow() > 1) {
      newId = sheet.getRange(sheet.getLastRow(), 1).getValue() + 1;
    }
    
    // 現在の日時をISO形式の文字列で取得
    // 例: "2025-06-05T10:30:15.123Z"
    const timestamp = new Date().toISOString();
    
    // スプレッドシートに新しい行を追加
    // appendRowメソッドで配列の値を順番に追加
    sheet.appendRow([newId, username, message, timestamp]);
    
    // 成功時は追加したメッセージ情報を含むオブジェクトを返す
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
    // エラー発生時はエラーメッセージを含むオブジェクトを返す
    return {
      status: "error",
      message: error.toString()
    };
  }
}

/**
 * getMessagesSheet - メッセージシートを取得する関数
 * 
 * メッセージを保存するシートを取得します。
 * シートが存在しない場合は、新しく作成してヘッダー行を設定します。
 * この関数は、初回実行時に必要なシートの初期化も行います。
 * 
 * @return {Sheet} スプレッドシートのシートオブジェクト
 */
function getMessagesSheet() {
  // 現在アクティブなスプレッドシートを取得
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // 指定した名前のシートを取得する
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  // シートが存在しない場合は新規作成と初期化を行う
  if (!sheet) {
    // 新しいシートを作成
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    
    // ヘッダー行を設定（最初の行にid, username, message, timestampを設定）
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    
    // ヘッダー行を固定してスクロールしても表示されるようにする
    sheet.setFrozenRows(1);
  }
  
  // 取得または作成したシートを返す
  return sheet;
}

/**
 * handleResponse - レスポンスをJSONとして整形する関数
 * 
 * 関数から返されたデータオブジェクトをJSON形式のレスポンスに変換します。
 * これにより、フロントエンドからのリクエストに対して標準的なJSONレスポンスを
 * 返すことができます。
 * 
 * @param {Object} data - JSON形式に変換するレスポンスデータ
 * @return {TextOutput} ContentServiceのJSONレスポンスオブジェクト
 */
function handleResponse(data) {
  // オブジェクトをJSON文字列に変換
  // JSON.stringifyでJavaScriptオブジェクトをJSON形式の文字列に変換
  const jsonString = JSON.stringify(data);
  
  // ContentServiceを使用してレスポンスを作成
  // createTextOutput: 指定した文字列を出力するTextOutputオブジェクトを作成
  // setMimeType: レスポンスのMIMEタイプをJSONに設定（ブラウザが正しく解釈できるように）
  const output = ContentService.createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
  
  // 作成したTextOutputオブジェクトを返す
  // これがGASウェブアプリのレスポンスとなる
  return output;
}
