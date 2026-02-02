# Zipline 下單函數參考

!!! info
    本頁詳細說明 Zipline 中的下單函數，包括 `order()`、`order_target()`、`order_percent()` 等的用途、參數和使用範例，幫助使用者將策略信號轉化為實際交易行為。

在 Zipline 回測中，下單是將策略信號轉化為實際交易行為的關鍵環節。Zipline 提供了多種下單函數，以應對不同策略邏輯和風險管理需求。這些函數主要產生 **市價單**，並在每個 `handle_data()` 呼叫的末尾進行撮合。

理解不同下單函數的特性，對於精確模擬策略行為和避免意外的交易結果至關重要。

---

## 1. 下單函數簡介

Zipline 的下單函數通常在 `handle_data()` 中被呼叫，它們會向回測引擎發送交易指令。Zipline 的核心設計是處理 **市價單**，即假設訂單會以當前市場價格成交。

Zipline 的下單函數可以分為兩大類：
*   **直接下單**: 根據指定的股數、百分比或金額直接發出買入或賣出訂單。
*   **目標下單**: 根據指定的目標股數、目標百分比或目標金額，由 Zipline 自動計算所需買賣的數量以達到目標。這種方式在策略需要再平衡或調整持倉時特別有用。

!!! note
    根據 Zipline 版本 2.1.0 的更新，`order_value()`、`order_target_value()`、`order_percent()` 和 `order_target_percent()` 函數在計算數量和目標金額時，會基於 **當前交易價格**（而非前一日的收盤價），這有助於更精確地模擬在多變市場條件下的交易。

---

## 2. zipline.api.order()：直接下單指定股數

`zipline.api.order()` 函數用於直接買入或賣出指定數量的股票。

*   **用途**: 直接下達買入 (`amount > 0`) 或賣出 (`amount < 0`) 指定股數的市價單。
*   **參數**:
    *   `asset`: (Asset) 欲交易的資產物件。
    *   `amount`: (int) 欲交易的股數。正數表示買入，負數表示賣出。

#### 範例
```python
from zipline.api import order, symbol

def handle_data(context, data):
    my_stock = symbol('2330')
    
    # 買入 1000 股台積電
    order(my_stock, 1000) 
    
    # 賣出 500 股台積電
    order(my_stock, -500)
```

---

## 3. zipline.api.order_target()：交易到目標股數

`zipline.api.order_target()` 函數會計算當前持股與目標股數之間的差額，然後下達相應的買賣訂單，使該資產的總持股數量達到指定的目標。

*   **用途**: 調整資產的持股數量到指定目標。
*   **參數**:
    *   `asset`: (Asset) 欲交易的資產物件。
    *   `target_amount`: (int) 該資產的目標總持股數量。

#### 範例
```python
from zipline.api import order_target, symbol

def handle_data(context, data):
    my_stock = symbol('2330')
    
    # 將台積電的持股數量調整到 2000 股
    order_target(my_stock, 2000)
    
    # 清空台積電的持股（將持股數量調整到 0）
    order_target(my_stock, 0)
```

---

## 4. zipline.api.order_percent()：按投資組合百分比下單

`zipline.api.order_percent()` 函數會計算當前投資組合總價值的一個百分比，然後將這個金額轉換為股數，並下達買賣訂單。

*   **用途**: 按投資組合總價值的一個百分比 (`percent`) 下單。
*   **參數**:
    *   `asset`: (Asset) 欲交易的資產物件。
    *   `percent`: (float) 佔投資組合總價值的百分比（以小數表示，例如 `0.1` 代表 10%）。正數為買入，負數為賣出。

#### 範例
```python
from zipline.api import order_percent, symbol

def handle_data(context, data):
    my_stock = symbol('2330')
    
    # 將投資組合總價值的 10% 用於買入台積電
    order_percent(my_stock, 0.1)
    
    # 賣出投資組合總價值的 5% 的台積電
    order_percent(my_stock, -0.05)
```

---

## 5. zipline.api.order_target_percent()：交易到目標投資組合百分比

`zipline.api.order_target_percent()` 函數會計算所需的交易量，使該資產在投資組合中的權重達到指定的目標百分比。這是最常用於再平衡策略的函數之一。

*   **用途**: 調整資產在投資組合中的權重到指定目標百分比。
*   **參數**:
    *   `asset`: (Asset) 欲交易的資產物件。
    *   `target_percent`: (float) 該資產在投資組合中的目標權重百分比。

#### 範例
```python
from zipline.api import order_target_percent, symbol

def handle_data(context, data):
    my_stock = symbol('2330')
    
    # 將台積電在投資組合中的權重調整到 50%
    order_target_percent(my_stock, 0.5)
    
    # 清空台積電的持股（將權重調整到 0%）
    order_target_percent(my_stock, 0.0)
```

---

## 6. zipline.api.order_value()：直接下單指定金額

`zipline.api.order_value()` 函數會計算購買或出售指定金額資產所需的股數，然後下達市價單。

*   **用途**: 直接下達買入 (`value > 0`) 或賣出 (`value < 0`) 指定金額的市價單。
*   **參數**:
    *   `asset`: (Asset) 欲交易的資產物件。
    *   `value`: (float) 欲交易的金額。正數表示買入，負數表示賣出。

#### 範例
```python
from zipline.api import order_value, symbol

def handle_data(context, data):
    my_stock = symbol('2330')
    
    # 買入價值 10,000 元的台積電
    order_value(my_stock, 10000)
    
    # 賣出價值 5,000 元的台積電
    order_value(my_stock, -5000)
```

---

## 7. zipline.api.order_target_value()：交易到目標金額

`zipline.api.order_target_value()` 函數會計算所需的交易量，使該資產的總市值達到指定的目標金額。

*   **用途**: 調整資產的總市值到指定目標。
*   **參數**:
    *   `asset`: (Asset) 欲交易的資產物件。
    *   `target_value`: (float) 該資產的目標總市值。

#### 範例
```python
from zipline.api import order_target_value, symbol

def handle_data(context, data):
    my_stock = symbol('2330')
    
    # 將台積電的持股市值調整到 50,000 元
    order_target_value(my_stock, 50000)
    
    # 清空台積電的持股（將市值調整到 0 元）
    order_target_value(my_stock, 0)
```