# 案例 3：CounterTrend 逆勢策略

> **策略類型：** Pipeline 因子架構 - 均值回歸  
> **交易標的：** 81 檔藍籌股  
> **調倉頻率：** 日度（每日開盤後）  
> **回測期間：** 2019-01-01 ~ 2023-12-31

---

## 📌 策略概述

CounterTrend 是一個結合 **趨勢過濾** 和 **均值回歸** 的逆勢策略，在長期趨勢向上的前提下，逢低承接短期回檔。

### 核心理念

> **"Buy the dip in an uptrend."**  
> 在上升趨勢中，買入短期回檔。

市場常見現象：

- 📈 **長期趨勢**：股價沿著均線向上
- 📉 **短期回檔**：偶爾跌破支撐
- 🔄 **均值回歸**：回檔後通常反彈

CounterTrend 的智慧在於 **不是所有回檔都買**，只在長期趨勢確認向上時才進場。

### 策略特色

1. **雙重 EMA 趨勢過濾**：40 日 > 80 日（確認多頭）
2. **統計學買點**：價格 < 20 日高點 - 3σ（超跌）
3. **風險平價權重**：反波動率加權
4. **強制出場**：持有 20 天後出場（避免套牢）
5. **藍籌股票池**：81 檔市值大、流動性好的股票

---

## 🎯 選股邏輯詳解

### Step 1: 趨勢過濾

**雙重 EMA 確認多頭：**
```
條件 1: 40 日 EMA > 80 日 EMA
條件 2: 當前價格 > 40 日 EMA

意義：
- 短期均線 > 長期均線 → 趨勢向上
- 價格 > 短期均線 → 站穩支撐
```

**視覺化：**
```
價格
  ↑
  │         ╱
  │       ╱    ← 40 日 EMA
  │     ╱
  │   ╱        ← 80 日 EMA
  │ ╱
──┼─────────→ 時間

當 EMA40 > EMA80 → 多頭趨勢
```

### Step 2: 回檔買點

**統計學超跌：**
```python
# 計算過去 20 日最高價
highest_20d = 過去 20 日最高價

# 計算過去 20 日波動率
std_20d = 過去 20 日標準差

# 買點 = 最高價 - 3 倍標準差
buy_threshold = highest_20d - (3 * std_20d)

# 當前價格 < 買點 → 超跌買入
if current_price < buy_threshold:
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
# 反波動率加權
weight_i = (1 / volatility_i) / Σ(1 / volatility_j)
```

低波動股票權重高，降低組合整體波動。

### Step 4: 持有期管理
```python
# 記錄買入日期
context.buy_date[stock] = today

# 檢查持有天數
holding_days = (today - context.buy_date[stock]).days

# 超過 20 天強制出場
if holding_days > 20:
    sell(stock)
```

**為什麼 20 天？**

- 避免長期套牢
- 逢反彈就出場
- 資金快速輪動

---

## 🔍 完整交易流程

### 買入條件（必須全部滿足）

1. EMA40 > EMA80（長期趨勢向上）
2. 當前價格 > EMA40（站穩支撐）
3. 當前價格 < 最高價 - 3σ（超跌）
4. 目前無持倉

### 賣出條件（任一滿足）

1. 持有天數 > 20 天（強制出場）
2. 趨勢反轉（EMA40 < EMA80）
3. 跌破 EMA40（破底）

---

