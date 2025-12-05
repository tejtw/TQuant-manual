# 如何 Ingest 期貨價量資料

!!! info
    本指南將引導您完成將 TEJ 期貨資料下載並整合至 TQuant Lab 本地資料庫的完整步驟。這個過程稱為 "ingest"，它是進行任何回測前最基礎且必要的第一步。

---

## 步驟 1：設定 TEJ API 金鑰

首先，您必須提供您的 TEJ API 金鑰，以便 TQuant Lab 能夠存取 TEJ 的資料庫。我們透過設定環境變數來完成此操作。

**請將 `'YOUR_KEY'` 替換成您自己的金鑰。**

```python
import os

# 填入您的 TEJ API Key
os.environ['TEJAPI_KEY'] = 'YOUR_KEY'
os.environ['TEJAPI_BASE'] = 'https://api.tej.com.tw'
```

---

## 步驟 2：設定要下載的商品與期間

接著，您需要設定要下載的期貨商品代碼 (`future`)、相關的現貨/指數代碼 (`ticker`)，以及資料的起訖日期 (`mdate`)。

- **`future`**: 指定一個或多個期貨根代碼 (root symbol)，以空格分隔。例如：`'TX'` (台指期), `'MTX'` (小台指)。
- **`ticker`**: 指定相關的現貨標的，通常用於設定回測的比較基準 (benchmark)。例如：`'IR0001'` (發行量加權股價報酬指數)。
- **`mdate`**: 設定資料的起訖日期，格式為 `'YYYYMMDD YYYYMMDD'`。

!!! warning "個股期貨代碼"
    假如想要下載個股期貨需要加 `F`，如台積電個股期為 `CDF`，聯發科為 `DVF`。

```python
# 設定要下載的期貨商品
os.environ['future'] = 'TX MTX'

# 設定相關的指數/股票 (用於 benchmark)
os.environ['ticker'] = 'IR0001'

# 設定下載的起訖日期
os.environ['mdate'] = '20100101 20250930'
```

---

## 步驟 3：執行 Ingest 命令

設定好所有環境變數後，最後一步就是執行 `zipline ingest` 命令。這個命令會讀取您剛才設定的環境變數，從 TEJ 資料庫下載指定的資料，並將其轉換、儲存至 Zipline 的本地資料庫中。

- **`-b tquant_future`**: 這個參數指定了要寫入的資料包 (bundle) 名稱。在 TQuant Lab 中，期貨資料固定使用 `tquant_future` 這個 bundle。

```python
!zipline ingest -b tquant_future
```

執行後，您會看到系統開始下載並處理資料。這個過程可能需要數分鐘，具體時間取決於您請求的資料量大小。

---

## 完整範例

您可以直接複製下方的完整程式碼區塊，貼到您的 Notebook 中執行，即可一次性完成期貨資料的 Ingest。

```python
import os

# 1. 設定金鑰
os.environ['TEJAPI_KEY'] = 'YOUR_KEY'
os.environ['TEJAPI_BASE'] = 'https://api.tej.com.tw'

# 2. 設定商品與期間
os.environ['future'] = 'TX MTX'  # 下載台指期與小台指
os.environ['ticker'] = 'IR0001'  # 下載加權指數作為 benchmark
os.environ['mdate'] = '20100101 20250930'

# 3. 執行 Ingest
# 注意：此命令僅在首次使用或需要更新資料時執行
!zipline ingest -b tquant_future
```

---

## 何時需要重新執行？

| 情境 | 說明 |
|------|------|
| **首次設定環境** | 必須執行一次以建立本地資料庫 |
| **增加新的期貨商品** | 修改 os.environ['future'] 後，需重新執行 |
| **延長資料期間** | 修改 os.environ['mdate'] 後，需重新執行 |
| **更新至最新資料** | 將結束日期設為當前日期並重新執行 |

---

## 延伸閱讀

- [建立你的第一個期貨策略](first-futures-strategy.md)
- [如何 Ingest 股票價量資料](../how-to/data/ingest-spot-pricing.md)
