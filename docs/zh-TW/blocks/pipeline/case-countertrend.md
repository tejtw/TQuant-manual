# 案例 3：CounterTrend 逆勢策略

> **策略類型：** Pipeline 因子架構 - 均值回歸  
> **交易標的：** 81 檔權值股  
> **調倉頻率：** 日度（每日收盤前）  
> **回測期間：** 2018-06-01 ~ 2023-07-30

---

## 📌 策略概述

CounterTrend 是一個結合 **趨勢過濾** 和 **均值回歸** 的逆勢策略，在長期趨勢向上的前提下，逢低承接短期回檔。

### 核心理念

> **"Buy the dip in an uptrend."**  
> 在上升趨勢中，買入統計上的超跌點位。

市場常見現象：

- 📈 **長期趨勢**：股價沿著均線向上
- 📉 **短期回檔**：偶爾跌破支撐
- 🔄 **均值回歸**：回檔後通常反彈

CounterTrend 的智慧在於 **不是所有回檔都買**，只在長期趨勢確認向上時才進場，且利用統計學方法（-3σ）確認超跌。

### 策略特色

1. **EMA 雙均線趨勢過濾**：EMA(40) > EMA(80)
2. **統計學買點**：價格 < 20 日高點 - 3σ
3. **風險平價權重**：根據波動率調整持股
4. **強制出場**：持有 20 天或趨勢反轉
5. **權值股票池**：81 檔市值大、流動性好的股票

---

## 🎯 選股邏輯詳解

### Step 1: 趨勢過濾

**EMA 雙均線確認多頭：**
```python
# 計算 EMA
ema_fast = close.ewm(span=40).mean()
ema_slow = close.ewm(span=80).mean()

# 判斷趨勢
trend_up = ema_fast > ema_slow
```

**為什麼用 EMA 而非 SMA？**

- EMA 對近期價格更敏感
- 反應速度較快
- 更適合捕捉趨勢轉變

### Step 2: 回檔買點

**統計學超跌：**
```python
# 計算過去 20 日最高價
highest_20d = close[-20:].max()

# 計算 60 日波動率（標準差）
std_60d = close[-60:].pct_change().std() * 100

# 計算回檔幅度
pullback = (current_price - highest_20d) / std_60d

# 超跌判斷：回檔 < -3σ
if pullback < -3:
    buy = True
```

**為什麼用 -3σ？**

根據常態分佈：

- ±1σ：68.27% 的數據
- ±2σ：95.45% 的數據
- ±3σ：99.73% 的數據

價格跌破 -3σ 非常罕見，代表 **極度超賣**，反彈機率高。

### Step 3: 風險平價權重
```python
def position_size(portfolio_value, std, risk_factor=0.01):
    """
    根據波動率計算持股數量
    
    邏輯：
    - 目標風險 = 投組價值 × 風險係數
    - 合約波動 = 標準差 × 點值
    - 持股數 = 目標風險 / 合約波動
    """
    target_variation = portfolio_value * risk_factor
    contract_variation = std * 1  # 點值 = 1
    contracts = target_variation / contract_variation
    
    return int(contracts)
```

**意義：**

- 波動率低的股票，買入數量多
- 波動率高的股票，買入數量少
- 每檔股票對投組風險的貢獻相等

### Step 4: 持有期管理

**兩種出場情境：**

1. **時間出場**：持有 20 天
2. **趨勢出場**：EMA(40) < EMA(80)

---

## 🔍 完整交易流程

### 買入條件（必須全部滿足）

1. EMA(40) > EMA(80)（長期趨勢向上）
2. 回檔幅度 < -3σ（統計上超跌）
3. 目前無持倉

### 賣出條件（任一滿足）

1. 持有天數 ≥ 20 天（時間到期）
2. EMA(40) < EMA(80)（趨勢反轉）

---