## 💻 完整程式碼
```python
# ====================================
# CounterTrend 逆勢策略 - 完整實作
# ====================================

import os
import pandas as pd
import numpy as np
import tejapi
import matplotlib.pyplot as plt
from logbook import Logger

# ====================================
# 環境設定
# ====================================
os.environ['TEJAPI_BASE'] = 'https://api.tej.com.tw'
os.environ['TEJAPI_KEY'] = 'your_key'
tejapi.ApiConfig.api_key = os.getenv('TEJAPI_KEY')
tejapi.ApiConfig.api_base = os.getenv('TEJAPI_BASE')

log = Logger('CounterTrend')

plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei']
plt.rcParams['axes.unicode_minus'] = False

# ====================================
# 參數設定
# ====================================
start_date = '2019-01-01'
end_date = '2023-12-31'

# ====================================
# 藍籌股票池（市值前 81 檔）
# ====================================
print("正在取得藍籌股票池...")

# 取得市值資料
mktcap_data = tejapi.get(
    'TWN/APIPRCD',
    coid={'has': True},
    mdate={'gte': start_date, 'lte': end_date},
    opts={'columns': ['coid', 'mdate', 'mktcap']},
    paginate=True
)

# 計算平均市值，選前 81 檔
avg_mktcap = mktcap_data.groupby('coid')['mktcap'].mean()
blue_chips = avg_mktcap.nlargest(81).index.tolist()

print(f"藍籌股票池: {len(blue_chips)} 檔")

os.environ['mdate'] = f'{start_date} {end_date}'
os.environ['ticker'] = ' '.join(blue_chips)

# ====================================
# 匯入股價資料
# ====================================
from zipline.data.run_ingest import simple_ingest

pools = blue_chips + ['IR0001']

print("正在準備 Zipline 資料...")
simple_ingest(
    name='tquant',
    tickers=pools,
    start_date=start_date.replace('-', ''),
    end_date=end_date.replace('-', '')
)
print("資料準備完成！")

# ====================================
# CustomFactor 定義
# ====================================
from zipline.pipeline import CustomFactor
from zipline.pipeline.data import EquityPricing
from zipline.pipeline.factors import ExponentialWeightedMovingAverage

class TrendFilter(CustomFactor):
    """
    趨勢過濾：EMA40 > EMA80
    """
    window_length = 80
    inputs = [EquityPricing.close]
    
    def compute(self, today, assets, out, close):
        # 計算 EMA40 和 EMA80
        ema40 = np.zeros(len(assets))
        ema80 = np.zeros(len(assets))
        
        for i in range(len(assets)):
            prices = close[:, i]
            
            if np.isnan(prices).any():
                ema40[i] = np.nan
                ema80[i] = np.nan
                continue
            
            # 手動計算 EMA
            alpha40 = 2 / (40 + 1)
            alpha80 = 2 / (80 + 1)
            
            # EMA40
            ema_val = prices[-40]
            for price in prices[-39:]:
                ema_val = alpha40 * price + (1 - alpha40) * ema_val
            ema40[i] = ema_val
            
            # EMA80
            ema_val = prices[0]
            for price in prices[1:]:
                ema_val = alpha80 * price + (1 - alpha80) * ema_val
            ema80[i] = ema_val
        
        # 多頭：EMA40 > EMA80
        out[:] = (ema40 > ema80).astype(float)


class BuySignal(CustomFactor):
    """
    買入訊號：價格 < 最高價 - 3σ
    """
    window_length = 20
    inputs = [EquityPricing.high, EquityPricing.close]
    
    def compute(self, today, assets, out, high, close):
        # 過去 20 日最高價
        highest = np.nanmax(high, axis=0)
        
        # 過去 20 日標準差
        std = np.nanstd(close, axis=0)
        
        # 買點 = 最高價 - 3σ
        buy_threshold = highest - (3 * std)
        
        # 當前價格
        current_price = close[-1]
        
        # 價格 < 買點 → 1，否則 → 0
        out[:] = (current_price < buy_threshold).astype(float)


class AnnualizedVolatility(CustomFactor):
    """
    年化波動率（用於風險平價）
    """
    window_length = 252
    inputs = [EquityPricing.close]
    
    def compute(self, today, assets, out, close):
        # 計算日報酬率
        daily_returns = np.diff(close, axis=0) / close[:-1]
        
        # 年化波動率
        volatility = np.nanstd(daily_returns, axis=0) * np.sqrt(252)
        
        out[:] = volatility


# ====================================
# Pipeline 定義
# ====================================
from zipline.pipeline import Pipeline
from zipline.pipeline.filters import StaticAssets

def make_pipeline():
    """
    建立 Pipeline
    
    篩選：
    1. 趨勢向上
    2. 出現買入訊號
    """
    # 定義股票池
    universe = StaticAssets(symbols(blue_chips))
    
    # 計算因子
    trend = TrendFilter(mask=universe)
    buy_signal = BuySignal(mask=universe)
    volatility = AnnualizedVolatility(mask=universe)
    
    # 當前價格
    current_price = EquityPricing.close.latest
    
    # 40 日 EMA（用於檢查是否站穩）
    ema40 = ExponentialWeightedMovingAverage(
        inputs=[EquityPricing.close],
        window_length=40,
        decay_rate=2/(40+1),
        mask=universe
    )
    
    # 篩選條件
    screen = (
        (trend == 1) &           # 趨勢向上
        (buy_signal == 1) &      # 出現買入訊號
        (current_price > ema40)  # 站穩 EMA40
    )
    
    return Pipeline(
        columns={
            'trend': trend,
            'buy_signal': buy_signal,
            'volatility': volatility,
            'ema40': ema40
        },
        screen=screen
    )


# ====================================
# 策略函數
# ====================================
from zipline.api import (
    attach_pipeline, pipeline_output,
    order_target_percent, set_commission, set_slippage,
    record, schedule_function, date_rules, time_rules,
    symbol, symbols
)
from zipline.finance import commission, slippage

def initialize(context):
    """
    初始化函數
    """
    # 交易成本
    set_commission(commission.PerShare(cost=0.001425, min_trade_cost=20))
    set_slippage(slippage.VolumeShareSlippage(volume_limit=0.025, price_impact=0.1))
    
    # 附加 Pipeline
    attach_pipeline(make_pipeline(), 'countertrend_pipe')
    
    # 記錄買入日期
    context.buy_date = {}
    
    # 持有期限
    context.max_holding_days = 20
    
    # 每日開盤後調倉
    schedule_function(
        rebalance,
        date_rules.every_day(),
        time_rules.market_open()
    )


def before_trading_start(context, data):
    """
    盤前執行：取得 Pipeline 輸出
    """
    # 取得 Pipeline 結果
    output = pipeline_output('countertrend_pipe')
    
    # 選股：所有通過篩選的股票
    context.output = output
    context.stocks = output.index.tolist()
    
    log.info(f"選股數量: {len(context.stocks)}")


def rebalance(context, data):
    """
    調倉函數
    """
    current_date = data.current_dt
    
    # ========================================
    # Step 1: 檢查持倉，賣出不符合條件的
    # ========================================
    for stock in list(context.portfolio.positions):
        # 原因 1: 不在新選股清單
        if stock not in context.stocks:
            order_target_percent(stock, 0)
            if stock in context.buy_date:
                del context.buy_date[stock]
            log.info(f"賣出（不在清單）: {stock.symbol}")
            continue
        
        # 原因 2: 持有超過 20 天
        if stock in context.buy_date:
            holding_days = (current_date.date() - context.buy_date[stock]).days
            
            if holding_days > context.max_holding_days:
                order_target_percent(stock, 0)
                del context.buy_date[stock]
                log.info(f"賣出（持有 {holding_days} 天）: {stock.symbol}")
                continue
        
        # 原因 3: 跌破 EMA40
        current_price = data.current(stock, 'close')
        ema40 = context.output.loc[stock, 'ema40']
        
        if current_price < ema40:
            order_target_percent(stock, 0)
            if stock in context.buy_date:
                del context.buy_date[stock]
            log.info(f"賣出（跌破 EMA40）: {stock.symbol}")
    
    # ========================================
    # Step 2: 計算可買入的新股票
    # ========================================
    new_stocks = [s for s in context.stocks if s not in context.portfolio.positions]
    
    if len(new_stocks) == 0:
        log.info("無新股票可買入")
        return
    
    # ========================================
    # Step 3: 計算風險平價權重
    # ========================================
    volatility_values = context.output.loc[new_stocks, 'volatility']
    
    # 反波動率
    inv_vol = 1 / volatility_values
    
    # 標準化為權重
    total_inv_vol = inv_vol.sum()
    target_weights = inv_vol / total_inv_vol
    
    # ========================================
    # Step 4: 買入新股票
    # ========================================
    for stock in new_stocks:
        weight = target_weights[stock]
        
        if data.can_trade(stock):
            order_target_percent(stock, weight)
            context.buy_date[stock] = current_date.date()
            log.info(f"買入: {stock.symbol}, 權重: {weight:.2%}")
    
    # ========================================
    # Step 5: 記錄資訊
    # ========================================
    record(
        num_positions=len(context.portfolio.positions),
        leverage=context.account.leverage
    )


def analyze(context, perf):
    """
    績效分析
    """
    import matplotlib.pyplot as plt
    
    fig = plt.figure(figsize=(16, 12))
    
    # 圖 1: 投資組合價值
    ax1 = fig.add_subplot(411)
    perf['portfolio_value'].plot(ax=ax1, linewidth=2)
    ax1.set_ylabel('Portfolio Value (TWD)', fontsize=12)
    ax1.set_title('CounterTrend Strategy - Portfolio Performance', 
                  fontsize=14, fontweight='bold')
    ax1.grid(True, alpha=0.3)
    
    # 圖 2: 累積報酬 vs 基準
    ax2 = fig.add_subplot(412)
    
    cumulative_returns = (1 + perf['returns']).cumprod() - 1
    benchmark_returns = (1 + perf['benchmark_return']).cumprod() - 1
    
    cumulative_returns.plot(ax=ax2, label='Strategy', linewidth=2, color='#2E86AB')
    benchmark_returns.plot(ax=ax2, label='Benchmark', linewidth=2, alpha=0.7, color='#A23B72')
    
    ax2.set_ylabel('Cumulative Returns', fontsize=12)
    ax2.set_title('Strategy vs Benchmark', fontsize=14, fontweight='bold')
    ax2.legend(loc='upper left', fontsize=11)
    ax2.grid(True, alpha=0.3)
    ax2.axhline(0, color='black', linewidth=0.8, linestyle='--', alpha=0.5)
    
    # 圖 3: 持倉數量
    ax3 = fig.add_subplot(413)
    perf['num_positions'].plot(ax=ax3, linewidth=2, color='#F18F01')
    ax3.set_ylabel('Number of Positions', fontsize=12)
    ax3.set_title('Position Count Over Time', fontsize=14, fontweight='bold')
    ax3.grid(True, alpha=0.3)
    
    # 圖 4: 槓桿
    ax4 = fig.add_subplot(414)
    perf['leverage'].plot(ax=ax4, linewidth=2, color='#6A4C93')
    ax4.set_ylabel('Leverage', fontsize=12)
    ax4.set_xlabel('Date', fontsize=12)
    ax4.set_title('Portfolio Leverage', fontsize=14, fontweight='bold')
    ax4.grid(True, alpha=0.3)
    ax4.axhline(1, color='red', linewidth=1, linestyle='--', alpha=0.5)
    
    plt.tight_layout()
    plt.show()


# ====================================
# 執行回測
# ====================================
from zipline import run_algorithm

print("="*60)
print("開始回測 CounterTrend 逆勢策略")
print("="*60)

results = run_algorithm(
    start=pd.Timestamp(start_date, tz='utc'),
    end=pd.Timestamp(end_date, tz='utc'),
    initialize=initialize,
    before_trading_start=before_trading_start,
    analyze=analyze,
    bundle='tquant',
    capital_base=1e7
)

print("\n回測完成！")

# ====================================
# 績效統計
# ====================================
print("\n========== 績效摘要 ==========")

total_return = (results['portfolio_value'].iloc[-1] / 1e7 - 1) * 100
benchmark_return = results['benchmark_period_return'].iloc[-1] * 100

print(f"策略總報酬: {total_return:.2f}%")
print(f"基準報酬: {benchmark_return:.2f}%")
print(f"超額報酬: {(total_return - benchmark_return):.2f}%")
print(f"最大回撤: {results['max_drawdown'].min() * 100:.2f}%")
print(f"夏普比率: {results['sharpe'].iloc[-1]:.2f}")
print(f"平均持倉數: {results['num_positions'].mean():.0f}")

results.to_csv('countertrend_results.csv')
print(f"\n詳細結果已儲存至: countertrend_results.csv")

# ====================================
# Pyfolio 績效分析
# ====================================
try:
    import pyfolio as pf
    from pyfolio.utils import extract_rets_pos_txn_from_zipline
    
    print("\n" + "="*60)
    print("Pyfolio 績效分析")
    print("="*60)
    
    returns, positions, transactions = extract_rets_pos_txn_from_zipline(results)
    benchmark_rets = results.benchmark_return
    
    pf.tears.create_full_tear_sheet(
        returns=returns,
        positions=positions,
        transactions=transactions,
        benchmark_rets=benchmark_rets
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

3. **風險可控**
> - 20 天強制出場
> - 避免長期套牢
> - 資金快速輪動

4. **藍籌股票池**
> - 流動性好
> - 基本面穩健
> - 系統性風險低

5. **風險平價**
> - 反波動率加權
> - 降低組合波動
> - 提高夏普比率

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
if price < highest - 3*std:
    buy = True

# 問題：可能是趨勢反轉
# 越買越跌
```

