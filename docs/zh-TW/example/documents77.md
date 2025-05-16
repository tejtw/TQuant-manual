# NoCommission : 不收任何手續費
## `zipline.finance.commission.NoCommission()`
* 不收任何手續費，此模型主要用來測試。
* 適用於 equities 與 futures。

## Notes：
手續費計算時，價格以成交日收盤價為準，數量也以成交時為準，也就是說，如果因為股數變動造成 amount 有任何變化，計算上都是用成交時新的 amount。手續費計算時，價格以成交日收盤價為準，數量也以成交時為準，也就是說，如果因為股數變動造成 amount 有任何變化，計算上都是用成交時新的 amount。
