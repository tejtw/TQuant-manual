# get_open_orders 函數介紹

`get_open_orders()` 是 Zipline 提供的查詢函數，用來**取得目前所有尚未成交的掛單資訊**。

當你在策略中下了條件單（例如限價單、停損單），但尚未被市場成交，就可以用這個函數來查看還有哪些掛單尚未完成。



## 函數語法
- `asset`（可選）：欲查詢未成交掛單的股票標的（例如使用 `symbol("2330")` 表示台積電）。若不指定，則會回傳所有股票的未成交掛單。

```python
get_open_orders(asset=None)
```

> 查詢目前所有股票的未成交掛單：
```python
open_orders = get_open_orders()
```
> 查詢目前台積電（2330）的未成交掛單：
```python
open_orders_tsmc = get_open_orders(symbol("2330"))
```
