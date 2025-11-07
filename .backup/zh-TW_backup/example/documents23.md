# Information Analysis

- Information Coefficient（IC）是另一種觀察因子預測性的方法，透過計算**因子值**與**持有期報酬**的**斯皮爾曼等級相關係數（Spearman rank correlation coefficient）**而得。
- 簡而言之，IC提供了一種評估方式，來確定較高的因子值是否意味著更高的報酬率，即是否存在單調遞增的關係。因此，理想情況下，**我們希望IC值越高越好**。在主動投資策略中，IC也常被用來評估基金經理人的預測能力。
- 由於IC是等級相關係數，其值的範圍是介於+1到-1之間。當IC=1時，意味著該因子完全沒有雜訊，並可以做出完美的預測；IC=0時，表示該因子無預測能力，全為雜訊；若IC值為負時，則代表預測方向與真實方向完全相反，這時我們可以透過調整預測方向來應對。
- 那麼，IC值到底要多高才算是好呢？不同的研究或投資人對此有各自的見解。例如，Grinold and Kahn（2000）指出：一個良好的因子其IC值應達到**0.05**；一個出色的因子，其IC值應達到0.10；而一個頂尖的因子，其IC值應達到0.15。然而，如果IC值高達0.20，可能代表存在回測偏差或是非法的內線交易行為。
- 然而，這種評判標準會因人或所投資的市場而異，可根據個人需求設定更嚴格或更寬鬆的標準。此外，當存在多個候選因子時，也可以利用IC對它們進行比較，選擇IC值較高的因子。

## Information Analysis vs. Returns Analysis
- 在報酬率分析中，我們會按照股票的因子值大小進行分組，然後分析每個分組的報酬率。透過觀察**各分組的報酬率（quantiles return，QR）**，我們可以了解一個因子在股票池中的**預測能力分佈**，例如，某個因子是否只在top quantile的股票中顯示出預測能力，或者它是否對整個股票池都具有預測力。
- 資訊係數則是描述因子與其持有期報酬率間線性關係的相關係數。雖然較高的IC值代表該因子具有較佳的預測能力，但由於計算IC時沒有進行樣本分組，我們無法明確知道這預測能力是來自股票池的哪部分。也就是說，一個因子可能只在股票池的某一子集中具有預測效果。
- 為了更全面評估一個因子，最好是結合使用兩種分析工具。**IC提供了較為一般化的視角，而QR則提供了更深入的觀點，能夠明確顯示因子在哪些分組中的預測能力最強，以及在哪些分組中效果不那麼明顯**。若僅依賴IC，可能會**遺漏因子在不同股票之間的表現差異**。反之，若只考慮QR而不考量IC，則可能會忽略掉**因子整體的預測強度**。

## Performance Metrics & Plotting Functions

### IC Time Series
利用`factor_information_coefficient`函數計算各持有期下每一日的IC值，觀察因子預測力隨時間變動的情況。

#### 計算方式：
$${在時點t的IC值（IC_{t, n}）=}{Corr(因子值_{i,t}}{ ,}{持有期報酬率_{i,t,n})}$$
- 其中，i為公司、n為持有期、Corr為斯皮爾曼相關係數。
- 若date=2013-01-03，持有期=10D：
  Corr(date=2013-01-03當天所有股票的**因子值**, date=2013-01-03當天所有股票持有10D的**報酬率**)

```python
ic = alphalens.performance.factor_information_coefficient(factor_data)
ic.head()
```

利用`plotting.plot_ic_ts`函數把不同時點的IC值繪製成折線圖，可以了解因子預測能力隨著時間的變化情況。  
- 通常會希望看到IC在時間序列上大部分的時間點皆**穩定為正（甚至＞0.05）**，且**擁有較大的IC均值**以及**較小的IC標準差**。  
- 其中，圖中藍色線為每日的IC值；綠色線為近一個月（過去22天）的IC均值；左上角顯示IC均值及IC標準差（利用每日的IC值計算平均數及標準差）。
- 近一個月的IC均值計算方式為`ic.rolling(window=22,min_periods=None).mean()`，因此當過去22天的資料中有一筆是NA時，近一個月的IC均值就是NA。

```python
alphalens.plotting.plot_ic_ts(ic)
```

### IC Histograms

