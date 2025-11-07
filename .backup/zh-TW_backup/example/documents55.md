# TSMC 買進持有策略

本次範例將以最經典的買進持有策略向您介紹 zipline 回測方法，並且介紹組建 zipline 交易策略最基礎的四大函式 - `initialize`、`handle_data`、`analyze`、`run_algorithm`。

## 導入股價資料

在 zipline 中，我們使用 `os` 搭配 `!zipline ingest` 將股價資料導入到本地端。常用寫法為: 
```
!zipline ingest -b tqant 
```
其中 `-b` 為 bundle 之涵義，bundle 為股票價量資訊的載體，`tquant` 則是 bundle 之名稱，可由使用者自定義。在 ingest 之前，需先使用 `os` 設定環境變數，以方便 zipline 接收使用者所欲抓取之資產標的與年份之要求。一般而言，針對環境變數之寫法如下:
```
os.environ['TEJAPI_BASE'] = "https://api.tej.com.tw" ==> 導航至 tej api 網域。
os.environ['TEJAPI_KEY'] = "your key" ==> 個人 api key 以驗證身分。
os.environ['mdate'] = "20170601 20230702" ==> 欲抓取資料之日期區間，前者為起始日，後者為終止日。
os.environ['ticker'] = '2330 2337' ==> 所欲抓取股票之代碼。
```


```python
import os 
os.environ['TEJAPI_BASE'] = "https://api.tej.com.tw"
os.environ['TEJAPI_KEY'] = "your key"
os.environ['mdate'] = "20170601 20230702"
os.environ['ticker'] = '2330 IR0001'
!zipline ingest -b tquant
```

    Merging daily equity files:


    [2023-08-09 05:09:50.565678] INFO: zipline.data.bundles.core: Ingesting tquant.


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

## Analyze 函式

`analyze` 主要用於回測後視覺化策略績效與風險，這裡我們以 `matplotlib` 繪製投組價值表與台積電股價走勢表。其中 `analyze` 有兩個參數 __context__ 與 __perf__，__context__ 就與上述相同，__perf__ 就是最終 `run_algorithm` 輸出的資料表 -- __results__。我們可以提取裡面特定欄位來繪製圖表。


```python
import matplotlib.pyplot as plt
def analyze(context, perf):
    ax1 = plt.subplot(211)
    perf.portfolio_value.plot(ax=ax1,title='portfolio values')
    ax2 = plt.subplot(212, sharex=ax1)
    perf['TSMC'].plot(ax=ax2,title='TSMC close')
    plt.gcf().set_size_inches(18, 8)
    plt.show()
```

## Run_algorithm 函式

### zipline.run_algorithm

進行策略回測。

#### Parameters:
* start: _pd.Timestamp_ or _datetime_
        回測起始日期。
* end: _pd.Timestamp_ or _datetime_
        回測結束日期。
* initialize: _callable_
        呼叫 initialize 函式以用於回測。
* capital_base: _int_
        初始資金額度。
* handle_data: _callable_, optional
        呼叫 handle_data 函式以用於回測。
* before_trading_start: _callable_, optional
        呼叫 before_trading_start 函式以用於回測。
* analyze: _callable_, optional
        呼叫 analyze 函式以用於回測。
* data_frequency: _{"daily", "minute"}_, optional
        設置交易頻率。
* bundle: _str_, optional
        設置回測用的 bundle。
* trading_calendar: _TradingCalendar_, optional
        設置交易日曆。
* benchmark_returns: _pd.Series_, optional
        設置指標報酬率。
* treasury_returns: _pd.Series_, optional
        設置無風險利率。

#### Returns:

   Perf: _pd.DataFrame_, 內建欄位有:
   
- benchmark_return：
    當日的benchmark報酬率，若是由`set_benchmark()`設定，則計算方式為(當日benchmark收盤價 / 前一日benchmark收盤價) - 1。
- benchmark_period_return：
    累積的benchmark日報酬率。計算方式：np.nancumprod(1 + `benchmark_return` Series) - 1。
- treasury_return：
    當日的treasury報酬率，直接由TEJ API提供。
- treasury_period_return：
    累積的treasury日報酬率。計算方式：np.nancumprod(1 + `treasury_return` Series) - 1。
- benchmark_volatility：
    benchmark日報酬率的年化波動率，至少需有兩期的報酬率才進行計算。計算方式：(`benchmark_return` Series).expanding(2).std(ddof=1) * np.sqrt(252)
        
- orders：顯示下單紀錄
    每一筆下單用一個字典的方式呈現，其中：
  - id：虛擬單號。
  - dt：下單時間。
  - reason：None, Hold, or Reject（目前不適用）
  - created：建立時間。
  - amount：
    - 下單股數。
    - 若>0表示買進或回補，<0表示賣出或放空。
    - 若有發股票股利或股票分割的情形，除權日當天會更新之前未成交訂單的amount（new_amount = old_amount / ratio，其中ratio = 1/僅除權調整係數）。
  - filled：成交股數。
    - 註：Order execution - 當演算法在某一天下單時，該訂單會在下一個交易日成交，以避免lookahead bias。   
    
  - commission：該筆交易傭金。
  - stop：停損價，若有發股票股利或股票分割的情形，除權日當天會更新之前未成交訂單的stop price（new_stop = old_stop * ratio，其中ratio = 1/僅除權調整係數）。
  - limit：限價價，若有發股票股利或股票分割的情形，除權日當天會更新之前未成交訂單的limit price（new_limit = old_limit * ratio，其中ratio = 1/僅除權調整係數）。
  - stop_reached：
    - 對於buy stop order，若現價>=stop price，則顯示True否則False。
    - 對於sell stop order，若現價<=stop price，則顯示True否則False。
  - limit_reached：
    - 對於buy limit order，若現價<=limit price，則顯示True否則False。
    - 對於sell limit order，若現價>=limit price，則顯示True否則False。
  - sid（asset）：下單的標的。
  - status：若=0表示OPEN（未完全成交），=1表示FILLED（完全成交），=2表示CANCEL（已取消）。


- transactions：顯示交易紀錄
  - amount：下單股數。
  - dt ： 交易時間。
  - price：成交價（為調整前收盤價，不調整股息、分割、股票股利）。
  - order_id：單號，可與orders中的id比對。
  - sid（asset）：下單的標的。
  - commission：一律為None。傭金資料已經在'orders'底下。
  
- positions：顯示持有部位
  - sid（asset）：下單的標的。
  - amount：該標的總持有股數。除權日當天amount會進行調整（old_amount / ratio = new_amount，其中ratio = 1/僅除權調整係數）。
  - last_sale_price：標的最近一筆的收盤價。
  - cost_basis：每股平均成本（含commissions）。
    - 計算方法為：sum(成交價 * (1+commission) * 股數) / 總股數
    - 除權日當天cost_basis會進行調整（old_cost_basis * ratio = new_cost_basis，其中ratio = 1/僅除權調整係數）。
    - 對於買進或回補來說，commissions會造成cost_basis增加；對於賣出或放空來說，commissions會造成cost_basis減少。
- longs_count：
  - 當日帳上有幾檔長部位股票。可與`positions`比較。
- shorts_count：
  - 當日帳上有幾檔短部位股票。可與`positions`比較。
- long_exposure（long_value）：
  - 當日帳上長部位的市值。
  - 可與`positions`比較。
  - 當投資標的為股票時`long_exposure`和`long_value`兩欄位數值一致。
  - 計算方式為sum(持有股數 * 收盤價) = sum(amount * last_sale_price)，where amount > 0。
- short_exposure（short_value）：
  - 當日帳上短部位的市值。
  - 可與`positions`比較。
  - 當投資標的為股票時`short_exposure`和`short_value`兩欄位數值一致。
  - 計算方式為sum(持有股數 * 收盤價) = sum(amount * last_sale_price)，where amount < 0。
  - short_exposure必然 <= 0。
- ending_exposure（ending_value）：
  - 當日結束時帳上部位的淨市值。
  - 計算方式：`long_exposure` + `short_exposure`
- starting_exposure（starting_value）：
  - 當日開始時帳上部位的淨市值。
  - 為前一日的`ending_exposure`。
- gross_leverage（leverage）：
  - Gross leverage is the sum of long and short leverage exposureper share divided by net asset value（portfolio_value）。
  - 計算方式：（`long_exposure` - `short_exposure`）／`portfolio_value`
- net_leverage：
  - Net leverage is the net leverage exposure per share divided by net asset value（portfolio_value）。
  - 計算方式：（`long_exposure` + `short_exposure`）／`portfolio_value`
- capital_used：
  - 當天的cash flow。>0表示流入，<0表示流出。
  - 計算方式：
    - -1 * sum(`transaction.price` * `transaction.amount`) - sum(`order.commission`) + sum(earn_dividends) + sum(leftover_cash)
  - 註：    
    1. earn_dividends：會於pay_date當天配發。
    2. leftover_cash：分割、股票股利等原因導致股數變動時，若有<1股(fractional_share_count)無法分配的情況時則返回現金。
    3. leftover_cash範例：
       - 若現在持有100股（amount），ratio=3。
       - 新的amount理論上是100/3=33.333，然而不滿一股的部分需轉換成現金 (return cash)。
       - 所以新的amount會是33，剩餘的0.333股（33.333-33）就是fractional_share_count。
       - 由於ratio=3代表該公司股數有發生變動，所以每股平均成本 (cost basis)需調整=原cost basis * 原amount / 新amount 後四捨五入到小數第二位。
       - 所以退回現金(return cash)=(fractional_share_count) * (新cost basis) 再四捨五入到小數第二位

- ending_cash：
  - 當日結束時帳上持有現金。
  - 計算方式：`starting_cash`+`capital_used`
- starting_cash：
  - 當日開始時帳上持有現金。
  - 為前一日的`ending_cash`+sum(earn_dividends)，若無前一日則為`capital_base`。
