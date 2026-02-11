# 內建資料集 (Built-in DataSets)

!!! info
    本頁整理 TQuant Lab 中 Pipeline 最常用的內建資料集與操作語法。

在 Pipeline 中，我們透過 **資料集 (DataSet)** 讀取歷史數據。所有的資料欄位都支援以下兩種取值方式：

*   `.latest`：取得最新一筆數據（數值）。
*   `.slice(n)`：取得過去 `n` 天的數據（陣列）。

---

## 1. 台灣股價價量資料 (TWEquityPricing)

這是最基礎的價量資料集。

```python
from zipline.pipeline.data import TWEquityPricing
```

| 欄位屬性 | 說明 |
| :--- | :--- |
| `TWEquityPricing.open` | 開盤價 |
| `TWEquityPricing.high` | 最高價 |
| `TWEquityPricing.low` | 最低價 |
| `TWEquityPricing.close` | 收盤價 |
| `TWEquityPricing.volume` | 成交量 |

**使用範例：**

```python
# 取得最新收盤價
close_price = TWEquityPricing.close.latest
```

---

## 2. TEJ 基本面資料 (TQFundamentals)

整合 TEJ 資料庫的財務與非財務數據。資料集分為以下兩類：

```python
from zipline.pipeline.data.TQFundamentals import TQDataSet, TQAltDataSet
```

### 2.1 財務數據 (TQDataSet)
包含營收、盈餘等財務指標。

*   **查詢欄位**：可使用 `TQDataSet._column_names` 查看所有可用欄位。
*   **常用欄位**：如 `Gross_Margin_Growth_Rate_A` (毛利率成長率), `Return_On_Equity_A` (ROE) 等。

### 2.2 非財務數據 (TQAltDataSet)
包含產業分類、市值等資訊。

*   **查詢欄位**：可使用 `TQAltDataSet._column_names` 查看所有可用欄位。
*   **常用欄位**：
    *   `TQAltDataSet.Industry`：產業別
    *   `TQAltDataSet.Sub_Industry`：子產業別

**使用範例：**

```python
# 取得最新產業別
industry = TQAltDataSet.Industry.latest
```