- 利用`plotting.plot_ic_hist`函數將不同持有期的IC序列資料繪製成直方圖觀察IC值的分佈情況（Alphalens利用`seaborn.histplot()`函數繪製）。
- 通常會希望有**較高的IC均值**以及**較為集中的分佈（標準差低）**。  
- 圖中白色虛線為IC均值；藍色實線為利用kernel density estimate方法估計的機率密度函數。因直方圖受限於長條寬度（bin），而不夠準確。Alphalens將`seaborn.histplot()`的`kde`參數設為True，利用kernel density estimate的方式估計機率密度，得到平滑且連續的結果。

```python
alphalens.plotting.plot_ic_hist(ic)
```

### IC Q-Q Plot

QQ圖（使用`plot_ic_qq`函數）可以觀察**IC值的機率分配是否近似於常態分配**。以下圖來觀察，若藍色點的分佈大致貼合紅色線（y=x），代表IC的分佈接近常態分配。

```python
alphalens.plotting.plot_ic_qq(ic)
```

### Monthly IC Heatmap
將IC值按月取平均。

```python
mean_monthly_ic = alphalens.performance.mean_information_coefficient(factor_data, 
                                                                     by_time='M')
mean_monthly_ic.head()
```
利用熱區圖觀察因子是否有月份效應。

```python
alphalens.plotting.plot_monthly_ic_heatmap(mean_monthly_ic)
```

### Information Coefficient by Year
將IC值按年取平均。

```python
mean_yearly_ic = alphalens.performance.mean_information_coefficient(factor_data,
                                                                    by_time='1Y')
mean_yearly_ic.head()
```
```python
fig = plt.figure(dpi=200)
mean_yearly_ic.index = mean_yearly_ic.index.year
mean_yearly_ic.plot.bar(figsize=(8, 4),rot=0,ax=plt.gca())
plt.tight_layout()
```

### Information Table
- `IC Mean`（IC均值）：把各持有期下的IC值取平均。  


- `IC Std.`（IC標準差）：利用各持有期下的IC值計算樣本標準差。  


- `Risk-Adjusted IC`（風險調整後的IC值）：
  - = `IC Mean` / `IC Std.`。
  - 風險調整後的IC能兼顧因子**選股能力與穩定性**，相較於IC均值，是更好的衡量指標。投資組合的資訊比率（information ratio，IR）大致上等於風險調整後的IC。且因IR的值越大越好，所以風險調整後的IC也是越大越好。（Qian and Hua, 2004）  
  - 關於IR的高低標準，不同的研究或投資人對此有各自的看法。例如，Grinold and Kahn（2000）認為好的投資組合IR應達到**0.5**；一個出色的投資組合IR則應達到1.0。而全球知名的資產管理公司富達國際（Fidelity International）認為，IR>=0.4是相對較佳的。


- `IC Skew`：
  - 利用`scipy.stats.skew()`函數計算IC值的偏態係數（SciPy是一個開源的Python演算法庫和數學工具包）。
  - `scipy.stats.skew()`的`bias`參數設定為為True，代表未將利用小樣本資料計算偏態係數造成的偏誤進行修正。
  - 常態分配的偏態係數為0（by Fisher’s definition）。[scipy.stats.skew](https://docs.scipy.org/doc/scipy-1.8.0/reference/generated/scipy.stats.skew.html)  


- `IC Kurtosis`：
  - 利用`scipy.stats.kurtosis()`函數計算IC值的峰態係數。
  - `scipy.stats.skew()`的`bias`參數設定為為True，代表未將利用小樣本資料計算峰態係數造成的偏誤進行修正。
  - 常態分配的峰態係數為0（by Fisher’s definition）。[scipy.stats.kurtosis](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.kurtosis.html)  


- `t-stat(IC)`與`p-value(IC)`：利用`scipy.stats.ttest_lsamp()`，將IC資料進行T檢定，檢驗其是否顯著異於0。
  $${檢定統計量=}\frac{IC Mean－0}{\sqrt{\frac {IC Std.}{樣本數}}}$$ 

```python
alphalens.plotting.plot_information_table(ic)
```
```python
print(stats.skew(ic))  #Alphalens計算的版本
print(stats.skew(ic, bias=False)) #EXCEL計算的版本

print(stats.kurtosis(ic))  #Alphalens計算的版本
print(stats.kurtosis(ic, bias=False)) #EXCEL計算的版本
```
## Information Tear Sheet

Information analysis 所有圖表

```python
alphalens.tears.create_information_tear_sheet(factor_data)
```