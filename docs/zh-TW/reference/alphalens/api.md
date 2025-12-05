# Alphalens API 總覽

!!! info
    本頁提供 Alphalens 相關 API 的詳細說明，包括因子分析、資訊係數 (IC) 分析、周轉率分析及相關繪圖函數的用途和計算方式。

Alphalens 是一個用於因子研究與評估的 Python 庫，提供因子分析、績效評估和周轉率分析等工具。

---

## 核心概念

### 資訊係數分析 (Information Coefficient, IC)

資訊係數是一種量化因子預測性的方法，透過計算**因子值**與**持有期報酬**的**斯皮爾曼等級相關係數**（Spearman rank correlation coefficient）而得。

簡而言之，IC 提供了一種評估方式，來確定較高的因子值是否意味著更高的報酬率，即是否存在單調遞增的關係。理想情況下，我們希望 IC 值越高越好。在主動投資策略中，IC 也常被用來評估基金經理人的預測能力。

由於 IC 是等級相關係數，其值的範圍是介於 +1 到 -1 之間：

- **IC = 1**：該因子完全沒有雜訊，並可以做出完美的預測
- **IC = 0**：該因子無預測能力，全為雜訊
- **IC < 0**：預測方向與真實方向完全相反

根據 Grinold and Kahn（2000）的研究：

- **良好的因子**：IC ≥ 0.05
- **出色的因子**：IC ≥ 0.10
- **頂尖的因子**：IC ≥ 0.15
- **IC ≥ 0.20**：可能代表存在回測偏差或內線交易

### 資訊分析 vs. 收益分析

**資訊分析**透過計算因子值與持有期報酬率的相關係數來評估因子的整體預測能力。這是一個單一的全局指標，反映因子在整個股票池中的平均預測力。

**收益分析**則將股票按因子值大小分成不同分組（通常 5 分組），然後計算每個分組的平均報酬率。這種方法能夠清楚展示因子在不同股票子集中的預測力分佈。

**最佳實踐**：結合使用兩種分析工具。資訊係數提供了較為一般化的視角，而分組收益分析則提供了更深入的觀點，能夠明確顯示因子在哪些分組中的預測能力最強。

---

## 資訊係數 (IC) 分析函數

### factor_information_coefficient

利用 `factor_information_coefficient` 函數計算各持有期下每一日的 IC 值，觀察因子預測力隨時間變動的情況。

#### 計算方式

$$IC_{t,n} = Corr(\text{因子值}_{i,t}, \text{持有期報酬率}_{i,t,n})$$

其中，$i$ 為股票代號、$n$ 為持有期天數、$Corr$ 為斯皮爾曼秩相關係數。

#### 範例

```python
ic = alphalens.performance.factor_information_coefficient(factor_data)
ic.head()
```

---

### plot_ic_ts

利用 `plot_ic_ts` 函數把不同時點的 IC 值繪製成折線圖，可以了解因子預測能力隨著時間的變化情況。

通常會希望看到 IC 在時間序列上大部分的時間點皆**穩定為正**（理想情況下 > 0.05），且**擁有較大的 IC 均值**以及**較小的 IC 標準差**。

圖表說明：

- **藍色線**：每日的 IC 值
- **綠色線**：近一個月（過去 22 天）的 IC 均值（滾動平均）
- **左上角資訊**：整期間的 IC 均值及 IC 標準差

#### 範例

```python
alphalens.plotting.plot_ic_ts(ic)
```

---

### plot_ic_hist

利用 `plot_ic_hist` 函數將不同持有期的 IC 序列資料繪製成直方圖，觀察 IC 值的分佈情況。

通常會希望有**較高的 IC 均值**以及**較為集中的分佈**（標準差低、峰度高），表示因子預測力穩定一致。

#### 範例

```python
alphalens.plotting.plot_ic_hist(ic)
```

---

### plot_ic_qq

QQ 圖（使用 `plot_ic_qq` 函數）可以觀察 IC 值的機率分配是否近似於常態分配。若藍色點的分佈大致貼合紅色線（y=x），代表 IC 的分佈接近常態分配。

若 IC 分布偏離常態，可能代表因子存在極端事件或其他非線性特徵。

#### 範例

```python
alphalens.plotting.plot_ic_qq(ic)
```

---

### plot_monthly_ic_heatmap

將 IC 值按月份取平均，並利用熱區圖觀察因子是否存在月份效應（即預測力在某些月份特別強或特別弱）。

#### 範例

```python
mean_monthly_ic = alphalens.performance.mean_information_coefficient(
    factor_data, 
    by_time='M'
)
alphalens.plotting.plot_monthly_ic_heatmap(mean_monthly_ic)
```

---

### plot_information_table

顯示 IC 相關的統計指標表，包括以下各項：

- **IC Mean**（IC 均值）：各持有期下的 IC 值取平均
- **IC Std.Div**（IC 標準差）：IC 值的樣本標準差
- **Risk-Adjusted IC**：IC Mean / IC Std.Div，兼顧因子選股能力與穩定性
- **IC Skew**：IC 值的偏態係數（衡量分布的非對稱性）
- **IC Kurtosis**：IC 值的峰態係數（衡量分布的厚尾程度）
- **t-stat(IC) & p-value(IC)**：T 檢定統計量及 p 值，用於檢驗 IC 是否顯著異於 0

