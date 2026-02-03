# 案例 1：Expanded Momentum 策略

> **策略類型：** Pipeline 因子架構 - 動量策略  
> **交易標的：** 台灣 50 成分股  
> **調倉頻率：** 月度（每月第一個交易日）  
> **回測期間：** 2019-01-01 ~ 2023-12-31

---

## 📌 策略概述

Expanded Momentum 是一個改良版的動量策略，結合了 **趨勢強度**（線性回歸斜率）和 **趨勢穩定性**（R²）兩個維度。

### 核心理念

> **"Strong trends with high consistency win."**  
> 強勁且穩定的趨勢才是真正的動能。

傳統動量策略只看報酬率，但忽略了趨勢的 **穩定性**。一檔股票可能有 30% 的年報酬，但如果過程劇烈震盪，風險很高。Expanded Momentum 透過 R² 過濾掉不穩定的趨勢。

### 策略特色

1. **雙重評估**：斜率（趨勢強度）× R²（趨勢穩定性）
2. **風險平價**：反波動率加權，降低組合波動
3. **流動性過濾**：只交易台灣 50 成分股
4. **月度調倉**：降低交易成本

---

## 🎯 動量分數計算詳解

### 公式
```
動量分數 = 年化斜率 × R²

其中：
- 年化斜率 = 線性回歸斜率 × 252
- R² = 決定係數（0-1 之間）
```

### 步驟拆解

**Step 1: 線性回歸**

對過去 252 天的價格做線性回歸：
```
價格 = β₀ + β₁ × 時間 + ε

其中 β₁ 就是斜率
```

**Step 2: 計算 R²**
```
R² = 1 - (RSS / TSS)

RSS = Σ(實際價格 - 預測價格)²
TSS = Σ(實際價格 - 平均價格)²
```

R² 衡量線性模型的解釋力：

- R² = 1：完美線性趨勢
- R² = 0：完全隨機

**Step 3: 組合分數**
```
動量分數 = β₁ × 252 × R²
```

### 視覺化解釋
```
股票 A: 年報酬 30%，R² = 0.9 → 動量分數 = 0.30 × 0.9 = 0.27
股票 B: 年報酬 30%，R² = 0.3 → 動量分數 = 0.30 × 0.3 = 0.09

雖然報酬率相同，但 A 的趨勢更穩定，分數更高
```

---

## 🔍 交易邏輯詳解

### 選股邏輯

**Step 1: 股票池**

台灣 50 成分股（約 50 檔）

**Step 2: 計算動量分數**

每檔股票計算：

- 過去 252 天線性回歸斜率
- R² 值
- 動量分數 = 斜率 × R²

**Step 3: 篩選**

只選動量分數 > 0 的股票（正趨勢）

**Step 4: 排序**

按動量分數由高到低排序

### 權重分配

**反波動率加權（Risk Parity）**
```
權重ᵢ = (1/波動率ᵢ) / Σ(1/波動率ⱼ)
```

**意義：**

- 波動率低的股票，權重高
- 波動率高的股票，權重低
- 目標：降低組合整體波動

**範例：**
```
股票 A: 波動率 20% → 1/0.20 = 5
股票 B: 波動率 30% → 1/0.30 = 3.33
股票 C: 波動率 40% → 1/0.40 = 2.5

總和 = 10.83

權重 A = 5 / 10.83 = 46.2%
權重 B = 3.33 / 10.83 = 30.7%
權重 C = 2.5 / 10.83 = 23.1%
```

---

