# 期貨轉倉機制

!!! info
    本指南深入說明期貨合約到期與轉倉的處理邏輯，幫助您理解如何在 TQuant Lab 中正確處理期貨換月。

---

## 什麼是轉倉？

期貨合約有到期日，不像股票可以無限期持有。當合約即將到期時，如果您想繼續持有部位，就必須：

1. **平倉**：將即將到期的舊合約平倉
2. **開新倉**：在新的合約上建立相同的部位

這個過程稱為「轉倉」(Roll Over) 或「換月」。

---

## 連續合約 (Continuous Future)

TQuant Lab 使用 `continuous_future` 物件來簡化期貨的處理：

```python
from zipline.api import continuous_future

def initialize(context):
    # 建立台指期的連續近月合約
    context.future = continuous_future(
        'TX',           # 期貨根代碼
        offset=0,       # 0 = 近月合約
        roll='calendar', # 換月規則
        adjustment='add' # 價格調整方式
    )
```

### 參數說明

| 參數 | 說明 | 可選值 |
|------|------|--------|
| root_symbol | 期貨根代碼 | TX, MTX, CDF 等 |
| offset | 合約月份偏移 | 0 (近月), 1 (次月), 2 (季月)... |
| roll | 換月時機 | calendar (到期前), volume (成交量) |
| adjustment | 價格調整 | add (加法), mul (乘法), None |

---

## 轉倉邏輯實作

以下是一個完整的轉倉函數實作：

```python
from zipline.api import order_target, get_open_orders, cancel_order

def roll_futures(context, data):
    """
    每日收盤時檢查是否需要轉倉
    """
    for asset, pos in context.portfolio.positions.items():
        # 忽略非期貨資產或空部位
        if pos.amount == 0:
            continue
        
        # 檢查是否為期貨合約
        if not hasattr(asset, 'auto_close_date') or asset.auto_close_date is None:
            continue
        
        # 計算距離到期日天數
        days_to_auto_close = (asset.auto_close_date.date() - data.current_session.date()).days
        
        # 如果還有超過 5 天，不需要轉倉
        if days_to_auto_close > 5:
            continue

        # 取得新的目標合約
        new_contract = data.current(context.future, "contract")
        
        # 如果新舊合約相同，不需要轉倉
        if new_contract == asset:
            continue

        # === 執行轉倉 ===
        print(f"執行轉倉: {asset.symbol} → {new_contract.symbol}")
        
        # 1. 取消舊合約的所有掛單
        for order in get_open_orders(asset):
            cancel_order(order.id)

        # 2. 平掉舊倉位
        order_target(asset, 0)
        
        # 3. 建立新倉位 (保持相同口數)
        order_target(new_contract, pos.amount)
```

---

## 排程轉倉檢查

在 `initialize` 中設定排程，每日收盤時執行轉倉檢查：

```python
from zipline.api import schedule_function, date_rules, time_rules

def initialize(context):
    context.future = continuous_future('TX', offset=0, roll='calendar', adjustment='add')
    
    # 每日收盤時檢查是否需要轉倉
    schedule_function(
        roll_futures,
        date_rules.every_day(),
        time_rules.market_close()
    )
```

---

## 轉倉時機選擇

| 策略 | 說明 | 優點 | 缺點 |
|------|------|------|------|
| **提前 5 天** | 到期前 5 天轉倉 | 避免流動性問題 | 可能有價差損失 |
| **到期前 1 天** | 最後一刻轉倉 | 最大化持倉時間 | 流動性風險 |
| **依成交量** | 新合約成交量超過舊合約時轉倉 | 流動性最佳 | 實作較複雜 |

!!! tip "建議"
    對於大多數策略，建議在到期前 3~5 天執行轉倉，以確保足夠的流動性。

---

## 常見問題

### Q: 為什麼要取消舊合約的掛單？

A: 因為舊合約即將到期，任何未成交的掛單都會失效。如果不取消，可能造成策略邏輯混亂。

### Q: 轉倉會產生額外成本嗎？

A: 是的，轉倉等於執行一次平倉和一次開倉，會產生兩次手續費和滑價成本。

### Q: 如何處理多個期貨商品的轉倉？

A: 上述 `roll_futures` 函數會遍歷所有持倉，自動處理所有期貨商品的轉倉。

---

## 延伸閱讀

- [建立你的第一個期貨策略](first-futures-strategy.md)
- [期貨手續費與滑價設定](futures-commission-slippage.md)
- [Zipline 引擎核心機制](../concepts/zipline-engine.md)
