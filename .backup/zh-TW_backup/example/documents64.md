# cancel_order 函數介紹

`cancel_order()` 是 Zipline 提供的函數，用來**取消尚未成交的掛單**。

當你下了限價單或停損單，而發現該掛單尚未成交且不想繼續保留時，可以用這個函數取消該筆訂單。



## 函數語法
- `order_param`：欲取消的訂單，可傳入下單時回傳的 **order_id**（字串），或整個 **order 物件**

```python
cancel_order(order_param)
```
> 以下程式碼會下單買進台積電，並立即取消這筆尚未成交的掛單：
```python
order_obj = order(symbol("2330"), 100, style=LimitOrder(500))
cancel_order(order_obj)
```
> 或者你也可以僅使用 order id 進行取消：
```python
oid = order(symbol("2330"), 100)
cancel_order(oid)
```
