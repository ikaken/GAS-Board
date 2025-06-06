# スプレッドシート掲示板アプリ

**これは学習者向けのサンプルプロジェクトです**

このプロジェクトは、Google Apps Script (GAS) をバックエンドとして使用し、GitHub Pages でホストされるフロントエンドを持つ掲示板アプリケーションです。コードは詳細なコメント付きで、Web開発とGoogle Apps Scriptの学習に最適です。
このプロジェクトを通じて、サーバーレスアプリケーションの開発手法と、無料ツールだけで実用的なウェブアプリを作成する方法を学ぶことができます。

## 学習ポイント

このプロジェクトでは以下の技術と概念を学ぶことができます：

### バックエンド（Google Apps Script）

- **スプレッドシート操作**: シートの取得、作成、行の追加、データの読み書き
- **Web APIの作成**: `doGet`/`doPost` 関数を使用したHTTPリクエストの処理
- **CORS対応**: クロスオリジンリクエストの処理方法
- **JSONデータの取り扱い**: データのJSON形式での送受信

### フロントエンド（JavaScript/HTML/CSS）

- **Fetch API**: 非同期通信を使ったデータの取得と送信
- **DOM操作**: JavaScriptでのHTML要素の操作
- **イベント処理**: フォーム送信やボタンクリックなどのイベント処理
- **非同期処理**: async/awaitを使った非同期処理
- **エラーハンドリング**: try/catchを使ったエラー処理
- **セキュリティ対策**: HTMLエスケープによるXSS対策

### デプロイと運用

- **GAS Webアプリのデプロイ**: スクリプトをWeb APIとして公開する方法
- **GitHub Pages**: 静的サイトのホスティング方法

## 機能

- スプレッドシートに保存されたメッセージの表示
- 新しいメッセージの投稿（テキスト、ユーザー名、日時を保存）
- シンプルで使いやすいUI

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

### バックエンド（Google Apps Script）のセットアップ

1. 以下の共有リンクからサンプルスプレッドシートを開きます（https://docs.google.com/spreadsheets/d/1WkClO_kAYzIfrYjLIJb7HHSS344Go0hlTYUFcZ0fLpc/copy）
2. 「ファイル > コピーを作成」を選択して、自分のGoogleドライブにコピーを作成します
3. コピーしたスプレッドシートを開き、「ツール > スクリプトエディタ」を選択します
4. スクリプトエディタには、既に必要なコードが設定されています
5. 「デプロイ > 新しいデプロイ」を選択します
6. 「種類の選択」で「ウェブアプリ」を選択します
7. 以下の設定を行います：
   - 説明：「掲示板アプリ」
   - ウェブアプリとして実行：「自分」
   - アクセスできるユーザー：「全員」
8. 「デプロイ」ボタンをクリックします
9. 表示されるウェブアプリのURLをコピーします（フロントエンドの設定で必要になります）

### フロントエンド（GitHub Pages）のセットアップ

1. 以下の手順でGitHubリポジトリをフォークします：
   - リポジトリページ（ここにリポジトリのURLを挿入）にアクセスします
   - 右上の「Fork」ボタンをクリックします
   - フォーク先の設定を確認し、「Create fork」をクリックします

2. フォークしたリポジトリをローカルにクローンするか、GitHub上で直接編集します：
   ```
   git clone https://github.com/あなたのユーザー名/GAS-Board.git
   cd GAS-Board
   ```

3. `js/app.js` ファイルを開き、`GAS_API_URL` 変数を、バックエンドセットアップでコピーしたウェブアプリのURLに更新します

4. 変更をコミットしてプッシュします（ローカルで編集した場合）：
   ```
   git add js/app.js
   git commit -m "GAS API URLを更新"
   git push origin main
   ```

