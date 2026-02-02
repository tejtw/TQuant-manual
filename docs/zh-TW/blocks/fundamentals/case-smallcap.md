# 案例 2：小型成長股策略

> **策略類型：** 財報選股架構 - 排名法  
> **調倉頻率：** 固定週期（預設 20 天）  
> **股票池：** 台灣上市 + 上櫃普通股  
> **回測期間：** 2015-01-01 ~ 2025-05-27

---

## 📌 策略概述

這是一個專注於 **小型成長股** 的量化策略，核心理念是：

> 在市值較小的公司中，找出高成長且估值合理的標的。

小型股通常具有：

- 📈 更高的成長潛力
- 💎 市場關注度低，存在定價錯誤
- ⚡ 波動較大，需要嚴格篩選

### 策略特色

1. **多條件篩選 → 排名法選股**：先用 5 個條件過濾，再按 PEG 排序取前 20%
2. **風險偏好監控**：追蹤 OTC/TSE 比率，判斷市場對小型股的態度
3. **槓桿控制**：當槓桿 > 1.2 時自動調降部位

---

## 🎯 選股條件詳解

### 階段 1：基本篩選（5 個條件）

#### 條件 1: 小型股過濾（市值 ≤ 平均值 × 30%）
```python
df['avg_mkt'] = df.groupby('mdate')['Market_Cap_Dollars'].transform('mean')
set_1 = set(df[df['Market_Cap_Dollars'] <= df['avg_mkt'] * 0.3]['coid'])
```
**邏輯：** 專注於市值較小的公司，這些公司通常被大型機構投資者忽視。

#### 條件 2: 高成長（淨利成長率 ≥ 15%）
```python
set_2 = set(df[df['Net_Income_Growth_Rate_Q'] >= 15]['coid'])
```
**邏輯：** 單季淨利成長率至少 15%，確保公司處於快速成長期。

#### 條件 3: 毛利率 ≥ 產業平均
```python
df['ind_gross_margin_mean'] = df.groupby(['mdate', 'Industry'])['Gross_Margin_Rate_percent_Q'].transform('mean')
set_3 = set(df[df['Gross_Margin_Rate_percent_TTM'] >= df['ind_gross_margin_mean']]['coid'])
```
**邏輯：** 高毛利率代表產品競爭力強，定價權高。

#### 條件 4: 董監持股 > 市場平均
```python
df['avg_ds_ratio'] = df.groupby('mdate')['Director_and_Supervisor_Holdings_Percentage'].transform('mean')
set_4 = set(df[df['Director_and_Supervisor_Holdings_Percentage'] > df['avg_ds_ratio']]['coid'])
```
**邏輯：** 內部人持股高，代表對公司信心足，利益與股東一致。

#### 條件 5: PEG < 1.0（成長合理估值）
```python
df['PEG'] = df['PER_TWSE'] / df['Operating_Income_Growth_Rate_TTM']
set_5 = set(df[df['PEG'] < 1.0]['coid'])
```
**邏輯：** PEG = 本益比 / 成長率，< 1 代表估值相對成長率便宜。

### 階段 2：排名法選股
```python
passed = set_1 & set_2 & set_3 & set_4 & set_5
top_n = int(len(passed) * 0.2)  # 取前 20%

filtered_df = df[df['coid'].isin(passed)]
top_df = filtered_df.sort_values(by='PEG').head(top_n)  # PEG 最小的前 20%

tickers = list(top_df['coid'])
```

**核心思想：** 不是所有通過條件的股票都買，而是挑出 PEG 最低（最便宜）的前 20%。

---