- pnl：
  - 當日投資組合損益。
  - 計算方式：(`ending_exposure` + `ending_cash`) - (`starting_exposure` + `starting_cash`)。
- returns：
  - 當日報酬率。
  - 計算方式：(當日`portfolio_value`) / (前一日`portfolio_value`) - 1。
  - 存在尾差。
- portfolio_value：
  - 即net asset value，當日投資組合總價值。
  - 計算方式：(`ending_exposure` + `ending_cash`)
- algorithm_period_return：
  - 投資組合累積日報酬率。
  - 計算方式：( 1 + 前一日的`algorithm_period_return`) * ( 1 + 當日`returns`) - 1。
  - 存在尾差。
- algo_volatility：
  - 投資組合日報酬率的年化波動率，至少需有兩期的報酬率才進行計算。
  - 利用empyrical套件計算：
    <br> empyrical.annual_volatility(`returns`Series, period='daily', alpha=2.0, annualization=None)。
  - 具體來說，empyrical套件的計算方式為：`returns`Series.std(ddof=1) * (252 ** (1 / 2))，std為樣本標準差。
  - 用完整`returns`資料，則會回傳最後一日algo_volatility，若扣掉最後一日`returns`，則回傳倒數第二日，以此類推。  
- excess_return：
  - 投資組合累積超額日報酬（相對於`benchmark_period_return`）。
  - 計算方式為：(`algorithm_period_return` - `benchmark_period_return`)。
- max_drawdown：
  - 投資組合累積報酬率從過去的峰值下跌的最大跌幅百分比。
  - 利用empyrical套件計算：empyrical.max_drawdown(`returns` Series)。
  - 具體來說，empyrical套件的計算方式為：
    - cumulative_returns：先計算過去每一日的累積報酬。
    - previous_peaks：計算過去累積報酬率的最大值。
    - daily_drawdown：計算每日回撤 = (cumulative_returns - previous_peaks) / previous_peaks
    - max_drawdown：過去每一日的daily_drawdown取極小值。
- sharpe：
  - 年化夏普比率，衡量每承擔1單位風險，可以獲取多少的報酬。
  - 利用empyrical套件計算：empyrical.sharpe_ratio(`returns` Series, risk_free=0)。
  - 具體來說，empyrical套件的計算方式為：
    <br>np.mean(`returns` Series) / np.std(`returns` Series,ddof=1) * np.sqrt(252)
- sortino：   
  - 年化索提諾比率，衡量承擔單位下方風險，可以獲取多少的報酬。
  - 利用empyrical套件計算：empyrical.sortino_ratio(`returns` Series, required_return=0)。
  - 具體來說，empyrical套件的計算方式為：
    - 計算downside_risk：np.sqrt(np.nanmean(np.square(downside_return))) * np.sqrt(252)，其中downside_return將`returns` Series中>0的數值替換成0。
    - 計算mean_return：np.nanmean(`returns` Series)
    - 計算sortino_ratio =  mean_return / downside_risk * 252。
  - 存在尾差。

- alpha：
  - 年化alpha，衡量投資組合創造超額報酬的能力。
  - 利用empyrical套件計算：empyrical.alpha_beta_aligned(returns=`returns`Series, factor_returns=`benchmark_return` Series,risk_free=0.0)
  - 具體來說，empyrical套件的計算方式為：
    - 計算alpha_series：`returns` Series - (當日`beta` * `benchmark_return` Series)
    - 計算平均alpha：nanmean(alpha_series)
    - 計算年化alpha：(平均alpha + 1) ^ 252 -1  
- beta：    
  - 衡量投資組合相對於整體市場的波動性。
  - 利用empyrical套件計算：empyrical.alpha_beta_aligned(returns=`returns`Series, factor_returns=`benchmark_return` Series,risk_free=0.0)
  - 具體來說，empyrical套件的計算方式為：
    <br>Cov(`benchmark_return` Series, `returns` Series) / Var(`benchmark_return` Series)


```python
from zipline import run_algorithm
import pandas as pd 

start_date = pd.Timestamp('2018-12-30',tz='utc')
end_date = pd.Timestamp('2023-05-26',tz='utc')

results = run_algorithm(start= start_date,  
                       end=end_date,
                       initialize=initialize,                       
                       capital_base=1e6,                       
                       analyze=analyze,
                       handle_data=handle_data,
                       data_frequency='daily',
                       bundle='tquant'
                       )
```








```python
results
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>period_open</th>
      <th>period_close</th>
      <th>short_value</th>
      <th>long_exposure</th>
      <th>benchmark_return</th>
      <th>treasury_return</th>
      <th>pnl</th>
      <th>short_exposure</th>
      <th>capital_used</th>
      <th>returns</th>
      <th>...</th>
      <th>treasury_period_return</th>
      <th>algorithm_period_return</th>
      <th>alpha</th>
      <th>beta</th>
      <th>sharpe</th>
      <th>sortino</th>
      <th>max_drawdown</th>
      <th>max_leverage</th>
      <th>trading_days</th>
      <th>period_label</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>2019-01-02 13:30:00+08:00</th>
      <td>2019-01-02 09:01:00+08:00</td>
      <td>2019-01-02 13:30:00+08:00</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.00</td>
      <td>0.0</td>
      <td>0.00</td>
      <td>0.000000</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.000000</td>
      <td>None</td>
      <td>None</td>
      <td>NaN</td>
      <td>NaN</td>
      <td>0.000000</td>
      <td>0.000000</td>
      <td>1</td>
      <td>2019-01</td>
    </tr>
    <tr>
      <th>2019-01-03 13:30:00+08:00</th>
      <td>2019-01-03 09:01:00+08:00</td>
      <td>2019-01-03 13:30:00+08:00</td>
      <td>0.0</td>
      <td>215500.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>-2.85</td>
      <td>0.0</td>
      <td>-215502.85</td>
      <td>-0.000003</td>
      <td>...</td>
      <td>0.0</td>
      <td>-0.000003</td>
      <td>None</td>
      <td>None</td>
      <td>-11.224972</td>
      <td>-11.224972</td>
      <td>-0.000003</td>
      <td>0.215501</td>
      <td>2</td>
      <td>2019-01</td>
    </tr>
    <tr>
      <th>2019-01-04 13:30:00+08:00</th>
      <td>2019-01-04 09:01:00+08:00</td>
      <td>2019-01-04 13:30:00+08:00</td>
      <td>0.0</td>
      <td>208000.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>-7500.00</td>
      <td>0.0</td>
      <td>0.00</td>
      <td>-0.007500</td>
      <td>...</td>
      <td>0.0</td>
      <td>-0.007503</td>
      <td>None</td>
      <td>None</td>
      <td>-9.170376</td>
      <td>-9.168633</td>
      <td>-0.007503</td>
      <td>0.215501</td>
      <td>3</td>
      <td>2019-01</td>
    </tr>
    <tr>
      <th>2019-01-07 13:30:00+08:00</th>
      <td>2019-01-07 09:01:00+08:00</td>
      <td>2019-01-07 13:30:00+08:00</td>
      <td>0.0</td>
      <td>213000.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>5000.00</td>
      <td>0.0</td>
      <td>0.00</td>
      <td>0.005038</td>
      <td>...</td>
      <td>0.0</td>
      <td>-0.002503</td>
      <td>None</td>
      <td>None</td>
      <td>-1.893153</td>
      <td>-2.608781</td>
      <td>-0.007503</td>
      <td>0.215501</td>
      <td>4</td>
      <td>2019-01</td>
    </tr>
    <tr>
      <th>2019-01-08 13:30:00+08:00</th>
      <td>2019-01-08 09:01:00+08:00</td>
      <td>2019-01-08 13:30:00+08:00</td>
      <td>0.0</td>
      <td>211000.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>-2000.00</td>
      <td>0.0</td>
      <td>0.00</td>
      <td>-0.002005</td>
      <td>...</td>
      <td>0.0</td>
      <td>-0.004503</td>
      <td>None</td>
      <td>None</td>
      <td>-3.141155</td>
      <td>-4.087705</td>
      <td>-0.007503</td>
      <td>0.215501</td>
      <td>5</td>
      <td>2019-01</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>2023-05-22 13:30:00+08:00</th>
      <td>2023-05-22 09:01:00+08:00</td>
      <td>2023-05-22 13:30:00+08:00</td>
      <td>0.0</td>
      <td>531000.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>-1000.00</td>
      <td>0.0</td>
      <td>0.00</td>
      <td>-0.000734</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.362247</td>
      <td>None</td>
      <td>None</td>
      <td>0.816172</td>
      <td>1.250657</td>
      <td>-0.202433</td>
      <td>0.455182</td>
      <td>1063</td>
      <td>2023-05</td>
    </tr>
    <tr>
      <th>2023-05-23 13:30:00+08:00</th>
      <td>2023-05-23 09:01:00+08:00</td>
      <td>2023-05-23 13:30:00+08:00</td>
      <td>0.0</td>
      <td>530000.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>-1000.00</td>
      <td>0.0</td>
      <td>0.00</td>
      <td>-0.000734</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.361247</td>
      <td>None</td>
      <td>None</td>
      <td>0.813954</td>
      <td>1.247253</td>
      <td>-0.202433</td>
      <td>0.455182</td>
      <td>1064</td>
      <td>2023-05</td>
    </tr>
    <tr>
      <th>2023-05-24 13:30:00+08:00</th>
      <td>2023-05-24 09:01:00+08:00</td>
      <td>2023-05-24 13:30:00+08:00</td>
      <td>0.0</td>
      <td>525000.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>-5000.00</td>
      <td>0.0</td>
      <td>0.00</td>
      <td>-0.003673</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.356247</td>
      <td>None</td>
      <td>None</td>
      <td>0.804283</td>
      <td>1.232180</td>
      <td>-0.202433</td>
      <td>0.455182</td>
      <td>1065</td>
      <td>2023-05</td>
    </tr>
    <tr>
      <th>2023-05-25 13:30:00+08:00</th>
      <td>2023-05-25 09:01:00+08:00</td>
      <td>2023-05-25 13:30:00+08:00</td>
      <td>0.0</td>
      <td>543000.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>18000.00</td>
      <td>0.0</td>
      <td>0.00</td>
      <td>0.013272</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.374247</td>
      <td>None</td>
      <td>None</td>
      <td>0.835019</td>
      <td>1.282067</td>
      <td>-0.202433</td>
      <td>0.455182</td>
      <td>1066</td>
      <td>2023-05</td>
    </tr>
    <tr>
      <th>2023-05-26 13:30:00+08:00</th>
      <td>2023-05-26 09:01:00+08:00</td>
      <td>2023-05-26 13:30:00+08:00</td>
      <td>0.0</td>
      <td>566000.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>23000.00</td>
      <td>0.0</td>
      <td>0.00</td>
      <td>0.016736</td>
      <td>...</td>
      <td>0.0</td>
      <td>0.397247</td>
      <td>None</td>
      <td>None</td>
      <td>0.873009</td>
      <td>1.345075</td>
      <td>-0.202433</td>
      <td>0.455182</td>
      <td>1067</td>
      <td>2023-05</td>
    </tr>
  </tbody>
</table>
<p>1067 rows × 42 columns</p>
</div>



我們可以發現之前使用 `order` 紀錄的 trade_days, has_ordered 與 TSMC 確實以欄位型式記錄在 __results__ 表中。 


```python
results[['trade_days','has_ordered','TSMC']]
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>trade_days</th>
      <th>has_ordered</th>
      <th>TSMC</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>2019-01-02 13:30:00+08:00</th>
      <td>1</td>
      <td>True</td>
      <td>219.5</td>
    </tr>
    <tr>
      <th>2019-01-03 13:30:00+08:00</th>
      <td>2</td>
      <td>True</td>
      <td>215.5</td>
    </tr>
    <tr>
      <th>2019-01-04 13:30:00+08:00</th>
      <td>3</td>
      <td>True</td>
      <td>208.0</td>
    </tr>
    <tr>
      <th>2019-01-07 13:30:00+08:00</th>
      <td>4</td>
      <td>True</td>
      <td>213.0</td>
    </tr>
    <tr>
      <th>2019-01-08 13:30:00+08:00</th>
      <td>5</td>
      <td>True</td>
      <td>211.0</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>2023-05-22 13:30:00+08:00</th>
      <td>1063</td>
      <td>True</td>
      <td>531.0</td>
    </tr>
    <tr>
      <th>2023-05-23 13:30:00+08:00</th>
      <td>1064</td>
      <td>True</td>
      <td>530.0</td>
    </tr>
    <tr>
      <th>2023-05-24 13:30:00+08:00</th>
      <td>1065</td>
      <td>True</td>
      <td>525.0</td>
    </tr>
    <tr>
      <th>2023-05-25 13:30:00+08:00</th>
      <td>1066</td>
      <td>True</td>
      <td>543.0</td>
    </tr>
    <tr>
      <th>2023-05-26 13:30:00+08:00</th>
      <td>1067</td>
      <td>True</td>
      <td>566.0</td>
    </tr>
  </tbody>