5. GitHub Pagesを有効化します：
   - フォークしたリポジトリのページに移動します
   - 「Settings」タブをクリックします
   - 左メニューから「Pages」を選択します
   - 「Source」セクションで「Deploy from a branch」を選択し、ブランチを「main」に設定します
   - 「Save」ボタンをクリックします

6. 数分後、GitHub Pagesが生成するURL（通常は https://あなたのユーザー名.github.io/GAS-Board/ ）にアクセスしてアプリケーションを使用できます

7. ローカルでテストする場合は、シンプルなHTTPサーバーを使用できます：
   ```
   python -m http.server 8000
   ```
   - ブラウザで http://localhost:8000 にアクセスします

## 使用方法

1. ページにアクセスすると、既存の投稿が表示されます
2. フォームにユーザー名とメッセージを入力して「投稿」ボタンをクリックすると、新しい投稿が追加されます
3. 投稿は自動的にGoogleスプレッドシートに保存され、ページに表示されます

## 注意事項

### Google Apps Script（GAS）の制限

- **実行時間の制限**: 1回の実行につき最大6分（トリガー付きの場合は30分）
- **スクリプトの容量制限**: プロジェクトあたり最大50MB
- **1日あたりのクォータ**:
  - メールの送信: 1日あたり最大100件
  - ドキュメントの作成: 1日あたり最大250件
  - スプレッドシートの作成: 1日あたり最大250件
  - ウェブアプリのリクエスト: 1日あたり最大20,000回
  - URLフェッチ: 1日あたり最大20,000回
- **同時実行の制限**: 同じユーザーによる同時実行は30件まで
- **レスポンスサイズの制限**: 最大10MB

### その他の注意点

- CORSの設定が正しく行われていることを確認してください
- 本番環境で使用する場合は、適切な認証とセキュリティ対策を実装してください
- 長時間実行される処理は、時間制限を考慮して分割することを検討してください

### Google Apps ScriptのCORS対応について

#### Content-Type: application/jsonを使用する際の問題

Google Apps Script (GAS) のウェブアプリでは、フロントエンドから`Content-Type: application/json`ヘッダーを使用してPOSTリクエストを送信すると、CORSエラーが発生することがあります。これは、GASのCORS処理がこのコンテンツタイプを適切に処理できないためです。

#### 対応方法

1. **フロントエンド側の対応**:
   - `Content-Type: application/x-www-form-urlencoded`を使用する
   - JSONデータの代わりに`URLSearchParams`を使用してデータを送信する

   ```javascript
   // 推奨される方法
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

2. **バックエンド側の対応**:
   - `e.postData.contents`からJSONをパースする代わりに、`e.parameter`からパラメータを直接取得する

   ```javascript
   function doPost(e) {
     // JSONパースではなく、直接パラメータにアクセス
     const username = e.parameter.username;
     const message = e.parameter.message;
     
     // 処理を続行...
   }
   ```

3. **OPTIONSリクエスト（プリフライト）の処理**:
   - ブラウザは複雑なリクエスト（カスタムヘッダーや特定のContent-Typeを含む）の前に、OPTIONSリクエストを送信します
   - GASでは、このOPTIONSリクエストに対して空のレスポンスを返すだけで十分な場合が多いです

   ```javascript
   function doPost(e) {
     if (e.method === 'OPTIONS') {
       return ContentService.createTextOutput('');
     }
     
     // 通常の処理を続行...
   }
   ```

4. **重要な注意点**:
   - Google Apps ScriptのContentServiceには、レスポンスヘッダーを設定するための`setHeader`や`addHeader`メソッドが直接提供されていません
   - CORSヘッダーを設定する必要がある場合は、プロキシサーバーや他の方法を検討する必要があります
   - このサンプルアプリでは、OPTIONSリクエストに空のレスポンスを返す方法と、application/x-www-form-urlencoded形式でデータを送信する方法を組み合わせてCORS問題を回避しています

これらの対応を行うことで、GASバックエンドとフロントエンド間のCORS関連のエラーを回避できます。


