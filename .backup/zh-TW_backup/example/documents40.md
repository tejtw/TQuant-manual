
# Pyfolio 可視化報表模組重點說明

本文件簡要整理 Pyfolio 在策略回測中提供的幾個主要功能模組及其用途。

##  Pyfolio 安裝（Installation）
Pyfolio 是 Quantopian 開發的績效分析工具，可以透過 pip 安裝：
```bash
pip install pyfolio
```

##  API 模組分類

### 1. 公用函數（Utilities）
- 提供基本資料處理、績效指標計算等支援函數。
- 例如：`timeseries.aggregate_returns()`、`timeseries.get_rolling_volatility()`。

### 2. 策略績效報告（Tears）
- 產出完整績效報表，一行程式即可快速展示結果。
- 常用函數：`pyfolio.create_full_tear_sheet()`。
- 包含回撤、貢獻分析、持股分佈等豐富指標。

### 3. 績效函數（Performance） 
- 用於計算如 Sharpe ratio、Sortino ratio、alpha/beta 等。
- 有些功能已不再維護，需注意版本相容性（例如 `perf.annual_return` 可能報錯）。

### 4. 繪圖函數（Ploting）
- 各種績效圖像化工具，例如：
  - `plot_rolling_returns()`：繪製策略與基準的滾動報酬。
  - `plot_drawdown_underwater()`：顯示資金水位圖。
  - `plot_exposures()`：多因子暴露可視化。

---

 **注意事項：** 某些版本下的 `performance` 模組已出現相容性問題，建議優先使用 `tears.create_full_tear_sheet` 搭配完整流程。

 
<span id="create_interesting_times_tear_sheet"></span>

## pyfolio.tears.create_interesting_times_tear_sheet

製作重大事件發生日前後的日報酬平均、最大、最小值表格，並繪製圖表視覺化。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* benchmark_rets: _pd.DataFrame_, optional
        指標日報酬率，預設 = None。
* periods: _dict_ or _OrderedDict_, optional
        歷史上重大事件發生日期。
* legend_loc: _plt.lengend_loc_, optional
        圖表中圖例的位置。
* return_fig: _boolen_, optional
        是否繪製圖表。
        
[Return to Menu](#menu)

<span id="create_full_tear_sheet"></span>

## pyfolio.tears.create_full_tear_sheet

繪製以上所有績效與風險相關圖表。

### Parameters:
* returns: _pd.Series_
        交易策略的日報酬率。
* positions: _pd.DataFrame_
        每日標的與現金部位表。
* transactions: _pd.DataFrame_
        交易策略的交易資料，一列為一筆交易。
* market_data: _pd.DataFrame_, optional
        每日市場資料，一日一行，欄位有股、交易量、價格，預設 = None。
* benchmark_rets: _pd.Series_, optional
        指標日報酬率，預設 = None。
* slippage: _int_ or _float_, optional 
        滑價，單位為basis point，需搭配 positions 和 transactions 使用，預設 = None，
* live_start_date: _datetime_, optional
        回測期間之後，開始 live trading 日期，相當於區分 In-sample 與 out-of sample 檢測，預設 = None，日期必須標準化。
* sector_mappings: _dict_ or _pd.Series_, optional
        行業分類，以股票 SID 為 key，行業為 value 的字典或 pd.Series，預設 = None。
* round_trips: _boolean_, optional
        交易 round trip 表格，需要搭配positions和transactions使用，預設 = False。
* estimate_intraday: _boolean_ or _str_, optional
        估算日內交易，預設為'infer'。
* hide_positions: _boolean_, optional
        隱藏股票代碼，預設為 False。
* cone_std: _float_ or _tuple_, optional
        設定 out_of_sample 時，交易策略預期報酬率的標準差區間。
        若為 float，則設定單一標準差區間。
        若為 tuple，則設定多個標準差區間。
* bootstrap: _boolean_, optional
        對各項指標進行拔靴法測試，預設 = False。
* unadjusted_returns: _pd.Series_, optional
        調整前日報酬率，預設 = None，提供後會額外繪製:
        1. Cumulative returns given additional per-dollar slippage
        2. Average annual returns given additional per-dollar slippage
* turnover_denom: _str_, optional
        周轉率計算方式，有 AGB 和 portfolio_value 兩種，預設為 AGB，
        計算方法為 (買進總額 + 賣出總額絕對值) / (AGB or portfolio_value)，
        AGB = portfolio-value - cash。
* set_context: _boolean_, optional
        設置繪圖風格。
* header_rows: _dict_ or _OrderedDict_, optional
        在表格 start date yyyy-mm-dd 上額外增加列，預設為 None。
* factor_returns: _pd.DataFrame_, optional
        風險因子所歸屬的報酬率，以日期作為指標，因子作為欄位。
        Ex:
                        momentum  reversal
            2017-01-01  0.002779 -0.005453
            2017-01-02  0.001096  0.010290       
* factor_loadings: _pd.DataFrame_, optional
        因子負荷量，為因子所對應的係數，以日期與標的為指標，因子為欄位。
        Ex:
                               momentum  reversal
            dt         ticker
            2017-01-01 AAPL   -1.592914  0.852830
                       TLT     0.184864  0.895534
                       XOM     0.993160  1.149353
            2017-01-02 AAPL   -0.140009 -0.524952
                       TLT    -1.066978  0.185435
                       XOM    -1.798401  0.761549
* pos_in_dollars: _boolean_, optional
        若為 True，positions 內欄位單位為元 (dollar)。
        若為 False，positions 內欄位單位為比率 (percentage)。 
* factor_partitions: _dict_, optional
        用於繪製報酬歸屬於因子圖。
        Ex: 
          {'style': ['momentum', 'size', 'value', ...],
           'sector': ['technology', 'materials', ... ]}

[Return to Menu](#menu)

```
pyfolio.tears.create_full_tear_sheet(returns=returns,
                                     positions=positions,
                                     transactions=transactions,
                                     benchmark_rets=benchmark_rets
                                    )
```
