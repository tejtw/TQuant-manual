# 內建因子/濾網/分類器

!!! info
    本頁詳細列出 TQuant Lab Pipeline 中所有內建的因子 (Factors)、濾網 (Filters) 和分類器 (Classifiers)，並提供其用途、參數說明及使用範例，幫助使用者快速理解和應用這些核心組件。

Zipline Pipeline 提供了豐富的內建組件，讓您可以無需從頭開始編寫複雜的計算邏輯。這些組件經過優化，能夠高效地處理大量的歷史數據，生成各種交易訊號。

---

## 1. Factors (因子)

Factors 用於計算每個資產在每個時間點的數值。它們通常基於歷史價格、成交量或其他數據來生成技術指標或基本面指標。

### SimpleMovingAverage(inputs, window_length)

*   **用途**：計算指定輸入數據的簡單移動平均。
*   **參數**：
    *   `inputs` (list of `BoundColumn`)：要計算移動平均的數據來源，例如 `[TWEquityPricing.close]`。
    *   `window_length` (int)：移動平均的計算窗口長度。
*   **範例**：計算 20 日收盤價移動平均。

    ```python
    from zipline.pipeline.factors import SimpleMovingAverage
    from zipline.pipeline.data import TWEquityPricing

    mean_close_20 = SimpleMovingAverage(inputs=[TWEquityPricing.close], window_length=20)
    ```

### ExponentialWeightedMovingAverage(inputs, window_length, decay_rate)

*   **用途**：計算指定輸入數據的指數加權移動平均，對近期數據賦予更高的權重。
*   **參數**：
    *   `inputs` (list of `BoundColumn`)：要計算指數加權移動平均的數據來源。
    *   `window_length` (int)：指數加權移動平均的計算窗口長度。
    *   `decay_rate` (float, optional)：衰減率，用於控制權重下降的速度。如果未指定，則根據 `window_length` 計算。
*   **範例**：計算 20 日收盤價指數加權移動平均。

    ```python
    from zipline.pipeline.factors import ExponentialWeightedMovingAverage
    from zipline.pipeline.data import TWEquityPricing

    ewma_close_20 = ExponentialWeightedMovingAverage(inputs=[TWEquityPricing.close], window_length=20)
    ```

### Momentum(inputs, window_length)

*   **用途**：計算指定輸入數據的動量，衡量價格變化的速度和幅度。
*   **參數**：
    *   `inputs` (list of `BoundColumn`)：要計算動量的數據來源，通常是收盤價。
    *   `window_length` (int)：動量計算的窗口長度。
*   **範例**：計算 10 日收盤價動量。

    ```python
    from zipline.pipeline.factors import Momentum
    from zipline.pipeline.data import TWEquityPricing

    momentum_10 = Momentum(inputs=[TWEquityPricing.close], window_length=10)
    ```

### FastStochasticOscillator(inputs, window_length)

*   **用途**：計算快速隨機指標 (Fast Stochastic Oscillator)，即 K 值，用於判斷超買超賣。
*   **參數**：
    *   `inputs` (list of `BoundColumn`)：通常為 `[TWEquityPricing.close, TWEquityPricing.low, TWEquityPricing.high]`。
    *   `window_length` (int)：計算 K 值所需的視窗長度。
*   **範例**：計算 10 日 K 值。

    ```python
    from zipline.pipeline.factors import FastStochasticOscillator
    from zipline.pipeline.data import TWEquityPricing

    fast_k = FastStochasticOscillator(
        inputs=[TWEquityPricing.close, TWEquityPricing.low, TWEquityPricing.high],
        window_length=10
    )
    ```

### MarketCap(inputs, window_length)

*   **用途**：計算市值。通常不需要 `inputs` 和 `window_length`，因為市值是每日更新的。
*   **參數**：無特定參數，但可以鏈接 `.top()` 或 `.bottom()` 方法進行篩選。
*   **範例**：獲取市值。

    ```python
    from zipline.pipeline.factors import MarketCap

    market_cap = MarketCap()
    ```

---

## 2. Filters (濾網)

Filters 用於篩選出一組符合特定條件的資產。它們的輸出是布林值 (True/False)。

### StaticAssets(assets)

*   **用途**：篩選出一個靜態的資產列表。這些資產在整個回測期間保持不變。
*   **參數**：
    *   `assets` (list of `Asset`)：要包含在篩選結果中的資產列表。
*   **範例**：篩選出台積電和聯發科。

    ```python
    from zipline.api import symbol
    from zipline.pipeline.filters import StaticAssets

    my_assets = StaticAssets([symbol('2330'), symbol('2454')])
    ```

### TopN(factor, N) / BottomN(factor, N)

*   **用途**：根據指定因子的值，篩選出排名前 N 或後 N 的資產。
*   **參數**：
    *   `factor` (Factor)：用於排序的因子。
    *   `N` (int)：要篩選的資產數量。
*   **範例**：篩選出市值排名前 100 的股票。

    ```python
    from zipline.pipeline.factors import MarketCap

    top_100_by_market_cap = MarketCap().top(100)
    ```

### 邏輯運算符 (Logical Operators)

Filters 可以透過邏輯運算符 (`&` (AND), `|` (OR), `~` (NOT)) 進行組合，以構建更複雜的篩選條件。

*   **範例**：篩選出市值排名前 100 且 20 日均線大於 100 的股票。

    ```python
    from zipline.pipeline.factors import MarketCap, SimpleMovingAverage
    from zipline.pipeline.data import TWEquityPricing

    top_100 = MarketCap().top(100)
    mean_close_20_gt_100 = SimpleMovingAverage(inputs=[TWEquityPricing.close], window_length=20) > 100

    combined_filter = top_100 & mean_close_20_gt_100
    ```

---

## 3. Classifiers (分類器)

Classifiers 用於為資產進行分類，其輸出通常是字串或整數，代表資產所屬的類別。

### Sector()

*   **用途**：返回每個資產所屬的產業類別。
*   **參數**：無。
*   **範例**：獲取股票的產業類別。

    ```python
    from zipline.pipeline.classifiers import Sector

    sector_classifier = Sector()
    ```

### Quantiles(factor, N)

*   **用途**：將一個因子的輸出值按分位數進行分組。例如，將所有股票按市值分為 5 個分位數組。
*   **參數**：
    *   `factor` (Factor)：要進行分位數分組的因子。
    *   `N` (int)：要分組的數量。
*   **範例**：將市值分為 5 個分位數組。

    ```python
    from zipline.pipeline.factors import MarketCap
    from zipline.pipeline.classifiers import Quantiles

    market_cap_quantiles = Quantiles(inputs=[MarketCap()], N=5)
    ```

---

## 總結

TQuant Lab Pipeline 的內建組件提供了強大的基礎，讓您可以快速構建和測試各種量化策略。透過靈活組合 Factors、Filters 和 Classifiers，您可以從原始數據中提取有價值的投資訊號，並有效地管理您的股票池。