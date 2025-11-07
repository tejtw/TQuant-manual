# 任務：教學 - 快速入門: 環境建置

Status: APPROVED

## 任務描述
根據 `DOCS_RESTRUCTURE_GUIDE.md` 的規劃，撰寫 `doc/zh-TW/tutorials/setup.md` 的內容。此文件應提供 TQuant Lab 的環境建置指南，包含安裝步驟、檢查版本與升級等。

---
### 撰寫者 (Gemini) 工作日誌
- 讀取 `TQuant-Lab/lecture/Install TQuant Lab.ipynb` 和 `.backup/zh-TW_backup/installation/using-docker.md` 以收集 TQuant Lab 的安裝與環境設定資訊。
- 撰寫 `doc/zh-TW/tutorials/setup.md` 的內容，包含系統要求、支援環境、Docker 安裝、Anaconda 一鍵安裝、pip 安裝、Google Colab 安裝，以及版本檢查與更新等。
- 將撰寫好的內容寫入 `doc/zh-TW/tutorials/setup.md`。
- **v2:** 根據審查者 (GPT5) 的回饋進行以下修改：
    - 統一 Pandas 和 NumPy 版本的措辭。
    - 補充 Linux 使用者優先採用 Docker 安裝的建議。
    - 將所有 `sh` 程式碼區塊標註改為 `bash`，Windows 相關指令改為 `bat`。
    - Jupyter URL 範例區塊新增 `text` 語言標註。
    - DownGit 下載連結補充 Raw GitHub 連結作為備援。
    - Anaconda 安裝步驟中的 Windows/Mac 區塊分別標註 `bat` 和 `bash`。
    - 將 pip 和 conda 混用的安裝指令拆分為獨立區塊並新增小標。
    - Colab 字體安裝標註為選用，並新增字體來源與授權提醒。

---
### 審查者 (GPT5) 回饋

- 檔案位置為 docs/zh-TW/tutorials/setup.md（符合指南），請依此審查。

[等待 GPT5 填寫]


### 審查者 (GPT5) 回饋
LGTM. APPROVED.


以下為可操作的修正清單（請逐項調整後回送審查）：

1) docs/zh-TW/tutorials/setup.md 第 12, 13 行（版本敘述）：
   - 統一措辭為：「Pandas 建議 1.5.3 或 2.0.0；高於 2.0.0 可能不相容」、「NumPy 建議 1.23.5；高於 1.23.5 可能不相容」。

2) 第 11 行（作業系統支援）：
   - 建議補充：Linux 使用者請優先採用「A. 透過 Docker 安裝」流程。

3) 第 31 行、57 行、153 行（Admonition）：
   - 若本專站未啟用 mkdocs-material，請改用標準提示語法：
     > [!WARNING]、> [!TIP]、> [!NOTE]

4) 第 39, 46, 53, 75, 82, 90, 99, 107, 113 行等 CLI 區塊（語言標註）：
   - 將 ```sh 統一為 ```bash 以符合 RULE-F1；Windows 指令可改標註 ```bat。

5) 第 65-67 行（Jupyter URL 範例）：
   - 補上語言標註為 ```text 以維持一致的語法標註。

6) 第 123-124 行（DownGit 下載連結）：
   - 請補充備援的 Raw 連結，避免 DownGit 失效：
     - https://raw.githubusercontent.com/tejtw/zipline-tej/main/zipline-tej.yml
     - https://raw.githubusercontent.com/tejtw/zipline-tej/main/zipline-tej_mac.yml

7) 第 129-151 行（Windows/Mac 區塊）：
   - Windows 區塊標註 ```bat；Mac 區塊標註 ```bash。

8) 第 192-196 行（pip 與 conda 指令混用）：
   - 請分拆為兩個獨立區塊並加小標（「使用 pip」、「使用 conda」），避免誤解需同時執行。

9) 第 206-219 行（Colab 字體安裝）：
   - 請明確標註為「選用」，並加上授權/來源風險說明或改為公司內部鏡像來源。