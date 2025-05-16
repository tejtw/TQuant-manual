# NoSlippage : 不設置滑價
## `zipline.finance.slippage.NoSlippage`
* 不設置滑價。

## Note:
* 滑價計算時，價格以成交日收盤價為準，數量也以成交時為準。也就是說，如果因為股數變動造成 amount 有任何變化，計算上都是用成交時新的 amount。
* 如果 `initialize(context):` 裡面沒有設定`set_slippage()`，系統預設使用 `FixedBasisPointsSlippage(basis_points = 5.0, volume_limit = 0.1)`。
* 如果希望完全不考慮交易量及滑價限制，則使用 `set_slippage(slippage.NoSlippage())`。