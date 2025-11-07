# Alphalens

事前準備
- [Installation&Prepare](#Installation)

## Analysis

### Alphalens提供以下三種類型的因子分析工具，讓我們對因子有初步的了解：
- [Returns（報酬率分析）](#Return_analysis)
- [Information（資訊分析）](#Information_analysis)
- [Turnover（周轉率分析）](#Turnover_analysis)

### 透過以上的功能，可以從中了解以下內容，並輔助後續的回測：

- 因子預測力的好壞。
- 因子的周轉率是否過高（可能導致較高的交易成本）。
- 持有期應該如何設置最恰當。
- 因子在所有部門中的表現是否一致。
- 在多空對沖策略中，哪些股票應該做多，哪些股票應該放空。
- 應該用哪一種權重形成投資組合？等權重（equally weighted）或因子加權（factor weighted）。

若提供群集資料(比如: 產業類別)，可以透過加入 `by_group=True` 根據不同群集繪製出不同因子分析圖表。
- [Groupwise Performance](#Groupwise)
### 後續研究：  

當使用Alphalens分析因子後，我們可以了解因子的**預測能力**及**因子最佳的交易方式**。但因為Alphalens不考慮股票交易時所產生的**手續費、滑價、暫停交易、漲跌停**等因素，故後續可以再透過Zipline、Pyfolio或其他分析工具進行更深入的分析，了解因子在實際交易上的可能性。

# Alpjalens 介紹

```python
import os 
StockList = 
['1227', '1234', '1304', '1314', '1434', '1440', '1476', '1504', '1507', '1590', '1605', '1710', '1717', '1723', '1789',
 '1802', '1907', '2006', '2015', '2049', '2101', '2103', '2106', '2204', '2227', '2327', '2337', '2344', '2356', '2360', '2362',
 '2379', '2384', '2385', '2392', '2395', '2449', '2450', '2451', '2489', '2501', '2504', '2511', '2542', '2545', '2548',
 '2603', '2606', '2607', '2608', '2609', '2610', '2615', '2618', '2707', '2723', '2727', '2809', '2812', '2834', '2845',
 '2847', '2855', '2884', '2887', '2888', '2889', '2903', '2915', '3034', '3037', '3044', '3149', '3189', '3406', '3702', '4938',
 '4958', '5522', '5871', '6005', '6176', '6239', '6269', '6286', '8008', '8046', '8078', '8422', '9904', '9907', '9914', '9917', '9921',
 '9933', '9940', '9945', '2458', '2206', '1201', '2347', '3231', '5534', '6116', '9910', '1477', '2353', '6271', '1319',
 '1722', '2059', '3060', '3474', '3673', '2393', '2376', '2439', '3682', '2201', '2377', '3576', '2352', '2838', '8150',
 '2324', '2231', '8454', '2833', '6285', '6409', '1536', '1702', '2313', '2498', '2867', '6415', '6456', '9938', '2383', '4137', 
 '1707', '1589', '2849', '6414', '8464', '2355', '2345', '3706', '2023', '2371', '1909', '2633', '3532', '9941', '2492', '3019',
 '3443', '4915', '4943', '1229', '2441', '2027', '3026', '1210', '2104', '2456', '5269', '8341', '2354', '3005', '3481', '6669',
 '2409', '3023', '6213', '2404', '3533', '6278', '6592', '3653', '3661', '3665', '2301', '3714', '2883', '2890', '6531', '1904',
 '2014', '2105', '2108', '2474', '2637', '6781', '1102', '4919', '1402', '3035', '3036', '4961', '6719', '6770', '2368', '1795',
 '6550', '6789', '3017', '1101', '1216', '1301', '1303', '1326', '2002', '2207', '2303', '2308', '2311', '2317', '2325', '2330',
 '2357', '2382', '2412', '2454', '2801', '2880', '2881', '2882', '2885', '2886', '2891', '2892', '2912', '3008', '3045', '3697',
 '4904', '5880', '6505', '2408', '3711', '5876', '6452','5264', '2823','1262', '2448', '1704']


os.environ['ticker'] = ' '.join(StockList)
os.environ['TEJAPI_BASE'] = "https://api.tej.com.tw"
os.environ['TEJAPI_KEY'] = 'YOUR KEY'



os.environ['mdate'] = "20180726 20230726"

!zipline ingest -b tquant
```

```python
import pandas as pd 
import numpy as np 
import seaborn as sns
import matplotlib.pyplot as plt
from scipy import stats
import alphalens
import TejToolAPI
import tejapi

%matplotlib inline
plt.rcParams['figure.dpi'] = 200
sns.set_style('white')
```

## 觀察載入資料

```python
from zipline.data.data_portal import get_bundle

df_bundle = get_bundle(bundle_name = 'tquant',
                        calendar_name = 'TEJ',
                        start_dt = pd.Timestamp("2018-07-26", tz = "UTC"),
                        end_dt = pd.Timestamp("2023-07-26", tz = "UTC"))

df_bundle.head(15)
```

## 建立因子

本次發想至 Fama-French 三因子模型中的 SMB 因子，以每日各公司標準化後的市值作為因子進行後續因子分析。

```python
from zipline.data import bundles

bundle = bundles.load("tquant")
sids = bundle.asset_finder.equities_sids
assets = bundle.asset_finder.retrieve_all(sids)
symbols = [i.symbol for i in assets]
columns = ["Market_Cap_Dollars"]

mkt_value = TejToolAPI.get_history_data(
    ticker = symbols,
    columns = columns,
    tranfer_to_chinese = False,
    start = pd.Timestamp("2018-07-02", tz = "UTC"),
    end = pd.Timestamp("2023-07-02", tz = "UTC"),
    fin_type = ["A"],
    include_self_acc = "Y"
)
```
```python
import pytz
mkt_value['mdate'] = pd.to_datetime(mkt_value['mdate'])

means = mkt_value.groupby("mdate").mean()
stds = mkt_value.groupby("mdate").std()
means.rename({"Market_Cap_Dollars":"mean"}, axis = 1, inplace = True)
stds.rename({"Market_Cap_Dollars":"std"}, axis = 1, inplace = True)
ovo = means.merge(stds, left_index = True, right_index = True)
mkt_value_med = mkt_value.merge(ovo, left_on = "mdate", right_index = True).reset_index(drop=True)
mkt_value_med["MKTValue"] = (mkt_value_med.Market_Cap_Dollars - mkt_value_med['mean']) / mkt_value_med['std']
mkt_value_med['mdate'] = mkt_value_med['mdate'].dt.tz_localize(pytz.utc)
mkt_value_med.set_index(['mdate', 'coid'], inplace = True)
mkt_value = mkt_value_med.MKTValue
```
```python
mkt_value
```

## 取得價格資料

也可以使用`get_bundle_price`來取得價格資料。
```python
from zipline.data.data_portal import get_bundle_price

# fields可指定撈取的欄位，預設為" * "，代表取得所有欄位。
# 支援的field：
# ["*","open", "high", "low", "close", "volume","open_adj", "high_adj", "low_adj", "close_adj", "volume_adj"]
pricing = get_bundle_price(start_dt=pd.Timestamp("2018-07-26"),
                           end_dt=pd.Timestamp("2023-07-26"),
                           fields='open_adj',
                           transform=True)['open_adj']

pricing.columns = [x.symbol for x in pricing.columns]

pricing = df_bundle[['date','symbol','open_adj']].set_index(['date','symbol']).iloc[1:].unstack('symbol')['open_adj']
pricing.head(6)
```

## Sector mapping

取得資產的產業類別
```python
sector = tejapi.fastget('TWN/APISTKATTR',
                    coid=df_bundle.symbol.unique(),
                    opts={'columns':['coid','main_ind_e','main_ind_c']},
                    paginate=True).rename(columns={'coid':'symbol',
                                                   'main_ind_e':'sector',
                                                   'main_ind_c':'sector_code'})
                                                   
sector_map = sector.set_index("symbol")['sector'].to_dict()
sector_map

# 建立因子與報酬表

## Further information

```python
alphalens.utils.get_clean_factor_and_forward_returns(factor,
                                                     prices,
                                                     groupby=None,
                                                     binning_by_group=False,
                                                     quantiles=5,
                                                     bins=None,
                                                     periods=(1, 5, 10),
                                                     filter_zscore=20,
                                                     groupby_labels=None,
                                                     max_loss=0.35,
                                                     zero_aware=False,
                                                     cumulative_returns=True)
```

- 利用`alphalens.utils.get_clean_factor_and_forward_returns()`將因子資料（`factor`參數）、價格資料（`prices`參數）以及部門資料（`groupby`參數）整理成一個資料表，以利後續計算，這個資料表的索引（index）是日期（DatetimeIndex）及公司碼（asset）。
- 此外這邊也會針對因子資料或價格資料缺值的資料做清理，確保可以正確計算。
- 最重要的是這邊會利用因子資料將樣本分組（`quantiles`、`bins`、`binning_by_group`、`zero_aware`參數）及利用預計的持有期（`periods`參數）計算持有期報酬率。
  - `quantiles`、`bins`、`binning_by_group`：
    - quantiles：*int or sequence[float]*
      - 利用樣本公司數量來分組，**預設值為5**。參考[pandas.qcut](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.qcut.html#pandas.qcut)。
      - `quantile`與`bins`只能擇一使用。
      - 當quantiles為*int*：將樣本按照數量盡可能平均分配至各組，若樣本公司有100家，欲將樣本公司分為5組（`quantile=5`），且每一組皆須有20家公司，則quantiles方法會將因子値（`factor`）最小的20家公司分到第1組，因子値最大的20家公司分到第5組，以此類推。
      - 當quantiles為*sequence[float]*：允許數量不均等的分組，若有以下5個factor：[1,2,3,4,5]且**quantiles=[0, .5, 1.]**（代表會分為兩組：(0,0.5]及(0.5,1.]），則[1,2,3]會被分到第1組；[4,5]會被分到第2組。
    - bins：*int or sequence[float]*
      - 利用因子取値範圍分組，類似直方圖的概念。參考[pandas.cut](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.cut.html#pandas.cut)。
      - `quantile`與`bins`只能擇一使用。若要使用bins必須設定**`quantile`=None**，因`quantile`預設值為5。
      - 當bins為*int*：若因子取値於0至100，欲按因子値（`factor`）數值大小均分為5組（`bins=5`），則bins方法會將因子値介於0到20的公司分到第1組，因子値介於21~40的公司分到第2組，以此類推。每一組的公司數目不一定相同。
      - 當bins為*sequence[float]*：允許間距不均等的分組，若有以下4個factor：[1, 2, 3, 4]且**bins=[0, 3, 4]**（代表會分為兩組：(0., 3.]及(3., 4.]），則[1,2,3]會被分到第1組；[4]會被分到第2組。
    - binning_by_group：*bool*
      - 可結合上述兩者做部門內分組，達成**部門中立（group neutral）**的效果。
      - 以結合quantiles及binning_by_group的分組方式為例，若欲分為5組（`quantile=5`且`binning_by_group=True`），則該方法會將每一個部門內因子値最小的一群公司分到第1組，因子値最大的一群公司分到第5組。
  - `zero_aware`：*bool, optional*
    - 預設為False，當設定為True時，**quantiles或bins必須是整數**。
    - 若設定為True時，會先將因子（`factor`）資料依數值大小分為 **>=0**及 **<0**兩組，再個別將兩組內的資料平均切分（quantiles//2）。
    - 以結合`quantiles`及`zero_aware`的分組方式為例，若有以下10個factor：[-4,-3,-2,-1,1,2,3,4,5,6]欲分為5組（`quantile=5`且`zero_aware=True`），則：
      - 先將5//2得到2，因此因子值>=0的樣本平均分2組；因子值<0的樣本平均分2組，總共4組。
      - -4及-3分至第1組；-2及-1分至第2組；1、2及3分至第3組；4、5及6分至第4組。
- 另外，利用`filter_zscore`參數可以將大於平均值X倍標準差的持有期報酬率修改為nan。（不推薦使用，因為這會產生lookahead bias）

## 因子資料及價格資料的一些規範：
- `factor`及`prices`資料的timezone要一致。
- `factor`及`prices`資料的DatetimeIndex不可其中一個是timezone-aware另一個是timezone-naive。
- `factor`及`prices`資料的日期起訖可以不一樣，但不能一邊有非交易日，一邊都是交易日。  
  （否則會報錯`ValueError: Inferred frequency None from passed values does not conform to passed frequency C`）

## 持有期報酬率
因為這邊是模擬利用因子做逐日交易的策略，所以持有期報酬率是每日計算。  
（若提供的因子、價格及部門分類資料為月頻率，則持有期報酬率就是逐月計算） 

根據《Fundamental law of active management》（Grinold, 1989）一書，投資組合獲取超額報酬的能力可以用資訊比率衡量（IR），IR又可以拆分成資訊係數（IC）及投資策略廣度（BR）。公式如下：  

$$ IR=IC * \sqrt {BR} $$

其中，IC是利用因子値與持有期報酬率間的相關係數來衡量因子有效性，隱含經理人的預測能力，這部份會於資訊分析（information）中說明。  
  
而BR則可以透過提高交易的頻率來改善，並近一步提升IR。舉例來說，若是每日換股，則每年交易次數約為252次；若是每22天換一次股，則會降低每一年的交易次數（約為252／22次），進而降低報酬。  
  
為了避免這個情況，Alphalens模擬一種策略：以持有期為22天為例，利用持有期訂定一個交易週期（22天），並且將本金分為22等份。每一天利用其中1等份的本金交易，22天後調整持股，所以總共會有22個投資組合。此外，由於將本金分成22份，滑價（slippage） 的影響也會降低。
<br>

> 持有期報酬率計算：$${個股i、日期為t且持有期間為n的持有期報酬率=}\frac{(股價_{i,t+n})}{股價_{i,t}}{-1}$$   
>
> 範例：
>
> date=2013-01-02，asset=1102，持有1D報酬率 =（2013-01-03收盤價／2013-01-02收盤價）－1。

```python
factor_data = alphalens.utils.get_clean_factor_and_forward_returns(mkt_value,
                                                                   pricing,
                                                                   quantiles = 5,
                                                                   bins = None,
                                                                   groupby = sector_map
                                                                  )

factor_data                                                                  
```

# Analysis

## Alphalens提供以下三種類型的因子分析工具，讓我們對因子有初步的了解：
- Returns（報酬率分析）
- Information（資訊分析）
- Turnover（周轉率分析）

## 透過以上的功能，可以從中了解以下內容，並輔助後續的回測：

- 因子預測力的好壞。
- 因子的周轉率是否過高（可能導致較高的交易成本）。
- 持有期應該如何設置最恰當。
- 因子在所有部門中的表現是否一致。
- 在多空對沖策略中，哪些股票應該做多，哪些股票應該放空。
- 應該用哪一種權重形成投資組合？等權重（equally weighted）或因子加權（factor weighted）。

## 後續研究：  

當使用Alphalens分析因子後，我們可以了解因子的**預測能力**及**因子最佳的交易方式**。但因為Alphalens不考慮股票交易時所產生的**手續費、滑價、暫停交易、漲跌停**等因素，故後續可以再透過Zipline、Pyfolio或其他分析工具進行更深入的分析，了解因子在實際交易上的可能性。