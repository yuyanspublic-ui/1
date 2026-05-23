# 2026 暑假課程選課系統部署包

這個 repo 內已放入：

- `index.html`：可直接用 GitHub Pages 發布的前台網頁。
- `apps_script_code.gs`：貼到 Google 試算表 Apps Script 的後端程式，用來把家長送出的資料寫入試算表。

## 目前狀態

`index.html` 已可部署到 GitHub Pages。  
但必須把 Google Apps Script 部署後取得的 Web app URL 貼進 `index.html` 內的 `GOOGLE_SCRIPT_URL`，家長資料才會集中寫進 Google 試算表。

## 最基本設定步驟

### A. 建立 Google 試算表資料庫

1. 到 Google 雲端硬碟，新增一份 Google 試算表。
2. 命名：`2026暑假課程報名資料`。
3. 試算表上方選單點：`擴充功能` → `Apps Script`。
4. 刪掉原本內容，貼上 `apps_script_code.gs` 裡面的全部程式碼。
5. 按儲存。

### B. 部署 Apps Script

1. 在 Apps Script 右上角點：`部署` → `新部署作業`。
2. 類型選：`網頁應用程式`。
3. 說明可填：`2026暑假課程報名後端`。
4. 執行身分選：`我`。
5. 誰可以存取選：`任何人`。
6. 點部署，依畫面授權。
7. 複製最後產生、結尾是 `/exec` 的 Web app URL。

### C. 把資料庫網址貼回 index.html

找到這行：

```js
const GOOGLE_SCRIPT_URL = "";
```

改成：

```js
const GOOGLE_SCRIPT_URL = "你複製的 Apps Script /exec 網址";
```

儲存並推到 GitHub。

### D. 開啟 GitHub Pages

1. 進入 GitHub repo。
2. 點 `Settings`。
3. 左側點 `Pages`。
4. Source 選 `Deploy from a branch`。
5. Branch 選 `main`，資料夾選 `/root`。
6. 按 Save。
7. 發布完成後網站通常會是：
   `https://yuyanspublic-ui.github.io/1/`

## 注意

請不要把家長填寫的個資公開在 GitHub。資料應只存在你的 Google 試算表，並且只分享給需要處理報名的人。
