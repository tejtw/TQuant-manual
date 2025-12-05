# 操作指南：如何設定手續費 (How-to: Set Commission)

## 目標

在進行任何實際的回測時，納入交易成本（如手續費、證交稅）是評估策略真實表現的關鍵一步。若忽略交易成本，會導致回測績效過於樂觀，從而產生誤判。

本指南將說明如何在 TQuant Lab (Zipline) 中使用 `set_commission` 函數，包含基礎設定以及針對台股特殊稅制（賣出才收稅、有低消）的進階自定義模型。

---

## 核心函數：`set_commission()`

`set_commission()` 是 Zipline 中用來定義交易費用的核心函數，它必須在 `initialize` 函數中被呼叫。

這個函數的主要參數是 `futures` 和 `equities`，您可以分別為這兩類資產傳入不同的費用模型物件。

```python
from zipline.api import set_commission
from zipline.finance import commission

def initialize(context):
    # 在此處呼叫 set_commission 函數
    # ...
```

---

## 情境一：設定期貨手續費 (基礎)

對於期貨交易，最常見的計費方式是**按口數 (Per Contract)** 收取固定費用。

- **模型**: `commission.PerContract()`
- **主要參數**:
    - `cost`: 每口單邊交易的手續費金額。
    - `exchange_fee`: 交易所費用，可選填。

#### 範例：

假設台指期貨每口單邊手續費為 200 元：

```python
# 在 initialize 函數中
from zipline.finance import commission

set_commission(futures=commission.PerContract(cost=200, exchange_fee=0))
```

這行程式碼會告訴回測引擎，每一次買入或賣出一口期貨，都要從帳戶中扣除 200 元的費用。

---

## 情境二：設定股票手續費 (基礎)

對於股票交易，若不考慮稅制差異，基礎計費方式是**按成交金額的百分比 (Per Dollar)** 收取。

- **模型**: `commission.PerDollar()`
- **主要參數**:
    - `cost`: 手續費佔成交金額的比例。例如，券商手續費為 0.1425%，則 `cost` 應設為 `0.001425`。

#### 範例：

假設股票交易手續費為成交金額的 0.1425%：

```python
# 在 initialize 函數中
from zipline.finance import commission

set_commission(equities=commission.PerDollar(cost=0.001425))
```

---

## 進階用法：自定義手續費模型 (Custom Commission Model)

### 為何需要自定義？

Zipline 內建的 `PerDollar` 模型假設買進與賣出的費率是相同的。然而，在**台股現貨**交易中，規則通常較為複雜：
1.  **證交稅**: 只有在**賣出**時才收取（通常為 0.3%）。
2.  **最低手續費**: 券商通常設有單筆最低手續費（例如 20 元）。

為了精確模擬這些規則，我們需要透過繼承 `CommissionModel` 來撰寫自己的費用邏輯。

### 實作步驟

1.  **定義類別**: 建立一個新類別並繼承 `zipline.finance.commission.CommissionModel`。
2.  **實作 `calculate` 方法**: 這是計算費用的核心，Zipline 會在每筆成交時呼叫此方法，並傳入訂單 (`order`) 與成交資訊 (`transaction`)。

### 範例程式碼：台股專用模型

以下範例展示了如何建立一個符合台股規則（含證交稅與低消）的模型。

```python
from zipline.api import set_commission
from zipline.finance.commission import CommissionModel

# 1. 定義自定義模型類別
class TaiwanStockCommission(CommissionModel):
    """
    客製化台股手續費模型：
    - 買進: 僅收手續費 (預設 0.1425%)
    - 賣出: 手續費 + 證交稅 (預設 0.3%)
    - 最低手續費: 預設 20 元 (針對手續費部分)
    """
    def __init__(self, cost=0.001425, tax=0.003, min_cost=20):
        self.cost = cost
        self.tax = tax
        self.min_cost = min_cost

    def calculate(self, order, transaction):
        """
        計算單筆成交的費用
        :param order: 訂單物件
        :param transaction: 成交資訊物件 (包含 amount, price)
        """
        # 計算成交金額 (取絕對值，因為賣出的 amount 為負數)
        trade_value = abs(transaction.amount * transaction.price)

        # A. 計算基礎手續費
        execution_cost = trade_value * self.cost

        # B. 處理最低手續費 (低消)
        if execution_cost < self.min_cost:
            execution_cost = self.min_cost

        # C. 判斷是否為賣出 (amount < 0 代表賣出)
        # 若是賣出，需額外加上證交稅 (證交稅沒有低消限制)
        if transaction.amount < 0:
            execution_cost += trade_value * self.tax

        return execution_cost

# 2. 在 initialize 中使用
def initialize(context):
    # 將股票的手續費模型設定為我們自定義的類別
    set_commission(equities=TaiwanStockCommission(cost=0.001425, tax=0.003))
    
    # 期貨仍可維持內建的固定費用模型
    # set_commission(futures=commission.PerContract(cost=200))
```

### 參數解說 (`transaction` 物件)

在 `calculate` 方法中，`transaction` 物件包含了該筆成交的關鍵資訊：
-   `transaction.amount`: 成交股數。**正數為買入，負數為賣出**。
-   `transaction.price`: 成交價格。

透過判斷 `transaction.amount` 的正負號，我們就能輕易區分買賣方向，並適用不同的稅率。

---

## 完整 `initialize` 整合範例

在一個同時交易股票和期貨的策略中，您可以同時設定兩者的手續費模型。

```python
from zipline.api import set_commission, set_slippage
from zipline.finance import commission, slippage

# (假設 TaiwanStockCommission 類別已定義在上方)

def initialize(context):
    # ... 其他設定 ...

    # 1. 設定期貨交易成本：每口固定 200 元
    set_commission(futures=commission.PerContract(cost=200))

    # 2. 設定股票交易成本：使用自定義台股模型 (買進手續費，賣出含稅)
    set_commission(equities=TaiwanStockCommission(cost=0.001425, tax=0.003))

    # 3. 設定滑價模型 (選用)
    # VolumeShareSlippage: 限制成交量不超過當日的 2.5%
    set_slippage(slippage.VolumeShareSlippage(volume_limit=0.025, price_impact=0.1))

    # ... 其他設定 ...
```

## 總結

- 在 `initialize` 函數中使用 `set_commission` 來定義交易成本。
- 期貨通常使用 `commission.PerContract` 按口計費。
- 股票若需精確模擬台股稅制（賣出收稅、買進不收），建議使用**繼承 `CommissionModel` 的自定義類別**。

準確地模擬交易成本，是讓您的回測結果更貼近真實市場表現的必要步驟。