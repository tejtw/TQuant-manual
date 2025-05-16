# order_target 函數介紹

`order_target()` 是 Zipline 提供的一種下單方式，用來調整某支股票的 **最終持股數量**。

與 `order()` 直接買賣股數不同，`order_target()` 的設計概念是「達成目標持股量」，不論目前持有多少，Zipline 都會幫你自動補上或賣出差額。



## 函數語法
- `asset`：要交易的股票標的（例如可使用 `symbol("2330")` 表示台積電）

- `target_amount`：目標持股股數（整數）。Zipline 會根據當前持股自動計算買賣數量，使持股達到此數值。

```python
order_target(asset, target_amount)
```

## 範例

> 範例程式碼是指無論你目前有多股台積電 (2330) ，函數會通過下單幫你調整至 300 股。
> 假設你目前有100股的台積電，通過上述程式碼會幫你在回測系統下 200 股的台積電。

```python 
order_target(symbol(2330), 300)
```