#### 範例

```python
alphalens.plotting.plot_information_table(ic)
```

---

### create_information_tear_sheet

生成包含所有 IC 分析圖表的完整報告。此函數會自動生成時間序列圖、直方圖、QQ 圖、月度熱力圖及統計表，提供因子預測力的全面評估。

#### 範例

```python
alphalens.tears.create_information_tear_sheet(factor_data)
```

---

## 周轉率分析

### 周轉率概念

因子周轉率間接衡量**因子的穩定性**及**潛在的交易成本**。周轉率低的因子能使投資組合無需頻繁調整持股，也間接代表因子有更好的持續性且享有較低的交易成本。

Carhart（1997）和 Champagne, Karoui and Patel（2018）都發現，周轉率越高的共同基金績效就越差。

周轉率也會隨**因子的資訊時域**不同而有所差異：

- **短資訊時域**（如短期反轉因子）：訊號迅速消失，導致較高周轉率
- **長資訊時域**（如基本面因子）：訊號衰減速度較慢，周轉率相對較低

---

### quantile_turnover

第 N 分組（quantile）在時點 t 的周轉率定義為：

$$\text{周轉率}_{N,t} = \frac{\text{本期在第 N 組但前 P 期不在此組的股票數}}{\text{本期在第 N 組的股票總數}}$$

此指標衡量因子排序變化的幅度，值越高表示因子排序變化越大，交易成本可能越高。

#### 範例

```python
quantile_turnover = {}
for holding_period in (1, 5, 10):
    quantile_turnover[holding_period] = pd.concat([
        alphalens.performance.quantile_turnover(
            factor_data['factor_quantile'],
            quantile=q,
            period=holding_period
        ) 
        for q in factor_data.factor_quantile.sort_values().unique().tolist()
    ], axis=1)
```

---

### plot_top_bottom_quantile_turnover

繪製 top quantile（最高分組）與 bottom quantile（最低分組）的周轉率折線圖。這兩個分組在因子投資中尤為重要，因為多因子策略通常會做多 top quantile 並同時放空 bottom quantile 來建構多空對沖投組。

#### 範例

```python
for holding_period in (1, 5, 10):
    alphalens.plotting.plot_top_bottom_quantile_turnover(
        quantile_turnover[holding_period],
        period=holding_period
    )
```

---

### factor_rank_autocorrelation

因子秩自相關係數衡量**當期因子值排序**與**前一期因子值排序**的相關程度。

$$\text{自相關係數}_t = Corr(\text{因子值秩}_{i,t}, \text{因子值秩}_{i,t-p})$$

**周轉率與自相關係數呈現負相關**。因此，因子秩自相關係數提供了另一種衡量因子周轉率（即穩定性）的方式。自相關係數高則代表因子在不同時期之間存在較大的相關性和穩定性，同時意味著周轉率較低。

#### 範例

```python
factor_rank_autocorr = pd.DataFrame()
for holding_period in (1, 5, 10):
    factor_rank_autocorr = pd.concat([
        factor_rank_autocorr,
        alphalens.performance.factor_rank_autocorrelation(
            factor_data,
            period=holding_period
        )
    ], axis=1)
```

---

### plot_factor_rank_auto_correlation

將不同持有期的因子秩自相關係數繪製成折線圖，觀察因子穩定性在時間序列上的變化。

#### 範例

```python
for holding_period in (1, 5, 10):
    alphalens.plotting.plot_factor_rank_auto_correlation(
        factor_rank_autocorr[holding_period],
        period=holding_period
    )
```

---

### plot_turnover_table

繪製周轉率與秩自相關係數的統計表格，提供因子穩定性的全面評估。

#### 範例

```python
alphalens.plotting.plot_turnover_table(
    factor_rank_autocorr,
    quantile_turnover
)
```

---

### create_turnover_tear_sheet

生成包含所有周轉率分析圖表的完整報告。此函數整合周轉率分析的各個方面，提供因子穩定性的完整評估。

#### 範例

```python
alphalens.tears.create_turnover_tear_sheet(factor_data)
```

---

## 收益分析函數

### mean_return_by_quantile

計算不同因子分組在不同時間點的平均報酬率，用於評估因子的預測力分佈。此函數對應於「收益分析」，能清楚展示不同分組的績效差異。

#### 範例

```python
mean_return_by_q, std_err_by_q = alphalens.performance.mean_return_by_quantile(
    factor_data, 
    by_date=True
)
```

---

## 完整工作流程範例

```python
import alphalens
import pandas as pd

# 1. 準備因子資料與價格資料
factor_data = alphalens.utils.get_clean_factor_and_forward_returns(
    factor,
    prices,
    quantiles=5,
    periods=(1, 5, 10),
    groupby=sector_map
)

# 2. IC 資訊係數分析
ic = alphalens.performance.factor_information_coefficient(factor_data)
alphalens.plotting.plot_ic_ts(ic)
alphalens.tears.create_information_tear_sheet(factor_data)

# 3. 周轉率與穩定性分析
alphalens.tears.create_turnover_tear_sheet(factor_data)

# 4. 完整績效報告
alphalens.tears.create_full_tear_sheet(factor_data)
```