</table>
<p>1067 rows × 3 columns</p>
</div>




```python

```

## Run_algorithm 函式

### zipline.run_algorithm

進行策略回測。

#### Parameters:
* start: _pd.Timestamp_ or _datetime_
        回測起始日期。
* end: _pd.Timestamp_ or _datetime_
        回測結束日期。
* initialize: _callable_
        呼叫 initialize 函式以用於回測。
* capital_base: _int_
        初始資金額度。
* handle_data: _callable_, optional
        呼叫 handle_data 函式以用於回測。
* before_trading_start: _callable_, optional
        呼叫 before_trading_start 函式以用於回測。
* analyze: _callable_, optional
        呼叫 analyze 函式以用於回測。
* data_frequency: _{"daily", "minute"}_, optional
        設置交易頻率。
* bundle: _str_, optional
        設置回測用的 bundle。
* trading_calendar: _TradingCalendar_, optional
        設置交易日曆。
* benchmark_returns: _pd.Series_, optional
        設置指標報酬率。
* treasury_returns: _pd.Series_, optional
        設置無風險利率。

#### Returns:

   Perf: _pd.DataFrame_, 內建欄位有:
   
- benchmark_return：
    當日的benchmark報酬率，若是由`set_benchmark()`設定，則計算方式為(當日benchmark收盤價 / 前一日benchmark收盤價) - 1。
- benchmark_period_return：
    累積的benchmark日報酬率。計算方式：np.nancumprod(1 + `benchmark_return` Series) - 1。
- treasury_return：
    當日的treasury報酬率，直接由TEJ API提供。
- treasury_period_return：
    累積的treasury日報酬率。計算方式：np.nancumprod(1 + `treasury_return` Series) - 1。
- benchmark_volatility：
    benchmark日報酬率的年化波動率，至少需有兩期的報酬率才進行計算。計算方式：(`benchmark_return` Series).expanding(2).std(ddof=1) * np.sqrt(252)
        
- orders：顯示下單紀錄
    每一筆下單用一個字典的方式呈現，其中：
  - id：虛擬單號。
  - dt：下單時間。
  - reason：None, Hold, or Reject（目前不適用）
  - created：建立時間。
  - amount：
    - 下單股數。
    - 若>0表示買進或回補，<0表示賣出或放空。
    - 若有發股票股利或股票分割的情形，除權日當天會更新之前未成交訂單的amount（new_amount = old_amount / ratio，其中ratio = 1/僅除權調整係數）。
  - filled：成交股數。
    - 註：Order execution - 當演算法在某一天下單時，該訂單會在下一個交易日成交，以避免lookahead bias。   
    
  - commission：該筆交易傭金。
  - stop：停損價，若有發股票股利或股票分割的情形，除權日當天會更新之前未成交訂單的stop price（new_stop = old_stop * ratio，其中ratio = 1/僅除權調整係數）。
  - limit：限價價，若有發股票股利或股票分割的情形，除權日當天會更新之前未成交訂單的limit price（new_limit = old_limit * ratio，其中ratio = 1/僅除權調整係數）。
  - stop_reached：
    - 對於buy stop order，若現價>=stop price，則顯示True否則False。
    - 對於sell stop order，若現價<=stop price，則顯示True否則False。
  - limit_reached：
    - 對於buy limit order，若現價<=limit price，則顯示True否則False。
    - 對於sell limit order，若現價>=limit price，則顯示True否則False。
  - sid（asset）：下單的標的。
  - status：若=0表示OPEN（未完全成交），=1表示FILLED（完全成交），=2表示CANCEL（已取消）。
  
  
- transactions：顯示交易紀錄
  - amount：下單股數。
  - dt ： 交易時間。
  - price：成交價（為調整前收盤價，不調整股息、分割、股票股利）。
  - order_id：單號，可與orders中的id比對。
  - sid（asset）：下單的標的。
  - commission：一律為None。傭金資料已經在'orders'底下。
  
- positions：顯示持有部位
  - sid（asset）：下單的標的。
  - amount：該標的總持有股數。除權日當天amount會進行調整（old_amount / ratio = new_amount，其中ratio = 1/僅除權調整係數）。
  - last_sale_price：標的最近一筆的收盤價。
  - cost_basis：每股平均成本（含commissions）。
    - 計算方法為：sum(成交價 * (1+commission) * 股數) / 總股數
    - 除權日當天cost_basis會進行調整（old_cost_basis * ratio = new_cost_basis，其中ratio = 1/僅除權調整係數）。
    - 對於買進或回補來說，commissions會造成cost_basis增加；對於賣出或放空來說，commissions會造成cost_basis減少。
- longs_count：
  - 當日帳上有幾檔長部位股票。可與`positions`比較。
- shorts_count：
  - 當日帳上有幾檔短部位股票。可與`positions`比較。
- long_exposure（long_value）：
  - 當日帳上長部位的市值。
  - 可與`positions`比較。
  - 當投資標的為股票時`long_exposure`和`long_value`兩欄位數值一致。
  - 計算方式為sum(持有股數 * 收盤價) = sum(amount * last_sale_price)，where amount > 0。
- short_exposure（short_value）：
  - 當日帳上短部位的市值。
  - 可與`positions`比較。
  - 當投資標的為股票時`short_exposure`和`short_value`兩欄位數值一致。
  - 計算方式為sum(持有股數 * 收盤價) = sum(amount * last_sale_price)，where amount < 0。
  - short_exposure必然 <= 0。
- ending_exposure（ending_value）：
  - 當日結束時帳上部位的淨市值。
  - 計算方式：`long_exposure` + `short_exposure`
- starting_exposure（starting_value）：
  - 當日開始時帳上部位的淨市值。
  - 為前一日的`ending_exposure`。
- gross_leverage（leverage）：
  - Gross leverage is the sum of long and short leverage exposure per share divided by net asset value（portfolio_value）。
  - 計算方式：（`long_exposure` - `short_exposure`）／`portfolio_value`
- net_leverage：
  - Net leverage is the net leverage exposure per share divided by net asset value（portfolio_value）。
  - 計算方式：（`long_exposure` + `short_exposure`）／`portfolio_value`
- capital_used：
  - 當天的cash flow。>0表示流入，<0表示流出。
  - 計算方式：
    - -1 * sum(`transaction.price` * `transaction.amount`) - sum(`order.commission`) + sum(earn_dividends) + sum(leftover_cash)
  - 註：    
    1. earn_dividends：會於pay_date當天配發。
    2. leftover_cash：分割、股票股利等原因導致股數變動時，若有<1股(fractional_share_count)無法分配的情況時則返回現金。
    3. leftover_cash範例：
       - 若現在持有100股（amount），ratio=3。
       - 新的amount理論上是100/3=33.333，然而不滿一股的部分需轉換成現金 (return cash)。
       - 所以新的amount會是33，剩餘的0.333股（33.333-33）就是fractional_share_count。
       - 由於ratio=3代表該公司股數有發生變動，所以每股平均成本 (cost basis)需調整=原cost basis * 原amount / 新amount 後四捨五入到小數第二位。
       - 所以退回現金(return cash)=(fractional_share_count) * (新cost basis) 再四捨五入到小數第二位

