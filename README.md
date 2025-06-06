# スプレッドシート掲示板アプリ

**これは学習者向けのサンプルプロジェクトです**

このプロジェクトは、Google Apps Script (GAS) をバックエンドとして使用し、GitHub Pages でホストされるフロントエンドを持つ掲示板アプリケーションです。コードは詳細なコメント付きで、Web開発とGoogle Apps Scriptの学習に最適です。このプロジェクトを通じて、サーバーレスアプリケーションの開発手法と、無料ツールだけで実用的なウェブアプリを作成する方法を学ぶことができます。

## 概要

- **機能**: スプレッドシートに保存されたメッセージの表示・投稿
- **バックエンド**: Google Apps Script (GAS)
- **フロントエンド**: HTML/CSS/JavaScript
- **デプロイ**: GitHub Pages

## プロジェクト構成

```
GAS-Board/
├── index.html         # メインHTML（GitHubページ用にルートに配置）
├── css/               # スタイルシートディレクトリ
│   └── style.css      # メインCSS
├── js/                # JavaScriptディレクトリ
│   └── app.js         # メインアプリケーションロジック
└── backend/           # Google Apps Script (GAS) コード
    └── Code.gs        # GASのメインコード
```

## セットアップ手順

### 1. バックエンド（Google Apps Script）のセットアップ

1. [サンプルスプレッドシートを開く](https://docs.google.com/spreadsheets/d/1WkClO_kAYzIfrYjLIJb7HHSS344Go0hlTYUFcZ0fLpc/copy)
2. 「ファイル > コピーを作成」を選択して、自分のGoogleドライブにコピーを作成
3. コピーしたスプレッドシートを開き、「ツール > スクリプトエディタ」を選択
4. 「デプロイ > 新しいデプロイ」を選択
5. 「種類の選択」で「ウェブアプリ」を選択し、以下の設定を行う：
   - 説明：「掲示板アプリ」
   - ウェブアプリとして実行：「自分」
   - アクセスできるユーザー：「全員」
6. 「デプロイ」ボタンをクリック
7. 表示されるウェブアプリのURLをコピー（フロントエンド設定用）

### 2. フロントエンド（GitHub Pages）のセットアップ

1. GitHubリポジトリをフォーク：
   - リポジトリページにアクセス
   - 右上の「Fork」ボタンをクリック
   - 「Create fork」をクリック

2. フォークしたリポジトリを編集：
   - ローカルにクローン: `git clone https://github.com/あなたのユーザー名/GAS-Board.git`
   - または、GitHub上で直接編集

3. `js/app.js` ファイルを開き、`GAS_API_URL` 変数をバックエンドのURLに更新

4. 変更をコミットしてプッシュ（ローカル編集の場合）：
   ```
   git add js/app.js
   git commit -m "GAS API URLを更新"
   git push origin main
   ```

5. GitHub Pagesを有効化：
   - リポジトリの「Settings」>「Pages」
   - 「Source」で「Deploy from a branch」を選択し、「main」を設定
   - 「Save」をクリック

6. 数分後、`https://あなたのユーザー名.github.io/GAS-Board/` でアクセス可能

7. ローカルテスト（オプション）：
   ```
   python -m http.server 8000
   ```
   - ブラウザで `http://localhost:8000` にアクセス

## 学習ポイント

### バックエンド（Google Apps Script）

- **スプレッドシート操作**: シートの作成・データの読み書き
- **Web APIの作成**: `doGet`/`doPost` 関数によるHTTP処理
- **CORS対応**: クロスオリジンリクエストの処理
- **JSONデータの取り扱い**: データのJSON形式での送受信

### フロントエンド（JavaScript/HTML/CSS）

- **Fetch API**: 非同期通信によるデータの送受信
- **DOM操作**: JavaScriptでのHTML要素の操作
- **イベント処理**: フォーム送信・ボタンクリックなどの処理
- **非同期処理**: async/await を使った処理
- **エラーハンドリング**: try/catch によるエラー処理
- **セキュリティ対策**: HTMLエスケープによるXSS対策

## 使用方法

1. アプリにアクセスすると、既存の投稿が表示されます
2. ユーザー名とメッセージを入力して「投稿」ボタンをクリック
3. 投稿はGoogleスプレッドシートに保存され、ページに表示されます

## 技術的な注意点

### Google Apps Scriptの制限

- **実行時間**: 最大6分（トリガー付きは30分）
- **プロジェクト容量**: 最大50MB
- **1日あたりのクォータ**:
  - メール送信: 最大100件/日
  - ドキュメント作成: 最大250件/日
  - スプレッドシート作成: 最大250件/日
  - ウェブアプリリクエスト: 最大20,000回/日
  - URLフェッチ: 最大20,000回/日
- **同時実行**: 最大30件/ユーザー
- **レスポンスサイズ**: 最大10MB

### CORS対応について

Google Apps Scriptでは、フロントエンドとの通信時にCORS（クロスオリジンリソース共有）の問題が発生する場合があります。以下の対応方法を推奨します：

#### フロントエンド側の対応

```javascript
// application/json ではなく application/x-www-form-urlencoded を使用
const formData = new URLSearchParams();
formData.append('username', username);
formData.append('message', message);

fetch(GAS_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  },
  body: formData
})
```

#### バックエンド側の対応

```javascript
function doPost(e) {
  // プリフライトリクエスト（OPTIONS）への対応
  if (e.method === 'OPTIONS') {
    return ContentService.createTextOutput('');
  }
  
  // e.parameter からパラメータを直接取得
  const username = e.parameter.username;
  const message = e.parameter.message;
  
  // 処理を続行...
}
```

**重要**: GASのContentServiceでは、一般的なCORSヘッダー設定方法が直接サポートされていません。このサンプルでは、OPTIONSリクエストに空レスポンスを返す方法と、適切なコンテンツタイプでデータを送信する方法を組み合わせて対応しています。

## まとめ

このプロジェクトは、無料のツールだけで実用的なウェブアプリを開発する方法を示しています。GoogleスプレッドシートとGoogle Apps Scriptを使用したバックエンドと、GitHub Pagesでホストされるフロントエンドの連携方法を学ぶことができます。学習用サンプルとして、コードにコメントを付けているので、各部分の動作を理解しやすくなっています。
