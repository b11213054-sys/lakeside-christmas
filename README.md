# 湖畔聖誕 · Lakeside Christmas

一片安靜的湖、一張空著的長椅，還有一點雪。用兩張湖畔相片做成的聖誕節單頁網站。

![預覽](lakeside.jpg)

## 內容

- **Hero**：滿版湖畔照片、飄雪動畫、聖誕語錄與即時倒數（距離 12/25）
- **湖畔故事**：兩段短文與三個數字，說明這片風景
- **相片**：原圖與加上 QR Code 的分享版，滑鼠移入有 3D 傾斜與反光，點擊可放大
- **QR 分享**：放大的 QR Code、下載分享版照片、隨機祝福語
- **聖誕氛圍**：Canvas 飄雪（可開關）、頂部閃爍燈串、吊掛飾品、金色光暈

## 檔案結構

```
index.html      頁面結構
style.css       樣式（深綠 × 金色 × 雪白）
main.js         飄雪、倒數、進場動畫、燈箱、祝福語
lakeside.jpg        原始湖畔照片
lakeside-qr.jpg     加上 QR Code 的分享版
qr-code.png         由照片裁切放大的 QR Code
```

## 本機預覽

純靜態網站，直接雙擊 `index.html` 即可；或用任一靜態伺服器：

```bash
python -m http.server 8000
# 然後開啟 http://localhost:8000
```

## 部署到 GitHub Pages

1. 進入 repo 的 **Settings → Pages**
2. Source 選擇 **Deploy from a branch**
3. Branch 選 `main`、資料夾選 `/ (root)`，按下 **Save**
4. 約一分鐘後即可用 `https://<你的帳號>.github.io/lakeside-christmas/` 瀏覽

## 備註

- 字型使用 Google Fonts（Cormorant Garamond、Noto Serif TC、Noto Sans TC），無網路時會退回系統字型。
- 已支援響應式版面與 `prefers-reduced-motion`（減少動態效果）。
- 照片版權屬原拍攝者所有，僅供個人聖誕祝福使用。
