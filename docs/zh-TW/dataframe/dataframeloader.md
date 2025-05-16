# Pipeline DataFrameLoader - Pipeline API with Custom Data
---
`DataFrameLoader` 允許將客製化的數據透過 DataFrame 導入至 pipeline 中，本範例將演示 `DataFrameLoader` 的用法。

Imports & Settings

``` py linenums="1" 
import os
import pandas as pd

os.environ['TEJAPI_BASE'] = 'https://api.tej.com.tw'
os.environ['TEJAPI_KEY'] = 'YOUR KEY'


from zipline.pipeline import Pipeline
from zipline.pipeline.loaders import EquityPricingLoader
from zipline.pipeline.loaders.frame import DataFrameLoader
from zipline.pipeline.data import Column, DataSet, TQAltDataSet, EquityPricing
from zipline.pipeline.engine import SimplePipelineEngine
from zipline.pipeline.domain import TW_EQUITIES

from zipline.data.data_portal import bundles
from zipline.data.run_ingest import simple_ingest

from zipline.sources.TEJ_Api_Data import get_universe

from TejToolAPI.TejToolAPI import get_history_data
```

獲取外部資料，並進行整理

#### 載入先前已導入的 tquant bundle
- 若尚未執行 tquant bundle ingest 的流程，請先執行以下 simple_ingest 程式。
- `bundles.load` 函式負責從先前已經 ingest 的 bundle 中載入數據，使使用者能夠在 Zipline 環境中利用 `AssetFinder` 存取證券 `SID`（Security Identifier）。

``` py linenums="1" 
start = '2020-01-03'
end = '2025-02-07'

start_dt = pd.Timestamp(start, tz='utc')
end_dt = pd.Timestamp(end, tz='utc')

pool = get_universe(start, end, idx_id=['IX0002'])

#simple_ingest(name = 'tquant', tickers = pool, start_date = start , end_date = end)
```

``` py linenums="1" 
bundle_name = 'tquant'
bundle = bundles.load(bundle_name)
```

#### 取得證券標的（Symbols）
在 Zipline 中，`AssetFinder` 是一個專門負責管理資產（`Asset`）資訊的工具，提供查找和檢索證券標的的功能。以下四行程式碼分別執行：
    
1. 取得 bundle 中所有股票的 `SID`。
2. 透過 SID 取得對應的 `Asset` 物件。
3. 透過 `Asset` 物件取得交易代碼（`symbol`）。
4. 建立 `symbol` mapping `SID` 的對照。

``` py linenums="1"
sids = bundle.asset_finder.equities_sids
assets = bundle.asset_finder.retrieve_all(sids)
symbols = [i.symbol for i in assets]
symbol_map = dict(zip(symbols, sids))
```

#### 利用 TEJ TOOL API 獲取資料
這邊取得外資買賣超張數（`Qfii_Diff_Vol`）資料作為示範。

``` py linenums="1"
custom_data = get_history_data(
    ticker=symbols,
    columns=['Qfii_Diff_Vol'],
    start=start,
    end=end,
    transfer_to_chinese=False
)
```

``` py linenums="1"
custom_data.head()
```

整理外部資料以符合 `DataFrameLoader` 要求的格式
- 將外部資料作轉置，一個欄位整理為一個 DataFrame。
- 接著將外部資料的 coid 替換成 `SID`。
- 最後將外部資料的 mdate 設定為 UTC 時區。

註：此處資料採用**不平移**的方式進行處理

``` py linenums="1"
transform_data = (
    custom_data
    .set_index(['coid', 'mdate'])['Qfii_Diff_Vol']
    .unstack('coid')
    .rename(columns=symbol_map, errors='raise') # errors = 'raise' 會在遇到錯誤時拋出異常，避免 bundle 與 custom_data 資產不一致
    .tz_localize('UTC')
)
```

``` py linenums="1"
transform_data.head()
```