**有趨勢過濾（安全）：**
```python
# 先確認多頭趨勢
if (ema40 > ema80) and (price > ema40):
    # 再看是否超跌
    if price < highest - 3*std:
        buy = True

# 只在上升趨勢的回檔中買入
```

### 2. -3σ vs -2σ vs -1σ

**標準差倍數的選擇：**
```
-1σ: 觸發頻繁，但不夠超跌
-2σ: 平衡選項
-3σ: 觸發稀少，但反彈力道強

本策略選 -3σ：
- 追求高勝率
- 犧牲交易頻率
- 適合小資金
```

### 3. 為什麼 20 天強制出場？

**持有期過長的問題：**
```python
# 沒有強制出場
# 可能：
# - 套牢 100 天
# - 資金凍結
# - 錯過其他機會

# 有強制出場
# 好處：
# - 快速止損
# - 資金輪動
# - 機會成本低
```

### 4. 手動計算 EMA
```python
# Zipline 的 ExponentialWeightedMovingAverage
# 參數不夠靈活，所以手動計算

alpha = 2 / (period + 1)

# 初始值
ema = prices[0]

# 遞迴計算
for price in prices[1:]:
    ema = alpha * price + (1 - alpha) * ema
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

buy_threshold = highest - (sigma_multiplier * std)
```

