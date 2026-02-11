# 如何執行 Alphalens 因子分析

!!! info
    本頁提供如何在 TQuant Lab 中使用 Alphalens 進行因子分析的詳細指南，包括因子數據準備、清洗、對齊，以及生成完整的因子分析報表 (Tear Sheet)。

Alphalens 是一個強大的 Python 庫，專為量化投資中的因子（Alpha）分析而設計。它提供了一系列工具，用於評估因子（如價值、動量、成長等）的預測能力、收益貢獻、穩定性以及交易成本影響。透過 Alphalens，您可以深入了解因子的質量，為策略開發和優化提供關鍵洞察。

本指南將說明如何將 Zipline `Pipeline` 產生的因子數據導入 Alphalens，並生成完整的因子分析報表 (tearsheet)。

---

## 1. 因子數據準備

在將因子數據傳遞給 Alphalens 之前，您需要從 Zipline `Pipeline` 的輸出中提取因子值和相應的股票價格，並將它們整理成 Alphalens 所需的特定格式。`alphalens.utils.get_clean_factor_and_forward_returns()` 函數是完成此步驟的核心工具。

#### 核心數據類型：
*   `factor`: `pd.Series`，包含因子值，索引通常為 `(日期, 資產)` 的 MultiIndex。
*   `prices`: `pd.DataFrame` 或 `pd.Series`，包含股票的歷史價格數據，通常是收盤價。
*   `groupby`: (可選) `pd.Series` 或 `dict`，用於指定股票的所屬分組（例如行業、板塊），以便進行分組分析。

#### 數據提取與清洗函數：get_clean_factor_and_forward_returns()

此函數會清洗因子數據（處理 NaN 值、極端值等），並根據提供的價格數據計算出不同持有期的遠期報酬率 (forward returns)，最終將數據轉換為 Alphalens 分析所需的 `factor_data` 格式。

*   `factor`: (必要) 因子數據。
*   `prices`: (必要) 價格數據。
*   `groupby`: (可選) 分組數據。
*   `periods`: (可選) 遠期報酬率的持有期列表，例如 `[1, 5, 10]` 代表計算 1 天、5 天、10 天後的報酬率。

