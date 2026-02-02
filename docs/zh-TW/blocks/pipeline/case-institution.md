# 案例 2：跟隨大戶策略

> **策略類型：** Pipeline 因子架構 - 籌碼分析  
> **交易標的：** 全市場（TSE + OTC）  
> **調倉頻率：** 日度（每日開盤後）  
> **回測期間：** 2020-01-01 ~ 2023-12-31

---

## 📌 策略概述

跟隨大戶策略是一個基於 **籌碼面** 的量化策略，追蹤三大法人（外資、投信、自營商）的持股變化和買賣超動向。

### 核心理念

> **"Follow the smart money."**  
> 跟隨聰明錢（機構投資人）的腳步。

三大法人擁有：

- 📊 **資訊優勢**：研究團隊、產業調研
- 💰 **資金優勢**：影響股價走勢
- 🎯 **長期視角**：不做短線炒作

當三大法人 **同時增持** 且 **持續買超** 時，往往代表股票基本面轉佳。

### 策略特色

1. **籌碼面選股**：不看技術指標，只看法人動向
2. **三大法人綜合**：外資 + 投信 + 自營商
3. **動態追蹤**：5 日移動平均，過濾雜訊
4. **日度調倉**：快速反應籌碼變化
5. **小額分散**：每檔 5% 倉位，分散風險

---

## 🎯 籌碼指標詳解

### 數據來源

**TEJ 三大法人資料：**
```
1. 外資及陸資買賣超股數
2. 投信買賣超股數
3. 自營商買賣超股數（避險 + 自行買賣）
4. 三大法人持股比率
```

### 計算邏輯

**Step 1: 計算 5 日均線**
```python
# 外資買賣超 5 日均線
foreign_5ma = 外資買賣超.rolling(5).mean()

# 投信買賣超 5 日均線
trust_5ma = 投信買賣超.rolling(5).mean()

# 自營商買賣超 5 日均線
dealer_5ma = 自營商買賣超.rolling(5).mean()
```

**Step 2: 比較當日與均線**
```python
# 外資：當日買賣超 > 5 日均線
foreign_signal = (外資買賣超[-1] > foreign_5ma[-1])

# 投信：當日買賣超 > 5 日均線
trust_signal = (投信買賣超[-1] > trust_5ma[-1])

# 自營商：當日買賣超 > 5 日均線
dealer_signal = (自營商買賣超[-1] > dealer_5ma[-1])
```

**Step 3: 綜合訊號**
```python
# 三大法人都看多（當日 > 均線）
all_positive = foreign_signal & trust_signal & dealer_signal

# 只有符合條件的股票才買入
```

### 視覺化解釋
```
外資買賣超（千股）
  ↑
  │     ╱
  │   ╱
  │ ╱         ← 5日均線
  │╱
──┼────────────→ 時間
  │
  
當 當日買賣超 > 5日均線 → 看多訊號
```

---

## 🔍 交易邏輯詳解

### 選股邏輯

**條件（必須全部滿足）：**

1. 外資當日買賣超 > 外資 5 日均線
2. 投信當日買賣超 > 投信 5 日均線
3. 自營商當日買賣超 > 自營商 5 日均線

**意義：**

- **三大法人同步看多**：不是單一法人的偶然行為
- **持續性確認**：當日優於近 5 日平均
- **過濾雜訊**：排除單日異常波動

### 權重分配

**固定現金比例：**
```python
# 每檔股票配置 5% 資金
weight_per_stock = 0.05

# 最多持有 20 檔（20 × 5% = 100%）
```

**優點：**

- 風險分散
- 單一股票影響有限
- 易於管理

---

