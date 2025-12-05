# 如何設定手續費模型

!!! info
    本頁提供如何在 Zipline 回測中設定手續費模型的詳細指南，包括 `set_commission()` 的使用方法、內建手續費模型類型和自定義手續費模型範例。

在量化回測中，交易成本（手續費與交易稅）是影響策略實際績效的關鍵因素。精確設定手續費模型，能夠使回測結果更貼近真實交易環境，從而避免對策略盈利能力的過度樂觀估計。

Zipline 提供了多種內建手續費模型，並允許您定義自定義模型以適應不同的交易規則。

---

## 1. set_commission() 函數概覽

`zipline.api.set_commission()` 函數用於在回測中設定交易的手續費模型。此函數通常在 `initialize` 函數中呼叫，並且可以針對股票 (equities) 和期貨 (futures) 分別設定不同的手續費規則。

```python
from zipline.api import set_commission
from zipline.finance import commission # 必須導入 commission 模組
```

*   `equities`: (CommissionModel) 股票交易的手續費模型。
*   `futures`: (CommissionModel) 期貨交易的手續費模型。

---

## 2. Zipline 內建手續費模型

Zipline 提供了以下幾種常用的內建手續費模型：

### 2.1. PerShare：**按股數計費**

`PerShare` 模型按照每股固定的費用計算手續費，並可設定每筆交易的最低手續費。

*   `cost`: 每股的費用。
*   `min_trade_cost`: 每筆交易的最低手續費。

```python
from zipline.api import set_commission
from zipline.finance import commission

def initialize(context):
    # 每股手續費 0.00285 元，每筆最低 20 元
    set_commission(equities=commission.PerShare(cost=0.00285, min_trade_cost=20))
```

### 2.2. PerTrade：**按筆數計費**

`PerTrade` 模型對每一筆交易收取固定的手續費，與交易的股數或金額無關。

*   `cost`: 每筆交易的固定費用。

```python
from zipline.api import set_commission
from zipline.finance import commission

def initialize(context):
    # 每筆交易固定收取 0.5 元手續費
    set_commission(equities=commission.PerTrade(cost=0.5))
```

### 2.3. PerDollar：**按交易金額比例計費**

`PerDollar` 模型按照交易總金額的百分比來計算手續費。這類似於證券商的交易手續費率。

*   `cost`: 交易金額的百分比（以小數表示，例如 0.0015 代表 0.15%）。

```python
from zipline.api import set_commission
from zipline.finance import commission

def initialize(context):
    # 按交易金額的 0.1% (0.001) 收取手續費
    set_commission(equities=commission.PerDollar(cost=0.001))
```

> 針對期貨交易，Zipline 也提供 `PerContract` 模型（按每手合約計費）。若要同時設定股票和期貨手續費，可將 `equities` 和 `futures` 參數一起使用。
>
> ```python
> from zipline.api import set_commission
> from zipline.finance import commission
>
> def initialize(context):
>     set_commission(
>         equities=commission.PerDollar(cost=0.003),  # 股票按金額 0.3%
>         futures=commission.PerContract(cost=200, exchange_fee=0) # 期貨每手 200 元
>     )
> ```

---

## 3. 自定義手續費模型：Custom_TW_Commission

TQuant Lab 為了符合台灣股票市場的交易慣例，內置了一個 `Custom_TW_Commission` 模型。這個模型允許您設定更貼近實際的手續費率、折扣和交易稅。

#### 參數
*   `min_trade_cost`: 每筆交易的最低手續費（台幣）。
*   `discount`: 手續費折扣，例如 `1.0` 代表無折扣，`0.6` 代表 6 折。
*   `tax`: 交易稅率，例如 `0.003` 代表 0.3%。

#### 範例
```python
from zipline.api import set_commission
from zipline.finance import commission

# 假設 Custom_TW_Commission 已在 zipline.finance.commission 中定義
# 或者您需要從其他路徑導入
# from tquant.custom_commission import Custom_TW_Commission # 實際路徑可能不同

def initialize(context):
    # 設定台灣股票專用手續費模型：
    # 每筆最低 20 元，無折扣，交易稅 0.3%
    set_commission(equities=commission.Custom_TW_Commission(
        min_trade_cost=20,
        discount=1.0,
        tax=0.003
    ))
```