- ending_cash：
  - 當日結束時帳上持有現金。
  - 計算方式：`starting_cash`+`capital_used`
- starting_cash：
  - 當日開始時帳上持有現金。
  - 為前一日的`ending_cash`+sum(earn_dividends)，若無前一日則為`capital_base`。
- pnl：
  - 當日投資組合損益。
  - 計算方式：(`ending_exposure` + `ending_cash`) - (`starting_exposure` + `starting_cash`)。
- returns：
  - 當日報酬率。
  - 計算方式：(當日`portfolio_value`) / (前一日`portfolio_value`) - 1。
  - 存在尾差。
- portfolio_value：
  - 即net asset value，當日投資組合總價值。
  - 計算方式：(`ending_exposure` + `ending_cash`)
- algorithm_period_return：
  - 投資組合累積日報酬率。
  - 計算方式：( 1 + 前一日的`algorithm_period_return`) * ( 1 + 當日`returns`) - 1。
  - 存在尾差。
- algo_volatility：
  - 投資組合日報酬率的年化波動率，至少需有兩期的報酬率才進行計算。
  - 利用empyrical套件計算：
    <br> empyrical.annual_volatility(`returns`Series, period='daily', alpha=2.0, annualization=None)。
  - 具體來說，empyrical套件的計算方式為：`returns`Series.std(ddof=1) * (252 ** (1 / 2))，std為樣本標準差。
  - 用完整`returns`資料，則會回傳最後一日algo_volatility，若扣掉最後一日`returns`，則回傳倒數第二日，以此類推。  
- excess_return：
  - 投資組合累積超額日報酬（相對於`benchmark_period_return`）。
  - 計算方式為：(`algorithm_period_return` - `benchmark_period_return`)。
- max_drawdown：
  - 投資組合累積報酬率從過去的峰值下跌的最大跌幅百分比。
  - 利用empyrical套件計算：empyrical.max_drawdown(`returns` Series)。
  - 具體來說，empyrical套件的計算方式為：
    - cumulative_returns：先計算過去每一日的累積報酬。
    - previous_peaks：計算過去累積報酬率的最大值。
    - daily_drawdown：計算每日回撤 = (cumulative_returns - previous_peaks) / previous_peaks
    - max_drawdown：過去每一日的daily_drawdown取極小值。
- sharpe：
  - 年化夏普比率，衡量每承擔1單位風險，可以獲取多少的報酬。
  - 利用empyrical套件計算：empyrical.sharpe_ratio(`returns` Series, risk_free=0)。
  - 具體來說，empyrical套件的計算方式為：
    <br>np.mean(`returns` Series) / np.std(`returns` Series,ddof=1) * np.sqrt(252)
- sortino：   
  - 年化索提諾比率，衡量承擔單位下方風險，可以獲取多少的報酬。
  - 利用empyrical套件計算：empyrical.sortino_ratio(`returns` Series, required_return=0)。
  - 具體來說，empyrical套件的計算方式為：
    - 計算downside_risk：np.sqrt(np.nanmean(np.square(downside_return))) * np.sqrt(252)，其中downside_return將`returns` Series中>0的數值替換成0。
    - 計算mean_return：np.nanmean(`returns` Series)
    - 計算sortino_ratio =  mean_return / downside_risk * 252。
  - 存在尾差。

- alpha：
  - 年化alpha，衡量投資組合創造超額報酬的能力。
  - 利用empyrical套件計算：empyrical.alpha_beta_aligned(returns=`returns`Series, factor_returns=`benchmark_return` Series,risk_free=0.0)
  - 具體來說，empyrical套件的計算方式為：
    - 計算alpha_series：`returns` Series - (當日`beta` * `benchmark_return` Series)
    - 計算平均alpha：nanmean(alpha_series)
    - 計算年化alpha：(平均alpha + 1) ^ 252 -1  
- beta：    
  - 衡量投資組合相對於整體市場的波動性。
  - 利用empyrical套件計算：empyrical.alpha_beta_aligned(returns=`returns`Series, factor_returns=`benchmark_return` Series,risk_free=0.0)
  - 具體來說，empyrical套件的計算方式為：
    <br>Cov(`benchmark_return` Series, `returns` Series) / Var(`benchmark_return` Series)

```python
from zipline import run_algorithm
import pandas as pd 

start_date = pd.Timestamp('2018-12-30',tz='utc')
end_date = pd.Timestamp('2023-05-26',tz='utc')

results = run_algorithm(start= start_date,  
                       end=end_date,
                       initialize=initialize,                       
                       capital_base=1e6,                       
                       analyze=analyze,
                       handle_data=handle_data,
                       data_frequency='daily',
                       bundle='tquant'
                       )
```

```python
results
```

我們可以發現之前使用 `order` 紀錄的 trade_days, has_ordered 與 TSMC 確實以欄位型式記錄在 __results__ 表中。 

```python
results[['trade_days','has_ordered','TSMC']]
```

```python

```
## Run_algorithm 函式

### zipline.run_algorithm

進行策略回測。

#### Parameters:
* start: _pd.Timestamp_ or _datetime_
        回測起始日期。
* end: _pd.Timestamp_ or _datetime_
        回測結束日期。
* initialize: _callable_
        呼叫 initialize 函式以用於回測。
* capital_base: _int_
        初始資金額度。
* handle_data: _callable_, optional
        呼叫 handle_data 函式以用於回測。
* before_trading_start: _callable_, optional
        呼叫 before_trading_start 函式以用於回測。
* analyze: _callable_, optional
        呼叫 analyze 函式以用於回測。
* data_frequency: _{"daily", "minute"}_, optional
        設置交易頻率。
* bundle: _str_, optional
        設置回測用的 bundle。
* trading_calendar: _TradingCalendar_, optional
        設置交易日曆。
* benchmark_returns: _pd.Series_, optional
        設置指標報酬率。
* treasury_returns: _pd.Series_, optional
        設置無風險利率。

#### Returns:

   Perf: _pd.DataFrame_, 內建欄位有:
   
- benchmark_return：
    當日的benchmark報酬率，若是由`set_benchmark()`設定，則計算方式為(當日benchmark收盤價 / 前一日benchmark收盤價) - 1。
- benchmark_period_return：
    累積的benchmark日報酬率。計算方式：np.nancumprod(1 + `benchmark_return` Series) - 1。
- treasury_return：
    當日的treasury報酬率，直接由TEJ API提供。
- treasury_period_return：
    累積的treasury日報酬率。計算方式：np.nancumprod(1 + `treasury_return` Series) - 1。
- benchmark_volatility：
    benchmark日報酬率的年化波動率，至少需有兩期的報酬率才進行計算。計算方式：(`benchmark_return` Series).expanding(2).std(ddof=1) * np.sqrt(252)
        
- orders：顯示下單紀錄
    每一筆下單用一個字典的方式呈現，其中：
  - id：虛擬單號。
  - dt：下單時間。
  - reason：None, Hold, or Reject（目前不適用）
  - created：建立時間。
  - amount：
    - 下單股數。
    - 若>0表示買進或回補，<0表示賣出或放空。
    - 若有發股票股利或股票分割的情形，除權日當天會更新之前未成交訂單的amount（new_amount = old_amount / ratio，其中ratio = 1/僅除權調整係數）。
  - filled：成交股數。
    - 註：Order execution - 當演算法在某一天下單時，該訂單會在下一個交易日成交，以避免lookahead bias。   
    
  - commission：該筆交易傭金。
  - stop：停損價，若有發股票股利或股票分割的情形，除權日當天會更新之前未成交訂單的stop price（new_stop = old_stop * ratio，其中ratio = 1/僅除權調整係數）。
  - limit：限價價，若有發股票股利或股票分割的情形，除權日當天會更新之前未成交訂單的limit price（new_limit = old_limit * ratio，其中ratio = 1/僅除權調整係數）。
  - stop_reached：
    - 對於buy stop order，若現價>=stop price，則顯示True否則False。
    - 對於sell stop order，若現價<=stop price，則顯示True否則False。
  - limit_reached：
    - 對於buy limit order，若現價<=limit price，則顯示True否則False。
    - 對於sell limit order，若現價>=limit price，則顯示True否則False。
  - sid（asset）：下單的標的。
  - status：若=0表示OPEN（未完全成交），=1表示FILLED（完全成交），=2表示CANCEL（已取消）。
  
  
- transactions：顯示交易紀錄
  - amount：下單股數。
  - dt ： 交易時間。
  - price：成交價（為調整前收盤價，不調整股息、分割、股票股利）。
  - order_id：單號，可與orders中的id比對。
  - sid（asset）：下單的標的。
  - commission：一律為None。傭金資料已經在'orders'底下。
  
- positions：顯示持有部位
  - sid（asset）：下單的標的。
  - amount：該標的總持有股數。除權日當天amount會進行調整（old_amount / ratio = new_amount，其中ratio = 1/僅除權調整係數）。
  - last_sale_price：標的最近一筆的收盤價。
  - cost_basis：每股平均成本（含commissions）。
    - 計算方法為：sum(成交價 * (1+commission) * 股數) / 總股數
    - 除權日當天cost_basis會進行調整（old_cost_basis * ratio = new_cost_basis，其中ratio = 1/僅除權調整係數）。
    - 對於買進或回補來說，commissions會造成cost_basis增加；對於賣出或放空來說，commissions會造成cost_basis減少。
- longs_count：
  - 當日帳上有幾檔長部位股票。可與`positions`比較。
- shorts_count：
  - 當日帳上有幾檔短部位股票。可與`positions`比較。
