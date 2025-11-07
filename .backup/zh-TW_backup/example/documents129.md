# Pipeline built-in classifier
在 TQuant Lab: Filters 中，我們介紹到對 `Factors` 和 `Classifier` 使用比較運算子（comparison operators，<, <=, !=, ==, >, >=）就可以創建 `Filters`。

本文將介紹：

- Classifier 的基本概念與使用方式  
- 如何用 `quartiles`、`quantiles` 等方法對股票分類  
- Pipeline 的實際範例與執行結果

---

##  匯入套件與初始化設定

```python
import os
import pandas as pd
import numpy as np

tej_key = 'your key'
api_base = 'https://api.tej.com.tw'

os.environ['TEJAPI_KEY'] = tej_key
os.environ['TEJAPI_BASE'] = api_base
```
```python
from zipline.pipeline import Pipeline
from zipline.TQresearch.tej_pipeline import run_pipeline
from zipline.pipeline.data import TWEquityPricing
from zipline.data.data_portal import bundles

from zipline.pipeline.factors import *
from zipline.pipeline.filters import *
```
```python
StockList = \
['1227', '1234', '1304', '1314', '1434', '1440', '1476', '1504', '1507', '1590', '1605', '1704', '1710', '1717', '1723', '1789',
 '1802', '1907', '2006', '2015', '2049', '2101', '2103', '2106', '2204', '2227', '2327', '2337', '2344', '2356', '2360', '2362',
 '2379', '2384', '2385', '2392', '2395', '2448', '2449', '2450', '2451', '2489', '2501', '2504', '2511', '2542', '2545', '2548',
 '2603', '2606', '2607', '2608', '2609', '2610', '2615', '2618', '2707', '2723', '2727', '2809', '2812', '2823', '2834', '2845',
 '2847', '2855', '2884', '2887', '2888', '2889', '2903', '2915', '3034', '3037', '3044', '3149', '3189', '3406', '3702', '4938',
 '4958', '5522', '5871', '6005', '6176', '6239', '6269', '6286', '8008', '8046', '8078', '8422', '9904', '9907', '9914', '9917', '9921',
 '9933', '9940', '9945', '2458', '5264', '2206', '1201', '2347', '3231', '5534', '6116', '9910', '1477', '2353', '6271', '1319',
 '1722', '2059', '3060', '3474', '3673', '2393', '2376', '2439', '3682', '1262', '2201', '2377', '3576', '2352', '2838', '8150',
 '2324', '2231', '8454', '2833', '6285', '6409', '1536', '1702', '2313', '2498', '2867', '6415', '6456', '9938', '2383', '4137', '6452',
 '1707', '1589', '2849', '6414', '8464', '2355', '2345', '3706', '2023', '2371', '1909', '2633', '3532', '9941', '2492', '3019',
 '3443', '4915', '4943', '1229', '2441', '2027', '3026', '1210', '2104', '2456', '5269', '8341', '2354', '3005', '3481', '6669',
 '2409', '3023', '6213', '2404', '3533', '6278', '6592', '3653', '3661', '3665', '2301', '3714', '2883', '2890', '6531', '1904',
 '2014', '2105', '2108', '2474', '2637', '6781', '1102', '4919', '1402', '3035', '3036', '4961', '6719', '6770', '2368', '1795',
 '6550', '6789', '3017', '1101', '1216', '1301', '1303', '1326', '2002', '2207', '2303', '2308', '2311', '2317', '2325', '2330',
 '2357', '2382', '2412', '2454', '2801', '2880', '2881', '2882', '2885', '2886', '2891', '2892', '2912', '3008', '3045', '3697',
 '4904', '5880', '6505', '2408', '3711', '5876','IR0001']

start = '2020-01-03'
end = '2023-05-18'

start_dt = pd.Timestamp(start, tz='utc')
end_dt = pd.Timestamp(end, tz='utc')

os.environ['mdate'] = start+' '+end
os.environ['ticker'] = ' '.join(StockList)

!zipline ingest -b tquant
```

## quartiles／quintiles／deciles／quantiles