## 💻 完整程式碼
```python
# ====================================
# 小型成長股策略 - 完整實作
# ====================================

import pandas as pd
import numpy as np
import tejapi
import os
import json
import matplotlib.pyplot as plt

plt.rcParams['font.family'] = 'Arial'

# ====================================
# TEJ API 設定
# ====================================
tej_key = 'your_key'
tejapi.ApiConfig.api_key = tej_key
os.environ['TEJAPI_BASE'] = "https://api.tej.com.tw"
os.environ['TEJAPI_KEY'] = tej_key

# ====================================
# 參數設定
# ====================================
start_date = '2010-01-01'
end_date = '2025-05-27'
back_start = '2015-01-01'  # 實際回測起始日
rebalance_freq = 20        # 調倉頻率（天）

# ====================================
# 股票池設定
# ====================================
from zipline.sources.TEJ_Api_Data import get_universe

pool = get_universe(
    start=start_date,
    end=end_date,
    mkt_bd_e=['TSE', 'OTC'],
    stktp_e=['Common Stock-Foreign', 'Common Stock']
)

print(f"股票池: {len(pool)} 檔")

# ====================================
# 財報數據下載
# ====================================
import TejToolAPI

columns = [
    'coid',       # 股票代碼
    'Industry',   # 產業別
    'roi',        # 投資報酬率
    'mktcap',     # 市值
    'r405',       # 營業利益成長率
    'r403',       # 淨利成長率
    'per',        # 本益比
    'r105',       # 毛利率
    'fld005'      # 董監持股比率
]

start_dt = pd.Timestamp(start_date, tz='UTC')
end_dt = pd.Timestamp(end_date, tz='UTC')

data_use = TejToolAPI.get_history_data(
    start=start_dt,
    end=end_dt,
    ticker=pool + ['IR0001'],
    fin_type=['Q', 'TTM'],
    columns=columns,
    transfer_to_chinese=False
)

# ====================================
# 數據預處理
# ====================================
data_use = data_use.sort_values(['mdate', 'coid'])

# 計算全市場平均值
data_use['avg_mkt'] = data_use.groupby('mdate')['Market_Cap_Dollars'].transform('mean')
data_use['avg_ds_ratio'] = data_use.groupby('mdate')['Director_and_Supervisor_Holdings_Percentage'].transform('mean')

# 計算產業平均毛利率
data_use['ind_gross_margin_mean'] = data_use.groupby(['mdate', 'Industry'])['Gross_Margin_Rate_percent_Q'].transform('mean')

# 計算 PEG
data_use['PEG'] = data_use['PER_TWSE'] / data_use['Operating_Income_Growth_Rate_TTM']

print(f"數據筆數: {len(data_use):,}")

# ====================================
# 選股函數
# ====================================
def compute_stock(date, data):
    """
    小型成長股選股函數
    
    Returns:
    --------
    tickers : list
        入選股票代碼
    sets : list
        各條件通過數量（用於監控）
    """
    df = data[data['mdate'] == pd.to_datetime(date)].reset_index(drop=True)

    # 條件 1: 小型股（市值 ≤ 平均 × 30%）
    set_1 = set(df[df['Market_Cap_Dollars'] <= df['avg_mkt'] * 0.3]['coid'])
    
    # 條件 2: 高成長（淨利成長 ≥ 15%）
    set_2 = set(df[df['Net_Income_Growth_Rate_Q'] >= 15]['coid'])
    
    # 條件 3: 毛利率 ≥ 產業平均
    set_3 = set(df[df['Gross_Margin_Rate_percent_TTM'] >= df['ind_gross_margin_mean']]['coid'])
    
    # 條件 4: 董監持股 > 市場平均
    set_4 = set(df[df['Director_and_Supervisor_Holdings_Percentage'] > df['avg_ds_ratio']]['coid'])
    
    # 條件 5: PEG < 1.0
    set_5 = set(df[df['PEG'] < 1.0]['coid'])

    # 取交集
    passed = set_1 & set_2 & set_3 & set_5 & set_4

    # 排名法：取前 20%
    top_n = int(len(passed) * 0.2)

    filtered_df = df[df['coid'].isin(passed)]
    top_df = filtered_df.sort_values(by='PEG').head(top_n)
    
    tickers = list(top_df['coid'])
    sets = [len(set_1), len(set_2), len(set_3), len(set_4), len(set_5)]

    return tickers, sets

# ====================================
# 風險偏好指標（OTC/TSE 比率）
# ====================================
codes = ['IR0001', 'IR0043']
co = ['coid', 'Industry', 'mkt', 'vol', 'open_d', 'high_d', 'low_d', 'close_d', 
      'roi', 'shares', 'per', 'pbr_tej', 'mktcap']

data_index = TejToolAPI.get_history_data(
    start=start_dt,
    end=end_dt,
    ticker=codes,
    columns=co,
    transfer_to_chinese=False
)

# 篩選時間
data_index = data_index[data_index['mdate'] >= back_start]

# 分別取出 TSE 與 OTC 並標準化
tse = data_index[data_index['coid'] == 'IR0001'][['mdate', 'Close']].copy()
otc = data_index[data_index['coid'] == 'IR0043'][['mdate', 'Close']].copy()

tse.rename(columns={'Close': 'TSE_Close'}, inplace=True)
otc.rename(columns={'Close': 'OTC_Close'}, inplace=True)

# 合併
merged = pd.merge(tse, otc, on='mdate', how='inner')

# 標準化：以首日為基準
merged['TSE_norm'] = merged['TSE_Close'] / merged['TSE_Close'].iloc[0] * 100
merged['OTC_norm'] = merged['OTC_Close'] / merged['OTC_Close'].iloc[0] * 100

# 計算風險偏好比（OTC / TSE）
merged['OTC_TSE_ratio'] = merged['OTC_norm'] / merged['TSE_norm']

# 繪圖
fig, axes = plt.subplots(2, 1, figsize=(12, 8), sharex=True)

axes[0].plot(merged['mdate'], merged['TSE_norm'], label='TSE')
axes[0].plot(merged['mdate'], merged['OTC_norm'], label='OTC')
axes[0].set_title('Normalized Index Performance (Base = 100)')
axes[0].legend()
axes[0].grid(True)

axes[1].plot(merged['mdate'], merged['OTC_TSE_ratio'], label='OTC / TSE')
axes[1].set_title('Risk Appetite Ratio (OTC / TSE)')
axes[1].axhline(1.0, color='gray', linestyle='--', linewidth=1)
axes[1].legend()
axes[1].grid(True)

plt.tight_layout()
plt.show()

# ====================================
# 匯入價量資料
# ====================================
from zipline.data.run_ingest import simple_ingest

pools = pool + ['IR0001', 'IR0043']
start_ingest = start_date.replace('-', '')
end_ingest = end_date.replace('-', '')

print('開始匯入回測資料')
simple_ingest(
    name='tquant',
    tickers=pools,
    start_date=start_ingest,
    end_date=end_ingest
)
print('結束匯入回測資料')

# ====================================
# Zipline 回測設定
# ====================================
from zipline.api import (
    set_slippage, set_commission, set_benchmark,
    symbol, record, order, order_target, order_value
)
from zipline.finance import commission, slippage
from zipline import run_algorithm

def initialize(context, re=20):
    """初始化函數"""
    set_slippage(slippage.VolumeShareSlippage(volume_limit=1, price_impact=0.01))
    set_commission(commission.Custom_TW_Commission())
    set_benchmark(symbol('IR0001'))

    context.i = 0
    context.state = False
    context.order_tickers = []
    context.last_tickers = []
    context.rebalance = re  # 調倉頻率
    context.dic = {}

def handle_data(context, data):
    """每日執行函數"""
    # 避免前視偏差，在篩選股票下一交易日下單
    if context.state == True:
        # 賣出不在新名單的股票
        for i in context.last_tickers:
            if i not in context.order_tickers:
                order_target(symbol(i), 0)

        # 買入新名單的股票（等權重）
        for i in context.order_tickers:
            order_target(symbol(i), 1.0 / len(context.order_tickers))
            context.dic[i] = data.current(symbol(i), 'price')

        record(p=context.dic)
        context.dic = {}

        print(f"下單日期：{data.current_dt.date()}, 擇股股票數量：{len(context.order_tickers)}, Leverage: {context.account.leverage}")
        
        context.last_tickers = context.order_tickers.copy()
        context.state = False

    backtest_date = data.current_dt.date()

    # 固定週期調倉
    if context.i % context.rebalance == 0:
        context.state = True
        context.order_tickers = compute_stock(date=backtest_date, data=data_use)[0]

    record(tickers=context.order_tickers)
    record(Leverage=context.account.leverage)
    
    # 槓桿監控：超過 1.2 時調降部位
    if context.account.leverage > 1.2:
        print(f'{data.current_dt.date()}: Over Leverage, Leverage: {context.account.leverage}')
        for i in context.order_tickers:
            order_target(symbol(i), 1 / len(context.order_tickers))

    context.i += 1

def analyze(context, perf):
    """績效分析函數"""
    plt.style.use('ggplot')

    fig1, axes1 = plt.subplots(nrows=3, ncols=1, figsize=(18, 15), sharex=False)
    
    # 策略 vs 大盤
    axes1[0].plot(perf.index, perf['algorithm_period_return'], label='Strategy')
    axes1[0].plot(merged['mdate'], (merged['TSE_norm'] / merged['TSE_norm'].iloc[0]) - 1, label='Benchmark [TSE]')
    axes1[0].plot(merged['mdate'], (merged['OTC_norm'] / merged['OTC_norm'].iloc[0]) - 1, label='Benchmark [OTC]')
    axes1[0].set_title("Backtest Results")
    axes1[0].legend()

    # 超額報酬
    axes1[1].bar(perf.index, perf['algorithm_period_return'] - perf['benchmark_period_return'],
                label='Excess return', color='#988ED5', alpha=1.0)
    axes1[1].set_title('Excess Return with TSE Index')
    axes1[1].legend()

    # 風險偏好比率
    axes1[2].plot(merged['mdate'], merged['OTC_TSE_ratio'], label='OTC / TSE')
    axes1[2].set_title('Risk Appetite Ratio (OTC / TSE)')
    axes1[2].axhline(1.0, color='gray', linestyle='--', linewidth=1)
    axes1[2].legend()
    axes1[2].grid(True)

    plt.tight_layout()
    plt.show()

# ====================================
# 執行回測
# ====================================
results = run_algorithm(
    start=pd.Timestamp(back_start, tz='utc'),
    end=pd.Timestamp(end_date, tz='utc'),
    initialize=initialize,
    handle_data=handle_data,
    analyze=analyze,
    bundle='tquant',
    capital_base=1e5
)

print("回測完成！")
```