- long_exposure（long_value）：
  - 當日帳上長部位的市值。
  - 可與`positions`比較。
  - 當投資標的為股票時`long_exposure`和`long_value`兩欄位數值一致。
  - 計算方式為sum(持有股數 * 收盤價) = sum(amount * last_sale_price)，where amount > 0。
- short_exposure（short_value）：
  - 當日帳上短部位的市值。
  - 可與`positions`比較。
  - 當投資標的為股票時`short_exposure`和`short_value`兩欄位數值一致。
  - 計算方式為sum(持有股數 * 收盤價) = sum(amount * last_sale_price)，where amount < 0。
  - short_exposure必然 <= 0。
- ending_exposure（ending_value）：
  - 當日結束時帳上部位的淨市值。
  - 計算方式：`long_exposure` + `short_exposure`
- starting_exposure（starting_value）：
  - 當日開始時帳上部位的淨市值。
  - 為前一日的`ending_exposure`。
- gross_leverage（leverage）：
  - Gross leverage is the sum of long and short leverage exposure per share divided by net asset value（portfolio_value）。
  - 計算方式：（`long_exposure` - `short_exposure`）／`portfolio_value`
- net_leverage：
  - Net leverage is the net leverage exposure per share divided by net asset value（portfolio_value）。
  - 計算方式：（`long_exposure` + `short_exposure`）／`portfolio_value`
- capital_used：
  - 當天的cash flow。>0表示流入，<0表示流出。
  - 計算方式：
    - -1 * sum(`transaction.price` * `transaction.amount`) - sum(`order.commission`) + sum(earn_dividends) + sum(leftover_cash)
  - 註：    
    1. earn_dividends：會於pay_date當天配發。
    2. leftover_cash：分割、股票股利等原因導致股數變動時，若有<1股(fractional_share_count)無法分配的情況時則返回現金。
    3. leftover_cash範例：
       - 若現在持有100股（amount），ratio=3。
       - 新的amount理論上是100/3=33.333，然而不滿一股的部分需轉換成現金 (return cash)。
       - 所以新的amount會是33，剩餘的0.333股（33.333-33）就是fractional_share_count。
       - 由於ratio=3代表該公司股數有發生變動，所以每股平均成本 (cost basis)需調整=原cost basis * 原amount / 新amount 後四捨五入到小數第二位。
       - 所以退回現金(return cash)=(fractional_share_count) * (新cost basis) 再四捨五入到小數第二位

- ending_cash：
  - 當日結束時帳上持有現金。
  - 計算方式：`starting_cash`+`capital_used`
- starting_cash：
  - 當日開始時帳上持有現金。
  - 為前一日的`ending_cash`+sum(earn_dividends)，若無前一日則為`capital_base`。
- pnl：
  - 當日投資組合損益。
  - 計算方式：(`ending_exposure` + `ending_cash`) - (`starting_exposure` + `starting_cash`)。
- returns：
  - 當日報酬率。
  - 計算方式：(當日`portfolio_value`) / (前一日`portfolio_value`) - 1。
  - 存在尾差。
- portfolio_value：
  - 即net asset value，當日投資組合總價值。
  - 計算方式：(`ending_exposure` + `ending_cash`)
- algorithm_period_return：
  - 投資組合累積日報酬率。
  - 計算方式：( 1 + 前一日的`algorithm_period_return`) * ( 1 + 當日`returns`) - 1。
  - 存在尾差。
- algo_volatility：
  - 投資組合日報酬率的年化波動率，至少需有兩期的報酬率才進行計算。
  - 利用empyrical套件計算：
    <br> empyrical.annual_volatility(`returns`Series, period='daily', alpha=2.0, annualization=None)。
  - 具體來說，empyrical套件的計算方式為：`returns`Series.std(ddof=1) * (252 ** (1 / 2))，std為樣本標準差。
  - 用完整`returns`資料，則會回傳最後一日algo_volatility，若扣掉最後一日`returns`，則回傳倒數第二日，以此類推。  
- excess_return：
  - 投資組合累積超額日報酬（相對於`benchmark_period_return`）。
  - 計算方式為：(`algorithm_period_return` - `benchmark_period_return`)。
- max_drawdown：
  - 投資組合累積報酬率從過去的峰值下跌的最大跌幅百分比。
  - 利用empyrical套件計算：empyrical.max_drawdown(`returns` Series)。
  - 具體來說，empyrical套件的計算方式為：
    - cumulative_returns：先計算過去每一日的累積報酬。
    - previous_peaks：計算過去累積報酬率的最大值。
    - daily_drawdown：計算每日回撤 = (cumulative_returns - previous_peaks) / previous_peaks
    - max_drawdown：過去每一日的daily_drawdown取極小值。
- sharpe：
  - 年化夏普比率，衡量每承擔1單位風險，可以獲取多少的報酬。
  - 利用empyrical套件計算：empyrical.sharpe_ratio(`returns` Series, risk_free=0)。
  - 具體來說，empyrical套件的計算方式為：
    <br>np.mean(`returns` Series) / np.std(`returns` Series,ddof=1) * np.sqrt(252)
- sortino：   
  - 年化索提諾比率，衡量承擔單位下方風險，可以獲取多少的報酬。
  - 利用empyrical套件計算：empyrical.sortino_ratio(`returns` Series, required_return=0)。
  - 具體來說，empyrical套件的計算方式為：
    - 計算downside_risk：np.sqrt(np.nanmean(np.square(downside_return))) * np.sqrt(252)，其中downside_return將`returns` Series中>0的數值替換成0。
    - 計算mean_return：np.nanmean(`returns` Series)
    - 計算sortino_ratio =  mean_return / downside_risk * 252。
  - 存在尾差。

- alpha：
  - 年化alpha，衡量投資組合創造超額報酬的能力。
  - 利用empyrical套件計算：empyrical.alpha_beta_aligned(returns=`returns`Series, factor_returns=`benchmark_return` Series,risk_free=0.0)
  - 具體來說，empyrical套件的計算方式為：
    - 計算alpha_series：`returns` Series - (當日`beta` * `benchmark_return` Series)
    - 計算平均alpha：nanmean(alpha_series)
    - 計算年化alpha：(平均alpha + 1) ^ 252 -1  
- beta：    
  - 衡量投資組合相對於整體市場的波動性。
  - 利用empyrical套件計算：empyrical.alpha_beta_aligned(returns=`returns`Series, factor_returns=`benchmark_return` Series,risk_free=0.0)
  - 具體來說，empyrical套件的計算方式為：
    <br>Cov(`benchmark_return` Series, `returns` Series) / Var(`benchmark_return` Series)

```python
from zipline import run_algorithm
import pandas as pd 

start_date = pd.Timestamp('2018-12-30',tz='utc')
end_date = pd.Timestamp('2023-05-26',tz='utc')

results = run_algorithm(start= start_date,  
                       end=end_date,
                       initialize=initialize,                       
                       capital_base=1e6,                       
                       analyze=analyze,
                       handle_data=handle_data,
                       data_frequency='daily',
                       bundle='tquant'
                       )
```

```python
results
```

我們可以發現之前使用 `order` 紀錄的 trade_days, has_ordered 與 TSMC 確實以欄位型式記錄在 __results__ 表中。 

```python
results[['trade_days','has_ordered','TSMC']]
```

```python

```

---

# Target Percent Pipeline Algorithm

利用pipeline提供的買賣清單與持股權重進行定期再平衡的演算法。

<span id="menu"></span>
本文件包含以下部份：