## 💻 完整程式碼
```python
# ====================================
# Expanded Momentum 策略 - 完整實作
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

log = Logger('Momentum')

plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei']
plt.rcParams['axes.unicode_minus'] = False

# ====================================
# 參數設定
# ====================================
start_date = '2019-01-01'
end_date = '2023-12-31'

# ====================================
# 取得台灣 50 成分股
# ====================================
from zipline.sources.TEJ_Api_Data import get_universe

print("正在取得台灣 50 成分股...")

tw50_list = get_universe(start_date,end_date, idx_id='IX0002')
print(f"台灣 50 成分股數量: {len(tw50_list)}")

# 設定環境變數
os.environ['mdate'] = f'{start_date} {end_date}'
os.environ['ticker'] = ' '.join(tw50_list)

# ====================================
# 匯入股價資料
# ====================================
from zipline.data.run_ingest import simple_ingest

pools = tw50_list + ['IR0001']

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
from scipy import stats

class ExpandedMomentum(CustomFactor):
    """
    Expanded Momentum: 年化斜率 × R²

    計算過去 252 天的線性回歸：
    - 斜率：趨勢強度
    - R²：趨勢穩定性
    """
    window_length = 252
    inputs = [EquityPricing.close]

    def compute(self, today, assets, out, close):
        # 準備時間序列 (0, 1, 2, ..., 251)
        x = np.arange(self.window_length)

        # 初始化輸出陣列
        slopes = np.zeros(len(assets))
        r_squared = np.zeros(len(assets))

        # 對每檔股票計算線性回歸
        for i in range(len(assets)):
            y = close[:, i]

            # 跳過有 NaN 的股票
            if np.isnan(y).any():
                slopes[i] = np.nan
                r_squared[i] = np.nan
                continue

            # 線性回歸
            slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)

            # 年化斜率
            slopes[i] = slope * 252

            # R²
            r_squared[i] = r_value ** 2

        # 動量分數 = 年化斜率 × R²
        momentum_score = slopes * r_squared

        out[:] = momentum_score


class AnnualizedVolatility(CustomFactor):
    """
    年化波動率
    """
    window_length = 252
    inputs = [EquityPricing.close]

    def compute(self, today, assets, out, close):
        # 計算日報酬率
        daily_returns = np.diff(close, axis=0) / close[:-1]

        # 年化波動率 = 日波動率 × √252
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

    流程：
    1. 計算動量分數
    2. 計算波動率
    3. 篩選：動量分數 > 0
    """
    # 定義股票池（台灣 50）
    universe = StaticAssets(symbols(*tw50_list))

    # 計算因子
    momentum = ExpandedMomentum(mask=universe)
    volatility = AnnualizedVolatility(mask=universe)

    # 篩選：只要正動量
    screen = (momentum > 0) & universe

    return Pipeline(
        columns={
            'momentum': momentum,
            'volatility': volatility
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
    symbol, symbols, set_benchmark
)
from zipline.finance import commission, slippage

def initialize(context):
    """
    初始化函數
    """
    # 交易成本
    set_commission(commission.PerShare(cost=0.001425, min_trade_cost=20))
    set_slippage(slippage.VolumeShareSlippage(volume_limit=0.025, price_impact=0.1))
    set_benchmark(symbol('IR0001'))  # 大盤作為基準

    # 附加 Pipeline
    attach_pipeline(make_pipeline(), 'momentum_pipe')

    # 每月第一個交易日調倉
    schedule_function(
        rebalance,
        date_rules.month_start(),
        time_rules.market_open()
    )


def before_trading_start(context, data):
    """
    盤前執行：取得 Pipeline 輸出
    """
    # 取得 Pipeline 結果
    output = pipeline_output('momentum_pipe')

    # 儲存完整 output（用於計算權重）
    context.output = output

    # 選股：所有通過篩選的股票
    context.stocks = output.index.tolist()

    log.info(f"選股數量: {len(context.stocks)}")


def rebalance(context, data):
    """
    調倉函數：反波動率加權
    """
    if len(context.stocks) == 0:
        log.warn("無股票通過篩選")
        return

    # ========================================
    # 計算反波動率權重
    # ========================================
    volatility_values = context.output.loc[context.stocks, 'volatility']

    # 反波動率
    inv_vol = 1 / volatility_values

    # 標準化為權重
    total_inv_vol = inv_vol.sum()
    target_weights = inv_vol / total_inv_vol

    # ========================================
    # 賣出不在清單的股票
    # ========================================
    for stock in context.portfolio.positions:
        if stock not in context.stocks:
            order_target_percent(stock, 0)
            log.info(f"賣出: {stock.symbol}")

    # ========================================
    # 買入目標股票
    # ========================================
    for stock in context.stocks:
        weight = target_weights[stock]
        if data.can_trade(stock):
            order_target_percent(stock, weight)

    # ========================================
    # 記錄資訊
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

    fig = plt.figure(figsize=(16, 10))

    # 圖 1: 投資組合價值
    ax1 = fig.add_subplot(311)
    perf['portfolio_value'].plot(ax=ax1, linewidth=2)
    ax1.set_ylabel('Portfolio Value (TWD)', fontsize=12)
    ax1.set_title('Expanded Momentum Strategy - Portfolio Performance', 
                  fontsize=14, fontweight='bold')
    ax1.grid(True, alpha=0.3)

    # 圖 2: 累積報酬 vs 基準
    ax2 = fig.add_subplot(312)

    cumulative_returns = (1 + perf['returns']).cumprod() - 1
    benchmark_returns = (1 + perf['benchmark_return']).cumprod() - 1

    cumulative_returns.plot(ax=ax2, label='Strategy', linewidth=2, color='#2E86AB')
    benchmark_returns.plot(ax=ax2, label='Taiwan 50', linewidth=2, alpha=0.7, color='#A23B72')

    ax2.set_ylabel('Cumulative Returns', fontsize=12)
    ax2.set_title('Strategy vs Taiwan 50 Index', fontsize=14, fontweight='bold')
    ax2.legend(loc='upper left', fontsize=11)
    ax2.grid(True, alpha=0.3)
    ax2.axhline(0, color='black', linewidth=0.8, linestyle='--', alpha=0.5)

    # 圖 3: 持倉數量
    ax3 = fig.add_subplot(313)
    perf['num_positions'].plot(ax=ax3, linewidth=2, color='#F18F01')
    ax3.set_ylabel('Number of Positions', fontsize=12)
    ax3.set_xlabel('Date', fontsize=12)
    ax3.set_title('Position Count Over Time', fontsize=14, fontweight='bold')
    ax3.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.show()


# ====================================
# 執行回測
# ====================================
from zipline import run_algorithm

print("="*60)
print("開始回測 Expanded Momentum 策略")
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

results.to_csv('momentum_results.csv')
print(f"\n詳細結果已儲存至: momentum_results.csv")

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

1. **雙重驗證機制**
> - 不只看報酬率，還看趨勢穩定性
> - R² 過濾掉震盪過大的股票
> - 降低假突破風險

2. **風險平價設計**
> - 反波動率加權
> - 低波動股票權重高
> - 組合整體波動較低

3. **流動性保證**
> - 只交易台灣 50 成分股
> - 流動性充足
> - 滑價成本低

4. **月度調倉**
> - 交易成本可控
> - 避免過度交易
> - 適合中長期投資

5. **理論基礎扎實**
> - 動量效應有學術支持
> - 線性回歸是經典方法
> - R² 是統計學標準指標

### 劣勢 ⚠️

1. **趨勢反轉風險**
> - 動量策略在趨勢反轉時虧損
> - 2020 年 3 月疫情暴跌受傷
> - 需要搭配停損機制

2. **參數敏感**
> - 252 天視窗期是經驗值
> - 不同市場可能需要調整
> - 需要回測優化

3. **集中度風險**
> - 台灣 50 集中在科技股
> - 產業分散不足
> - 系統性風險高

4. **月度調倉延遲**
> - 無法即時反應市場變化
> - 趨勢反轉時反應慢
> - 可能錯過最佳出場時機

---

## 🔍 關鍵學習點

### 1. 為什麼用線性回歸斜率而非簡單報酬率？

**簡單報酬率的問題：**
```python
# 簡單報酬率
returns = (close[-1] - close[0]) / close[0]

