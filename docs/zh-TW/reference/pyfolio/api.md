# Pyfolio API 總覽

!!! info
    本頁提供 Pyfolio 相關 API 的詳細說明，包括如何從 Zipline 回測結果中提取數據、進行時區標準化，以及生成完整的績效分析報告。

Pyfolio 是一個用於金融投資組合績效與風險分析的 Python 庫，主要以圖表方式顯示投資策略的優劣，與 Zipline-tej 開源回測庫完美兼容。

---

## pyfolio.utils.extract_rets_pos_txn_from_zipline

用於從 `zipline.run_algorithm()` 所輸出的資料表中，提取交易策略報酬、持有部位與交易資訊。

**Parameters:**

*   `backtest`: _pd.DataFrame_
    *   `zipline.run_algorithm()` 得出的資料表。

**Returns:**

*   `returns`: _pd.Series_
    *   交易策略的每日報酬。
*   `positions`: _pd.DataFrame_
    *   交易策略的各證券與現金每日持有部位。
*   `transactions`: _pd.DataFrame_
    *   交易策略的每日交易資料，一列為一筆交易。

#### 範例

```python
from pyfolio.utils import extract_rets_pos_txn_from_zipline

returns, positions, transactions = extract_rets_pos_txn_from_zipline(results)
benchmark_rets = results.benchmark_return

# 時區標準化
returns.index = returns.index.tz_localize(None).tz_localize('UTC')
positions.index = positions.index.tz_localize(None).tz_localize('UTC')
transactions.index = transactions.index.tz_localize(None).tz_localize('UTC')
benchmark_rets.index = benchmark_rets.index.tz_localize(None).tz_localize('UTC')
```

---

## pyfolio.plotting.show_perf_stats

顯示績效與風險指標表。

**Parameters:**

*   `returns`: _pd.Series_
    *   交易策略的日報酬率。
*   `factor_returns`: _pd.Series_, optional
    *   計算 beta 所需的指標報酬率，通常設定為市場報酬。
*   `positions`: _pd.DataFrame_, optional
    *   每日標的與現金部位表。
*   `transactions`: _pd.DataFrame_, optional
    *   交易策略的交易資料，一列為一筆交易。
*   `turnover_denom`: _str_, optional
    *   周轉率計算方式，有 `AGB` 和 `portfolio_value` 兩種，預設為 `AGB`。計算方法為 (買進總額 + 賣出總額絕對值) / (AGB or portfolio_value)，其中 AGB = portfolio-value - cash。

#### 範例

```python
from pyfolio.plotting import show_perf_stats
perf_stats = show_perf_stats(
    returns, 
    benchmark_rets, 
    positions, 
    transactions, 
    turnover_denom='portfolio_value'
)
```

---

## pyfolio.plotting.show_worst_drawdown_periods

顯示前 n 大的交易回落期間。

**Parameters:**

*   `returns`: _pd.Series_
    *   交易策略的日報酬率。
*   `top`: _int_, optional
    *   決定 n，預設為 5。

#### 範例

```python
from pyfolio.plotting import show_worst_drawdown_periods
show_worst_drawdown_periods(returns, top=10)
```

---

## pyfolio.plotting.show_and_plot_top_positions

製作多單持有量前十、空單持有量前十與綜合持有量的標的持有部位比率表格，並繪製各時間點持有比率圖。

**Parameters:**

*   `returns`: _pd.Series_
    *   交易策略的日報酬率。
*   `positions`: _pd.DataFrame_
    *   每日標的與現金部位表。

#### 範例

```python
import pyfolio
pyfolio.plotting.show_and_plot_top_positions(returns, positions)
```

---

## pyfolio.plotting.plot_rolling_returns

繪製滾動報酬率（通常為 252 天滾動）。

#### 範例

```python
import pyfolio
pyfolio.plotting.plot_rolling_returns(returns, benchmark_rets=benchmark_rets)
```

---

## pyfolio.plotting.plot_rolling_beta

繪製滾動 Beta 值（相對於基準）。

#### 範例

```python
import pyfolio
pyfolio.plotting.plot_rolling_beta(returns, benchmark_rets)
```

---

## pyfolio.plotting.plot_rolling_volatility

繪製滾動波動率。

#### 範例

```python
import pyfolio
pyfolio.plotting.plot_rolling_volatility(returns)
```

---

## pyfolio.plotting.plot_rolling_sharpe

繪製滾動夏普比率。

#### 範例

```python
import pyfolio
pyfolio.plotting.plot_rolling_sharpe(returns)
```

---

## pyfolio.plotting.plot_drawdown_periods

繪製最大回落期間。

#### 範例

```python
import pyfolio
pyfolio.plotting.plot_drawdown_periods(returns, top=5)
```

---

## pyfolio.plotting.plot_drawdown_underwater

繪製策略 underwater 程度（從高點下降的幅度）。

#### 範例

```python
import pyfolio
pyfolio.plotting.plot_drawdown_underwater(returns)
```

---

## pyfolio.plotting.plot_monthly_returns_heatmap

以熱力圖繪製交易策略每月報酬。

#### 範例

```python
import pyfolio
pyfolio.plotting.plot_monthly_returns_heatmap(returns)
```

---

## pyfolio.plotting.plot_annual_returns

繪製交易策略每年報酬。

#### 範例

```python
import pyfolio
pyfolio.plotting.plot_annual_returns(returns)
```

---

## pyfolio.plotting.plot_holdings

繪製持有股數，包括每日持有股數、每月日均持有數、日均持有數等。

#### 範例

```python
import pyfolio
pyfolio.plotting.plot_holdings(returns, positions)
```

---

## pyfolio.tears.create_full_tear_sheet

生成包含績效、風險、回落、月度報酬、持倉等所有指標與圖表的完整績效報告。

**Parameters:**

*   `returns`: _pd.Series_
    *   交易策略的日報酬率。
*   `positions`: _pd.DataFrame_
    *   每日標的與現金部位表。
*   `transactions`: _pd.DataFrame_
    *   交易資料。
*   `benchmark_rets`: _pd.Series_, optional
    *   基準報酬率。

#### 範例

```python
import pyfolio
pyfolio.tears.create_full_tear_sheet(
    returns=returns,
    positions=positions,
    transactions=transactions,
    benchmark_rets=benchmark_rets
)
```