---

## 📊 策略特性分析

### 優勢 ✅

1. **專注小型成長股**
> - 市場效率較低，容易發現錯誤定價
> - 成長潛力大，可能出現倍數成長

2. **排名法降低雜訊**
> - 不是通過條件就全買，而是挑最便宜的 20%
> - PEG 排序確保估值合理

3. **風險監控完善**
> - OTC/TSE 比率：判斷市場對小型股的偏好
> - 槓桿控制：避免過度集中

### 風險 ⚠️

1. **波動較大**
> - 小型股流動性差，價格波動劇烈
> - 需要較高的風險承受度

2. **選股數量不穩定**
> - 某些時期可能只選出 2-3 檔
> - 需要設定最低持股數量

3. **交易成本**
> - 20 天調倉頻率較高
> - 對手續費敏感

---

## 🔍 關鍵學習點

### 1. 排名法 vs 交集法
```python
# 交集法：全部買
tickers = list(set_1 & set_2 & set_3 & set_4 & set_5)

# 排名法：挑前 20%
passed = set_1 & set_2 & set_3 & set_4 & set_5
filtered_df = df[df['coid'].isin(passed)]
top_df = filtered_df.sort_values(by='PEG').head(int(len(passed) * 0.2))
tickers = list(top_df['coid'])
```

