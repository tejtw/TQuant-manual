# 10 分鐘體驗：您的第一個 Zipline 回測策略

!!! info
    本頁提供 Zipline 回測策略的 10 分鐘快速體驗指南，包括環境設定、資料載入、策略函式說明、執行回測與分析結果，幫助您快速上手 TQuant Lab。

本指南將帶您透過一個簡單的「買進持有」策略，快速體驗 TQuant Lab 的核心回測功能。您將了解如何設定環境、載入資料、定義交易策略，並執行回測與分析結果。

---

## 1. 環境設定與資料載入

在使用 Zipline 進行回測前，需要設定 TEJ API 相關環境變數，並載入股價資料。

1.  **設定環境變數** ：
    在 Jupyter Notebook 中執行以下程式碼，將 `YOUR_API_KEY` 替換為您的 TEJ API Key。`mdate` 設定資料區間，`ticker` 設定股票代碼。

    ```python
    import os
    os.environ['TEJAPI_BASE'] = "https://api.tej.com.tw"
    os.environ['TEJAPI_KEY'] = "YOUR_API_KEY" # 請替換為您的 API Key
    os.environ['mdate'] = "20170601 20230702" # 資料起始日與結束日
    os.environ['ticker'] = '2330 IR0001' # 股票代碼 (2330 為台積電)
    ```

2.  **載入股價資料** ：
    使用 `!zipline ingest` 指令將設定好的資料載入到 Zipline 的 bundle 中。

    ```bash
    !zipline ingest -b tquant
    ```

---

## 2. 策略核心：Zipline 回測函數

Zipline 策略主要由四個核心函式構成：`initialize`、`handle_data`、`analyze` 和 `run_algorithm`。

### 2.1. initialize(context)

*   **功能** ：在回測開始前執行一次，用於設定初始環境，例如設定滑價、手續費，或初始化策略所需的變數。
*   **範例** ：設定滑價、手續費，並初始化 `context.day` 和 `context.has_ordered` 變數。

    ```python
    from zipline.api import set_slippage, set_commission
    from zipline.finance import slippage, commission

    def initialize(context):
        context.day = 0
        context.has_ordered = False # 追蹤是否已下單
        set_slippage(slippage.FixedSlippage()) # 設定固定滑價
        set_commission(commission.PerShare(cost=0.00285)) # 設定每股手續費
    ```

### 2.2. handle_data(context, data)

*   **功能** ：在每個交易日結束時執行一次，用於定義交易邏輯、下單操作及記錄交易資訊。
*   **參數** ：
    *   `context`: 包含策略狀態的物件，可在不同函式間共享資訊。
    *   `data`: 包含當前交易日所有資產的歷史與當前市場資料。
*   **範例** ：在第一個交易日買入台積電 (2330) 股票，並記錄相關資訊。

    ```python
    from zipline.api import order, record, symbol

    def handle_data(context, data):
        context.day += 1
        if not context.has_ordered:
            # 在第一個交易日買入 1000 股台積電
            order(symbol("2330"), 1000)
            context.has_ordered = True

        # 記錄交易日、是否已下單及台積電收盤價
        record(
            trade_days = context.day,
            has_ordered = context.has_ordered,
            TSMC = data.current(symbol("2330"), "close")
        )
    ```

### 2.3. analyze(context, perf)

*   **功能** ：在回測結束後執行一次，用於分析策略績效並進行視覺化。
*   **參數** ：
    *   `context`: 同 `initialize` 和 `handle_data` 中的 `context`。
    *   `perf`: 包含回測結果的 DataFrame，可提取績效指標。
*   **範例** ：繪製投資組合價值與台積電股價走勢圖。

    ```python
    import matplotlib.pyplot as plt

    def analyze(context, perf):
        fig, (ax1, ax2) = plt.subplots(2, 1, sharex=True, figsize=(18, 8))
        perf.portfolio_value.plot(ax=ax1, title='投資組合價值')
        perf['TSMC'].plot(ax=ax2, title='台積電收盤價')
        plt.tight_layout()
        plt.show()
    ```

### 2.4. run_algorithm

*   **功能** ： **啟動** Zipline 回測引擎，整合上述函式並執行策略。
*   **參數** ：
    *   `start`, `end`: 回測的起始與結束日期。
    *   `initialize`, `handle_data`, `analyze`: 傳入上述定義的函式。
    *   `capital_base`: 初始投資金額。
    *   `bundle`: 使用的資料 bundle 名稱。
*   **範例** ：執行從 2018 年底到 2023 年中的回測。

    ```python
    from zipline import run_algorithm
    import pandas as pd

    start_date = pd.Timestamp('2018-12-30', tz='utc')
    end_date = pd.Timestamp('2023-05-26', tz='utc')

    results = run_algorithm(
        start=start_date,
        end=end_date,
        initialize=initialize,
        capital_base=1e6, # 初始資金 1,000,000
        handle_data=handle_data,
        analyze=analyze,
        data_frequency='daily',
        bundle='tquant'
    )
    ```

---

## 3. 執行回測與結果分析

將上述所有程式碼片段依序在 Jupyter Notebook 中執行，`run_algorithm` 函式將會啟動回測，並在結束後自動呼叫 `analyze` 函式顯示績效圖表。

1.  `results` 變數會儲存回測期間的詳細績效數據，您可以進一步檢視：

    ```python
    results.head()
    ```

2.  透過這個簡單的範例，您已成功執行了第一個 TQuant Lab Zipline 回測策略！您可以嘗試修改 `handle_data` 中的邏輯，探索更多元的交易策略。