##  before_trading_start 函數介紹

###  函數用途
`before_trading_start(context, data)` 是 Zipline 回測架構中的一個 **可選的 callback 函數**，在每天市場開盤前會被呼叫一次。這可以讓你在每天開始之前，先準備好所需資料或運算結果。

```text
Called every day before market open.
```

---

###  使用場景一：取出當日的 pipeline 結果

```python
def before_trading_start(context, data):
    """
    Called every day before market open.
    """
    context.output = pipeline_output('signals')
```



---

###  使用場景二：設定持股目標 (context.trades)

```python
def before_trading_start(context, data):
    """
    Called every day before market open.
    """
    output = pipeline_output('signals')
    context.output = output
    context.trades = (output['longs'].astype(int)
                      .reset_index()
                      .drop_duplicates()
                      .set_index('index')
                      .squeeze())
```

- `context.trades`: 為一個 `pandas.Series`，代表每天預計持有的標的（1 表持有，0 表不持有）。

---

###  設定方式簡述

```python
before_trading_start: callable, optional
```

可設定為一個函數，用於 Zipline 策略初始化的參數之一。