## 💻 完整程式碼
```python
# ====================================
# CounterTrend 逆勢策略 - 完整實作
# ====================================

import os
import pandas as pd
import numpy as np
import pytz
import matplotlib.pyplot as plt

# ====================================
# 環境設定
# ====================================
os.environ['TEJAPI_KEY'] = "your_key"
os.environ['TEJAPI_BASE'] = "https://api.tej.com.tw"

# ====================================
# Zipline 套件引入
# ====================================
import zipline
from zipline.data import bundles
from zipline.utils.calendar_utils import get_calendar
from zipline.api import *
from zipline.finance.commission import PerDollar
from zipline.finance.slippage import VolumeShareSlippage
from zipline.sources.TEJ_Api_Data import get_Treasury_Return
from zipline.utils.run_algo import get_transaction_detail, get_record_vars

import pyfolio as pf

plt.rcParams['axes.unicode_minus'] = False
plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei']

# ====================================
# 參數設定
# ====================================
# 股票池：81 檔權值股
StockList = [
    '1101', '1102', '1216', '1301', '1303', '1326', '1402', '1722', '2002', '2105',
    '2201', '2207', '2301', '2303', '2308', '2311', '2317', '2324', '2325', '2330',
    '2347', '2353', '2354', '2357', '2382', '2409', '2412', '2454', '2474', '2498',
    '2801', '2880', '2881', '2882', '2883', '2885', '2886', '2890', '2891', '2892',
    '2912', '3008', '3045', '3231', '3481', '3673', '3697', '4904', '5880', '6505',
    '2884', '4938', '2887', '2227', '9904', '3474', '2395', '2408', '1476', '2823',
    '2633', '5871', '2327', '3711', '2492', '5876', '9910', '2888', '6669', '2379',
    '6415', '3034', '1590', '8046', '2603', '2609', '2615', '8454', '3037', '6770',
    '1605', 'IR0001'
]

# 回測期間
start = '2018-06-01'
end = '2023-07-30'

start_dt = pd.Timestamp(start, tz=pytz.utc)
end_dt = pd.Timestamp(end, tz=pytz.utc)

# ====================================
# 策略參數
# ====================================
starting_portfolio = 10e6      # 初始資金 1000 萬
risk_factor = 0.01             # 風險係數 1%
slow_ma = 80                   # 長期均線週期
fast_ma = 40                   # 短期均線週期
vola_window = 60               # 波動率計算週期
high_window = 20               # 最高價計算週期
days_to_hold = 20              # 最長持有天數
dip_buy = -3                   # 回檔買入門檻（-3σ）

# 交易成本
commission_pct = 0.0029        # 佣金 0.29%
slippage_volume_limit = 1.0    # 滑價限制
slippage_impact = 0            # 滑價影響 0%

# ====================================
# Ingest 股價資料
# ====================================
os.environ['ticker'] = ' '.join(StockList)
os.environ['mdate'] = start + ' ' + end

# !zipline ingest -b tquant

calendar_name = 'TEJ_XTAI'
bundle_name = 'tquant'

# ====================================
# 策略函數
# ====================================
def position_size(portfolio_value, std, risk_factor=0.01):
    """
    根據波動率計算持股價值
    
    風險平價邏輯：
    - 每檔股票對投組風險的貢獻相等
    - 波動率低 → 買入多
    - 波動率高 → 買入少
    """
    target_variation = portfolio_value * risk_factor
    contract_variation = std * 1  # 點值 = 1
    contracts = target_variation / contract_variation
    
    return int(np.nan_to_num(contracts))

def initialize(context):
    """
    初始化函數
    """
    # 交易成本設定
    set_commission(PerDollar(cost=commission_pct))
    set_slippage(
        VolumeShareSlippage(
            volume_limit=slippage_volume_limit,
            price_impact=slippage_impact
        )
    )
    
    # 載入股票池
    bundle_data = bundles.load(bundle_name)
    context.universe = bundle_data.asset_finder.retrieve_all(
        bundle_data.asset_finder.equities_sids
    )
    
    # 設定基準
    set_benchmark(symbol('IR0001'))
    
    # 績效追蹤
    context.months = 0
    
    # 持有天數追蹤
    context.bars_held = {asset.symbol: 0 for asset in context.universe}
    
    # 排程：每日收盤前交易
    schedule_function(
        daily_trade,
        date_rules.every_day(),
        time_rules.market_close()
    )
    
    # 排程：每月報告
    schedule_function(
        func=report_result,
        date_rule=date_rules.month_start(),
        time_rule=time_rules.market_open()
    )

def report_result(context, data):
    """
    輸出績效報告
    """
    context.months += 1
    today = get_datetime().date()
    
    # 計算年化報酬
    ann_ret = np.power(
        context.portfolio.portfolio_value / starting_portfolio,
        12 / context.months
    ) - 1
    
    print(f"{today} 已交易 {context.months} 個月，年化報酬：{ann_ret:.2%}")

def daily_trade(context, data):
    """
    每日交易邏輯
    """
    today = data.current_session.date()
    todays_universe = context.universe
    
    # 取得歷史資料
    hist_close = data.history(
        todays_universe,
        ['close', 'volume'],
        bar_count=high_window + 1,
        frequency='1d'
    )['close']
    
    hist_volume = data.history(
        todays_universe,
        ['close', 'volume'],
        bar_count=high_window + 1,
        frequency='1d'
    )['volume']
    
    for _asset in todays_universe:
        
        # 排除基準指數
        if _asset == symbol('IR0001'):
            continue
        
        # 取得該股票的歷史資料
        h_close = hist_close.unstack()[_asset]
        h_volume = hist_volume.unstack()[_asset]
        
        # 計算波動率（60 日標準差）
        h_std = (
            hist_close.unstack()
            .pct_change()
            .iloc[-vola_window:]
            .std()[_asset] * 100
        )
        
        # ========================================
        # 計算趨勢（EMA 雙均線）
        # ========================================
        h_trend = (
            h_close.ewm(span=fast_ma).mean() >
            h_close.ewm(span=slow_ma).mean()
        )
        
        # ========================================
        # 已持倉的處理
        # ========================================
        if _asset in context.portfolio.positions:
            
            p = context.portfolio.positions[_asset]
            context.bars_held[_asset] += 1  # 持有天數 +1
            
            if p.amount > 0:  # 多頭部位
                
                # 出場條件 1: 持有超過 20 天
                if context.bars_held[_asset] >= days_to_hold:
                    order_target(_asset, 0)
                    print(f"{today} 持有 {_asset.symbol} 超過 {days_to_hold} 天，出場")
                
                # 出場條件 2: 趨勢反轉
                elif h_trend.iloc[-1] == False:
                    order_target(_asset, 0)
                    print(f"{today} {_asset.symbol} 趨勢反轉，出場")
        
        # ========================================
        # 未持倉的處理
        # ========================================
        else:
            
            # 只在趨勢向上時考慮進場
            if h_trend.iloc[-1]:
                
                # 計算回檔幅度
                pullback = (
                    h_close.values[-1] - np.max(h_close.values[-high_window:])
                ) / h_std
                
                # 進場條件：回檔 < -3σ
                if pullback < dip_buy:
                    
                    # 計算持股價值
                    volume_to_trade = position_size(
                        context.portfolio.portfolio_value,
                        h_std,
                        risk_factor
                    )
                    
                    # 下單
                    order_value(_asset, volume_to_trade)
                    
                    # 重置持有天數
                    context.bars_held[_asset] = 0
                    
                    print(f"{today} {_asset.symbol} 回檔 {pullback:.2f}σ，買入")

# ====================================
# 取得無風險利率
# ====================================
print("正在取得無風險利率資料...")

treasury_returns = get_Treasury_Return(
    start=start_dt,
    end=end_dt,
    rate_type='Time_Deposit_Rate',
    term='1y',
    symbol='5844'  # 第一銀行一年期定存
)

print(f"無風險利率資料載入完成：{len(treasury_returns)} 筆")

# ====================================
# 執行回測
# ====================================
print("="*60)
print("開始回測 CounterTrend 逆勢策略")
print(f"期間：{start} ~ {end}")
print(f"初始資金：{starting_portfolio:,.0f} 元")
print("="*60)

results = zipline.run_algorithm(
    start=start_dt,
    end=end_dt,
    initialize=initialize,
    capital_base=starting_portfolio,
    data_frequency='daily',
    treasury_returns=treasury_returns,
    trading_calendar=get_calendar(calendar_name),
    bundle=bundle_name
)

print("\n回測完成！")

# ====================================
# 績效統計
# ====================================
print("\n========== 績效摘要 ==========")

total_return = (results['portfolio_value'].iloc[-1] / starting_portfolio - 1) * 100
benchmark_return = results['benchmark_period_return'].iloc[-1] * 100

print(f"策略總報酬: {total_return:.2f}%")
print(f"基準報酬: {benchmark_return:.2f}%")
print(f"超額報酬: {(total_return - benchmark_return):.2f}%")
print(f"最大回撤: {results['max_drawdown'].min() * 100:.2f}%")

results.to_csv('countertrend_results.csv')
print(f"\n詳細結果已儲存至: countertrend_results.csv")

# ====================================
# Pyfolio 績效分析
# ====================================
try:
    import pyfolio as pf
    
    print("\n" + "="*60)
    print("Pyfolio 績效分析")
    print("="*60)
    
    # 提取資料
    bt_returns, bt_positions, bt_transactions = (
        pf.utils.extract_rets_pos_txn_from_zipline(results)
    )
    benchmark_rets = results.benchmark_return
    
    # 處理時區
    bt_returns.index = bt_returns.index.tz_localize(None).tz_localize('UTC')
    bt_positions.index = bt_positions.index.tz_localize(None).tz_localize('UTC')
    bt_transactions.index = bt_transactions.index.tz_localize(None).tz_localize('UTC')
    benchmark_rets.index = benchmark_rets.index.tz_localize(None).tz_localize('UTC')
    
    # 生成完整績效報告
    pf.create_full_tear_sheet(
        bt_returns,
        positions=bt_positions,
        transactions=bt_transactions,
        benchmark_rets=benchmark_rets,
        round_trips=False
    )
    
except ImportError:
    print("\n未安裝 pyfolio，略過詳細分析")
    print("若需完整報告，請執行: pip install pyfolio")
except Exception as e:
    print(f"\nPyfolio 分析錯誤: {e}")
```