```python
import pandas as pd
import alphalens.utils as alu

# 假設 factor_values 是您從 Zipline Pipeline 獲得的因子數據 (pd.Series)
# 假設 pricing_data 是您的股票歷史價格數據 (pd.DataFrame)

# 例如：從 Zipline 回測結果中獲取因子和價格
# from zipline.pipeline import Pipeline
# from zipline.pipeline.factors import SimpleMovingAverage
# from zipline.pipeline.data import EquityPricing
# from zipline import run_algorithm
# ... (Zipline 回測設置)

# # 假設你已經運行了包含 Pipeline 的 backtest，results 中包含了 factor_values 和 pricing_data
# # 為了範例中獨立演示，這裡創建一些模擬數據
# dates = pd.to_datetime(pd.date_range('2020-01-01', periods=100, freq='D'), tz='UTC')
# assets = ['2330', '2303', '2454']
# # factor_index = pd.MultiIndex.from_product([dates, assets], names=['date', 'asset'])
# factor_values = pd.Series(np.random.rand(len(factor_index)), index=factor_index)
# # price_index = pd.MultiIndex.from_product([dates, assets], names=['date', 'asset'])
# price_values = pd.Series(100 + np.random.randn(len(price_index)).cumsum(), index=price_index)
# pricing_data = price_values.unstack().loc[dates, assets] # 轉換為 DataFrame 格式
# # # --- 實際從 Zipline 獲取數據的範例 ---
# # from zipline.pipeline import Pipeline
# # from zipline.pipeline.factors import SimpleMovingAverage
# # from zipline.pipeline.data import EquityPricing
# # from zipline.api import attach_pipeline, pipeline_output, symbol, set_benchmark
# # from zipline import run_algorithm
# #
# # def make_simple_pipeline():
# #     sma_factor = SimpleMovingAverage(inputs=[EquityPricing.close], window_length=20)
# #     return Pipeline(columns={'my_factor': sma_factor})
# #
# # def initialize(context):
# #     context.assets = [symbol('2330'), symbol('2303')]
# #     attach_pipeline(make_simple_pipeline(), 'my_pipeline')
# #     set_benchmark(symbol('IR0001'))
# #
# # def handle_data(context, data):
# #     pass
# #
# # def analyze(context, perf):
# #     pass
# #
# # results = run_algorithm(
# #     start=pd.Timestamp('2020-01-01', tz='UTC'),
# #     end=pd.Timestamp('2021-01-01', tz='UTC'),
# #     initialize=initialize,
# #     handle_data=handle_data,
# #     analyze=analyze,
# #     capital_base=1e6,
# #     bundle='tquant'
# # )
# #
# # # 提取 factor
# # factor_values = results.xs('my_pipeline', level=1, axis=1)['my_factor']
# #
# # # 提取價格數據 (通常是 Zipline results 中的 'close_price')
# # pricing_data = results['close_price'] # 這需要根據實際 results 結構調整


# 獲取清洗後的因子數據和遠期報酬
# 這裡使用一個簡單的模擬 factor 和 pricing_data 進行演示
# 在真實場景中，這些數據會來自 Zipline Pipeline 的輸出
factor_values = pd.Series(
    data=[0.5, 0.2, -0.1, 0.8, -0.3, 0.1],
    index=pd.MultiIndex.from_tuples([
        (pd.Timestamp('2022-01-03', tz='UTC'), '2330'),
        (pd.Timestamp('2022-01-03', tz='UTC'), '2454'),
        (pd.Timestamp('2022-01-04', tz='UTC'), '2330'),
        (pd.Timestamp('2022-01-04', tz='UTC'), '2454'),
        (pd.Timestamp('2022-01-05', tz='UTC'), '2330'),
        (pd.Timestamp('2022-01-05', tz='UTC'), '2454'),
    ], names=['date', 'asset'])
)

pricing_data = pd.DataFrame(
    data={'2330': [100, 101, 102], '2454': [50, 51, 52]},
    index=pd.to_datetime(['2022-01-03', '2022-01-04', '2022-01-05'], tz='UTC')
)


factor_data = alu.get_clean_factor_and_forward_returns(
    factor=factor_values,
    prices=pricing_data,
    periods=[1, 5, 10] # 計算 1, 5, 10 日的遠期報酬
)

print(factor_data.head())
```

---

## 2. 生成完整的因子分析報表 (create_full_tear_sheet())

當您準備好 `factor_data` 後，就可以使用 `alphalens.tears.create_full_tear_sheet()` 函數來生成包含各項圖表和統計數據的完整因子分析報表。

#### 主要參數：
*   `factor_data`: (必要) 經過 `get_clean_factor_and_forward_returns()` 處理後的因子數據。
*   `gross_returns`: (可選) 策略的每日總報酬率 (`pd.Series`)。如果提供，一些與策略總報酬相關的分析也會被包含。

```python
import alphalens.tears as alt

# ... (上述因子數據準備的程式碼)

alt.create_full_tear_sheet(factor_data)
```

執行後，Alphalens 會生成一系列的圖表和表格，涵蓋了因子的各個方面，包括：
*   **收益分析**: 因子分位數收益、因子迴歸分析。
*   **信息係數 (Information Coefficient, IC) 分析**: 每日、月度、年度 IC。
*   **週轉率 (Turnover) 分析**: 因子和分位數週轉率。
*   **持倉分析**: 因子曝光度等。

---

## 3. 完整範例

以下將演示如何結合 Zipline `Pipeline` 輸出數據，透過 Alphalens 生成完整的因子分析報表。