**基本設定**
1. [Set Environment Variables](#Env)
2. [Investment Universe](#Universe)
3. [Ingest](#Ingest)
4. [Imports](#Imports)
5. [Pipeline](#Pipeline)

**參數說明與範例**

6. [API Reference](#APIReference)：參數說明。
   - [class zipline.algo.pipeline_algo.TargetPercentPipeAlgo](#APIReference)
   - [class zipline.api.date_rules](#date_rules)


7. [Examples](#Examples)：範例。
   - [Case 1－調整start_session與end_session](#Case1)
   - [Case 2－調整max_leverage](#Case2)
   - [Case 3－調整tradeday](#Case3)
   - [Case 4－調整rebalance_date_rule](#Case4)
   - [Case 5－調整slippage_model](#Case5)
   - [Case 6－調整stocklist](#Case6)
   - [Case 7－調整order_filling_policy](#Case7)
   - [Case 8－調整allow_short](#Case8)
   - [Case 9－調整cancel_datedelta](#Case9)   
   - [Case 10－調整limit_buy_multiplier](#Case10)  
   - [Case 11－調整custom_weight、analyze、record_vars、get_record_vars與get_transaction_detail](#Case11)   

<span id="Env"></span>
# 1. Set Environment Variables
[Return to Menu](#menu)

```python
import pandas as pd
import datetime
import tejapi
import os

# set tej_key and base
os.environ['TEJAPI_KEY'] = "your key" 
os.environ['TEJAPI_BASE'] = "https://api.tej.com.tw"

# set benchmark
benchmark=['IR0001']

# set calendar
calendar_name='TEJ_XTAI'

# set bundle name
bundle_name = 'tquant'

# set date
start='2023-06-01'
end='2023-10-03'

# 由文字型態轉為Timestamp，供回測使用
tz = 'UTC'
start_dt, end_dt = pd.Timestamp(start, tz = tz), pd.Timestamp(end, tz = tz)

# 設定os.environ['mdate'] = start+' '+end，供ingest bundle使用
os.environ['mdate'] = start+' '+end
```

<span id="Universe"></span>
# 2. Investment Universe

台灣50指數成分股

[Return to Menu](#menu)

```python
from zipline.sources.TEJ_Api_Data import get_universe

StockList = get_universe(start, end, idx_id='IX0002')

print(len(StockList))
```

```python
os.environ['ticker'] = ' '.join(StockList + benchmark)
```

```python
os.environ['ticker']
```

<span id="Ingest"></span>
# 3. Ingest
[Return to Menu](#menu)

```python
# Ingest pricing bundle
!zipline ingest -b tquant
```

```python
from zipline.data.data_portal import get_bundle_price

df_bundle_price = get_bundle_price(bundle_name=bundle_name,
                                   calendar_name=calendar_name,
                                   start_dt=start_dt,
                                   end_dt=end_dt)
```

<span id="Imports"></span>
# 4. Imports & Settings
[Return to Menu](#menu)

```python
import warnings
warnings.filterwarnings('ignore')
```

```python
from time import time
import numpy as np
import pandas as pd
import empyrical as ep

from logbook import Logger, StderrHandler, INFO, WARNING
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator


from TejToolAPI.TejToolAPI import *

from zipline.api import record

from zipline.utils.calendar_utils import get_calendar
from zipline.utils.run_algo import  (get_transaction_detail,
                                     get_record_vars)

from zipline.pipeline import Pipeline, CustomFactor
from zipline.pipeline.filters import SingleAsset
from zipline.pipeline.factors import RSI
from zipline.pipeline.data import TQAltDataSet

from zipline.finance import slippage

from zipline.TQresearch.tej_pipeline import run_pipeline

# 設定log顯示方式
log_handler = StderrHandler(format_string='[{record.time:%Y-%m-%d %H:%M:%S.%f}]: ' +
                            '{record.level_name}: {record.func_name}: {record.message}',
                            level=INFO)
log_handler.push_application()
log = Logger('Algorithm')
```

```python
import warnings
warnings.filterwarnings('ignore')
```

<span id="Pipeline"></span>
# 5. Pipeline

取得`Market_Cap_Dollars`（市值）資料

[Return to Menu](#menu)

```python
col = ['Market_Cap_Dollars']

fields = ''
for i in col:
    fields += i
    fields += ' '

os.environ['fields'] = fields
```

```python
# Ingest Fundamental Bundle
!zipline ingest -b fundamentals
```

<span id="APIReference"></span>
# 6. API Reference
[Return to Menu](#menu)

### **class zipline.algo.pipeline_algo.<font color=DeepPink>TargetPercentPipeAlgo</font>** 
*(self, bundle_name='tquant', start_session=None, end_session=None, trading_calendar=get_calendar('TEJ_XTAI'),*

*capital_base=1e7, data_frequency='daily', tradeday=None, rebalance_date_rule=None, stocklist=None, benchmark='IR0001',* 

*zero_treasury_returns=True, slippage_model=slippage.VolumeShareSlippage(volume_limit=0.025, price_impact=0.1),*

*commission_model=commission.Custom_TW_Commission(min_trade_cost=20, discount = 1.0, tax = 0.003), max_leverage=0.8,* 

*limit_buy_multiplier=None, limit_sell_multiplier=None, allow_short=False, cancel_datedelta=None, custom_weight=False,*

*custom_loader=None, pipeline=None, analyze=None, record_vars=None, get_record_vars=False, get_transaction_detail=False,*

*order_filling_policy='next_bar')*

利用pipeline提供的買賣清單與持股權重進行定期再平衡的演算法。必要參數僅有`pipeline`。


#### Parameters:

- **bundle_name** (*str, optional*)－bundle名稱。預設是 **`'tquant'`**。  


- **start_session** (*pd.Timestamp or datetime, optional*)－回測起始日期。預設是**bundle中最早的資料日期**。  


- **end_session** (*pd.Timestamp or datetime, optional*)－回測結束日期。預設是**bundle中最晚的資料日期**。  


- **trading_calendar** (*TradingCalendar, optional*)－
  - 設置交易日曆。預設是 **`get_calendar('TEJ_XTAI')`**。
  - TradingCalendar：`zipline.utils.calendar_utils.TradingCalendar`。  


- **capital_base** (*float, optional*)－初始資金額度。預設是**一千萬**。  


- **data_frequency** (*{'daily', 'minute'}, optional*)－資料頻率，目前僅支援日頻率 **`'daily'`**。  


- **tradeday** (*list[str] or list[pd.Timestamp] or pd.DatetimeIndex, optional*)－
  - 交易日期清單，限制只能在這個清單中的日期進行交易。預設是**None**，代表**每日**都交易。
  - `rebalance_date_rule`與`tradeday`請擇一設定，若兩者皆設定，則會以`rebalance_date_rule`為主。  


- **rebalance_date_rule**(*EventRule, optional*)－
  - 交易頻率，設定固定的交易頻率。預設是**None**，代表**每日**都交易。
  - `rebalance_date_rule`與`tradeday`請擇一設定，若兩者皆設定，則會以`rebalance_date_rule`為主。
  - EventRule：`zipline.utils.events.EventRule`。可使用的`rebalance_date_rule`參考[zipline.api.date_rules](#date_rules)。  


- **stocklist** (*list[str], optional*)－交易清單，限制只能交易這個清單中的股票。預設是**None**，代表使用所有bundle中的股票。  


- **benchmark** (*str, optional*)－指數名稱，用來與投資組合報酬率比較。預設是`'IR0001'`，代表**台灣發行量加權股價報酬指數**。  


- **zero_treasury_returns** (*bool, optional*)－
  - 是否將無風險利率設定為0，預設是**True**，代表設定為0。因此使用`algo.run()`產出的回測報表中，`treasury_return`與`treasury_period_return`皆會是0。
  - 若設定為**False**，則會<font color=DeepPink>耗費額外API流量</font>，並取得第一銀行一年期定存利率作為無風險利率。  


- **slippage_model** (*SlippageModel, optional*)－
  - 設定滑價模型。預設為`slippage.VolumeShareSlippage(volume_limit=0.025, price_impact=0.1)`。可使用的模型參考：[lecture/Zipline Slippage.ipynb](https://github.com/tejtw/TQuant-Lab/blob/main/lecture/Zipline%20Slippage.ipynb)
  - SlippageModel：`zipline.finance.slippage.SlippageModel`。


- **commission_model** (*CommissionModel, optional*)－
  - 設定手續費模型。預設為`commission.Custom_TW_Commission(min_trade_cost=20, discount=1.0, tax = 0.003)`。可使用的模型參考：[lecture/Zipline Commission Models.ipynb](https://github.com/tejtw/TQuant-Lab/blob/main/lecture/Zipline%20Commission%20Models.ipynb)
  - CommissionModel：`zipline.finance.commission.CommissionModel`


- **max_leverage** (*float, optional*)－槓桿限制，預設 = **0.8**。  


- **limit_buy_multiplier** (*float, optional*)－
  - 買進／回補時的limit_price乘數，若有提供則limit_price = 下單時最近一筆收盤價 * `limit_buy_multiplier`。
  - 預設為**None**，代表**不設定**買進／回補時的limit_price。  


- **limit_sell_multiplier** (*float, optional*)－
  - 賣出／放空時的limit_price乘數，若有提供則limit_price = 下單時最近一筆收盤價 * `limit_sell_multiplier`。
  - 預設為**None**，代表**不設定**賣出／放空時的limit_price。  


- **allow_short** (*bool, optional*)－是否允許放空股票，預設為**False**，代表僅能做多。若設定為**True**，則pipeline中需要有`shorts`欄位。  


- **cancel_datedelta** (*int, optional*)－訂單幾天內未完全成交就取消。預設是在**下一次再平衡**時取消。 


- **custom_weight** (*bool, optional*)－
  - 是否要使用自訂的加權權數，預設為**False**，代表不使用（即等權重加權）。
  - 若設定為**True**，則pipeline中需要有`long_weights`（若`allow_short`=True，則也須有`short_weights`）欄位。


- **custom_loader** (*PipelineLoader , optional*)－
  - 用來取得價量以外資料，預設是**None**，代表不使用價量、`TQDataSet`與`TQAltDataSet`以外資料。
  - TQDataSet：`zipline.pipeline.data.TQDataSet`
  - TQAltDataSet：`zipline.pipeline.data.TQAltDataSet`
  - 目前支援的`PipelineLoader`：
    - DataFrameLoader（`zipline.pipeline.loaders.frame.DataFrameLoader`）。


- **pipeline** (*Pipeline*)－
  - 要用來產出交易清單或權重的pipeline，為<font color=DeepPink>**必要參數**</font>。
  - Pipeline：`zipline.pipeline.Pipeline`


- **analyze** (*callable[(context, pd.DataFrame) -> None], optional*)－
  - 傳入`analyze`函式以用於回測，函式中必須要有`context`與`perf`參數，預設是**None**。
  - 此函式在**回測結束**時被一次性呼叫，並繪製自訂圖表。


- **record_vars** (*callable[(context, BarData) -> None], optional*)－
  - 傳入`record_vars`函式以用於回測，函式中必須要有`context`與`data`參數，預設是**None**。
  - 此函式在**每個交易日結束**時被呼叫，並把指定資料紀錄於回測結果的DataFrame中。


- **get_record_vars** (*bool, optional*)－
  - 是否產出`record_vars`中`record`方法所記錄的變數，預設為**False**，代表不產出。
  - 若設定為**True**，則可用`algo.dict_record_vars`取出。


- **get_transaction_detail** (*bool, optional*)－
  - 是否產出交易結果，預設為**False**，代表不產出。
  - 若設定為**True**，則可用`algo.positions`、`algo.transactions`、`algo.orders`方式取出交易結果。


- **order_filling_policy** (*{'next_bar','current_bar'}, optional*)－
  - 設定交易方式，預設為**next_bar**，代表當天收盤後下單，隔一日收盤前成交，也就是原先的回測方式。
  - 若要當天開盤前下單，收盤前成交，則需指定設定為**current_bar**。

  
#### Returns:
    algo

#### Return type:
    zipline.algo.pipeline_algo.TargetPercentPipeAlgo


<br>




<br/>

**<font color=DeepPink>run</font>()**
>
> 執行演算法
> 
> **Returns:**
> - perf（回測報表）
> 
> **Return type:**
> - pd.DataFrame

<span id="date_rules"></span>
### **class zipline.api.<font color=DeepPink>date_rules</font>**
[Return to Menu](#menu)

- 為Factory API，主要用來傳入`zipline.api.schedule_function`的`date_rule`參數中。用來決定要以何種頻率觸發某項規則。
- 使用前請先import：`from zipline.api import date_rules`。
---

*static* **<font color=DeepPink>every_day</font>**()
> 
> 每日觸發某項規則。
> 
> **Returns:**
> - rule
> 
> **Return type:**
> - zipline.utils.events.EventRule

<br>

*static* **<font color=DeepPink>month_end</font>**(days_offset=0)
> 
> 每個月底觸發某項規則，並可以選擇性的新增一個偏移量。
> 
> **Parameters:**
> - **days_offset**(*int , optional*)：
>   - 在月底之前的第幾個交易日（由0開始計算）觸發某項規則。預設值是0，即在月底的最後一個交易日觸發。
>   - days_offset只能介於0~22之間。 
> 
> **Returns:**
> - rule
> 
> **Return type:**
> - zipline.utils.events.EventRule


<br>

*static* **<font color=DeepPink>month_start</font>**(days_offset=0)
> 
> 每個月初觸發某項規則，並可以選擇性的新增一個偏移量。
> 
> **Parameters:**
> - **days_offset**(*int , optional*)：
>   - 在月初之後的第幾個交易日（由0開始計算）才觸發某項規則。預設值是0，即在月初的第一個交易日觸發。
>   - days_offset只能介於0~22之間。 
> 
> **Returns:**
> - rule
> 
> **Return type:**
> - zipline.utils.events.EventRule


<br>

*static* **<font color=DeepPink>week_end</font>**(days_offset=0)
> 
> 在每周最後一個交易日觸發某項規則，並可以選擇性的新增一個偏移量。
> 
> **Parameters:**
> - **days_offset**(*int , optional*)：
>   - 在每周倒數第幾個交易日（由0開始計算）觸發某項規則。預設值是0，即在每周的最後一個交易日觸發。
>   - days_offset只能介於0~4之間。 
>
> **Returns:**
> - rule
> 
> **Return type:**
> - zipline.utils.events.EventRule


<br>

*static* **<font color=DeepPink>week_start</font>**(days_offset=0)
> 
> 在每周的第一個交易日觸發某項規則，並可以選擇性的新增一個偏移量。
> 
> **Parameters:**
> - **days_offset**(*int , optional*)：
>   - 在每周的第幾個交易日（由0開始計算）才觸發某項規則。預設值是0，即在每周的第一個交易日觸發。
>   - days_offset只能介於0~4之間。
> 
> **Returns:**
> - rule
> 
> **Return type:**
> - zipline.utils.events.EventRule

<span id="Examples"></span>
# 7. Examples
[Return to Menu](#menu)

```python
from zipline.utils.algo_instance import get_algo_instance, set_algo_instance
from zipline.algo.pipeline_algo import TargetPercentPipeAlgo
```

<span id="Case1"></span>
## Case 1 調整start_session與end_session

[Return to Menu](#menu)

僅調整`start_session`與`end_session`。其餘保持預設值。

以下設定pipeline（`make_pipeline()`），並定義`longs`欄位用來判斷須持有的股票。在`longs`欄位中要持有的股票標記為True，反之標記為False。

```python
from zipline.data import bundles

bundle = bundles.load(bundle_name)

def make_pipeline():
    rsi = RSI()
    longs = rsi.top(2, mask = ~SingleAsset(bundle.asset_finder.lookup_symbol('IR0001', as_of_date=None)))

    return Pipeline(
        
        columns = {
            "longs" : longs,
        }
    )
```

```python
algo_start = '2023-09-21'
algo_start_dt = pd.Timestamp(algo_start, tz = tz)

result = run_pipeline(make_pipeline(), algo_start, end)
result.query('longs == True')
```

### 執行演算法
1. 實體化`TargetPercentPipeAlgo`並命名為`algo`。
2. 設定演算法：`set_algo_instance(algo)`
3. 執行演算法，並產出回測報表`stats`（*pd.DataFrame*）：`stats = algo.run()`

```python
algo = TargetPercentPipeAlgo(
                     start_session=algo_start_dt,
                     end_session=end_dt,
                     pipeline=make_pipeline,
)

# set_algo_instance
set_algo_instance(algo)

# run
stats = algo.run()
```

查看演算法中的參數設定

```python
algo
```

```python
stats.T
```

```python
positions, transactions, orders = get_transaction_detail(stats)
```

```python
transactions
```

```python
positions['mv'] = positions['amount'] * positions['last_sale_price']
positions
```

```python
stats.net_leverage
```

<span id="Case2"></span>
## Case 2 調整max_leverage
[Return to Menu](#menu)

接續**Case 1**，多調整`max_leverage=0.70`，其餘與**Case 1**相同。

```python
algo = TargetPercentPipeAlgo(
                     start_session=algo_start_dt,
                     end_session=end_dt,
                     max_leverage=0.70,
                     pipeline=make_pipeline,
)

# set_algo_instance
set_algo_instance(algo)

# run
stats = algo.run()
```

```python
stats.net_leverage
```

<span id="Case3"></span>
## Case 3 調整tradeday
[Return to Menu](#menu)  

接續**Case 1**，多新增`tradeday`，其餘與**Case 1**相同。

```python
# 設定再平衡日期
freq = 'MS'   # QS-JUL  MS W
_tradeday = list(pd.date_range(start=start_dt, end=end_dt, freq=freq))
tradeday = [get_calendar(calendar_name).next_open(pd.Timestamp(i)).strftime('%Y-%m-%d') if \
           get_calendar(calendar_name).is_session(i)==False else i.strftime('%Y-%m-%d') for i in _tradeday]
tradeday
```

```python
algo_start_dt
```

```python
algo = TargetPercentPipeAlgo(
                     start_session=algo_start_dt,
                     end_session=end_dt,           
                     tradeday=tradeday,
                     pipeline=make_pipeline,
)

# set_algo_instance
set_algo_instance(algo)

# run
stats = algo.run()
```

```python
positions, transactions, orders = get_transaction_detail(stats)
```

```python
transactions
```

<span id="Case4"></span>
## Case 4 調整rebalance_date_rule
[Return to Menu](#menu)  

接續**Case 1**，多新增`rebalance_date_rule`，並修改`start_session`為2023-09-01，其餘與**Case 1**相同。

```python
from zipline.api import date_rules

algo = TargetPercentPipeAlgo(
                     start_session=pd.Timestamp('2023-09-01', tz='UTC'),
                     end_session=end_dt,
                     pipeline=make_pipeline,
                     # 每月的第四個交易日下單
                     rebalance_date_rule=date_rules.month_start(days_offset=3) 
)

# set_algo_instance
set_algo_instance(algo)

# run
stats = algo.run()
```

```python
positions, transactions, orders = get_transaction_detail(stats)
```

```python
orders
```

<span id="Case5"></span>
## Case 5 調整slippage_model
[Return to Menu](#menu)  

接續**Case 1**，多新增`slippage_model`，將`volume_limit`由**0.025**調整為**0.01**，其餘與**Case 1**相同。

```python
algo = TargetPercentPipeAlgo(
                     start_session=algo_start_dt,
                     end_session=end_dt,
                     pipeline=make_pipeline,
                     slippage_model=slippage.VolumeShareSlippage(volume_limit=0.01, price_impact=0.1)
)

# set_algo_instance
set_algo_instance(algo)

# run
stats = algo.run()
```

```python
positions, transactions, orders = get_transaction_detail(stats)
```

```python
orders.query('(symbol == "1590") & (created.dt.strftime("%Y-%m-%d") == "2023-09-25")')
```

```python
# 321000 * 1% = 3210(股) 

df_bundle_price.query('(symbol == "1590") & (date.dt.strftime("%Y-%m-%d") == "2023-09-26")')[['symbol','date','volume']]
```

```python
orders.query('(symbol == "2885") & (created.dt.strftime("%Y-%m-%d") == "2023-09-27")')
```

```python
# 10738000 * 1% = 107380(股) 

df_bundle_price.query('(symbol == "2885") & (date.dt.strftime("%Y-%m-%d") == "2023-09-28")')[['symbol','date','volume']]
```

<span id="Case6"></span>
## Case 6 調整stocklist
[Return to Menu](#menu)  


接續**Case 1**，多新增`stocklist`，其餘與**Case 1**相同。  



註1：`stocklist`限制是在pipeline執行完後。  

註2：也可以使用pipeline直接限制股票池。

```python
len(StockList)
```

```python
_StockList = [i for i in StockList if i!='2886']
len(_StockList)
```

```python
algo = TargetPercentPipeAlgo(
                     start_session=algo_start_dt,
                     end_session=end_dt,            
                     stocklist=_StockList,
                     pipeline=make_pipeline,
)

# set_algo_instance
set_algo_instance(algo)

# run
stats = algo.run()
```

```python
positions, transactions, orders = get_transaction_detail(stats)
```

```python
positions
```

<span id="Case7"></span>
## Case 7 調整order_filling_policy
[Return to Menu](#menu) 

接續**Case 1**，多新增`order_filling_policy='current_bar'`，其餘與**Case 1**相同。

```python
algo = TargetPercentPipeAlgo(
                     start_session=algo_start_dt,
                     end_session=end_dt,
                     pipeline=make_pipeline,
                     order_filling_policy='current_bar'
)

# set_algo_instance
set_algo_instance(algo)

# run
stats = algo.run()
```

```python
positions, transactions, orders = get_transaction_detail(stats)
```

```python
result.loc['2023-09-22'].query('longs == True')
```

```python
# 從`orders`中可以發現created=2023-09-22的單在當天就成交（status由0變為1）
orders.loc['2023-09-22']
```

<span id="Case8"></span>
## Case 8 調整allow_short
[Return to Menu](#menu) 

接續**Case 1**，多新增`allow_short=True`，其餘與**Case 1**相同。  


以下設定pipeline（`make_pipeline()`），並定義`shorts`欄位用來判斷須放空的股票。在`shorts`欄位中要放空的股票標記為True，反之標記為False。

```python
def make_pipeline():
    rsi = RSI()
    longs = rsi.top(2, mask = ~SingleAsset(bundle.asset_finder.lookup_symbol('IR0001', as_of_date=None)))
    shorts = rsi.bottom(2, mask = ~SingleAsset(bundle.asset_finder.lookup_symbol('IR0001', as_of_date=None)))

    return Pipeline(
        columns = {
            "longs" : longs,
            "shorts" : shorts
        }
    )
```

```python
result = run_pipeline(make_pipeline(), algo_start, end)
result.query('(longs == True) | (shorts == True)' )
```

```python
algo = TargetPercentPipeAlgo(
                     start_session=algo_start_dt,
                     end_session=end_dt,
                     allow_short=True,
                     pipeline=make_pipeline,
)

# set_algo_instance
set_algo_instance(algo)

# run
stats = algo.run()
```

```python
positions, transactions, orders = get_transaction_detail(stats)
```

```python
# 當天取消
orders.query('(symbol == "2912") & (created.dt.strftime("%Y-%m-%d") == "2023-09-28")')
```

```python
# 343000 * 2.5% = 8575(股) 

df_bundle_price.query('(symbol == "2912") & (date.dt.strftime("%Y-%m-%d") == "2023-10-02")')[['symbol','date','volume']]
```

```python
positions['mv'] = positions['amount'] * positions['last_sale_price']
positions.query('(symbol == "2912")')
```

<span id="Case9"></span>
## Case 9 調整cancel_datedelta
[Return to Menu](#menu) 

接續**Case 8**，多新增`cancel_datedelta=2`，其餘與**Case 8**相同。  

```python
algo = TargetPercentPipeAlgo(
                     start_session=algo_start_dt,
                     end_session=end_dt,
                     allow_short=True,
                     cancel_datedelta=2,
                     pipeline=make_pipeline,
)

# set_algo_instance
set_algo_instance(algo)

# run
stats = algo.run()
```

```python
result = run_pipeline(make_pipeline(), algo_start, end)
result.query('(longs == True) | (shorts == True)' )
```

```python
positions, transactions, orders = get_transaction_detail(stats)
```

```python
orders.query('(symbol == "2912") & (created.dt.strftime("%Y-%m-%d") == "2023-09-28")')
```

```python
# 10/02：343000 * 2.5% = 8575(股) 
# 10/03：808000 * 2.5% = 20200(股) 

df_bundle_price.query('(symbol == "2912") & (date.dt.strftime("%Y-%m-%d")>="2023-10-02")')\
                 [['symbol','date','volume']]
```

```python
positions['mv'] = positions['amount'] * positions['last_sale_price']
positions.query('(symbol == "2912")')
```

<span id="Case10"></span>
## Case 10 調整limit_buy_multiplier
[Return to Menu](#menu) 

接續**Case 9**，多設定`limit_buy_multiplier=1.015`，其餘與**Case 9**相同。

```python
result = run_pipeline(make_pipeline(), algo_start, end)
result.query('(longs == True) | (shorts == True)' )
```

```python
algo = TargetPercentPipeAlgo(
                     start_session=algo_start_dt,
                     end_session=end_dt,
                     limit_buy_multiplier=1.015,
                     allow_short=True,
                     cancel_datedelta=2,
                     pipeline=make_pipeline,
)

# set_algo_instance
set_algo_instance(algo)

# run
stats = algo.run()
```

```python
positions, transactions, orders = get_transaction_detail(stats)
```

```python
orders
```

```python
orders.query('(symbol == "1590") & (created.dt.strftime("%Y-%m-%d") == "2023-09-28")')
```

```python
# 9/28 979 * 1.015 = 993.685
df_bundle_price.query('(symbol == "1590") & (date.dt.strftime("%Y-%m-%d")>="2023-09-28")')\
                 [['symbol','date','close']]
```

<span id="Case11"></span>
## Case 11 調整custom_weight、analyze、record_vars、get_record_vars與get_transaction_detail
[Return to Menu](#menu) 

接續**Case 10**，多設定`custom_weight`=True、`analyze`、`record_vars`、`get_record_vars`=True與`get_transaction_detail`=True，其餘與**Case 10**相同。

```python
class Weight(CustomFactor):
    
    inputs =  [TQAltDataSet.Market_Cap_Dollars] 
    outputs = ["Market_Cap_Dollars","Sum_Market_Cap_Dollars","Weight"]   
    window_length = 1

    def compute(self, today, assets, out, Market_Cap_Dollars):
        
        out.Market_Cap_Dollars[:] = Market_Cap_Dollars
        out.Sum_Market_Cap_Dollars[:] = np.nansum(Market_Cap_Dollars, axis=1)
        out.Weight[:] = Market_Cap_Dollars / np.sum(Market_Cap_Dollars, axis=1)
```

```python
def make_pipeline():
    
    rsi = RSI()
    longs = rsi.top(2, mask = ~SingleAsset(bundle.asset_finder.lookup_symbol('IR0001', as_of_date=None)))
    shorts = rsi.bottom(2, mask = ~SingleAsset(bundle.asset_finder.lookup_symbol('IR0001', as_of_date=None)))

    return Pipeline(
        
        columns = {
            "Market_Cap_Dollars":Weight().Market_Cap_Dollars,        
            "longs" : longs,
            "shorts" : shorts,
            "long_weights" : Weight(mask=longs).Weight,
            "short_weights" : Weight(mask=shorts).Weight
        }
    )
```

```python
def analyze(context, perf):
    
    fig = plt.figure(figsize=(16, 24), dpi=400)
    
    # First chart(累積報酬)
    ax = fig.add_subplot(611) 
    ax.set_title('Strategy Results') 
    ax.plot(perf['algorithm_period_return'],
            linestyle='-', 
            label='algorithm period return',
            linewidth=3.0)
    ax.plot(perf['benchmark_period_return'],
            linestyle='-', 
            label='benchmark period return',
            linewidth=3.0)
    ax.legend()
    ax.grid(False)
    
    # Second chart(returns)
    ax = fig.add_subplot(612, sharex=ax)       
    ax.plot(perf['returns'],
            linestyle='-', 
            label='returns',
            linewidth=3.0)
    ax.legend()
    ax.grid(False)

    # Third chart(ending_cash) -> 觀察是否超買
    ax = fig.add_subplot(613, sharex=ax)
    ax.plot(perf['ending_cash'], 
            label='ending_cash',
            linestyle='-',
            linewidth=3.0)
    ax.axhline(y=1, c='r', linewidth=1)
    ax.legend()
    ax.grid(False)

    # Forth chart(shorts_count) -> 觀察是否放空
    ax = fig.add_subplot(614, sharex=ax)
    ax.plot(perf['shorts_count'], 
            label='shorts_count',
            linestyle='-',
            linewidth=3.0)
    ax.yaxis.set_major_locator(MaxNLocator(integer=True))
    ax.axhline(y=0, c='r', linewidth=1)
    ax.legend()
    ax.grid(False)
    
    # Fifth chart(longs_count)
    ax = fig.add_subplot(615, sharex=ax)
    ax.plot(perf['longs_count'], 
            label='longs_count',
            linestyle='-',
            linewidth=3.0)
    ax.yaxis.set_major_locator(MaxNLocator(integer=True))
    ax.axhline(y=0, c='r', linewidth=1)
    ax.legend()
    ax.grid(False) 
    
    # Sixth chart(weights) -> 觀察每日持股權重
    ax = fig.add_subplot(616, sharex=ax)        
    weights = pd.concat([df.to_frame(d) for d, df in perf['daily_weights'].dropna().items()],axis=1).T
    
    for i in weights.columns:
        df = weights.loc[:,i]
        ax.scatter(df.index,df.values,marker='.', s=5, c='grey', label='daily_weights')
    ax.axhline(y=0, c='r', linewidth=1)
    ax.legend(['daily_weights'])
    ax.grid(False)

    fig.tight_layout()

def record_vars(context, data):
    """
    Plot variables at the end of each day.
    """
            
    record(daily_weights=context.daily_weights,
           Market_Cap_Dollars=context.output.Market_Cap_Dollars
          )
```

```python
algo = TargetPercentPipeAlgo(
                     start_session=algo_start_dt,
                     end_session=end_dt,
                     limit_buy_multiplier=1.015,
                     allow_short=True,
                     custom_weight=True,
                     cancel_datedelta=2,
                     pipeline=make_pipeline,
                     analyze=analyze,
                     record_vars=record_vars,
                     get_record_vars=True,
                     get_transaction_detail=True
)

# set_algo_instance
set_algo_instance(algo)

# run
stats = algo.run()
```

```python
result = run_pipeline(make_pipeline(), algo_start, end)
result.query('(longs == True) | (shorts == True)' )
```

#### algo.positions

```python
# 計算實際股票部位的weight = 個股持股市值／所有股票部位的持股市值加總
pos = algo.positions

pos['mv'] = pos['amount'] * pos['last_sale_price']

positive_sum = pos[pos['mv'] > 0].groupby(level=0)['mv'].sum()
negative_sum = - pos[pos['mv'] < 0].groupby(level=0)['mv'].sum()
pos['sum'] = np.where(pos['mv'] > 0,
                            pos.index.map(positive_sum),
                            pos.index.map(negative_sum))

pos['weight'] = pos['mv'] / pos['sum']
pos
```

#### algo.dict_record_vars

```python
record_vars = algo.dict_record_vars
```

```python
# 實際持股市值 = 個股持股市值／所有股票部位的持股市值加總 * max_leverage
record_vars['daily_weights']
```

```python
# 個股總市值
record_vars['Market_Cap_Dollars']
```

[Return to Menu](#menu) 