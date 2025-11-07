# 資料集 (DataSets) 概論

!!! info
    本頁介紹 Zipline Pipeline 中資料集 (DataSets) 的核心概念，包括其作用、TQuant Lab 提供的內建資料集類型，以及如何在 Pipeline 中使用這些資料集來獲取原始數據。

在 Zipline Pipeline 中，資料集 (DataSets) 是獲取原始市場數據和基本面數據的基礎。它們提供了一個標準化的介面，讓您可以輕鬆地將各種數據源整合到您的 Pipeline 計算中，而無需擔心底層數據的儲存格式或載入細節。

---

## 1. 什麼是 DataSets？

DataSets 可以被視為 Pipeline 的「數據入口」。它們封裝了不同類型的歷史數據，並將這些數據以 Pipeline 可理解的格式暴露出來。每個 DataSet 都包含了一系列可供 Pipeline 訪問的「欄位 (fields)」，例如股票的開盤價、收盤價、市值等。

**核心作用**：

*   **數據抽象**：將底層數據的複雜性抽象化，讓使用者可以專注於策略邏輯。
*   **高效訪問**：優化數據讀取，確保 Pipeline 能夠快速獲取所需數據。
*   **類型安全**：定義了每個欄位的數據類型，有助於避免潛在的錯誤。

---

## 2. TQuant Lab 提供的內建 DataSets

TQuant Lab 整合了多種常用的資料集，以滿足不同策略的需求：

### `TWEquityPricing` (台灣股票價量資料)

*   **用途**：提供台灣股票市場的歷史價量數據。
*   **可用欄位**：
    *   `open`：開盤價
    *   `high`：最高價
    *   `low`：最低價
    *   `close`：收盤價
    *   `volume`：成交量
*   **範例**：在 Pipeline 中獲取收盤價。

    ```python
    from zipline.pipeline.data import TWEquityPricing

    close_price = TWEquityPricing.close.latest
    ```

> 詳見：[EquityPricing 資料集](../../reference/pipeline/datasets/equity-pricing.md)

### `TQDataSet` / `TQAltDataSet` (TEJ 財務/非財務資料)

*   **用途**：提供由 TEJ 台灣經濟新報整理的豐富財務和非財務數據，例如公司市值、本益比、股價淨值比等。
*   **可用欄位**：根據 TEJ 提供的數據類型而定，通常包括：
    *   `Market_Cap_Dollars`：市值 (美元)
    *   `PER`：本益比
    *   `PBR`：股價淨值比
    *   ... (更多欄位請參考具體 API 文件)
*   **範例**：在 Pipeline 中獲取市值。

    ```python
    from zipline.pipeline.data import TQDataSet

    market_cap = TQDataSet.Market_Cap_Dollars.latest
    ```

> 詳見：[TQDataSet / TQAltDataSet 資料集](../../reference/pipeline/datasets/tej-datasets.md)

---

## 3. 如何在 Pipeline 中使用 DataSets

在 Pipeline 中使用 DataSets 非常直觀。您只需透過 `zipline.pipeline.data` 模組導入所需的 DataSet，然後訪問其欄位即可。

```python
from zipline.pipeline import Pipeline
from zipline.pipeline.data import TWEquityPricing, TQDataSet
from zipline.pipeline.factors import SimpleMovingAverage

def make_my_pipeline():
    # 從 TWEquityPricing 獲取收盤價並計算 20 日均線
    mean_close_20 = SimpleMovingAverage(inputs=[TWEquityPricing.close], window_length=20)
    
    # 從 TQDataSet 獲取最新市值
    latest_market_cap = TQDataSet.Market_Cap_Dollars.latest
    
    return Pipeline(
        columns={
            'mean_close_20': mean_close_20,
            'market_cap': latest_market_cap
        }
    )
```

**`latest` 屬性**：

在上述範例中，我們使用了 `.latest` 屬性。這表示我們希望獲取該欄位在當前 Pipeline 執行時間點的最新可用數據。對於某些數據（如收盤價），這通常是前一個交易日的數據，以避免向前看偏誤。

---

## 4. 自訂資料集 (Custom DataSets)

如果 TQuant Lab 提供的內建資料集無法滿足您的特定需求，您也可以創建自己的自訂資料集，將外部數據源整合到 Pipeline 中。

> 詳見：[自訂資料集](../../reference/pipeline/datasets/custom-dataset.md)

---

## 總結

DataSets 是 Zipline Pipeline 的基石，它們提供了一種高效且標準化的方式來訪問和整合各種市場數據。透過理解和靈活運用這些內建資料集，您可以為您的量化策略提供豐富的數據基礎，並構建出更具洞察力的交易訊號。