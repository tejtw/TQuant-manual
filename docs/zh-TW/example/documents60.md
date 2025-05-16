# order_target_percent 函數介紹

`order_target_percent()` 是 Zipline 提供的一種下單方式，用來**調整某檔股票在整體投資組合中的佔比**。

你只要告訴它「這支股票要佔我資產的幾 %」，Zipline 就會幫你自動買進或賣出，達到你設定的目標比例。



## 函數語法
- `asset`：欲調整持股比例的股票標的（例如使用 `symbol("2330")` 表示台積電）

- `target`：設定該股票在投資組合中的**目標佔比**（用小數表示，如 0.2 為 20%，0 為完全不持有）

```python
order_target_percent(asset, target)
```
> 以下程式碼會將你持有的台積電（2330）部位調整為佔整體資產的 30%。
不管你原本是 10%、50%，Zipline 都會自動買進或賣出來達到這個比例。
```python
order_target_percent(symbol("2330"), 0.3)
```
