# 期貨專區

!!! info
    本專區涵蓋 TQuant Lab 期貨回測相關的所有內容，從資料準備到策略實作，幫助您快速上手期貨量化交易。

---

## 1. 專區導覽

<div class="grid cards" markdown>

-   :material-rocket-launch: **快速入門**

    ---

    建立您的第一個期貨策略，從零開始學習期貨回測的完整流程。

    [:octicons-arrow-right-24: 開始學習](first-futures-strategy.md)

-   :material-database: **資料準備**

    ---

    學習如何 Ingest 期貨價量資料到 TQuant Lab 本地資料庫。

    [:octicons-arrow-right-24: 資料指南](ingest-futures-pricing.md)

-   :material-cog: **手續費與滑價**

    ---

    了解期貨專用的手續費與滑價模型設定方式。

    [:octicons-arrow-right-24: 成本設定](futures-commission-slippage.md)

-   :material-swap-horizontal: **轉倉機制**

    ---

    深入理解期貨合約到期與轉倉的處理邏輯。

    [:octicons-arrow-right-24: 轉倉說明](futures-rollover.md)

</div>

---

## 2. 期貨 vs 現貨：主要差異

| 特性 | 現貨 (Equity) | 期貨 (Futures) |
|------|---------------|----------------|
| 資料包 (Bundle) | tquant | tquant_future |
| 資產物件 | symbol('2330') | continuous_future('TX', ...) |
| 合約到期 | 無 | 有，需處理轉倉 |
| 保證金 | 無 | 有，影響槓桿 |
| 手續費類型 | PerShare / PerDollar | PerContract |

---

## 3. 支援的期貨商品

TQuant Lab 目前支援以下台灣期貨商品：

| 代碼 | 名稱 | 說明 |
|------|------|------|
| TX | 台指期 | 台灣加權指數期貨 |
| MTX | 小台指 | 小型台指期貨 |
| CDF | 台積電期 | 台積電個股期貨 |
| DVF | 聯發科期 | 聯發科個股期貨 |

> **注意**：個股期貨代碼需加上 F 後綴，例如台積電個股期為 CDF。

---

## 4. 延伸閱讀

- [Zipline 引擎核心機制](../concepts/zipline-engine.md)
- [如何執行一個基本的回測](../how-to/backtest/run-algorithm.md)
- [如何設定手續費模型](../how-to/backtest/set-commission.md)