## 💻 完整程式碼
```python
# ====================================
# 跟隨大戶策略 - 完整實作
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

log = Logger('Institution')

plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei']
plt.rcParams['axes.unicode_minus'] = False

# ====================================
# 參數設定
# ====================================
start_date = '2020-01-01'
end_date = '2023-12-31'

# ====================================
# 股票池設定
# ====================================
from zipline.sources.TEJ_Api_Data import get_universe

pool = get_universe(
    start=pd.Timestamp(start_date, tz='utc'),
    end=pd.Timestamp(end_date, tz='utc'),
    mkt_bd_e=['TSE', 'OTC'],
    stktp_e='Common Stock'
)

print(f"股票池總數: {len(pool)} 檔")

os.environ['mdate'] = f'{start_date} {end_date}'
os.environ['ticker'] = ' '.join(pool)

# ====================================
# 匯入股價資料
# ====================================
from zipline.data.run_ingest import simple_ingest

pools = pool + ['IR0001']

print("正在準備 Zipline 資料...")
simple_ingest(
    name='tquant',
    tickers=pools,
    start_date=start_date.replace('-', ''),
    end_date=end_date.replace('-', '')
)
print("資料準備完成！")

# ====================================
# 下載三大法人資料
# ====================================
print("正在下載三大法人資料...")

# 外資及陸資買賣超
foreign = tejapi.get(
    'TWN/EWISALE',
    coid=pool,
    mdate={'gte': start_date, 'lte': end_date},
    opts={'columns': ['coid', 'mdate', 'bsale']},
    paginate=True
)
foreign.columns = ['coid', 'mdate', 'foreign_net']
foreign['mdate'] = pd.to_datetime(foreign['mdate'])

# 投信買賣超
trust = tejapi.get(
    'TWN/EWITRSALE',
    coid=pool,
    mdate={'gte': start_date, 'lte': end_date},
    opts={'columns': ['coid', 'mdate', 'bsale']},
    paginate=True
)
trust.columns = ['coid', 'mdate', 'trust_net']
trust['mdate'] = pd.to_datetime(trust['mdate'])

# 自營商買賣超
dealer = tejapi.get(
    'TWN/EWIDLRSALE',
    coid=pool,
    mdate={'gte': start_date, 'lte': end_date},
    opts={'columns': ['coid', 'mdate', 'bsale']},
    paginate=True
)
dealer.columns = ['coid', 'mdate', 'dealer_net']
dealer['mdate'] = pd.to_datetime(dealer['mdate'])

print(f"外資資料: {len(foreign)} 筆")
print(f"投信資料: {len(trust)} 筆")
print(f"自營商資料: {len(dealer)} 筆")

# 合併資料
institution_data = foreign.merge(trust, on=['coid', 'mdate'], how='outer')
institution_data = institution_data.merge(dealer, on=['coid', 'mdate'], how='outer')
institution_data = institution_data.fillna(0)

print("三大法人資料準備完成！")

# ====================================
# 將資料載入 Zipline
# ====================================
from zipline.pipeline.loaders import InstitutionDataLoader

# 這裡需要自定義 DataSet 和 Loader
# 為了簡化，我們使用 CustomFactor 直接讀取

# ====================================
# CustomFactor 定義
# ====================================
from zipline.pipeline import CustomFactor
from zipline.pipeline.data import EquityPricing

class ForeignInstitution(CustomFactor):
    """
    外資買賣超 vs 5 日均線
    """
    window_length = 6  # 需要 6 天計算 5 日均線
    
    def compute(self, today, assets, out):
        # 這裡簡化處理，實際應從 institution_data 讀取
        # 讀取當天的外資資料
        today_str = pd.Timestamp(today).strftime('%Y-%m-%d')
        
        result = np.zeros(len(assets))
        
        for i, asset in enumerate(assets):
            symbol = asset.symbol
            
            # 從 institution_data 取得該股票過去 6 天資料
            stock_data = institution_data[
                (institution_data['coid'] == symbol) &
                (institution_data['mdate'] <= today_str)
            ].tail(6)
            
            if len(stock_data) < 6:
                result[i] = np.nan
                continue
            
            # 計算 5 日均線
            ma5 = stock_data['foreign_net'].iloc[:-1].mean()
            
            # 當日買賣超
            today_net = stock_data['foreign_net'].iloc[-1]
            
            # 當日 > 均線 → 1，否則 → 0
            result[i] = 1 if today_net > ma5 else 0
        
        out[:] = result


class TrustInstitution(CustomFactor):
    """
    投信買賣超 vs 5 日均線
    """
    window_length = 6
    
    def compute(self, today, assets, out):
        today_str = pd.Timestamp(today).strftime('%Y-%m-%d')
        
        result = np.zeros(len(assets))
        
        for i, asset in enumerate(assets):
            symbol = asset.symbol
            
            stock_data = institution_data[
                (institution_data['coid'] == symbol) &
                (institution_data['mdate'] <= today_str)
            ].tail(6)
            
            if len(stock_data) < 6:
                result[i] = np.nan
                continue
            
            ma5 = stock_data['trust_net'].iloc[:-1].mean()
            today_net = stock_data['trust_net'].iloc[-1]
            
            result[i] = 1 if today_net > ma5 else 0
        
        out[:] = result


class DealerInstitution(CustomFactor):
    """
    自營商買賣超 vs 5 日均線
    """
    window_length = 6
    
    def compute(self, today, assets, out):
        today_str = pd.Timestamp(today).strftime('%Y-%m-%d')
        
        result = np.zeros(len(assets))
        
        for i, asset in enumerate(assets):
            symbol = asset.symbol
            
            stock_data = institution_data[
                (institution_data['coid'] == symbol) &
                (institution_data['mdate'] <= today_str)
            ].tail(6)
            
            if len(stock_data) < 6:
                result[i] = np.nan
                continue
            
            ma5 = stock_data['dealer_net'].iloc[:-1].mean()
            today_net = stock_data['dealer_net'].iloc[-1]
            
            result[i] = 1 if today_net > ma5 else 0
        
        out[:] = result


# ====================================
# Pipeline 定義
# ====================================
from zipline.pipeline import Pipeline

def make_pipeline():
    """
    建立 Pipeline
    
    篩選：三大法人都看多
    """
    # 計算三大法人訊號
    foreign = ForeignInstitution()
    trust = TrustInstitution()
    dealer = DealerInstitution()
    
    # 篩選：三個訊號都 = 1
    screen = (foreign == 1) & (trust == 1) & (dealer == 1)
    
    return Pipeline(
        columns={
            'foreign': foreign,
            'trust': trust,
            'dealer': dealer
        },
        screen=screen
    )


# ====================================
# 策略函數
# ====================================
from zipline.api import (
    attach_pipeline, pipeline_output,
    order_target_percent, set_commission, set_slippage,
    record, schedule_function, date_rules, time_rules
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
    attach_pipeline(make_pipeline(), 'institution_pipe')
    
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
    output = pipeline_output('institution_pipe')
    
    # 選股：所有通過篩選的股票
    context.stocks = output.index.tolist()
    
    log.info(f"選股數量: {len(context.stocks)}")


def rebalance(context, data):
    """
    調倉函數：每檔 5% 資金
    """
    if len(context.stocks) == 0:
        log.warn("無股票通過篩選")
        # 清空所有持倉
        for stock in context.portfolio.positions:
            order_target_percent(stock, 0)
        return
    
    # ========================================
    # 固定權重：每檔 5%
    # ========================================
    weight_per_stock = 0.05
    
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
        if data.can_trade(stock):
            order_target_percent(stock, weight_per_stock)
    
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
    ax1.set_title('Institution Following Strategy - Portfolio Performance', 
                  fontsize=14, fontweight='bold')
    ax1.grid(True, alpha=0.3)
    
    # 圖 2: 累積報酬 vs 基準
    ax2 = fig.add_subplot(312)
    
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
print("開始回測跟隨大戶策略")
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

results.to_csv('institution_results.csv')
print(f"\n詳細結果已儲存至: institution_results.csv")

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

1. **資訊優勢**
> - 跟隨專業機構投資人
> - 他們有研究團隊和產業資源
> - 避免散戶盲目跟風

2. **籌碼面量化**
> - 不依賴技術指標
> - 直接觀察資金流向
> - 數據客觀可驗證

3. **三大法人綜合**
> - 不只看單一法人
> - 避免偶然性
> - 增加訊號可靠性

4. **日度調倉**
> - 快速反應籌碼變化
> - 不會錯過新機會
> - 及時停損

5. **風險分散**
> - 每檔 5% 倉位
> - 最多持有 20 檔
> - 單一股票影響有限

### 劣勢 ⚠️

1. **交易成本高**
> - 日度調倉
> - 頻繁進出
> - 手續費和滑價成本高

2. **資訊延遲**
> - 法人資料通常 T+1 公布
> - 已經晚一天
> - 可能錯過最佳時機

3. **假訊號風險**
> - 法人也會犯錯
> - 短期買賣不代表長期看好
> - 可能被洗出場

4. **選股數量波動**
> - 有時選 30 檔，有時選 5 檔
> - 不穩定
> - 影響分散效果

5. **無基本面驗證**
> - 只看籌碼面
> - 不管公司好壞
> - 可能買到地雷股

---

## 🔍 關鍵學習點

### 1. 為什麼用 5 日均線而非當日絕對值？

**當日絕對值的問題：**
```python
# 只看當日買賣超
if foreign_net > 0:
    buy = True

