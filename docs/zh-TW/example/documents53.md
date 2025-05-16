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