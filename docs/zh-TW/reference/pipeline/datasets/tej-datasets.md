# TQDataSet / TQAltDataSet 資料集

!!! info
    本頁詳細介紹 `TQDataSet` 和 `TQAltDataSet`，它們是 TQuant Lab Pipeline 中用於獲取 TEJ 台灣經濟新報提供的財務與非財務數據的核心資料集。內容涵蓋其概念、使用方法及常見的應用範例。

`TQDataSet` 和 `TQAltDataSet` 為 TQuant Lab 的使用者提供了直接在 Pipeline 中存取 TEJ 高品質數據庫的能力。這使得研究者可以輕鬆地將基本面因子、另類數據等納入其量化策略中，極大地擴展了策略的廣度和深度。

---

## 1. `TQDataSet` / `TQAltDataSet` 核心概念

這兩個資料集的主要區別在於它們提供的數據類型和更新頻率：

*   `TQDataSet`
    *   **主要內容**：包含標準化的、常用的 TEJ 數據欄位，例如市值、本益比、股價淨值比等。這些數據通常經過處理，適合直接在 Pipeline 中使用。
    *   **適用場景**：適用於大多數需要基本面因子的策略，例如價值投資、成長投資等。

*   `TQAltDataSet`
    *   **主要內容**：提供更廣泛的、未經標準化或較為原始的 TEJ 數據欄位。這可能包括一些特定的另類數據、產業數據或更細粒度的財務數據。
    *   **適用場景**：適用於需要特定、非標準化數據的進階策略研究。

**共同特點**：

*   **Point-in-Time (PIT) 資料**：這兩個資料集都遵循 PIT 原則，確保在回測的任何時間點，您只能獲取到當時已知的數據，有效避免了向前看偏誤。
*   **與價量數據的整合**：您可以輕鬆地將 `TQDataSet` / `TQAltDataSet` 的數據與 `TWEquityPricing` 的價量數據結合，創建多維度的因子和篩選條件。

---

## 2. 使用方法

在 Pipeline 中使用 `TQDataSet` 和 `TQAltDataSet` 的方式與使用 `TWEquityPricing` 類似。您只需從 `zipline.pipeline.data` 模組導入它們，然後訪問所需的欄位。

### 範例 1：獲取最新市值和本益比

```python
from zipline.pipeline import Pipeline
from zipline.pipeline.data import TQDataSet

def make_my_pipeline():
    # 從 TQDataSet 獲取最新的市值 (Market Cap)
    latest_market_cap = TQDataSet.Market_Cap_Dollars.latest
    
    # 從 TQDataSet 獲取最新的本益比 (Price-to-Earnings Ratio)
    latest_per = TQDataSet.PER.latest
    
    return Pipeline(
        columns={
            'market_cap': latest_market_cap,
            'per': latest_per
        }
    )
```

### 範例 2：結合 `TQDataSet` 進行篩選

您可以將 `TQDataSet` 的欄位與比較運算符結合，創建 `Filter` 來篩選股票。

```python
from zipline.pipeline import Pipeline
from zipline.pipeline.data import TQDataSet

def make_my_pipeline():
    # 獲取最新的本益比
    per = TQDataSet.PER.latest
    
    # 創建一個篩選條件：本益比介於 0 和 20 之間
    per_filter = (per > 0) & (per < 20)
    
    return Pipeline(
        columns={
            'per': per
        },
        screen=per_filter # 將篩選條件應用到 Pipeline
    )
```

### 範例 3：在自訂因子中使用

`TQDataSet` 的欄位也可以作為 [自訂因子](../../reference/pipeline/custom-factor.md) 的輸入，讓您可以基於基本面數據創建獨特的因子。

```python
from zipline.pipeline import CustomFactor
from zipline.pipeline.data import TQDataSet
import numpy as np

class PBR_Inverse(CustomFactor):
    # 定義輸入為股價淨值比 (Price-to-Book Ratio)
    inputs = [TQDataSet.PBR]
    window_length = 1 # 只需要當日的數據

    def compute(self, today, assets, out, pbr):
        # pbr 是一個 (1 x N) 的 NumPy 陣列
        # 計算股價淨值比的倒數 (Book-to-Price Ratio)
        out[:] = 1 / pbr[0]
```

---

## 3. 可用欄位查詢

`TQDataSet` 和 `TQAltDataSet` 提供了大量的數據欄位。要查詢所有可用的欄位，您可以查閱 TEJ 官方提供的 API 文件，或在 Jupyter Notebook 中使用以下方式進行探索：

```python
from zipline.pipeline.data import TQDataSet

# 列出 TQDataSet 中所有可用的欄位
available_fields = [field for field in dir(TQDataSet) if not field.startswith('_')]
print(available_fields)
```

---

## 總結

`TQDataSet` 和 `TQAltDataSet` 是 TQuant Lab 中連接 TEJ 數據寶庫的橋樑。它們讓量化研究者能夠超越傳統的價量數據，將深入的基本面分析和另類數據納入策略開發流程中。熟練運用這兩個資料集，將為您的量化策略帶來更強大的競爭優勢。