!!! tip
    在執行此範例前，請確保您已經使用 `zipline ingest -b tquant` [匯入了價量資料](../data/ingest-spot-pricing.md)，並且資料範圍涵蓋了回測期間。

```python
import pandas as pd
import numpy as np
from zipline import run_algorithm
from zipline.api import attach_pipeline, pipeline_output, symbol, set_benchmark
from zipline.pipeline import Pipeline
from zipline.pipeline.factors import SimpleMovingAverage
from zipline.pipeline.data import EquityPricing
import alphalens.utils as alu
import alphalens.tears as alt
import matplotlib.pyplot as plt

# 1. 定義一個簡單的 Pipeline 來計算因子 (例如：短期均線與長期均線之差)
def make_simple_pipeline():
    short_sma = SimpleMovingAverage(inputs=[EquityPricing.close], window_length=10)
    long_sma = SimpleMovingAverage(inputs=[EquityPricing.close], window_length=30)
    
    # 因子定義：短期均線減去長期均線
    my_factor = short_sma - long_sma
    
    # 這裡我們還需要價格數據來計算遠期報酬，所以也一併獲取
    return Pipeline(columns={
        'my_factor': my_factor,
        'close_price': EquityPricing.close.latest
    })

# 2. Zipline 回測設置
def initialize(context):
    context.assets = [symbol('2330'), symbol('2454'), symbol('IR0001')] # 包含Benchmark
    attach_pipeline(make_simple_pipeline(), 'my_pipeline')
    set_benchmark(symbol('IR0001')) # 設定Benchmark

def handle_data(context, data):
    pass # 這裡只收集數據，不執行交易

def analyze(context, results):
    pass # Alphalens 將處理分析和視覺化

# 3. 執行 Zipline 回測
results = run_algorithm(
    start=pd.Timestamp('2020-01-01', tz='UTC'),
    end=pd.Timestamp('2022-01-01', tz='UTC'),
    initialize=initialize,
    handle_data=handle_data,
    analyze=analyze,
    capital_base=1_000_000,
    bundle='tquant'
)

# 4. 從回測結果中提取因子和價格數據
# Pipeline 的輸出會在 results DataFrame 中，通常以 MultiIndex 形式出現
# 這裡需要根據實際 results 結構調整提取方式
# 假設 my_factor 在 results.xs('my_pipeline', level=1, axis=1)['my_factor']
# 假設 close_price 在 results['close_price']
# 注意：這裡需要處理 results DataFrame 的實際結構來精確提取
# 因為 run_algorithm 會將整個 pipeline_output 放在 results 的 'pipeline_output' 欄位下
# 例如：
factor_values = results.xs('my_pipeline', level=1, axis=1)['my_factor'].dropna() # 提取因子值
# 需要一個單一的價格序列 (通常是 close_price)
# 由於 Zipline results 的結構可能較為複雜，這裡假設一個簡化的提取方式
# 實際使用時，應根據 results DataFrame 的結構精確提取各資產的收盤價
all_prices = results['close_price'] # 或者從 pipeline output 中提取
# 確保 factor_values 和 all_prices 的索引對齊
# Alphalens要求 prices 的索引為日期，columns為資產
pricing_data = all_prices.unstack().reindex(index=factor_values.index.get_level_values('date').unique(),
                                              columns=factor_values.index.get_level_values('asset').unique())
pricing_data = pricing_data.stack().reindex(factor_values.index).unstack() # 確保與factor的索引對齊

# 5. 清洗因子數據並計算遠期報酬
factor_data = alu.get_clean_factor_and_forward_returns(
    factor=factor_values,
    prices=pricing_data,
    periods=[1, 5, 10] # 計算 1, 5, 10 日的遠期報酬
)

# 6. 生成完整的 Alphalens 績效報表
alt.create_full_tear_sheet(factor_data)

# 確保繪圖環境顯示
plt.show()
```