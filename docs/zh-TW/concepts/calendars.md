# 核心概念：交易日曆 (Trading Calendars)

!!! info
    本頁說明交易日曆在量化回測中的重要性，以及如何在 TQuant Lab 中使用和應用交易日曆。

## 為什麼需要交易日曆？

金融市場並非全年無休。各國市場都有自己的交易時間、假日、以及因特殊事件（如颱風）的休市日。在進行量化回測時，如果忽略了這些非交易日，可能會導致以下嚴重問題：

1.  **不切實際的交易**：策略可能會在市場休市時產生交易訊號並試圖下單，這在現實世界中是不可能的。
2.  **錯誤的績效計算**：若將非交易日納入報酬率計算，會稀釋波動率，高估夏普比率等風險指標。
3.  **前視偏差 (Lookahead Bias)**：若在假日拿到下一個開盤日的資訊，會產生不公平的預知優勢。

因此，一個準確的交易日曆是任何嚴謹回測框架的基礎。它定義了回測過程中每一天是否為「交易日」（session），以及該日的開盤與收盤時間。

---

## Zipline 中的日曆機制

Zipline 透過一個強大的日曆系統來模擬真實世界的交易時間。每個回測都必須綁定一個特定的交易日曆。這個日曆物件會告訴回測引擎：

- 哪些日期是交易日。
- 每個交易日的確切開盤時間與收盤時間。
- 是否有提早收盤的狀況。

---

## 在 TQuant Lab 中取得日曆

TQuant Lab 內建了台灣市場的交易日曆，您可以透過 `get_calendar` 函數輕易取得。台灣證券交易所的官方日曆名稱為 `XTAI`，而 TQuant Lab 為了方便使用者，將其註冊為 `TEJ`。

因此，在 TQuant Lab 環境中，`TEJ` 是您最常會用到的交易日曆。

```python
from zipline.utils.calendar_utils import get_calendar

# 取得台灣市場的交易日曆
taiwan_calendar = get_calendar('TEJ')

# 您也可以使用官方名稱 XTAI，兩者是相同的
# taiwan_calendar_xtai = get_calendar('XTAI')
```

---

## 如何應用於回測

在設定並執行 `run_algorithm` 函數時，您可以透過 `trading_calendar` 參數將您想使用的日曆傳入。這樣一來，整個回測過程就會嚴格遵守該日曆定義的交易時間。

```python
from zipline import run_algorithm
from zipline.utils.calendar_utils import get_calendar
import pandas as pd

# ... (此處省略 initialize, handle_data 等函數的定義)

# 執行回測時，傳入 TEJ 日曆
results = run_algorithm(
    start=pd.Timestamp('2020-01-01', tz='utc'),
    end=pd.Timestamp('2024-09-30', tz='utc'),
    initialize=initialize,
    capital_base=1000000,
    bundle='tquant_future',
    trading_calendar=get_calendar('TEJ') # <--- 在此指定交易日曆
)
```

---

## 總結

使用正確的交易日曆是確保回測準確性的基本要求。在 TQuant Lab 中，您應該隨時在 `run_algorithm` 函數中明確指定 `trading_calendar=get_calendar('TEJ')`，以確保您的策略行為與台灣市場的真實開休市狀況保持一致。
