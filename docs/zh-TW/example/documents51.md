## Handle_data 函式
`handle_data` 為構建 zipline 交易策略的重要函式，會在回測開始後每天被呼叫，主要任務為設定交易策略、下單與紀錄交易資訊。

其中 `handle_data` 含有兩種參數 -- __context__ , __data__。__context__ 與上述 `initialize` 介紹功能相同，這裡為了記錄交易天數與否持有台積電股票，我們設定為:

```
def handle_data(context, data):
    
    # 每次交易日加 1 天。
    context.day += 1 
    
    # 判別是否持有台積電，請注意我們在 initialize 設定 context.has_ordered 為 False。
    if not context.has_ordered:
```

接著我們引入交易下單函式，下單函式共有六個不同種類，請見教材中以 zipline order 開頭之文件，這裡使用最基礎的下單函式:

### zipline.api.order

買進或賣出 n 股的資產標的。

#### Parameters:
* asset: _zipline.assets.Asset_
        欲下單之資產，請注意資料型態為 zipline 獨有的 Asset 型態。
* amount: _int_
        欲下單股數。
* limit_price: _float_, optional
        限價。
* stop_price: _float_, optional
        停價。

加入下單函式 order(symbol("2330")，其中 symbol("2330") 就是 zipline 中的 Asset 資料型態。之後，我們會將 context.has_ordered 調整成 True，此時下個交易日就不會再度下單，更改完程式如下:
```
def handle_data(context, data):
    
    context.day += 1 
    if not context.has_ordered:
        
        # 下單台積電股票一張 == 1000股
        order(symbol("2330", 1000)
        
        # 設定 context.has_ordered 為 True 以避免下次交易日下單
        context.has_ordered = True
```
最後為了記錄交易天數、是否持有部位與當日價格，我們使用 `record` 函式，其功能為記錄每個交易日的資訊並且在最終 `run_algorithm` 輸出的資料表中，以欄位型式加入所紀錄資訊。其程式編輯方式如下:
```
record( 欄位名稱 = 資訊)
```
這裡我們紀錄當天交易天數 (context.day)、是否持有部位 (context.has_ordered) 與當天收盤價格 (data.current(symbol("2330"), "close"))，其中上面所提到的 data 就是在 `handle_data` 中的 __data__，__data__ 主要功能為保存每天股價的價量資料並且提供呼叫，於本實例我們欲紀錄當天收盤價，於是用到 `data.current()` 函式。

### zipline.data.current

呼叫股票的當日價量資訊。

#### Parameters:
* assets: _zipline.asset.Asset_
        所欲呼叫的股票，請注意資料型態為 zipline 獨有的 Asset 型態。
* fields: _str_
        所欲呼叫的價量資訊，提供 'close', 'open', 'high', 'low' 與 'volume'。

由於我們希望記錄台積電當日收盤價格，因此程式編輯如下:
```
def handle_data(context, data):
    context.day += 1 
    if not context.has_ordered:
        order(symbol("2330", 1000)
        context.has_ordered = True
        
    record( # 紀錄用
        trade_days = context.day,
        has_ordered = context.has_ordered,
        TSMC = data.current(symbol("2330"), "close")
    )
```

```python
from zipline.api import order, record, symbol

def handle_data(context, data):
    context.day += 1
    if not context.has_ordered:
        order(symbol("2330"), 1000)
        context.has_ordered = True
        
    record(
        trade_days = context.day,
        has_ordered = context.has_ordered,
        TSMC = data.current(symbol("2330"), "close")
    )
```