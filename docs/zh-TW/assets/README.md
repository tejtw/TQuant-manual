# CSS/HTML/JavaScript 結構整理說明

## 整理前的問題

### 1. CSS 重複問題
- `docs/zh-TW/assets/stylesheets/extra.css` (1389 行)
- `public/assets/stylesheets/extra.css` (872 行) 
- `docs/en/assets/stylesheets/extra.css` (25 行)
- 內嵌在 `main.html` 中的 CSS (~200 行)
- 內嵌在 `public/index.html` 中的 `<style>` 標籤

### 2. JavaScript 混在 HTML 中
- `config/zh-TW/overrides/main.html` 內有大量 JavaScript (~300 行)
- 主題切換、側邊欄、載入動畫等邏輯混雜

### 3. 沒有清楚的組織結構
- 樣式沒有按功能分類
- 同樣的樣式重複定義多次

---

## 整理後的結構

### 檔案結構
```
docs/zh-TW/assets/
├── stylesheets/
│   ├── extra.css           # 主要樣式檔（已整理）
│   └── extra.backup.css    # 原始備份
├── javascripts/
│   ├── mathjax.js          # 數學公式支援
│   └── theme.js            # 主題管理、UI 互動（新增）
```

### CSS 結構 (`extra.css`)
按功能分類組織：
1. CSS Variables - 顏色、陰影變數
2. Layout & Grid - 版面配置
3. Sidebar Styles - 側邊欄樣式
4. Light Theme - 淺色主題
5. Dark Theme - 深色主題
6. Typography - 字體排版
7. Header & Footer - 頁首頁尾
8. Search Box - 搜尋框
9. Code Blocks - 程式碼區塊
10. Admonitions - 提示區塊
11. Tables - 表格
12. Links - 連結
13. Mermaid Diagrams - 流程圖
14. UI Components - 按鈕、開關
15. Loading Animation - 載入動畫
16. Theme Transitions - 主題切換動畫
17. Utilities - 工具類

### JavaScript 結構 (`theme.js`)
按功能分類：
1. Theme Management - 主題管理
2. TQuantLab Button - 訂閱按鈕
3. Custom Theme Toggle - 自訂主題切換
4. Sidebar Toggle - 側邊欄開關
5. Loading Animation - 載入動畫
6. Theme Transition Effects - 主題切換特效

### main.html 簡化
從 695 行簡化為約 20 行，只保留：
- 模板繼承
- GitHub 通知橫幅

---

## 備份檔案

| 原始檔案 | 備份位置 |
|---------|---------|
| `docs/zh-TW/assets/stylesheets/extra.css` | `extra.backup.css` |
| `config/zh-TW/overrides/main.html` | `main.backup.html` |

---

## 注意事項

1. **public 資料夾**：這是 MkDocs 建置後的輸出資料夾，會在每次 `mkdocs build` 時重新生成
2. **開發時修改**：應修改 `docs/` 和 `config/` 中的原始檔案
3. **如需還原**：使用 `.backup` 檔案還原

---

## 使用方式

```bash
# 開發模式
cd config/zh-TW
mkdocs serve

# 建置
mkdocs build
```
