# 操作指南：如何設定滑價 (How-to: Set Slippage)

## 目標

滑價（Slippage）是指在金融市場中，最終成交價格與下單時預期價格之間的差異。這種差異可能由市場波動、流動性不足或訂單大小造成。在回測中模擬滑價，是讓策略績效更貼近真實市場狀況的關鍵步驟。

本指南將說明如何在 TQuant Lab 中使用 `set_slippage` 函數來為您的策略設定不同的滑價模型。

---

## 核心函數：`set_slippage()`

與 `set_commission` 類似，`set_slippage()` 函數也應該在 `initialize` 函數中被呼叫。它同樣可以針對 `futures` 和 `equities` 設定不同的滑價模型。

```python
from zipline.api import set_slippage
from zipline.finance import slippage

def initialize(context):
    # 在此處呼叫 set_slippage 函數
    # ...
```

---

## 情境一：設定期貨的固定滑價 (Fixed Slippage)

對於流動性較好的期貨市場，一個常見的簡化模型是假設每次交易都有一個固定的滑價成本。`FixedSlippage` 模型就是為此設計的。

- **模型**: `slippage.FixedSlippage()`
- **主要參數**:
    - `spread`: 設定一個固定的價差。Zipline 會將這個價差的一半應用於買單（成交價更高），另一半應用於賣單（成交價更低）。

#### 範例：

假設我們預期每次交易的總滑價成本為 6 點（tick）。這意味著買進時會比市價多付 3 點，賣出時會比市價少收 3 點。

```python
# 在 initialize 函數中

from zipline.finance import slippage

# 設定總價差為 6 點
set_slippage(futures=slippage.FixedSlippage(spread=6.0))
```

---

## 情境二：設定股票的成交量滑價 (Volume Share Slippage)

對於股票，特別是當交易量可能影響市場價格時，使用與成交量相關的滑價模型會更貼近真實。`VolumeShareSlippage` 會根據您的訂單佔當前 K 棒成交量的比例來模擬價格衝擊。

- **模型**: `slippage.VolumeShareSlippage()`
- **主要參數**:
    - `volume_limit`: 您的訂單成交量佔 K 棒總成交量的最大比例，預設為 0.1 (10%)。
    - `price_impact`: 價格衝擊係數，預設為 0.1。您的訂單量越大，對價格的影響就越大。

#### 範例：

```python
# 在 initialize 函數中

from zipline.finance import slippage

# 使用預設參數設定成交量滑價模型
set_slippage(equities=slippage.VolumeShareSlippage())
```

---

## 情境三：無滑價

在策略開發的初期階段，您可能希望在一個理想化的環境中測試核心邏輯，此時可以設定無滑價。

- **模型**: `slippage.NoSlippage()`

#### 範例：

```python
# 在 initialize 函數中

from zipline.finance import slippage

set_slippage(futures=slippage.NoSlippage())
```

---

## 總結

- 在 `initialize` 函數中使用 `set_slippage` 來定義滑價模型。
- **期貨**常用 `slippage.FixedSlippage` 來模擬固定的交易成本。
- **股票**可使用 `slippage.VolumeShareSlippage` 來模擬更真實的市場衝擊。
- 為了進行最嚴謹的回測，請務必為您的策略設定一個合理的滑價模型。
