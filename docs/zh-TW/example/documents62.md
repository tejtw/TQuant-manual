# order_target_value 函數介紹

`order_target_value()` 是 Zipline 提供的一種下單方式，用來**調整某支股票的市值（以金額為單位）到你設定的目標值**。

它會根據你當前持股金額與目標金額的差距，自動買進或賣出，達成指定市值。



## 函數語法
- `asset`：要交易的股票（可用 `symbol("股票代碼")` 表示）

- `target_value`：希望持有該股票的最終金額（正值表示持有部位，0 表示清空）

```python
order_target_value(asset, target_value)
```

> 以下程式碼會讓你持有台積電（2330）的部位調整為 10,000 元，無論你目前持有多少。
假設你目前持有價值 4000 元的台積電，則會幫你再買進 6000 元；若目前持有 12,000 元，則會幫你賣出 2000 元。

```python
order_target_value(symbol("2330"), 10000)
```