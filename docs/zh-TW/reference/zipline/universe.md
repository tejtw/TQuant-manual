# Zipline 股票池 (Universe) 定義與管理

!!! info
    本頁提供 Zipline 中股票池 (Universe) 定義與管理的詳細指南，包括 `get_universe()` 函數的使用、透過 Pipeline 的 `screen` 參數進行動態篩選，幫助使用者提升回測效率。

在 Zipline 回測中，「股票池 (Universe)」是指您的交易策略在每個時間點上所能考慮或實際交易的資產集合。有效地定義和管理股票池，能夠大幅提升回測效率，並確保策略只關注相關或符合特定條件的資產。

本文件將說明如何利用 `get_universe()` 函數來定義靜態股票池，以及如何透過 `Pipeline` 的 `screen` 參數來實現動態篩選。

---

## 1. zipline.sources.TEJ_Api_Data.get_universe() 函數：定義靜態股票池

`zipline.sources.TEJ_Api_Data.get_universe()` 函數是 TQuant Lab 提供的一個強大工具，用於從 TEJ 資料庫中獲取符合特定篩選條件的資產列表。

**導入**: `from zipline.sources.TEJ_Api_Data import get_universe`
**用途**: 根據日期和多種篩選條件，獲取一組 Zipline 資產物件 (SID) 列表。

**參數**:

*   `start`: (`datetime` 或 `str`) 起始日期。
*   `end`: (`datetime` 或 `str`, 可選) 結束日期，預設為執行當天。
*   `idx_id`: (`str` 或 `list`, 可選) 指數代碼，例如 `'IX0002'` (台灣五十指數)。
*   `mkt`: (`str` 或 `list`, 可選) 市場類型，例如 `'TWSE'` (台灣證券交易所)、`'OTC'` (櫃檯買賣中心)。
*   `stktp_c` / `stktp_e`: (`str` 或 `list`, 可選) 股票類型，可使用中文或英文，例如 `'普通股'`, `'Common Stock'`。
*   `sub_ind_c` / `sub_ind_e`: (`str` 或 `list`, 可選) 次產業別。
*   `main_ind_c`: (`str` 或 `list`, 可選) 主要產業別。
*   更多篩選參數請參考 `get_universe` 的源碼或相關說明。

**返回值**: `pd.Series` 或 `list`，包含符合條件的資產物件 (Zipline `Asset` 物件)。

!!! note
    `get_universe()` 函數依賴於 TEJ API。因此，`TEJAPI_KEY` 和 `TEJAPI_BASE` 環境變數必須預先設定。

#### 範例：獲取台灣50指數成分股

```python
import pandas as pd
from zipline.sources.TEJ_Api_Data import get_universe
import os

# 假設已設定 TEJAPI_KEY 和 TEJAPI_BASE 環境變數
# os.environ['TEJAPI_KEY'] = 'YOUR_API_KEY'
# os.environ['TEJAPI_BASE'] = 'https://api.tej.com.tw'

start_date = pd.Timestamp('2020-01-01', tz='UTC')
end_date = pd.Timestamp('2023-01-01', tz='UTC')

# 獲取台灣50指數 (IX0002) 的成分股
tw50_assets = get_universe(start=start_date, end=end_date, idx_id='IX0002')

print(f"台灣50指數成分股數量: {len(tw50_assets)}")
print(tw50_assets.head())
```

---

## 2. 透過 Pipeline 的 screen 參數動態篩選

在 Zipline 中，`Pipeline` 提供了一種更為強大和動態的方式來定義每日的股票池。您可以利用各種因子（Factor）和過濾器（Filter）來構建複雜的篩選邏輯，並透過 `attach_pipeline()` 的 `screen` 參數將篩選結果應用於回測。

`screen` 參數應接收一個布林 Series (Boolean Series)，其中 `True` 表示該資產包含在 Universe 中。

#### 範例：篩選市值最大的股票

```python
from zipline.api import attach_pipeline, pipeline_output, set_benchmark, symbol
from zipline.pipeline import Pipeline
from zipline.pipeline.factors import AverageDollarVolume
from zipline.pipeline.filters import StaticAssets
from zipline.pipeline.data import EquityPricing

# 1. 定義 Pipeline
def make_my_pipeline():
    # 計算平均每日成交金額
    dollar_volume = AverageDollarVolume(window_length=20)
    
    # 篩選條件：市值前 100 大的股票
    # 這裡只是一個示意，實際的市值篩選可能需要更複雜的因子
    top_100_by_volume = dollar_volume.top(100) # 假設成交量與市值正相關

    return Pipeline(
        columns={
            'dollar_volume': dollar_volume
        },
        screen=top_100_by_volume # <--- 透過 screen 參數進行動態篩選
    )

# 2. 回測的 initialize 函數
def initialize(context):
    set_benchmark(symbol('IR0001'))
    # 附掛 Pipeline，並讓其 screen 參數定義當日 Universe
    attach_pipeline(make_my_pipeline(), 'my_dynamic_universe') 
    context.my_universe = None

# 3. 回測的 before_trading_start 函數 (獲取 Pipeline 篩選結果)
def before_trading_start(context, data):
    # 獲取 Pipeline 的輸出，其索引即為當日篩選出的 Universe
    context.my_universe = pipeline_output('my_dynamic_universe').index.get_level_values(1).tolist()

# 4. 回測的 handle_data 函數 (在篩選後的 Universe 中操作)
def handle_data(context, data):
    # 策略邏輯只對 context.my_universe 中的股票執行
    for asset in context.my_universe:
        if data.can_trade(asset):
            # ... 執行交易邏輯 ...
            pass
```