# 問題：
# 1. 容易受單日異常影響
# 2. 無法判斷趨勢
# 3. 正負頻繁切換
```

**5 日均線的優勢：**
```python
# 當日 vs 均線
if foreign_net > foreign_ma5:
    buy = True

# 優勢：
# 1. 過濾單日雜訊
# 2. 確認持續性
# 3. 訊號較穩定
```

### 2. 三大法人的特性

**外資：**

- 資金量大，影響力強
- 關注大型權值股
- 有研究團隊支持

**投信：**

- 本土機構，熟悉台灣市場
- 偏好中小型股
- 季底有作帳需求

**自營商：**

- 短線操作為主
- 有避險需求
- 較不適合長期跟隨

### 3. Pipeline 處理外部數據

**挑戰：**
```python
# CustomFactor 通常用 EquityPricing 數據
inputs = [EquityPricing.close]

# 但法人資料是外部 CSV/API
# 如何整合？
```

**解決方案：**
```python
# 方法 1: 在 compute 內讀取（本案例）
def compute(self, today, assets, out):
    # 直接從 DataFrame 讀取
    data = institution_data[institution_data['mdate'] == today]

# 方法 2: 自定義 DataSet (進階)
class InstitutionData(DataSet):
    foreign_net = Column(dtype=float)
    trust_net = Column(dtype=float)
