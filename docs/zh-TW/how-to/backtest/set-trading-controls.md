# 如何設定交易限制

!!! info
    本頁提供如何在 Zipline 回測中設定交易限制的詳細指南，包括 `set_max_leverage()`、`set_max_position_size()` 和 `set_max_order_size()` 的使用方法，幫助您模擬真實世界的市場約束。

在量化回測中設定交易限制是至關重要的一環。這些限制有助於模擬真實世界的市場約束、管理策略風險，並確保回測結果更具可信度。Zipline 提供了多個 API 函數來實施這些交易控制。

---

## 1. set_max_leverage()：設定最大槓桿倍數

此函數用於限制您的投資組合在回測期間的最大槓桿倍數。如果投資組合的槓桿超過此設定，Zipline 將會終止回測並報錯。

 ** 參數 ** :

*   `max_leverage` (float)
    *   `max_leverage` 應為一個大於 0 的浮點數，表示允許的最大槓桿倍數。

```python
from zipline.api import set_max_leverage

def initialize(context):
    # 設定最大槓桿倍數為 3.0
    set_max_leverage(3.0)
```

!!! warning
    過高的槓桿可能會導致在市場波動時，投資組合價值迅速歸零。請根據您的風險承受能力審慎設定。

---

## 2. set_max_position_size()：設定 ** 單一資產最大部位限制 ** 

此函數用於限制單一資產在投資組合中的最大持有部位。這有助於分散風險，避免單一資產對整個投資組合產生過大的影響。

 ** 參數 ** :

*   `asset`: (Asset, 可選) 欲設定限制的資產物件。若為 `None`，則限制適用於所有資產。
*   `max_shares`: (int, 可選) 允許持有的最大股數。
*   `max_notional`: (float, 可選) 允許持有的最大市值 (美元)。
*   `on_error`: (str, 可選) 當限制被違反時的處理方式。選項包括 `'fail'` (終止回測)、`'log'` (記錄警告並繼續)、`'warn'` (發出警告並繼續)、`'ignore'` (忽略)。預設為 `'fail'`。

> `max_shares` 和 `max_notional` 至少必須設定其中一個。

```python
from zipline.api import set_max_position_size, symbol

def initialize(context):
    # 設定台泥 (1101) 的最大持有股數為 1050 股，違反時記錄警告
    set_max_position_size(asset=symbol('1101'), max_shares=1050, on_error='log')
    
    # 設定台積電 (2330) 的最大持有股數為 2000 股，且最大市值不超過 600,000 元，違反時記錄警告
    set_max_position_size(asset=symbol('2330'), max_shares=2000, max_notional=600000, on_error='log')
```

---

## 3. set_max_order_size()：設定 ** 單筆訂單最大數量限制 ** 

此函數用於限制單次下單的最大數量。這可以防止因意外或邏輯錯誤而下達過大的訂單，同時也能模擬市場深度不足的狀況。

 ** 參數 ** : 同 `set_max_position_size()` 的參數。

```python
from zipline.api import set_max_order_size, symbol

def initialize(context):
    # 設定台泥 (1101) 的單筆最大下單股數為 1000 股
    set_max_order_size(asset=symbol('1101'), max_shares=1000, on_error='log')

    # 設定台積電 (2330) 的單筆最大下單股數為 2000 股，且最大市值不超過 481,000 元
    set_max_order_size(asset=symbol('2330'), max_shares=2000, max_notional=481000, on_error='log')
```

> `max_notional` 是根據下單時的收盤價計算。因此，由於實際成交價與收盤價可能存在差異，最終成交的股數和金額仍可能微幅超出 `max_notional` 的限制。

---

## 4. set_min_order_size()：設定 ** 單筆訂單最小數量限制 ** 

[TODO: 內容缺失]

撰寫者註：
在 `TQuant-Lab` 專案的範例中，並未找到 `set_min_order_size` 函數的明確使用範例。
根據 [RULE-T1] (絕對真實性)，在沒有可驗證的參考資料前，無法撰寫此文件的技術內容。
此問題已記錄在 `_CURRENT_TASK.md` 中，等待審查者提供進一步的指引。