<span id="extract_rets_pos_txn_from_zipline"></span>
## pyfolio.utils.extract_rets_pos_txn_from_zipline

用於從 `zipline.run_algorithms()` 所輸出的資料表中，提取交易策略報酬、持有部位與交易資訊。

### Parameters:
* backtest: pd.DataFrame<br>
        zipline.run_algorithm() 得出的資料表。
    
### Returns:
* returns: _pd.Series_<br>
        交易策略的每日報酬。
* positions: _pd.DataFrame_<br>
        交易策略的各證券與現金每日持有部位。
* transactions : _pd.DataFrame_<br>
        交易策略的每日交易資料，一列為一筆交易。
        
[Return to Menu](#menu)

```
from pyfolio.utils import extract_rets_pos_txn_from_zipline

returns, positions, transactions = extract_rets_pos_txn_from_zipline(results)
benchmark_rets = results.benchmark_return

# 時區標準化
returns.index = returns.index.tz_localize(None).tz_localize('UTC')
positions.index = positions.index.tz_localize(None).tz_localize('UTC')
transactions.index = transactions.index.tz_localize(None).tz_localize('UTC')
benchmark_rets.index = benchmark_rets.index.tz_localize(None).tz_localize('UTC')
```
