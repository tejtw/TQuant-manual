
# 回測程式基本結構說明

以下為 Zipline 策略回測中常見的幾個主要函數與物件的簡要介紹：

## 1. `initialize(context)`
初始化策略設定，定義初始變數、股票池、排程等內容。
- **執行時機：** 回測一開始執行一次。
- **範例用途：** 指定資產、設定 rebalance 排程。

## 2. `handle_data(context, data)`
主要的交易邏輯處理函數，每個交易日都會執行。
- **執行時機：** 每個 market open 時執行。
- **範例用途：** 判斷是否下單、更新指標、執行買賣。

## 3. `before_trading_start(context, data)`
每日開盤前執行的邏輯，用來處理不依賴價格的邏輯。
- **執行時機：** 每個交易日開盤前。
- **範例用途：** 更新選股名單、儲存資料狀態。

## 4. `analyze(context, perf)`
回測結束後的分析函數。
- **執行時機：** 回測整體執行完畢後。
- **範例用途：** 輸出績效報表、繪製圖表、回顧績效。

## 5. `context`
Zipline 自動傳入的物件，用來儲存策略的狀態。
- **用途：** 儲存變數與狀態，如持股紀錄、參數設定等。

## 6. `run_algorithm(...)`
執行整體 Zipline 策略回測的主要函數。
- **用途：** 結合上述各函數並回傳回測報表與績效資料。


## Initialize 函式

`initialize` 為構建 zipline 交易策略的重要函式，會在回測開始前被呼叫一次，主要任務為設定回測環境，常見用於設定滑價或手續費。分別可以使用:

1. zipline.api.set_slippage

    設定滑價模式，zipline 共提供四種滑價計算方法，詳請請見後續教學-zipline slippage。
   
2. zipline.api.set_commission

    設定手續費模式，zipline 共提供三種手續費計算方法，詳請請見後續教學-zipline commission。

常見的寫法如下:
```
def initialize(context):
    set_slippage(slippage.FixedSlippage())
    set_commission(commission.PerShare(cost=0.00285))
```
除此之外，我們可以注意到 initialize 含有一個參數 __context__，__context__ 為一個命名空間 (namespace)，可以在儲存各種自定義之變數並且在每次交易日中循環呼叫。舉例來說，我們設置一個變數 (context.day = 0) 來計算交易日天數與一個變數 (context.has_ordered = False) 紀錄是否已經持有台積電股票。
```
def initialize(context):
    context.day = 0
    context.has_ordered = False
    set_slippage(slippage.FixedSlippage())
    set_commission(commission.PerShare(cost=0.00285))
```

```python
from zipline.api import set_slippage, set_commission
from zipline.finance import slippage, commission

def initialize(context):
    context.day = 0
    context.has_ordered = False
    set_slippage(slippage.FixedSlippage())
    set_commission(commission.PerShare(cost=0.00285))
```