# 問題：只看頭尾兩點
# 忽略中間過程
```

**線性回歸斜率的優勢：**
```python
# 線性回歸考慮所有 252 個點
slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)

# 優勢：
# 1. 考慮整個趨勢
# 2. 對異常值較不敏感
# 3. 可以得到 R²
```

### 2. R² 的意義

**R² = 0.9 vs R² = 0.3**
```
股票 A (R² = 0.9):
  價格沿著趨勢線穩定上升
  ↗↗↗↗↗↗↗↗
  
股票 B (R² = 0.3):
  價格劇烈震盪
  ↗↘↗↘↗↘↗↘
  
即使兩者最終報酬相同，A 的趨勢更可靠
```

### 3. 向量化計算的重要性

**❌ 錯誤：用迴圈**
```python
def compute(self, today, assets, out, close):
    for i in range(len(assets)):
        y = close[:, i]
        slope, _, r_value, _, _ = stats.linregress(x, y)
        out[i] = slope * 252 * r_value ** 2
    # 50 檔股票，50 次迴圈，慢！
```

**✅ 正確：仍需迴圈（因為 linregress 無法向量化）**
```python
# scipy.stats.linregress 不支援向量化
# 所以這裡必須用迴圈
# 但這是不得已的，如果有向量化版本會更快
```

### 4. 反波動率加權的邏輯

**為什麼不用等權重？**
```
等權重：
股票 A (波動率 20%): 權重 33.3%
股票 B (波動率 30%): 權重 33.3%
股票 C (波動率 40%): 權重 33.3%