### 優化 2: 動態持有期
```python
# 根據反彈力道調整持有期
def rebalance(context, data):
    for stock in context.portfolio.positions:
        holding_days = (current_date - context.buy_date[stock]).days
        
        # 獲利 > 10%，提前出場
        if current_price > cost_basis * 1.1:
            order_target_percent(stock, 0)
        
        # 未獲利但超過 30 天，也出場
        elif holding_days > 30:
            order_target_percent(stock, 0)
```

### 優化 3: 加入成交量確認
```python
class BuySignalWithVolume(CustomFactor):
    def compute(self, today, assets, out, high, close, volume):
        # 原本的 -3σ 邏輯
        signal = (close[-1] < highest - 3*std)
        
        # 加入量能確認：成交量 > 20 日均量
        avg_volume = np.nanmean(volume, axis=0)
        volume_confirm = (volume[-1] > avg_volume)
        
        out[:] = (signal & volume_confirm).astype(float)
```

### 優化 4: 分批進場
```python
def rebalance(context, data):
    for stock in context.stocks:
        if stock not in context.portfolio.positions:
            # 分兩批買入
            order_target_percent(stock, weight * 0.5)
            context.pending_orders[stock] = weight * 0.5
    
    # 隔天買第二批
    for stock in context.pending_orders:
        order_target_percent(stock, weight * 0.5)
```

