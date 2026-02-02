# Zipline 資料物件介紹

!!! info
    本頁介紹 Zipline 中常見的內建資料物件，包括 `context`、`data`、`pipeline_output()`、`record()` 等，並說明其用途和使用方式，幫助使用者理解如何存取和管理回測中的數據。

在 Zipline 中，有多種內建資料物件可供演算法存取資料與追蹤變數。常見的資料物件包括 `context`、`data`、`pipeline_output()`、`record()`、`get_bundle_price()`、`portfolio`、`account` 及 `get_open_orders()` 等，以下將逐一介紹其用途與使用方式。

---

## 1. context 物件

`context` 是 Zipline 策略的核心，用來儲存策略執行過程中的狀態與變數，讓你在不同的函數（如 `initialize`、`before_trading_start`、`handle_data`）中都能存取與共享資料。例如你可以在 `initialize()` 中定義投資標的清單與參數，並於後續策略執行中持續使用：

```python
def initialize(context):
    context.stocklist = ['2330', '2317']
    context.max_leverage = 1.0
```

---

## 2. data 物件

`data` 提供每日市場資料，包含報價（`price`）、成交量（`volume`）、是否可交易（`can_trade`）等資訊。常見用法如下：

```python
def handle_data(context, data):
    price = data.current(symbol("2330"), 'price')
    volume = data.current(symbol("2330"), 'volume')
```

也可以透過：

```python
data.can_trade(symbol("2330"))
```

來確認某股票當日是否可以進行交易（如未停牌、流動性足夠等）。

---

## 3. pipeline_output()

若你有建立 Pipeline 用來進行條件篩選或因子計算，可以透過 `pipeline_output()` 來取得結果。它會回傳一個 DataFrame，包含通過條件的標的與對應的欄位數值。

```python
def before_trading_start(context, data):
    context.output = pipeline_output('my_pipeline')
```

這些結果可用來設定每日的投資清單，搭配目標權重進行再平衡。

---

## 4. record()

`record()` 可用來在回測過程中記錄重要變數，例如槓桿比率、現金水位、投資報酬等，之後可產製圖表進行視覺化分析。

```python
def handle_data(context, data):
    record(leverage=context.account.leverage, cash=context.portfolio.cash)
```

記錄的變數會在回測完成後，自動顯示於圖表中。

---

## 5. get_bundle_price()

`get_bundle_price()` 是 TEJ 專屬的 Zipline 擴充函數，用來讀取某段期間內的股票歷史資料，並以 DataFrame 的形式輸出，適合用於分析或作為外部輸入資料。

```python
from zipline.data.data_portal import get_bundle_price

df = get_bundle_price(
    bundle_name='tej_bundle',
    calendar_name='XTAI',
    start_dt='2020-01-01',
    end_dt='2020-12-31'
)
```

你可以使用這份資料做為回測基礎，也可以搭配 TA-Lib 或自製因子進行計算。

---

## 6. portfolio 物件

`context.portfolio` 提供當前投資組合的總覽資訊，包含總資產、現金餘額、每檔股票的持股狀況等，是監控部位與下單邏輯的重要依據。

常見屬性包括：

*   `portfolio.cash`：目前持有的現金
*   `portfolio.positions`：每檔持股資訊（包含股數、成本、最新市值）
*   `portfolio.positions[symbol("2330")].amount`：某檔股票的持股數量
*   `portfolio.positions[symbol("2330")].cost_basis`：該檔股票的平均成本

```python
def handle_data(context, data):
    cash = context.portfolio.cash
    amount = context.portfolio.positions[symbol("2330")].amount
```

---

## 7. account 物件

`context.account` 是 Zipline 提供的帳戶層級資訊，主要用來追蹤槓桿使用、淨值等策略總體財務狀況。

常見屬性包括：

*   `account.leverage`：當前槓桿比率
*   `account.net_leverage`：考慮空頭後的淨槓桿
*   `account.portfolio_value`：整體投資組合價值（含股票與現金）

```python
def handle_data(context, data):
    record(leverage=context.account.leverage)
```

---

## 8. get_open_orders()

`get_open_orders()` 是 Zipline 提供的查詢函數，可用來檢視目前有哪些掛單尚未成交（如限價單、停損單等）。

```python
open_orders = get_open_orders()
```

你也可以指定某一檔股票進行查詢：

```python
open_orders_tsmc = get_open_orders(symbol("2330"))
```

回傳內容為 dictionary 格式：

*   key 為資產（如 `symbol("2330")`）
*   value 為該資產的掛單列表

通常搭配 `cancel_order()` 使用，可在特定邏輯條件下自動取消未成交掛單。