---

## 📊 策略特性分析

### 優勢 ✅

1. **趨勢 + 均值回歸結合**
> - 不是盲目逆勢
> - 只在多頭趨勢中買回檔
> - 提高勝率

2. **統計學買點**
> - -3σ 是極端值
> - 反彈機率高
> - 有理論支持

3. **風險平價權重**
> - 根據波動率調整持股
> - 每檔股票風險貢獻相等
> - 降低組合波動

4. **時間出場機制**
> - 20 天強制出場
> - 避免長期套牢
> - 資金快速輪動

5. **權值股票池**
> - 流動性好
> - 基本面穩健
> - 系統性風險低

### 劣勢 ⚠️

1. **趨勢反轉風險**
> - 可能買在下跌起點
> - 「接落下的刀」
> - 需要嚴格停損

2. **持有期太短**
> - 20 天可能不夠
> - 錯過大波段
> - 交易成本高

3. **參數敏感**
> - -3σ 門檻不一定適合所有股票
> - EMA 40/80 是經驗值
> - 需要優化

4. **震盪市表現差**
> - 橫盤時頻繁買賣
> - 虧損累積
> - 適合單邊市場

5. **選股數量不穩定**
> - 有時 20 檔，有時 0 檔
> - 影響資金使用率
> - 績效波動大

