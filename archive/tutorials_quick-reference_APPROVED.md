# 任務：教學 - 快速入門: 常用功能速查

Status: APPROVED

## 任務描述
根據 `DOCS_RESTRUCTURE_GUIDE.md` 的規劃，撰寫 `docs/zh-TW/tutorials/quick-reference.md` 的內容。此文件應提供 TQuant Lab 常用功能的快速查詢指南，例如資料載入、策略參數設定、下單函數、績效分析等，以表格或簡潔列表形式呈現。

---
### 撰寫者 (Gemini) 工作日誌
- 撰寫了 `doc/zh-TW/tutorials/quick-reference.md` 的內容。
- 內容以表格形式呈現 TQuant Lab 的核心函數、交易與資料 API、Pipeline API、資料載入、TEJ Tool API 以及績效分析等常用功能。
- 遵循寫作規範，使用了 Hero one-liner、表格、程式碼區塊標示，並提供了相關教學的交叉連結。
- **v2:** 根據審查者 (GPT5) 的回饋進行修改。
- 刪除了 `doc/zh-TW/tutorials/quick-reference.md` 中錯誤放置的文件。
- 更新了 `_PROJECT_PLAN.md` 中所有 `doc/` 路徑為 `docs/`。
- 更新了 `_CURRENT_TASK.md` 中任務描述的目標文件路徑為 `docs/`。
- 修正了 `docs/zh-TW/tutorials/quick-reference.md` 中的 Admonition 語法，將 `> [!INFO]` 替換為 `!!! info`。
- 修正了 `docs/zh-TW/tutorials/first-futures-strategy.md` 中的 Admonition 語法 (`> [!INFO]`, `> [!IMPORTANT]`, `> [!NOTE]`) 為 `!!! info`, `!!! warning`, `!!! note`，並移除了程式碼區塊的 `???+ note` 包裝，改為直接呈現程式碼並加上粗體標題。
- 修正了 `docs/zh-TW/tutorials/first-spot-strategy.md` 中的 Admonition 語法 (`> [!INFO]`, `> [!NOTE]`) 為 `!!! info`, `!!! note`，並移除了程式碼區塊的 `???+ note` 包裝，改為直接呈現程式碼並加上粗體標題。
- 檢查了 `docs/zh-TW/tutorials/getting-started.md` 和 `docs/zh-TW/tutorials/setup.md`，確認其 Admonition 語法和程式碼區塊格式符合要求，無需修改。
- 修正了 `docs/zh-TW/tutorials/first-spot-strategy.md` 中混合的 Admonition 語法。
- 重新提交以供審查。
- **v3:** 根據使用者 (作為審查者) 的第二輪回饋進行修改。
- 修正了 `docs/zh-TW/tutorials/first-spot-strategy.md` 的 Markdown 結構，解決了程式碼區塊縮排錯誤和粗體標題無法顯示的問題。
- 修正了 `docs/zh-TW/tutorials/quick-reference.md` 中的頁內錨點連結，確保「快速跳轉」功能正常運作。
- 修改了 `docs/zh-TW/assets/stylesheets/extra.css`，將 H1 和 H2 標題的 `font-weight` 增加為 700，解決了大標題過細的問題，並調整了 H3/H4 的粗細以確保視覺層級清晰。
- 重新提交以供審查。

---
### 審查者 (GPT5) 回饋

**二輪審查（2025-11-07 user feedback）**

**總體評估**：上次修正引入了一些格式問題，且整體樣式需要調整。

---

**發現的問題**：

1.  **標題樣式問題**：目前大標題是細體，小標題是粗體，可讀性不佳，需要重新設計。
2.  **`first-spot-strategy.md` 格式錯誤**：
    *   程式碼區塊有不正確的縮排。
    *   程式碼區塊上方的粗體標題（例如 `**環境設定與資料準備程式碼：**`）沒有正確顯示。
3.  **`quick-reference.md` 連結失效**：頁面內的快速跳轉連結點擊後沒有反應。

---

**需要立即修正**：

1.  **修正 `first-spot-strategy.md`**：調整 Markdown 結構，將說明文字與程式碼區塊分離，確保程式碼縮排正常且標題能正確顯示為粗體。
2.  **修正 `quick-reference.md`**：檢查並修正頁內錨點連結，使其能正確跳轉到對應章節。
3.  **調整標題樣式**：調查並修改 CSS 檔案，統一網站的標題樣式，使其更具可讀性 (例如：大標題應比小標題更粗或更大)。

---

---

**三輪審查（2025-11-07 05:41 UTC）**

Gemini 已完成 v3 版本的所有修正。重新審查結果：

✅ **v3 修正內容驗證**：
- ✓ `first-spot-strategy.md` Markdown 結構已調整，程式碼縮排正常
- ✓ 粗體標題能正確顯示
- ✓ `quick-reference.md` 頁內錨點連結已修正（使用 `{#id}` 格式）
- ✓ CSS 文件已更新：H1/H2 font-weight 設為 700，H3/H4 設為 600

✅ **完整技術驗證**：
- ✓ 無舊 GitHub admonition 語法
- ✓ 無孤立 collapsible 塊
- ✓ 所有 admonition 正確格式化（`!!! info`, `!!! warning`, `!!! note`）
- ✓ 無 AI 樣板用語
- ✓ 無 Emoji
- ✓ 程式碼區塊均有正確語言標記
- ✓ 頁面樣式層級清晰（大標題 font-weight: 700, 小標題: 600）

✅ **跨文件一致性**：
- ✓ `first-spot-strategy.md` 格式規範
- ✓ `first-futures-strategy.md` 格式規範
- ✓ `quick-reference.md` 格式規範
- ✓ 所有文件的 Markdown 結構一致

**LGTM. APPROVED.**

所有修正完成，文件品質優秀，已準備發佈。本任務可進行封存流程。