# 期貨手續費與滑價設定

!!! info
    本指南說明如何在 TQuant Lab 中為期貨策略設定合理的交易成本，包含手續費 (Commission) 與滑價 (Slippage) 模型。

---

## 1. 概述

在進行期貨回測時，正確設定交易成本是確保回測結果貼近真實交易的關鍵。TQuant Lab 提供了專為期貨設計的成本模型：

- **手續費 (Commission)**：每次交易時支付給券商的費用
- **滑價 (Slippage)**：實際成交價格與預期價格之間的差異

---

## 2. 手續費設定

### 2.1 PerContract 模型

期貨手續費通常以「每口」計算，使用 PerContract 模型：

```python
from zipline.api import set_commission
from zipline.finance import commission

def initialize(context):
    # 設定期貨手續費：每口 200 元
    set_commission(futures=commission.PerContract(cost=200, exchange_fee=0))
```

**參數說明：**

| 參數 | 說明 | 範例 |
|------|------|------|
| cost | 每口手續費 (新台幣) | 200 |
| exchange_fee | 交易所費用 | 0 |

!!! tip "實務建議"
    台指期一般券商手續費約為每口 50~200 元，建議根據您的實際費率設定。

---

## 3. 滑價設定

### 3.1 FixedSlippage 模型

期貨滑價使用 FixedSlippage 模型，以固定點數計算：

```python
from zipline.api import set_slippage
from zipline.finance import slippage

def initialize(context):
    # 設定期貨滑價：每次成交滑價 6 點
    set_slippage(futures=slippage.FixedSlippage(spread=6))
```

**參數說明：**

| 參數 | 說明 | 範例 |
|------|------|------|
| spread | 買賣價差 (點數) | 6 |

!!! note "滑價影響"
    以台指期為例，每點價值約 200 元。若設定 `spread=6`，則每次成交會產生約 6 × 200 = 1,200 元的滑價成本。

---

## 4. 完整範例

```python
from zipline.api import (
    continuous_future, set_commission, set_slippage, set_benchmark, symbol
)
from zipline.finance import commission, slippage

def initialize(context):
    # 設定要交易的期貨
    context.future = continuous_future('TX', offset=0, roll='calendar', adjustment='add')
    
    # 設定手續費：每口 200 元
    set_commission(futures=commission.PerContract(cost=200, exchange_fee=0))
    
    # 設定滑價：每次成交滑價 6 點
    set_slippage(futures=slippage.FixedSlippage(spread=6))
    
    # 設定績效基準
    set_benchmark(symbol('IR0001'))
```

---

## 5. 現貨 vs 期貨成本模型比較

| 特性 | 現貨 | 期貨 |
|------|------|------|
| 手續費模型 | PerShare / PerDollar | PerContract |
| 滑價模型 | VolumeShareSlippage | FixedSlippage |
| 計算基礎 | 股數/金額 | 口數/點數 |

---

## 6. 延伸閱讀

- [建立你的第一個期貨策略](first-futures-strategy.md)
- [如何設定手續費模型](../how-to/backtest/set-commission.md)
- [如何設定滑價模型](../how-to/backtest/set-slippage.md)