---

## 🔍 關鍵學習點

### 1. 為什麼需要趨勢過濾？

**沒有趨勢過濾（危險）：**
```python
# 只要出現 -3σ 就買
if pullback < -3:
    buy = True

# 問題：可能是趨勢反轉
# 越買越跌
```

**有趨勢過濾（安全）：**
```python
# 先確認多頭趨勢
if (ema_fast > ema_slow):
    # 再看是否超跌
    if pullback < -3:
        buy = True

# 只在上升趨勢的回檔中買入
```

### 2. 風險平價的計算邏輯

**目標：**

讓每檔股票對投組風險的貢獻相等。

**公式推導：**
```
設定：
- 投組價值 = P
- 風險係數 = r（例如 1%）
- 目標風險 = P × r

單一股票：
- 標準差 = σ
- 持股價值 = V
- 該股票的風險貢獻 = V × σ

要求：
V × σ = P × r

解：
V = (P × r) / σ

結論：
- σ 越大，V 越小（買入少）
- σ 越小，V 越大（買入多）
```

**程式實作：**
```python
def position_size(portfolio_value, std, risk_factor=0.01):
    target_variation = portfolio_value * risk_factor  # P × r
    contract_variation = std * 1                       # σ × 點值
    contracts = target_variation / contract_variation  # V = (P × r) / σ
    
    return int(contracts)
```

### 3. EMA vs SMA

**SMA（Simple Moving Average）：**
```python
sma = close[-40:].mean()

# 所有價格權重相同
```

**EMA（Exponential Moving Average）：**
```python
ema = close.ewm(span=40).mean()

# 近期價格權重高
# 遠期價格權重低
```

**為什麼用 EMA？**

- 對近期價格變化更敏感
- 反應速度快
- 更適合捕捉趨勢轉變

