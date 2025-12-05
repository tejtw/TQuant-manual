# 常用功能速查表

!!! info
    本頁提供 TQuant Lab 常用功能的快速查詢指南，幫助您迅速找到關鍵函數與操作方式。

快速查詢常見任務的解決方案。每個部分都包含代碼示例和指向詳細文檔的連結。

---

## 快速跳轉

在下方快速定位你需要的內容：

- [資料管理](#data-management) - 獲取股票數據、基本面資料、基準指數
- [策略編寫](#strategy-writing) - 初始化參數、編寫交易邏輯、使用 Pipeline
- [交易執行](#trade-execution) - 下單、查詢持倉、設置手續費和滑價
- [交易限制](#trading-controls) - 設置槓桿、禁止交易清單、交易頻率限制
- [績效分析](#performance-analysis) - Pyfolo 報表、因子分析、自訂指標
- [API 參考](#api-reference) - symbol()、data.history()、context.portfolio
- [常見問題](#troubleshooting) - 調試技巧、快速診斷

---

## 資料管理 {#data-management}

### 如何取得股票歷史價格？

```python
from zipline.api import data
prices = data.history(symbol('2330'), 'close', 100, '1d')
```

詳見：[如何 Ingest 股票價量資料](../how-to/data/ingest-spot-pricing.md)

### 如何加載 TEJ 基本面資料？

```python
import TejToolAPI
api = TejToolAPI.TejToolAPI()
df = api.get_history_data(tickers='2330', fields=['PER', 'PBR'], date='20230101')
```

詳見：[如何 Ingest TEJ 財務/非財務資料](../how-to/data/ingest-tej-fundamental.md)

### 如何取得基準指數報酬？

在 `run_algorithm()` 中指定：

```python
run_algorithm(
    benchmark_symbol='0050',  # 台灣 50 指數
)
```

詳見：[如何取得 Benchmark 報酬率](../how-to/data/get-benchmark-roi.md)

---

## 策略編寫 {#strategy-writing}

### 如何初始化策略參數？

```python
def initialize(context):
    context.max_leverage = 1.0
    context.stocks = [symbol('2330'), symbol('2454')]
    context.long_window = 50
    context.short_window = 20
```

詳見：[Zipline 生命週期函數](../reference/zipline/lifecycle-functions.md)

### 如何在每個交易日執行操作？

```python
def handle_data(context, data):
    # 這個函數每天執行一次
    prices = data.history(symbol('2330'), 'close', 20, '1d')
    avg = prices.mean()
    
    if avg > some_threshold:
        order(symbol('2330'), 100)
```

詳見：[Zipline 生命週期函數](../reference/zipline/lifecycle-functions.md)

### 如何計算因子並過濾股票？

```python
from zipline.pipeline import Pipeline, screen
from zipline.pipeline.factors import CustomFactor

pipeline = Pipeline(
    columns={
        'momentum': CustomFactor(...),
    },
    screen=Q(pe_ratio < 20),
)
```

詳見：[Pipeline 自訂因子](../reference/pipeline/custom-factor.md)

---

## 交易執行 {#trade-execution}

### 如何下買單？

```python
order(symbol('2330'), 100)  # 買 100 股
```

### 如何下賣單？

```python
order(symbol('2330'), -100)  # 賣 100 股
```

### 如何一次買入所有資金可購買的股票？

```python
price = data.current(symbol('2330'), 'price')
cash = context.portfolio.cash
shares = int(cash / price)
order(symbol('2330'), shares)
```

詳見：[下單函數](../reference/zipline/orders.md)

### 如何查詢當前持倉？

```python
positions = context.portfolio.positions
for asset, position in positions.items():
    print(f"股票: {asset}, 數量: {position.amount}, 成本: {position.cost_basis}")
```

詳見：[context 變數](../reference/zipline/context.md)

### 如何設定手續費？

```python
from zipline.finance import commission

set_commission(commission.PerShare(cost=0.001))  # 每股 0.001 元
```

詳見：[如何設定手續費模型](../how-to/backtest/set-commission.md)

### 如何設定滑價？

```python
from zipline.finance import slippage

set_slippage(slippage.FixedSlippage(0.001))  # 固定 0.1%
```

詳見：[如何設定滑價模型](../how-to/backtest/set-slippage.md)

---

## 交易限制 {#trading-controls}

### 如何限制最大槓桿？

```python
set_max_leverage(2.0)  # 最多借 2 倍資金
```

### 如何設定禁止交易清單？

```python
set_do_not_order_list([symbol('2881'), symbol('2882')])
```

### 如何設定單日最大交易筆數？

```python
set_max_order_count(10)  # 最多下 10 單
```

詳見：[如何設定交易限制](../how-to/backtest/set-trading-controls.md)

---

## 績效分析 {#performance-analysis}

### 如何生成 Pyfolo 報表？

```python
import pyfolio as pf
pf.create_tear_sheet(returns, positions, transactions)
```

詳見：[如何產生 Pyfolo 績效報表](../how-to/visualization/pyfolio-tearsheet.md)

### 如何進行因子分析？

```python
import alphalens as al
al.tears.create_factor_tear_sheet(factor, prices)
```

詳見：[如何執行 Alphalens 因子分析](../how-to/factor-analysis/alphalens-tearsheet.md)

### 如何記錄自訂指標？

```python
def handle_data(context, data):
    # ... 交易邏輯 ...
    
    record(
        portfolio_value=context.portfolio.portfolio_value,
        leverage=context.account.leverage,
        custom_signal=some_value
    )
```

詳見：[context 變數](../reference/zipline/context.md)

---

## 常用 API 參考 {#api-reference}

### symbol() - 獲取股票對象

```python
from zipline.api import symbol

tsmc = symbol('2330')  # TSMC
```

### data.history() - 獲取歷史數據

```python
prices = data.history(stock, 'close', 50, '1d')  # 過去 50 日收盤價
volumes = data.history(stock, 'volume', 20, '1d')  # 過去 20 日成交量
```

### data.current() - 獲取當前價格

```python
current_price = data.current(stock, 'price')
current_volume = data.current(stock, 'volume')
```

### context.portfolio - 投資組合信息

```python
context.portfolio.portfolio_value  # 總資產
context.portfolio.cash             # 現金
context.portfolio.positions        # 持倉字典
```

詳見：[context 變數完整參考](../reference/zipline/context.md)

---

## 完整策略範本

一個最小化但完整的策略框架：

```python
from zipline import run_algorithm
from zipline.api import order, symbol, record
from datetime import datetime

def initialize(context):
    context.stock = symbol('2330')

def handle_data(context, data):
    price = data.current(context.stock, 'price')
    order(context.stock, 10)
    record(price=price)

def analyze(context, perf):
    print(f"Return: {perf['algorithm_period_return'][-1]:.2%}")

run_algorithm(
    start=datetime(2022, 1, 1),
    end=datetime(2023, 1, 1),
    initialize=initialize,
    handle_data=handle_data,
    analyze=analyze,
    capital_base=100000,
    bundle='tquant',
)
```

---

## 快速診斷 {#troubleshooting}

### 為什麼我的策略沒有下單？

| 原因 | 檢查方法 |
|------|--------|
| 資金不足 | 檢查 `context.portfolio.cash` |
| 股票代碼錯誤 | 確保 symbol() 使用正確的代碼 |
| 數據不可用 | 檢查回測期間是否有該股票的數據 |
| 邏輯錯誤 | 在 `handle_data()` 中添加 `print()` 調試 |

### 如何調試策略？

```python
def handle_data(context, data):
    # 添加 print 語句
    print(f"Date: {data.current_dt}")
    print(f"Cash: {context.portfolio.cash}")
    print(f"Portfolio value: {context.portfolio.portfolio_value}")
    
    # ... 其他邏輯 ...
```

---

## 進階主題

- [Pipeline 內建因子](../reference/pipeline/built-ins.md)
- [自訂 Pipeline 因子](../reference/pipeline/custom-factor.md)
- [交易日曆設定](../concepts/calendars.md)
- [Zipline 資料物件](../reference/zipline/data-object.md)

---

## 無法找到答案？

- 查看 [新手必讀](getting-started.md)
- 閱讀 [核心概念](../concepts/workflow.md)
- 查詢 [完整 API 參考](../reference/)
- 查閱 [10 分鐘快速體驗](quick-demo.md)