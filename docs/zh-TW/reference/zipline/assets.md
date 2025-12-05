# Zipline API 參考：Asset 物件

!!! info
    本頁說明 Zipline 中 Asset（資產）物件的核心概念，包含股票 (Equity) 與期貨 (Future) 兩種類型的屬性與使用方式。

---

## 1. 核心概念

在 Zipline 中，**Asset（資產）** 物件是任何可交易金融工具（如股票、期貨）的唯一標識。每個 Asset 物件都包含該金融工具的元數據，例如代碼、交易所、到期日等。

在 TQuant Lab 的環境中，您最常接觸到的 Asset 主要有兩種類型：

1.  `Equity`：代表股票。
2.  `Future`：代表期貨合約。

---

## 2. 股票 (Equity)

`Equity` 物件代表單一一支股票，例如台積電 (2330)。

### 2.1 如何取得 `Equity` 物件

在 Zipline API 中，最常用 `symbol()` 函數來透過股票代碼取得 `Equity` 物件。

```python
from zipline.api import symbol

# 取得台積電 (2330) 的 Asset 物件
asset_tsmc = symbol('2330')

# 取得大盤指數 (用於 benchmark)
asset_benchmark = symbol('IR0001')
```

### 2.2 常用屬性

| 屬性 (`attribute`) | 描述 | 範例 |
| :--- | :--- | :--- |
| `sid` | 系統內部唯一的證券 ID (Security ID) | `2317` |
| `symbol` | 股票代碼 | `'2330'` |
| `asset_name` | 股票名稱 | `'TAIWAN SEMICONDUCTOR MANUFACTURING'` |
| `exchange` | 交易所名稱 | `'XTAI'` (台灣證券交易所) |

---

## 3. 期貨 (Future)

期貨資產在 Zipline 中有兩種主要形式：代表特定月份的 `Future` 物件，以及用於分析和交易的 `ContinuousFuture` 物件。

### 3.1 具體合約 (The `Future` Object)

`Future` 物件代表一個 **具體的、有到期日** 的期貨合約，例如「2024年10月份的台指期貨合約」。在下單或查詢特定合約的持倉時，您操作的對象就是這個物件。

#### 3.1.1 如何取得

您通常**不會**直接建立 `Future` 物件，而是透過 `ContinuousFuture` 物件在特定的交易日查詢當下應該交易的合約。

```python
# 假設 context.future 是一個連續合約物件
# 取得今天的具體合約
current_contract = data.current(context.future, 'contract')
```

#### 3.1.2 常用屬性

| 屬性 (`attribute`) | 描述 | 範例 |
| :--- | :--- | :--- |
| `sid` | 系統內部唯一的合約 ID | `12345` |
| `symbol` | 合約的代碼 | `'TXF2410'` |
| `root_symbol` | 該合約的根代碼，代表其標的商品 | `'TX'` |
| `start_date` | 該合約的起始交易日 | `pd.Timestamp(...)` |
| `auto_close_date` | **(非常重要)** 該合約的最後交易日/到期結算日 | `pd.Timestamp(...)` |
| `exchange` | 交易所名稱 | `'XTFX'` (台灣期貨交易所) |

### 3.2 連續合約 (The ContinuousFuture Object)

`ContinuousFuture` 是一個 **輔助性** 的物件，它本身不能被直接交易。它的作用是將一系列有到期日的獨立期貨合約（如台指09、台指10、台指11...）串接成一個沒有到期日的「連續合約」。

這讓您可以對一個連續的價格序列進行技術分析，而 Zipline 會在背景自動處理換月，您無需手動管理。

#### 3.2.1 如何取得

使用 `continuous_future()` 函數來建立。

```python
from zipline.api import continuous_future

# 建立一個代表台指期近月合約的連續合約物件
future_tx = continuous_future(
    root_symbol='TX',      # 根代碼
    offset=0,              # 0 代表近月合約
    roll='calendar',       # 依日曆換月
    adjustment='add'       # 價格調整方式
)
```

---

## 4. 在策略中應用

在實際策略中，您會透過 `context.portfolio.positions` 來存取您持有的所有 Asset 物件。您可以透過檢查物件的類型來判斷它是股票還是期貨，並執行相應的操作。

```python
from zipline.assets import Equity, Future

def daily_trade(context, data):
    
    # 遍歷您投資組合中的每一個部位
    for asset, position in context.portfolio.positions.items():
        
        # 檢查資產類型
        if isinstance(asset, Equity):
            # --- 這是股票 --- 
            print(f"持有的股票: {asset.symbol}, 股數: {position.amount}")
            
        elif isinstance(asset, Future):
            # --- 這是期貨 --- 
            print(f"持有的期貨合約: {asset.symbol}")
            print(f"  - 根代碼: {asset.root_symbol}")
            print(f"  - 到期日: {asset.auto_close_date.date()}")
            print(f"  - 持有口數: {position.amount}")
```