→ 組合波動率 ≈ 30%

反波動率加權：
股票 A (波動率 20%): 權重 46.2%
股票 B (波動率 30%): 權重 30.7%
股票 C (波動率 40%): 權重 23.1%

→ 組合波動率 ≈ 24%（降低 20%）
```

---

## 🎯 延伸優化方向

### 優化 1: 動態調整視窗期
```python
class AdaptiveMomentum(CustomFactor):
    """
    根據市場波動率調整視窗期
    """
    def compute(self, today, assets, out, close):
        # 計算市場波動率
        market_vol = calculate_market_volatility()
        
        # 高波動用短視窗，低波動用長視窗
        if market_vol > 0.3:
            window = 126  # 半年
        else:
            window = 252  # 一年
        
        # 使用動態視窗計算動量
        ...
```

### 優化 2: 加入止損機制
```python
def rebalance(context, data):
    # 檢查持倉虧損
    for stock in context.portfolio.positions:
        position = context.portfolio.positions[stock]
        current_price = data.current(stock, 'close')
        
        # 虧損超過 15% 停損
        if current_price < position.cost_basis * 0.85:
            order_target_percent(stock, 0)
            log.info(f"停損: {stock.symbol}")
```

### 優化 3: 產業中性
```python
def before_trading_start(context, data):
    output = pipeline_output('momentum_pipe')
    
    # 加入產業分類（需要外部數據）
    output['industry'] = get_industry_classification(output.index)
    
    # 每個產業選前 3 名
    stocks = []
    for industry in output['industry'].unique():
        industry_stocks = output[output['industry'] == industry]
        top3 = industry_stocks.nlargest(3, 'momentum')
        stocks.extend(top3.index.tolist())
    
    context.stocks = stocks
```

### 優化 4: 動態持倉數量
```python
def before_trading_start(context, data):
    output = pipeline_output('momentum_pipe')
    
    # 根據市場狀況調整持倉數
    avg_momentum = output['momentum'].mean()
    
    if avg_momentum > 0.5:
        num_stocks = 15  # 強勢市場，集中持倉
    elif avg_momentum > 0.2:
        num_stocks = 25  # 中性市場
    else:
        num_stocks = 35  # 弱勢市場，分散持倉
    
    context.stocks = output.nlargest(num_stocks, 'momentum').index.tolist()
```

### 優化 5: 多因子組合
```python
class ValueFactor(CustomFactor):
    """價值因子：低 PB"""
    ...

def make_pipeline():
    momentum = ExpandedMomentum()
    value = ValueFactor()
    
    # 組合分數
    composite = 0.7 * momentum.rank() + 0.3 * value.rank()
    
    return Pipeline(
        columns={'composite': composite},
        screen=composite.top(20)
    )
```

---

## 📚 相關資源

- **模板頁面**：[template.md](template.md) - CustomFactor 模板
- **架構說明**：[index.md](index.md) - 理解設計原理
- **其他案例**：
  - [跟隨大戶](case-institution.md) - 籌碼分析
  - [CounterTrend](case-countertrend.md) - 逆勢策略

---

## 💡 總結

Expanded Momentum 策略展示了 Pipeline 架構的核心優勢：

1. ✅ **批次計算**：一次處理 50 檔股票
2. ✅ **因子模組化**：動量和波動率獨立計算
3. ✅ **可擴展性**：從 50 檔到 500 檔無痛升級
4. ✅ **理論扎實**：線性回歸 + R² 是經典方法

**適合誰使用？**

- 量化投資者
- 偏好動量策略
- 中長期投資者（月度調倉）

**使用建議：**

- ✅ 在趨勢明確的市場使用
- ✅ 搭配停損機制
- ✅ 注意產業分散
- ⚠️ 避免在震盪市場使用
- ⚠️ 注意趨勢反轉風險

**👉 Next Step:**

1. 複製完整程式碼
2. 調整參數（視窗期、權重方法）
3. 測試不同股票池
4. 加入你的優化邏輯

---

## 📖 延伸閱讀

**動量效應研究：**

- Jegadeesh & Titman (1993) "Returns to Buying Winners and Selling Losers"
- Carhart (1997) "On Persistence in Mutual Fund Performance"

**動量策略的理論解釋：**

- 行為金融學：投資人反應不足（Underreaction）
- 資訊擴散：好消息逐步傳播
- 羊群效應：追漲殺跌

**R² 在量化投資的應用：**

- 趨勢強度過濾
- 策略穩定性評估
- 因子有效性檢驗