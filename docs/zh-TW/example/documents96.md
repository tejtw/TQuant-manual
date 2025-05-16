# BollingerBands 函數介紹

`BollingerBands()` 是 Zipline 提供的技術指標之一，使用統計學的概念，將價格移動平均線擴展為 **上軌、中軌、下軌** 三條線：

> 中軌 = n 日移動平均線  
> 上軌 = 中軌 + m × 標準差  
> 下軌 = 中軌 - m × 標準差

此指標可用於辨識價格是否偏離常態區間，並作為超買超賣的技術依據。

## 函數語法

- `inputs`：欲使用的價格資料，預設為 `EquityPricing.close`。  
- `window_length`：計算移動平均與標準差的天數 (n)。  
- `k`：標準差倍數 (m)。

```python
BollingerBands(
    inputs=[TWEquityPricing.close],
    window_length=14,
    k=1.5
)