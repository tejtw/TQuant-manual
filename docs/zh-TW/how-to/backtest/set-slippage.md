# 如何設定滑價模型

!!! info
    本頁提供如何在 Zipline 回測中設定滑價模型的詳細指南，包括 `set_slippage()` 函數概覽、內建滑價模型類型和自定義滑價模型範例。

在量化回測中，滑價 (Slippage) 是指預期成交價格與實際成交價格之間的差異。由於市場波動、流動性不足或大額訂單的影響，訂單往往無法在預期的價格成交，由此產生的成本便是滑價。精確地模擬滑價對於回測結果的真實性至關重要。

Zipline 提供了多種內建滑價模型，並允許您定義自定義模型以反映不同市場條件下的滑價行為。

---

## 1. set_slippage() 函數概覽

`zipline.api.set_slippage()` 函數用於在回測中設定交易的滑價模型。此函數通常在 `initialize` 函數中呼叫，並且可以針對股票 (equities) 和期貨 (futures) 分別設定不同的滑價規則。

```python
from zipline.api import set_slippage
from zipline.finance import slippage # 必須導入 slippage 模組
```

*   `equities`: (SlippageModel) 股票交易的滑價模型。
*   `futures`: (SlippageModel) 期貨交易的滑價模型。

---

## 2. Zipline 內建滑價模型

Zipline 提供了以下幾種常用的內建滑價模型：

### 2.1. FixedSlippage：**固定滑價**

`FixedSlippage` 模型為每股/每單位交易設定一個固定的滑價金額 (`spread`)，與交易量無關。

*   `spread`: 每股/每單位交易的固定滑價金額。

```python
from zipline.api import set_slippage
from zipline.finance import slippage

def initialize(context):
    # 每股滑價 0.2 元
    set_slippage(equities=slippage.FixedSlippage(spread=0.2))

    # 如果希望沒有滑價，可以設定 spread=0.0
    # set_slippage(equities=slippage.FixedSlippage(spread=0.0))
```

### 2.2. VolumeShareSlippage：**基於交易量份額的滑價**

`VolumeShareSlippage` 模型根據您的交易量佔市場總成交量的比例來計算滑價，並可設定交易量限制及價格衝擊係數。

*   `volume_limit`: 您訂單佔當日總成交量的最大比例（例如 `0.025` 代表 2.5%）。超過此限制的交易會被拆分為多筆，並可能產生更大的滑價。
*   `price_impact`: 價格衝擊係數，表示交易量對價格的影響程度。

```python
from zipline.api import set_slippage
from zipline.finance import slippage

def initialize(context):
    # 限制每筆交易不超過當日總成交量的 2.5%，並設定價格衝擊
    set_slippage(equities=slippage.VolumeShareSlippage(volume_limit=0.025, price_impact=0.1))
```

### 2.3. NoSlippage：**無滑價**

如果您希望完全不考慮滑價對交易的影響，可以使用 `NoSlippage` 模型。這通常用於初步策略驗證，或在非常流動的市場中。

```python
from zipline.api import set_slippage
from zipline.finance import slippage

def initialize(context):
    # 完全禁用滑價
    set_slippage(equities=slippage.NoSlippage())
```

---

## 3. 自定義滑價模型：TW_Slippage

TQuant Lab 為了更好地模擬台灣市場的交易特性，內置了一個 `TW_Slippage` 模型。這個模型可能結合了固定價差和交易量限制的特性，以更貼近真實情境。

#### 參數
*   `spread`: 固定價差金額。
*   `volume_limit`: 交易量限制比例。

#### 範例
```python
from zipline.api import set_slippage
from zipline.finance import slippage

# 假設 TW_Slippage 已在 zipline.finance.slippage 中定義
# 或者您需要從其他路徑導入
# from tquant.custom_slippage import TW_Slippage # 實際路徑可能不同

def initialize(context):
    # 設定台灣股票專用滑價模型：固定價差 0.3 元，交易量限制 1%
    set_slippage(equities=slippage.TW_Slippage(
        spread=0.3,
        volume_limit=0.01
    ))
```