```

### 4. 固定權重 vs 動態權重

**固定權重（本策略）：**
```python
weight_per_stock = 0.05  # 每檔 5%

# 優點：簡單、風險分散
# 缺點：不考慮訊號強度
```

**動態權重（進階）：**
```python
# 根據買賣超量分配權重
total_net = sum(foreign_net[stock] for stock in stocks)
weight[stock] = foreign_net[stock] / total_net

# 優點：區分強弱
# 缺點：可能過度集中
```

---

## 🎯 延伸優化方向

### 優化 1: 加入持股比率
```python
class InstitutionHolding(CustomFactor):
    """
    三大法人持股比率
    """
    def compute(self, today, assets, out):
        # 持股比率 > 30% 才考慮
        ...

# 篩選
screen = (foreign_signal) & (trust_signal) & (holding > 0.3)
```

### 優化 2: 加權計分
```python
def before_trading_start(context, data):
    output = pipeline_output('institution_pipe')
    
    # 給不同法人不同權重
    output['score'] = (
        output['foreign'] * 0.5 +  # 外資權重 50%
        output['trust'] * 0.3 +    # 投信權重 30%
        output['dealer'] * 0.2     # 自營商權重 20%
    )
    
    # 選前 20 名
    context.stocks = output.nlargest(20, 'score').index.tolist()
```

### 優化 3: 降低調倉頻率
```python
def initialize(context):
    # 改為每週一調倉
    schedule_function(
        rebalance,
        date_rules.week_start(),
        time_rules.market_open()
    )
```

### 優化 4: 加入基本面過濾
```python
def make_pipeline():
    foreign = ForeignInstitution()
    trust = TrustInstitution()
    dealer = DealerInstitution()
    
    # 加入基本面過濾
    pe_ratio = PERatio()
    roe = ROE()
    
    screen = (
        (foreign == 1) & 
        (trust == 1) & 
        (dealer == 1) &
        (pe_ratio < 20) &  # 本益比 < 20
        (roe > 0.15)       # ROE > 15%
    )
```

### 優化 5: 停損機制
```python
def rebalance(context, data):
    # 檢查持倉
    for stock in list(context.portfolio.positions):
        position = context.portfolio.positions[stock]
        current_price = data.current(stock, 'close')
        
        # 虧損 10% 或不在清單，賣出
        if (current_price < position.cost_basis * 0.9) or (stock not in context.stocks):
            order_target_percent(stock, 0)
```

---

## 📚 相關資源

- **模板頁面**：[template.md](template.md) - CustomFactor 模板
- **架構說明**：[index.md](index.md) - 理解設計原理
- **其他案例**：
  - [Expanded Momentum](case-momentum.md) - 動量策略
  - [CounterTrend](case-countertrend.md) - 逆勢策略

---

## 💡 總結

跟隨大戶策略展示了 **籌碼面量化** 的應用：

1. ✅ **跟隨機構**：利用法人資訊優勢
2. ✅ **三大綜合**：降低偶然性
3. ✅ **日度調倉**：快速反應
4. ✅ **風險分散**：每檔 5%

**適合誰使用？**

- 相信籌碼面分析
- 能承受高頻交易成本
- 短線操作者

**使用建議：**

- ✅ 注意交易成本
- ✅ 搭配基本面過濾
- ✅ 設定停損機制
- ⚠️ 法人資料有延遲
- ⚠️ 法人也會犯錯

**👉 Next Step:**

1. 複製完整程式碼
2. 調整參數（均線天數、權重）
3. 加入基本面過濾
4. 測試不同調倉頻率

---

## 📖 延伸閱讀

**籌碼分析理論：**

- 供需法則：大量買盤推升股價
- 資訊不對稱：機構比散戶有優勢
- 羊群效應：跟隨主力方向

**三大法人特性：**

- 外資：長線布局，資金龐大
- 投信：季底作帳，月底結算
- 自營商：短線避險，參考價值低

**實務注意事項：**

- 法人資料 T+1 公布（有延遲）
- 作帳行情：季末月初需注意
- 假外資：借名帳戶可能扭曲數據