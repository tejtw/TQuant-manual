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


---

# documents19.md

# 策略撰寫

```python
from zipline.api import set_slippage, set_commission, set_benchmark, attach_pipeline, order, order_target, symbol, pipeline_output, record
from zipline.finance import commission, slippage
from zipline.data import bundles
from zipline import run_algorithm
from zipline.pipeline import Pipeline
from zipline.pipeline.filters import StaticAssets, StaticSids
from zipline.pipeline.factors import BollingerBands
from zipline.pipeline.data import EquityPricing

bundle = bundles.load('tquant')
ir0001_asset = bundle.asset_finder.lookup_symbol('IR0001', as_of_date=None)

def make_pipeline():
    perf = BollingerBands(inputs=[EquityPricing.close], window_length=20, k=2)
    upper, middle, lower = perf.upper, perf.middle, perf.lower
    curr_price = EquityPricing.close.latest

    return Pipeline(
        columns={
            'upper': upper,
            'middle': middle,
            'lower': lower,
            'curr_price': curr_price
        },
        screen=~StaticAssets([ir0001_asset])
    )

def initialize(context):
    context.last_buy_price = 0
    set_commission(commission.PerShare(cost=0.00285))
    set_benchmark(symbol('IR0001'))
    attach_pipeline(make_pipeline(), 'mystrategy')
    context.last_signal_price = 0

def handle_data(context, data):
    out_dir = pipeline_output('mystrategy')
    for i in out_dir.index:
        sym = i.symbol
        upper = out_dir.loc[i, 'upper']
        middle = out_dir.loc[i, 'middle']
        lower = out_dir.loc[i, 'lower']
        curr_price = out_dir.loc[i, 'curr_price']
        cash_position = context.portfolio.cash
        stock_position = context.portfolio.positions[i].amount

        buy, sell = False, False

        record(
            **{
                f'price_{sym}': curr_price,
                f'upper_{sym}': upper,
                f'lower_{sym}': lower,
                f'buy_{sym}': buy,
                f'sell_{sym}': sell
            }
        )

        if stock_position == 0:
            if (curr_price <= lower) and (cash_position >= curr_price * 1000):
                order(i, 1000)
                context.last_signal_price = curr_price
                buy = True
                record(
                    **{
                        f'buy_{sym}': buy
                    }
                )
        elif stock_position > 0:
            if (curr_price <= lower) and (curr_price <= context.last_signal_price) and (cash_position >= curr_price * 1000):
                order(i, 1000)
                context.last_signal_price = curr_price
                buy = True
                record(
                    **{
                        f'buy_{sym}': buy
                    }
                )
            elif (curr_price >= upper):
                order_target(i, 0)
                context.last_signal_price = 0
                sell = True
                record(
                    **{
                        f'sell_{sym}': sell
                    }
                )
            else:
                pass
        else:
            pass

def analyze(context, perf):
    pass

results = run_algorithm(
    start=pd.Timestamp('2008-07-02', tz='UTC'),
    end=pd.Timestamp('2022-07-02', tz='UTC'),
    initialize=initialize,
    bundle='tquant',
    analyze=analyze,
    capital_base=5e4,
    handle_data=handle_data
)

results
```

## 提取交易數據

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

## 生成完整績效報告

```python
pyfolio.tears.create_full_tear_sheet(returns=returns,
                                     positions=positions,
                                     transactions=transactions,
                                     benchmark_rets=benchmark_rets
                                    )
```P