**何時用排名法？**
- 通過條件的股票太多（>30 檔）
- 希望集中在最優質的標的
- 因子有明確排序意義（PEG 越低越好）

### 2. 固定週期 vs 固定日期
```python
# 固定日期（需事先計算）
if backtest_date in modified_day:
    context.state = True

# 固定週期（用計數器）
if context.i % context.rebalance == 0:
    context.state = True
```

**固定週期的優勢：**
- 不需事先計算日期
- 適合高頻策略
- 參數容易調整

### 3. 槓桿監控
```python
# 監控槓桿比率
if context.account.leverage > 1.2:
    # 調降部位
    for ticker in context.order_tickers:
        order_target(symbol(ticker), 1 / len(context.order_tickers))
```

**為什麼需要？**
- 小型股波動大，容易觸發追繳
- 保護帳戶安全
- 避免強制平倉

### 4. 風險偏好指標（OTC/TSE 比率）
```python
merged['OTC_TSE_ratio'] = merged['OTC_norm'] / merged['TSE_norm']
```

**解讀：**
- 比率 > 1：市場偏好小型股（風險偏好上升）
- 比率 < 1：市場偏好大型股（避險情緒）
- 可作為策略開關：比率 < 0.95 時暫停交易

---

## 🎯 延伸優化方向

### 優化 1: 動態持股數量
```python
# 根據 OTC/TSE 比率調整持股數
if merged['OTC_TSE_ratio'].iloc[-1] > 1.05:  # 市場偏好小型股
    top_n = int(len(passed) * 0.3)  # 多買一些
else:
    top_n = int(len(passed) * 0.15)  # 保守一點
```

### 優化 2: 加入流動性過濾
```python
# 排除流動性太差的股票
set_liquidity = set(df[df['月成交量'] > threshold]['coid'])
passed = set_1 & set_2 & set_3 & set_4 & set_5 & set_liquidity
```

### 優化 3: 產業分散
```python
# 每個產業最多選 2 檔
top_df_grouped = filtered_df.groupby('Industry').apply(
    lambda x: x.nsmallest(2, 'PEG')
)
```

---

## 📚 相關資源

- **模板頁面**：[template.md](template.md) - 排名法模板
- **架構說明**：[index.md](index.md) - 理解設計原理
- **其他案例**：
  - [多因子選股](case-multifactor.md) - 交集法範例
  - [Dreman 逆向投資](case-dreman.md) - 計分法範例

---

## 💡 總結

小型成長股策略展示了 **排名法** 的精髓：

1. ✅ **降低雜訊**：不是全買，挑最好的
2. ✅ **風險監控**：槓桿控制 + 市場情緒指標
3. ✅ **靈活調整**：固定週期，易於優化

**適合誰使用？**

- 風險偏好較高的投資者
- 偏好中短期交易（20 天週期）
- 熟悉小型股特性的人

**⚠️ 注意事項：**

- 需要較高的資金量（避免流動性問題）
- 密切監控槓桿比率
- 市場恐慌時應暫停策略

**👉 Next Step:**  
前往 [case-dreman.md](case-dreman.md) 學習計分法的進階應用！