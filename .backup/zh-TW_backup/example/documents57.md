# Zipline Order 函數介紹

Order 函數是用於交易股票的函數，可以利用以下六種函數得出我們指定要交易的股票以及數量


> ## Zipline 有六種下單函數：
	order()：購買指定股數。  
	order_value()：購買指定價值的股票。  
	order_percent()：購買指定價值（整個投資組合價值（portfolio value）的一個特定比例）的股票。  
	order_target()：交易直到該股票帳上總股數達到指定數量為止。  
	order_target_value()：交易到帳上該股票價值達到指定價值為止。  
	order_target_percent()：將股票在投資組合的比重調整到指定的比例。
    
	# Zipline Order函數介紹 - order

Order 函數是用於交易股票的函數，可以利用以下六種函數得出我們指定要交易的股票以及數量

> ## 本篇將會介紹`order()`的使用辦法。
本文件包含以下四個部份：  
> 1. 函數說明  
> 2. 範例：order（搭配 limit_price）  
> 3. 範例：order（搭配 stop_price）  


## 下單函數的參數與回傳值：

### 1. 函數說明 
> 以市價單下單
- `asset`：要交易的股票標的（例如使用 `symbol("2330")` 表示台積電）

- `amount`：欲買賣的股數（正值代表買進，負值代表賣出）

- `style`：下單方式，預設為 `MarketOrder()`（市價單），也可替換為 `LimitOrder()` 或 `StopOrder()` 等條件單

```python
order(asset, amount, style=MarketOrder())
```


### 2. 範例：order（搭配 limit_price） 
> 用 限價610元 買進 sid(24) 這檔股票 100 股。 
```python
order(sid(24), 100, style=LimitOrder(610))
```


### 3. 範例：order（搭配 stop_price）
> 當價格跌破590元時，賣出 sid(24) 100 股（停損單）。
```python
order(sid(24), -100, style=StopOrder(590))
```