Pipeline 有下列功能可以建立 Classifier，以便分類股票：

- `quartiles`：四分位（將 Factor 依數值低至高轉換成 0, 1, 2, 3 四個級距，NaN 的資料會是 -1）。
- `quintiles`：五分位（將 Factor 依數值低至高轉換成 0, 1, 2, 3, 4 五個級距，NaN 的資料會是 -1）。
- `deciles`：十分位（將 Factor 依數值低至高轉換成 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 十個級距，NaN 的資料會是 -1）。
- `quantiles`：自訂分位，NaN 的資料會是 -1。

### Parameters

- `mask` (`zipline.pipeline.Filter`, optional)：預設為無，若加上 mask，僅會對 `mask=True` 的項目進行排名，`mask=False` 部分皆會被標為 -1。
- `bins` (`int`)：僅限 `quantiles` 使用，用來自訂分組數。

### Notes

為了避免前視偏差，Classifier 計算時若使用到 `zipline.pipeline.data.TWEquityPricing` 的欄位（如 `TWEquityPricing.open`／`high`／`low`／`close`／`volume`），不會使用當天資料，而會改用**前一個交易日**的資料。

例如：`window_length = 10` 時，若當天的時間點為 `t`，則會使用 `t-1 ~ t-10` 的 `close`。

計算這些 Built-in Classifier 時，若使用 `TWEquityPricing` 的欄位，也會**考慮除權息調整**。

---

## Examples：quartiles & quantiles

以下範例展示如何使用 `quartiles` 與 `quantiles`：

```python
sma = SimpleMovingAverage(inputs=[TWEquityPricing.close], window_length=30)
sma_quartiles = sma.quartiles(mask=(sma > 200) & (StaticAssets(assets_ex_IR0001)))
```

把三十日收盤價移動平均（SMA）> 200 的股票分四等分；SMA <= 200 的股票或 symbol = 'IR0001' ( 加權股價報酬指數 )，不納入排名並標上-1。

```python
vol = TWEquityPricing.volume.latest
vol_quantiles = vol.quantiles(bins = 15, mask=StaticAssets(assets_ex_IR0001))
```
則是把昨日成交量分為 15 等分（0-14），並將 'IR0001' 標上-1。

```python 
bundle_name = 'tquant'
bundle = bundles.load(bundle_name)
benchmark_asset = bundle.asset_finder.lookup_symbol('IR0001',as_of_date = None)

def make_pipeline():

    sids = bundle.asset_finder.equities_sids
    assets = bundle.asset_finder.retrieve_all(sids)    
    assets_ex_IR0001 = [i for i in assets if i!= bundle.asset_finder.lookup_symbol('IR0001', as_of_date=None)]

#     quartiles
    sma = SimpleMovingAverage(inputs = [TWEquityPricing.close], window_length = 30)
    sma_quartiles = sma.quartiles(mask = (sma > 200) & (StaticAssets(assets_ex_IR0001)))
    
#     quantiles
    vol = TWEquityPricing.volume.latest   # .latest出來的值會是未調整
    vol_quantiles = vol.quantiles(bins = 15, mask=StaticAssets(assets_ex_IR0001))

    return Pipeline(
        columns={
            'SMA': sma,
            'vol': vol,
            'SMA Quartile': sma_quartiles,
            'Volume Quantile':vol_quantiles
        }
    )
```
在 Pipeline 輸出的 result 資料表中，可以看到 'IR0001' 在 SMA Quartile 及 Volume Quantile 兩欄皆被標上-1。

```python 
result = run_pipeline(make_pipeline(), end, end)
result
```


查看交易量很高的台積電 ( 2330 )，可以發現其 Volume Quantile 被分在最高一級 ( 14 )。

```python 
result.loc[result.index.get_level_values(1).map(lambda x: x.symbol) == '2330']
```

查看 2023-05-18 交易量最高的 10 檔資產 ( 'IR0001' 除外 )，其 Volume Quantile 皆為 14。

```python 
result.sort_values(by = 'vol', ascending = False).head(11)
```

