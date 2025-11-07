# AverageDollarVolume 函數介紹

`AverageDollarVolume()` 是 Zipline 提供的一種因子（Factor），用來計算某資產在過去一段期間的 **平均成交金額**，其定義為：

> 每日平均金額 = 價格 × 成交量  

這個指標常用來篩選流動性高的股票。

## 函數語法

- `inputs`：欲使用的價格與成交量欄位，預設為 `EquityPricing.close`。  
- `window_length`：觀察的天數（例如過去 10 天）。

```python
AverageDollarVolume(
    inputs=[TWEquityPricing.close, TWEquityPricing.volume],
    window_length=10
)



# Pipeline內建因子（Built-in Factors）

本文件彙整了 Zipline 中常用的 `pipeline.factors` 因子模組，涵蓋統計、技術指標、波動度、趨勢追蹤等多種功能，並針對每個因子提供簡要介紹、語法說明與範例程式碼。


## 技術分析類

- [AverageDollarVolume](#AverageDollarVolume)：成交金額平均因子
- [SimpleMovingAverage](#SimpleMovingAverage)：簡單移動平均 (SMA)
- [LinearWeightedMovingAverage](#LinearWeightedMovingAverage)：線性加權移動平均
- [ExponentialWeightedMovingAverage](#ExponentialWeightedMovingAverage)：指數加權移動平均
- [ExponentialWeightedMovingStdDev](#ExponentialWeightedMovingStdDev)：指數加權標準差
- [BollingerBands](#BollingerBands)：布林通道
- [RSI](#RSI)：相對強弱指標
- [VWAP](#VWAP)：加權平均價格
- [WeightedAverageValue](#WeightedAverageValue)：成交量加權任意數值
- [FastStochasticOscillator](#FastStochasticOscillator)：快速隨機指標 (K值)
- [IchimokuKinkoHyo](#IchimokuKinkoHyo)：一目均衡表
- [Aroon](#Aroon)：阿隆指標



## 報酬與變動率類

- [DailyReturns](#DailyReturns)：日報酬率
- [Returns](#Returns)：多期報酬率
- [PercentChange](#PercentChange)：變數百分比變動
- [RateOfChangePercentage](#RateOfChangePercentage)：百分比變化率 (%ROC)



## 波動度與風險評估

- [MaxDrawdown](#MaxDrawdown)：最大回撤
- [TrueRange](#TrueRange)：真實波動幅度



## 相關性與回歸分析

- [RollingPearson](#RollingPearson)：滾動皮爾森相關
- [RollingSpearmanOfReturns](#RollingSpearmanOfReturns)：滾動斯皮爾曼報酬相關
- [RollingLinearRegressionOfReturns](#RollingLinearRegressionOfReturns)：滾動線性回歸（Beta, Alpha 等）
- [SimpleBeta](#SimpleBeta)：簡化版 Beta 回歸分析



## 分類與統計

- [PeerCount](#PeerCount)：同類群組數量統計



