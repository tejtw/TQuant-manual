# IchimokuKinkoHyo 函數介紹

`IchimokuKinkoHyo()` 是 Zipline 提供的多元技術指標，用來計算完整的 **一目均衡表** 組成要素，包括：

- `tenkan_sen` 轉換線：$(9日最高 + 9日最低)/2$  
- `kijun_sen` 基準線：$(26日最高 + 26日最低)/2$  
- `senkou_span_a` 先行帶 A：前兩項平均  
- `senkou_span_b` 先行帶 B：$(52日最高 + 52日最低)/2$  
- `chikou_span` 遲行帶：26 日前的收盤價  

此指標常用於趨勢判斷與支撐阻力判別，是日系技術分析的重要工具。

## 函數語法

- `inputs`：輸入資料欄位，預設為 `[EquityPricing.high, EquityPricing.low, EquityPricing.close]`。  
- `window_length`：觀察期，預設為 52。  
- `tenkan_sen_length`：轉換線天數。  
- `kijun_sen_length`：基準線天數。  
- `chikou_span_length`：遲行帶天數。

```python
IchimokuKinkoHyo(
    inputs=[TWEquityPricing.high, TWEquityPricing.low, TWEquityPricing.close],
    window_length=52,
    mask=StaticSids([0])
)
```

範例

> 以下範例建立一個 Pipeline，輸出一目均衡表的五條線：轉換線、基準線、先行 A、先行 B 與遲行帶
```python
from zipline.pipeline.factors import IchimokuKinkoHyo
from zipline.pipeline.filters import StaticSids

def make_pipeline():
    Ich = IchimokuKinkoHyo(
        inputs=[TWEquityPricing.high, TWEquityPricing.low, TWEquityPricing.close],
        window_length=52,
        mask=StaticSids([0])
    )

    return Pipeline(
        columns={
            "tenkan_sen": Ich.tenkan_sen,
            "kijun_sen": Ich.kijun_sen,
            "senkou_span_a": Ich.
            senkou_span_a,
            "senkou_span_b": Ich.senkou_span_b,
            "chikou_span": Ich.chikou_span
        },
        screen=StaticSids([0])
    )

run_pipeline(make_pipeline(), start_time, end_time)
```