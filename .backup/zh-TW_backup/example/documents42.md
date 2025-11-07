<span id="show_perf_stats"></span>

## pyfolio.plotting.show_perf_stats

顯示績效與風險指標。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* factor_returns: _pd.Series_, optional
        計算 beta 所需的指標報酬率，通常設定為市場報酬。
* positions: _pd.DataFrame_, optional
        每日標的與現金部位表。
* transactions: _pd.DataFrame_, optional
        交易策略的交易資料，一列為一筆交易。
* turnover_denom: _str_
        周轉率計算方式，有 AGB 和 portfolio_value 兩種，預設為 AGB，
        計算方法為 (買進總額 + 賣出總額絕對值) / (AGB or portfolio_value)，
        AGB = portfolio-value - cash。
* live_start_date: _datetime_, optional<br>
        回測期間之後，開始 live trading 日期，相當於區分 In-sample 與 out-of sample 檢測，預設 = None，日期必須標準化。
* bootstrap: _boolean_, optional
        對各項指標進行拔靴法測試，預設 = False。
* header_rows: _dict_ or _OrderedDict_, optional
        在表格 start date yyyy-mm-dd 上額外增加列，預設為None。

### Returns: 
   &emsp; _pd.DataFrame_

[Return to Menu](#menu)

<span id="show_worst_drawdown_periods"></span>
## pyfolio.plotting.show_worst_drawdown_periods

顯示前 n 大的交易回落期間。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* top: _int_, optional
        決定 n，預設為 5。
        
### Returns:
   &emsp; _pd.DataFrame_
   
[Return to Menu](#menu)

<span id="show_and_plot_top_positions"></span>

## pyfolio.plotting.show_and_plot_top_positions

製作多單持有量前十、空單持有量前十與綜合持有量的標的持有部位比率表格，並且繪製各時間點持有比率圖。

### Parameters:

* returns: _pd.Series_
        交易策略的日報酬率。
* positions_alloc: _pd.DataFrame_
        個股標的的持有部位分布。
* show_and_plot: _int_, optional
        1. 若為 0，僅繪圖。
        2. 若為 1，僅製表。
        3. 若為 2，同時製作圖與表。
* hide_positions: _boolean_, optional
        若為 True，隱藏標的名稱。
* legend_loc: _plt.lengend_loc_, optional
        圖表中圖例的位置。
* ax: _matplotlib.Axes_, optional
        matplotlib 中的尺標。
        
### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

<span id="plot_rolling_returns"></span>

## pyfolio.plotting.plot_rolling_returns

繪製出累積交易策略報酬率與指標報酬率。


### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* factor_returns: _pd.Series_, optional
        指標報酬率，通常設定為市場報酬。
* live_start_date: _datetime_, optional<br>
        回測期間之後，開始 live trading 日期，相當於區分 In-sample 與 out-of sample 檢測，預設 = None，日期必須標準化。
* logy: _boolean_, optional
        是否使用對數報酬，預設 = False。
* cone_std: _float_ or _tuple_, optional
        設定 out_of_sample 時，交易策略預期報酬率的標準差區間。
        若為 float，則設定單一標準差區間。
        若為 tuple，則設定多個標準差區間。
* legend_loc: _plt.lengend_loc_, optional
        圖表中圖例的位置。
* volatility_match: _boolean_, optional
        是否將交易策略與指標的報酬率以波動度進行標準化，以便比較相同風險下的報酬差異。
* cone_function: _function_, optional
        用來計算 out_of_sample 期間，預測報酬率的函式。
* ax: _matplotlib.Axes_, optional
        matplotlib 的尺標。

### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

<span id="plot_returns"></span>

## pyfolio.plotting.plot_returns

繪製每日交易策略報酬圖。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* live_start_date: _datetime_, optional
        回測期間之後，開始 live trading 日期，相當於區分 In-sample 與 out-of sample 檢測，預設 = None，日期必須標準化。 
* ax: _matplotlib.Axes_, optional
        matplotlib 的尺標。

### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

<span id="plot_rolling_beta"></span>
## pyfolio.plotting.plot_rolling_beta

繪製六個月與十二個月的移動 beta 值。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* factor_returns: _pd.Series_
        計算 beta 所需的指標報酬率，通常設定為市場報酬。
* legend_loc: _plt.lengend_loc_, optional
        圖表中圖例的位置。
* ax: _matplotlib.Axes_, optional
        matplotlib 的尺標。
        
### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

<span id="plot_rolling_volatility"></span>
## pyfolio.plotting.plot_rolling_volatility

繪製移動波動度圖表

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* factor_returns: _pd.Series_, optional
        計算指標波動度所需的指標報酬率，通常設定為市場報酬。
* rolling_window: _int_, optional
        計算移動波動度所需之窗格大小。
* legend_loc: _plt.lengend_loc_, optional
        圖表中圖例的位置。
* ax: _matplotlib.Axes_, optional
        matplotlib 的尺標。
        
### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

<span id="plot_rolling_sharpe"></span>

## pyfolio.plotting.plot_rolling_sharpe

繪製移動波動度圖表

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* factor_returns: _pd.Series_, optional
        計算指標夏普值所需的指標報酬率，通常設定為市場報酬。
* rolling_window: _int_, optional
        計算移動波動度所需之窗格大小。
* legend_loc: _plt.lengend_loc_, optional
        圖表中圖例的位置。
* ax: _matplotlib.Axes_, optional
        matplotlib 的尺標。
        
### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

<span id="plot_drawdown_periods"></span>

## pyfolio.plotting.plot_drawdown_periods

繪製前 n 大回撤期間於累積報酬圖。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* top: _int_, optional
        決定 n，預設為 10。
* ax: _matplotlib.Axes_, optional
        matplotlib 的尺標。
        
### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

```
import pyfolio
pyfolio.plotting.plot_drawdown_periods(returns)
```

<span id="plot_drawdown_underwater"></span>

## pyfolio.plotting.plot_drawdown_underwater

繪製策略 underwater 程度。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* ax: _matplotlib.Axes_, optional
        matplotlib 的尺標。
        
### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

```
pyfolio.plotting.plot_drawdown_underwater(returns)
```

<span id="plot_monthly_returns_heatmap"></span>

## pyfolio.plotting.plot_monthly_returns_heatmap

以熱力圖繪製交易策略每月報酬。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* ax: _matplotlib.Axes_, optional
        matplotlib 的尺標。
        
### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

```
pyfolio.plotting.plot_monthly_returns_heatmap(returns)
```

<span id="plot_annual_returns"></span>

## pyfolio.plotting.plot_annual_returns

繪製交易策略每年報酬。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* ax: _matplotlib.Axes_, optional
        matplotlib 的尺標。
        
### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

```
pyfolio.plotting.plot_annual_returns(returns)
```

<span id="plot_monthly_returns_dist"></span>
## pyfolio.plotting.plot_monthly_returns_dist

繪製交易策略每月報酬之分布圖。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* ax: _matplotlib.Axes_, optional
        matplotlib 的尺標。
        
### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

```
pyfolio.plotting.plot_monthly_returns_dist(returns)
```

<span id="plot_return_quantiles"></span>
## pyfolio.plotting.plot_return_quantiles

繪製交易策略日、週、月頻率的報酬盒狀圖。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* live_start_date: _datetime_, optional
        回測期間之後，開始 live trading 日期，相當於區分 In-sample 與 out-of sample 檢測，預設 = None，日期必須標準化。
* ax: _matplotlib.Axes_, optional
        matplotlib 的尺標。
        
### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

```
pyfolio.plotting.plot_return_quantiles(returns, live_start_date=pd.Timestamp("2018-07-02", tz='UTC'))
```

<span id="plot_exposures"></span>
## pyfolio.plotting.plot_exposures

繪製多空曝險部位圖。

    1. Long = 多頭部位總價值/所有部位總價值
    2. Short = 空頭部位總價值/所有部位總價值
    3. Net = 現金部位以外總價值/所有部位總價值

### Parameters:

* returns: _pd.Series_
        交易策略的日報酬率。
* positions_alloc: _pd.DataFrame_
        個股標的的持有部位分布。
* ax: _matplotlib.Axes_, optional
        matplotlib 中的尺標。
        
### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

```
pyfolio.plotting.plot_exposures(returns, positions)
```

<span id="plot_max_median_position_concentration"></span>
## pyfolio.plotting.plot_max_median_position_concentration

繪製多空集中程度 (concentration) 的最大值與中位數。
    
    1. max_long = 多頭部位集中程度最大值
    2. max_short = 空頭部位集中程度最大值
    3. median_long = 多頭部位集中程度中位數
    4. median_short = 空頭部位集中程度中位數

### Parameters:

* positions_alloc: _pd.DataFrame_
        個股標的的持有部位分布。
* ax: _matplotlib.Axes_, optional
        matplotlib 中的尺標。
        
### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

```
pyfolio.plotting.plot_max_median_position_concentration(positions)
```

<span id="plot_holdings"></span>
## pyfolio.plotting.plot_holdings

繪製持有股數。
1. Daily holdings: 每日持有股數
2. Average daily holdings, by month: 每月日均持有數
3. Average daily holdings, Total: 日均持有數

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* positions: _pd.DataFrame_
        每日標的與現金部位表。
* legend_loc: _plt.lengend_loc_, optional
        圖表中圖例的位置。
* ax: _matplotlib.Axes_, optional
        matplotlib 中的尺標。
        
### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

```
pyfolio.plotting.plot_holdings(returns, positions)
```

<span id="plot_long_short_holdings"></span>
## pyfolio.plotting.plot_long_short_holdings

繪製多空頭持有股數。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* positions: _pd.DataFrame_
        每日標的與現金部位表。
* legend_loc: _plt.lengend_loc_, optional
        圖表中圖例的位置。
* ax: _matplotlib.Axes_, optional
        matplotlib 中的尺標。
        
### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

```
pyfolio.plotting.plot_long_short_holdings(returns, positions)
```

<span id="plot_gross_leverage"></span>
## pyfolio.plotting.plot_gross_leverage

繪製毛槓桿 (gross leverage)，gross leverage = (long exposure - short exposure)/net asset value。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* positions: _pd.DataFrame_
        每日標的與現金部位表。
* legend_loc: _plt.lengend_loc_, optional
        圖表中圖例的位置。
* ax: _matplotlib.Axes_, optional
        matplotlib 中的尺標。
        
### Returns:
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

```
pyfolio.plotting.plot_gross_leverage(returns, positions)
```

<span id="plot_turnover"></span>

## pyfolio.plotting.plot_turnover

繪製周轉率圖，周轉率計算方法請見下方 turnover_denom。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* transactions: _pd.DataFrame_
        交易策略的交易資料，一列為一筆交易。
* positions: _pd.DataFrame_
        每日標的與現金部位表。
* turnover_denom: _str_, optional
        周轉率計算方式，有 AGB 和 portfolio_value 兩種，預設為 AGB，
        計算方法為 (買進總額 + 賣出總額絕對值) / (AGB or portfolio_value)，
        AGB = portfolio-value - cash。
* legend_loc: _plt.lengend_loc_, optional
        圖表中圖例的位置。
* ax: _matplotlib.Axes_, optional
        matplotlib 中的尺標。

### Returns: 
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

```
pyfolio.plotting.plot_turnover(returns, transactions, positions)
```

<span id="plot_daily_volume"></span>

## pyfolio.plotting.plot_daily_volume

繪製每日交易量。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* transactions: _pd.DataFrame_
        交易策略的交易資料，一列為一筆交易。
* ax: _matplotlib.Axes_, optional
        matplotlib 中的尺標。

### Returns: 
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

```
pyfolio.plotting.plot_daily_volume(returns, transactions)
```

<span id="plot_daily_turnover_hist"></span>

## pyfolio.plotting.plot_daily_turnover_hist

繪製每日周轉率分布圖，周轉率計算方法請見下方 turnover_denom。

### Parameters:

* transactions: _pd.DataFrame_
        交易策略的交易資料，一列為一筆交易。
* positions: _pd.DataFrame_
        每日標的與現金部位表。
* turnover_denom: _str_, optional
        周轉率計算方式，有 AGB 和 portfolio_value 兩種，預設為 AGB，
        計算方法為 (買進總額 + 賣出總額絕對值) / (AGB or portfolio_value)，
        AGB = portfolio-value - cash。
* ax: _matplotlib.Axes_, optional
        matplotlib 中的尺標。

### Returns: 
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

```
pyfolio.plotting.plot_daily_turnover_hist(transactions, positions)
```

<span id="plot_txn_time_hist"></span>
## pyfolio.plotting.plot_txn_time_hist

繪製交易時間分布圖。(僅適用於日內資料)

### Parameters:
* transactions: _pd.DataFrame_
        交易策略的交易資料，一列為一筆交易。
* bin_minutes: _float_, optional
        時間區間間隔，預設為 5 分鐘。
* tz: _str_, optional
        時區。
* ax: _matplotlib.Axes_, optional
        matplotlib 中的尺標。
        
### Returns: 
&emsp; _matplotlib.Axes_

[Return to Menu](#menu)

```
pyfolio.plotting.plot_txn_time_hist(transactions, tz = 'Asia/Taipei')
```