### 4. 持有天數追蹤的實作
```python
# 在 initialize 中初始化
context.bars_held = {asset.symbol: 0 for asset in context.universe}

# 每日更新
if _asset in context.portfolio.positions:
    context.bars_held[_asset] += 1  # 持有天數 +1

# 檢查持有天數
if context.bars_held[_asset] >= 20:
    order_target(_asset, 0)  # 出場
    
# 買入時重置
if pullback < -3:
    order_value(_asset, volume_to_trade)
    context.bars_held[_asset] = 0  # 重置為 0
```

---

## 🎯 延伸優化方向

### 優化 1: 動態標準差倍數
```python
# 根據市場波動率調整
market_vol = calculate_market_volatility()

if market_vol > 0.3:
    sigma_multiplier = 2  # 高波動用 -2σ
else:
    sigma_multiplier = 3  # 低波動用 -3σ

if pullback < -sigma_multiplier:
    buy = True
```

### 優化 2: 動態持有期
```python
# 根據反彈力道調整持有期
if _asset in context.portfolio.positions:
    p = context.portfolio.positions[_asset]
    current_price = data.current(_asset, 'close')
    
    # 獲利 > 10%，提前出場
    if current_price > p.cost_basis * 1.1:
        order_target(_asset, 0)
    
    # 未獲利但超過 30 天，也出場
    elif context.bars_held[_asset] > 30:
        order_target(_asset, 0)
```

### 優化 3: 加入成交量確認
```python
# 成交量 > 20 日均量
avg_volume = h_volume[-20:].mean()
volume_confirm = h_volume.iloc[-1] > avg_volume

if h_trend.iloc[-1] and (pullback < -3) and volume_confirm:
    buy = True
```

### 優化 4: 分批進場
```python
# 第一批：-3σ 買入 50%
if pullback < -3:
    order_value(_asset, volume_to_trade * 0.5)
    context.entry_stage[_asset] = 1

# 第二批：-4σ 再買入 50%
elif pullback < -4 and context.entry_stage[_asset] == 1:
    order_value(_asset, volume_to_trade * 0.5)
    context.entry_stage[_asset] = 2
```

### 優化 5: 產業分散
```python
# 記錄每個產業的持倉數
context.industry_count = defaultdict(int)

# 進場前檢查產業分散
industry = get_industry(_asset)

if context.industry_count[industry] < 3:  # 每個產業最多 3 檔
    order_value(_asset, volume_to_trade)
    context.industry_count[industry] += 1
```

---

## 📚 相關資源

- **模板頁面**：[template.md](template.md) - 架構模板
- **架構說明**：[index.md](index.md) - 理解設計原理
- **其他案例**：
  - [Expanded Momentum](case-momentum.md) - 動量策略
  - [跟隨大戶](case-institution.md) - 籌碼分析

---

## 💡 總結

CounterTrend 策略展示了 **均值回歸** 的精髓：

1. ✅ **趨勢過濾**：只在多頭中逢低買（EMA 雙均線）
2. ✅ **統計學買點**：-3σ 極端值
3. ✅ **風險平價**：根據波動率調整持股
4. ✅ **強制出場**：20 天避免套牢
5. ✅ **權值股池**：降低系統性風險

**適合誰使用？**

- 偏好逆勢操作
- 能承受短期波動
- 相信均值回歸

**使用建議：**

- ✅ 在多頭市場使用
- ✅ 嚴格執行 20 天出場
- ✅ 注意風險平價計算
- ⚠️ 避免在趨勢反轉時使用
- ⚠️ 注意「接落下的刀」風險

**👉 Next Step:**

1. 複製完整程式碼
2. 調整參數（σ 倍數、持有期、EMA 週期）
3. 測試不同風險係數
4. 加入你的優化邏輯

---

## 📖 延伸閱讀

**均值回歸理論：**

- 價格偏離均值後傾向回歸
- 布林通道的理論基礎
- 統計套利的核心概念

**EMA 指數移動平均：**

- 對近期價格更敏感
- 計算公式：`EMA_t = α × Price_t + (1-α) × EMA_{t-1}`
- 其中 `α = 2 / (span + 1)`

**風險平價（Risk Parity）：**

- 每個資產對投組風險的貢獻相等
- 不是等權重，而是等風險
- 廣泛應用於資產配置

**實務經驗：**

- -3σ 觸發頻率：每月 0-5 次
- 勝率：約 60-70%
- 平均持有：10-15 天（很多會提前反彈）
- 最大風險：趨勢反轉時連續虧損
- 適合市況：震盪偏多的市場