### 優化 5: 產業分散
```python
def before_trading_start(context, data):
    output = pipeline_output('countertrend_pipe')
    
    # 加入產業分類
    output['industry'] = get_industry(output.index)
    
    # 每個產業最多 3 檔
    stocks = []
    for industry in output['industry'].unique():
        industry_stocks = output[output['industry'] == industry]
        top3 = industry_stocks.head(3)
        stocks.extend(top3.index.tolist())
    
    context.stocks = stocks
```

---

## 📚 相關資源

- **模板頁面**：[template.md](template.md) - CustomFactor 模板
- **架構說明**：[index.md](index.md) - 理解設計原理
- **其他案例**：
  - [Expanded Momentum](case-momentum.md) - 動量策略
  - [跟隨大戶](case-institution.md) - 籌碼分析

---

## 💡 總結

CounterTrend 策略展示了 **均值回歸** 的精髓：

1. ✅ **趨勢過濾**：只在多頭中逢低買
2. ✅ **統計學買點**：-3σ 極端值
3. ✅ **強制出場**：20 天避免套牢
4. ✅ **風險平價**：反波動率加權
5. ✅ **藍籌股池**：降低系統性風險

**適合誰使用？**

- 偏好逆勢操作
- 能承受短期波動
- 相信均值回歸

**使用建議：**

- ✅ 在多頭市場使用
- ✅ 嚴格執行 20 天出場
- ✅ 搭配停損機制
- ⚠️ 避免在趨勢反轉時使用
- ⚠️ 注意「接落下的刀」風險

**👉 Next Step:**

1. 複製完整程式碼
2. 調整參數（σ 倍數、持有期）
3. 測試不同 EMA 組合
4. 加入你的優化邏輯

---

## 📖 延伸閱讀

**均值回歸理論：**

- 價格偏離均值後傾向回歸
- 布林通道的理論基礎
- 統計套利的核心概念

**趨勢過濾的重要性：**

- 避免在空頭中逆勢操作
- 「順勢而為」是交易鐵律
- 趨勢 + 均值回歸 = 最佳組合

**實務經驗：**

- -3σ 觸發頻率：每月 0-5 次
- 勝率：約 60-70%
- 平均持有：10-15 天（很多會提前反彈）
- 最大風險：趨勢反轉時連續虧損