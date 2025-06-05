// シート設定
const SHEET_NAME = "Messages";
const HEADERS = ["id", "username", "message", "timestamp"];

// GETリクエスト処理
function doGet(e) {
  if (e.method === 'OPTIONS') return ContentService.createTextOutput('');
  
  const result = getAllMessages();
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// POSTリクエスト処理
function doPost(e) {
  if (e.method === 'OPTIONS') return ContentService.createTextOutput('');
  
  const username = e.parameter.username;
  const message = e.parameter.message;
  
  let result;
  if (!username || !message) {
    result = { status: "error", message: "名前とメッセージは必須です" };
  } else {
    result = addMessage(username, message);
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// 全メッセージ取得
function getAllMessages() {
  try {
    const sheet = getMessagesSheet();
    
    if (sheet.getLastRow() <= 1) {
      return { status: "success", messages: [] };
    }
    
    const dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length);
    const values = dataRange.getValues();
    
    const messages = values.map(row => {
      const message = {};
      HEADERS.forEach((header, index) => message[header] = row[index]);
      return message;
    });
    
    return { status: "success", messages: messages };
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
}

// メッセージ追加
function addMessage(username, message) {
  try {
    const sheet = getMessagesSheet();
    
    // 新ID生成
    let newId = 1;
    if (sheet.getLastRow() > 1) {
      newId = sheet.getRange(sheet.getLastRow(), 1).getValue() + 1;
    }
    
    const timestamp = new Date().toISOString();
    sheet.appendRow([newId, username, message, timestamp]);
    
    return {
      status: "success",
      message: { id: newId, username, message, timestamp }
    };
  } catch (error) {
    return { status: "error", message: error.toString() };
  }
}

// シート取得/作成
function getMessagesSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

