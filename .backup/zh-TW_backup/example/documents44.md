# Returns Analysis

## 報酬率處理方式：
Alphalens的函數中，若將`long_short`或`demeaned`參數設定為True則將每一檔股票的報酬率扣除全市場（所有樣本公司）的平均報酬，得到demeaned後的報酬率，消除整體市場波動的影響。

兩種報酬率處理方式可按照預期的投資策略或欲觀察的重點來選擇：
- 若預期採用的是多空對沖策略（long-short strategies）、本金中立多空對沖策略（long-short dollar neutral strategy）或市場風險對沖策略（beta hedging strategy）時，將`long_short`（`demeaned`）參數設定為True，選擇demeaned後報酬率，可以更好的觀察各個分組的**相對報酬**，類似超額報酬的概念。

- 若預期採用的是**long only strategy**時，則應將`long_short`（`demeaned`）參數設定為False，觀察**絕對報酬率**。

這邊預期採用**long-short strategies**，並將`long_short`（`demeaned`）設定為True（**Alphalens預設就是True**）且後續皆會採用demeaned的平均報酬率進行計算。

## Performance Metrics & Plotting Functions

### Mean Return by Factor Quantile（by date）

以下利用`mean_return_by_quantile`函數並將`by_date`參數設置為**True**，計算不同時間點下平均報酬率，後續可以用來觀察投資組合報酬率隨時間的變化及計算累計報酬率。

#### 平均報酬率：
- 若`demeaned`參數設定為True則將每一檔股票的報酬率扣除全市場（所有樣本公司）的平均報酬，得到demeaned後的平均報酬率，消除整體市場波動的影響。（這邊`demeaned`參數的功能與`create_returns_tear_sheet`函數的`long_short`參數功能一致）  

- 須注意持有期1日、5日及10日的報酬率計算頻率不同，無法直接比較。

> 以factor_quantile=1，持有期=1D，date=2013-01-03為例：
> 
> ##### 若demeaned=False：
> 利用2013-01-03當日所有quantile=1公司計算平均報酬率（簡單平均）。
> 
> ##### 若demeaned=True：  
> 1.先對2013-01-03當日quantile＝1所有公司的報酬率做demeaned：（當日原始的報酬率－當日factor_quantile＝1~5所有公司的平均報酬率）。 
> 2.再對上述demeaned後的報酬率做平均，得到quantile＝1當日demeaned後的平均報酬率。

#### 平均報酬率標準差：  

> 以factor_quantile=1，持有期=1D，date=2013-01-03為例：
> 
> ##### 若demeaned=False：
> σ（quantile=1所有公司在2013-01-03當日的平均報酬率)／${\sqrt {公司數目}}$  
> 
> ##### 若demeaned=True：
> σ（quantile=1所有公司在2013-01-03當日的demeaned後的平均報酬率)／${\sqrt {公司數目}}$

```python
mean_return_by_q_daily, std_err_by_q_daily = alphalens.performance.mean_return_by_quantile(factor_data, by_date=True)

mean_return_by_q_daily.head()

std_err_by_q_daily.head()
```

### Convert returns to one_period_len


因前面提及持有期1日、5日及10日的報酬率計算頻率不同，無法直接比較，故這邊利用 `alphalens.utils.rate_of_return` 將不同持有期的報酬率皆轉為日報酬。

#### 平均報酬率頻率轉換：
> 利用`rate_of_return`函數針對報酬率計算的基準期做轉換（類似複合成長率CAGR的概念）。  
> 
> ##### 轉換方式如下：  
> 
> $ ({轉換前報酬率+1})^{\left({\cfrac{基準期}{原始持有期}}\right)}-1 $  
> 
> 例如：quantile=1，持有期=10D，date=2013-01-03的報酬率為-0.046771，若基準期為1天，則轉換後報酬率為：$ ({-0.046771+1})^ {1/10}-1 $

```python
mean_return_by_q_daily_convertfreq=mean_return_by_q_daily.apply(alphalens.utils.rate_of_return,
                                                                axis=0,
                                                                base_period=mean_return_by_q_daily.columns[0])
mean_return_by_q_daily_convertfreq.head()
```

#### 標準差頻率轉換：  
> 在`mean_return_by_quantile`函數計算出來的標準差會因為持有期不同而產生頻率不同的情形，為了利於比較，以下利用`std_conversion`函數將標準差做轉換。 
> 
> ##### 轉換方式如下：  
> 
> $ {\cfrac{轉換前標準差} {{\sqrt{\cfrac{原始持有期}{基準期}}}}} $ 
> 
> 例如：quantile=1，持有期=10D，date=2013-01-03的標準差為0.008489，若基準期為1天，則轉換後報酬率為：$ {\cfrac{0.008489} {{\sqrt{\cfrac{10}{1}}}}} $ 

```python
std_err_by_q_daily_convertfreq=std_err_by_q_daily.apply(alphalens.utils.std_conversion,
                                                        axis=0,
                                                        base_period=std_err_by_q_daily.columns[0])
std_err_by_q_daily_convertfreq.head()
```

### Mean Return by Factor Quantile
用`mean_return_by_quantile`函數並將`by_date`參數設置為**False**，不考慮時間差異，計算整體的平均報酬率。可以從中了解買入各分組的股票，利用特定持有期持有至期末能獲得的平均報酬，對因子的預測力做初步了解。
<!-- 
（註：`plot_quantile_returns_bar`函數內部會`utils.rate_of_return`並將不同持有期的報酬率皆轉為日報酬，故可以直接比較） -->

#### 平均報酬率：  
   
> 以quantile=1，持有期=1D為例：
> 
> ##### 因demeaned=True：  
> 1.針對所有quantile=1的公司，計算每一日的demeaned後平均報酬率。  
> 2.將每一日的demeaned後平均報酬率再取平均。  

#### 平均報酬的標準差：  
  
> 以factor_quantile=1，持有期=1D為例：
>   
> ##### 因demeaned=True：
> σ（所有quantile=1的公司，每一日demeaned後平均報酬率）／${\sqrt {交易日數}}$  

```python
mean_return_by_q, std_err_by_q = alphalens.performance.mean_return_by_quantile(factor_data,
                                                                               by_date=False)
mean_return_by_q.head()
```

#### 平均報酬率轉換頻率：

```python
mean_return_by_q_convertfreq=mean_return_by_q.apply(alphalens.utils.rate_of_return,
                                                    axis=0,
                                                    base_period=mean_return_by_q.columns[0])
mean_return_by_q_convertfreq
```

### Mean Period Wise Return by Factor Quantile

最後將`performance.mean_return_by_quantile`的計算結果利用`plot_quantile_returns_bar`函數將因子平均報酬率畫成柱狀圖。  
  
我們通常會希望報酬在不同分組中呈現單調遞增，即bottom quantile（第一組）報酬率最低，top quantile（第五組）報酬率最高。在這種情形下可以透過做多第五組的股票、放空第一組的股票，來建構多空策略。但在這個因子中，並沒有明顯的單調遞增現象。

另一個可以觀察的重點為不同的持有期間對應的平均報酬率，它告訴我們需要持有特定股票多久才可以最大化報酬。

```python
alphalens.plotting.plot_quantile_returns_bar(mean_return_by_q_convertfreq)
sns.despine()
```

### Period Wise Return by Factor Quantile（Violin plots）

小提琴圖結合機率密度函數圖（probability density function plot）及盒鬚圖（box plot）。該圖形可以展示變數的三個四分位數、極值及機率分佈。
可以用來了解因子中噪音的大小。

```python
alphalens.plotting.plot_quantile_returns_violin(mean_return_by_q_daily_convertfreq)
sns.despine()
```

### Top Minus Bottom Quantile Mean Returns

#### Mean return spread（by date）
在各因子分組平均報酬率（非時間序列）的結果中可以發現第五組的報酬率最高且第一組的報酬最低，因此可以透過多空對沖策略（等權重配置），做多第五組的股票並同時放空第一組的股票來最大化報酬。

這邊利用`compute_mean_returns_spread`函數將第5組（`upper_quant`參數）平均報酬率減去第1組（`lower_quant`參數）的平均報酬率，得到多空對沖投組平均報酬率（即mean return spread）及其標準差。  

##### 通常會選擇頭尾兩個分組做分別做為top quantile及bottom quantile，不過在Alphalens中也可以使用其他分組進行計算。 

> #### 多空對沖平均報酬
> 利用各因子分組平均報酬率（by date）計算。
> 
> 以持有期=10D，date=2013-01-03為例：（當天第五組平均報酬－當天第一組平均報酬）
> 
> #### 多空對沖平均報酬率的標準差
> 利用各因子分組平均報酬率（by date）的標準差計算。
> 
> 以持有期=10D，date=2013-01-03為例：$\sqrt {（當天第5組平均報酬率的標準差）^2 + （當天第1組平均報酬率的標準差）^2}$

```python
quant_return_spread, std_err_spread = alphalens.performance.compute_mean_returns_spread(mean_return_by_q_daily_convertfreq,
                                                                                        upper_quant=5,
                                                                                        lower_quant=1,
                                                                                        std_err=std_err_by_q_daily_convertfreq)
quant_return_spread.head()

std_err_spread.head()
```

利用`plot_mean_quantile_returns_spread_time_series`函數繪製多空對沖投組平均報酬率（mean return spread）的折線圖，觀察不同期間多空對沖均報酬率的變化。通常會希望得到穩定＞0的曲線，代表多空對沖策略能穩定優於所有樣本公司的平均報酬率。  
  
圖中的淺色線代表多空對沖投組的平均報酬率（mean return spread）、深色線代表過去22個交易日的多空對沖平均報酬率（1 month moving avg）、陰影處則代表報酬率的信賴區間。


#### 陰影處上下軌（其中，bandwidth預設1）  
上軌 = 當天多空對沖投組平均報酬率 + （當天多空對沖投組平均報酬率的標準差 * bandwidth）  
下軌 = 當天多空對沖投組平均報酬率 - （當天多空對沖投組平均報酬率的標準差 * bandwidth）

```python
alphalens.plotting.plot_mean_quantile_returns_spread_time_series(quant_return_spread,
                                                                 std_err_spread)
```

### Cumulative Return by Quantile

相較於前面提及的平均報酬率，這邊模擬透過等權重方式交易各因子分組中的所有股票，並計算實際報酬率。

這邊我們希望看到不同分組的報酬率走勢呈現發散且各分組的表現呈現單調遞增，即top quantile的報酬率優於bottom quantile。  

此外，在採用多空對沖策略的情形下，會做多top quantile，並同時放空bottom quantile的股票。因此我們希望看到top quantile逐漸上升且bottom quantile的報酬率逐漸下降。（此處top quantile為第5組，bottom quantile為第1組） 

#### 累計報酬率計算方式  
- 利用`cumulative_returns`函數將同一分組每天的報酬率+1後再做連乘，得到日累計報酬率。  
- `performance.cumulative_returns`函數利用`ep.cum_returns(returns, starting_value=1)`做計算。  

<!-- 參考http://quantopian.github.io/empyrical/_modules/empyrical/stats.html
df_cum = np.exp(np.log1p(returns).cumsum())  
log1p = log（x+1）  -->

公式如下： 

$$\quad \prod_{t=1}^p {(1+平均報酬率_t)} \quad $$

```python
cum_ret = mean_return_by_q_daily[['1D']].unstack('factor_quantile').apply(alphalens.performance.cumulative_returns)
cum_ret.head()cum_ret=mean_return_by_q_daily[['1D']].unstack('factor_quantile').apply(alphalens.performance.cumulative_returns)
```

以下利用`plot_cumulative_returns_by_quantile`函數將累計報酬率繪製成折線圖。受限於Alphalens計算累計報酬率的方式，僅呈現持有期為1日的累計報酬率折線圖。  

#### 限制：
因這邊使用的為日頻率資料，當持有期為10日時，若要計算20130102至20130103的累計報酬率，則Alphalens計算方式為（1+在20130102時點持有10日的報酬率） ×（1+在20130103時點持有10日的報酬率），但這個計算方式並不恰當。

```python
alphalens.plotting.plot_cumulative_returns_by_quantile(mean_return_by_q_daily['1D'], period='1D')
sns.despine()
```

### Factor weighted Long/Short Portfolio Cumulative Return
While looking at quantiles is important we must also look at the factor returns as a whole. The cumulative factor long/short returns plot lets us view the combined effects overtime of our entire factor.

這邊利用`factor_returns`函數模擬了另一種多空對沖策略：以因子值為權重，做多因子值為正的股票，做空因子值為負的股票 ，獲得多空對沖報酬。這個策略納入所有股票池中的股票進行交易，與前面提到的因子分組組別（quantile）無關。若因子皆為正，則會形成一個純做多的投資組合。  

通常實務上進行多空對沖策略時，只會交易top quantile及bottom quantile，但是依然可以利用因子加權的累計報酬率來觀察因子整體預測能力的一致性。若是越一致則以因子加權的方式建立投資組合會更有優勢。

#### 因子加權
根據`factor_returns`函數中demeaned參數設定的不同，因子加權投組的權數計算方式可分為以下兩種：

> #### demeaned=False（不針對因子値做demeaned處理）
> 股票i在時點t權數的計算方式為：將該股票當天的因子值除以當天所有股票因子値取絕對値後的總合。公式如下： 
> 
> $${權數_{i,t}=}\frac{因子值_{i,t}}{\sum_{i=1}^n  {\mid因子值_{i,t}}\mid}$$ 
> 
> #### demeaned=True（針對因子値做demeaned處理）
> 先計算股票i在時點t的demeaned後因子值，計算方式為：將該股票當天的因子值扣除當天所有股票因子值的平均。公式如下：    
> 
> $${demeaned後因子值_{i,t}=}{因子值_{i,t}}{-}\frac{{\sum_{i=1}^n{因子值_{i,t}}}}{n}$$ 
>   
> 接著再計算股票i在時點t權數，公式如下： 
> 
> $${權數_{i,t}=}\frac{demeaned後因子值_{i,t}}{\sum_{i=1}^n  {\mid demeaned後因子值_{i,t}}\mid}$$ 

```python
ls_factor_returns = alphalens.performance.factor_returns(factor_data)
ls_factor_returns.head()
```

最後將累計報酬率繪製成折線圖。受限於Alphalens計算累計報酬率的方式 ，僅呈現持有期為1日的累計報酬率折線圖。  

#### 限制：
因這邊使用的為日頻率資料，當持有期為10日時，若要計算20130102至20130103的累計報酬率，則Alphalens計算方式為（1+在20130102時點持有10日的報酬率） ×（1+在20130103時點持有10日的報酬率），但這個計算方式並不恰當。解決方法為：將原始資料直接調整為月頻率，並且將持有期設定為1，就可以得到月的累計報酬率。

```python
alphalens.plotting.plot_cumulative_returns(ls_factor_returns['1D'], 
                                           period='1D')
sns.despine()
```

### Alpha and beta
Ann. alpha和beta來自於簡單迴歸中的兩個迴歸係數。其中，Ann. alpha需將原始的迴歸係數做年化處理，計算方式為：  

$${(1+alpha)^\frac{252}{持有期 }}{ }{-1}$$ 

迴歸的自變數X是全市場的平均報酬率（計算方式是將股票池中所有股票的報酬率取平均），應變數Y是因子加權多空對沖投組的平均報酬率。  
（若demeaned參數設定為True則Y利用demeaned後報酬率計算）  

其中，alpha衡量因子加權多空對沖投組所能獲得的超額報酬；beta則衡量該投組暴露於市場風險的程度。

```python
alpha_beta = alphalens.performance.factor_alpha_beta(factor_data)
alpha_beta
```

### Returns table
包含alpha和beta、不同持有期下的top quantile及bottom quantile的平均報酬及多空對沖報酬率的平均值。

```python
alphalens.plotting.plot_returns_table(alpha_beta,
                                      mean_return_by_q_convertfreq,
                                      quant_return_spread)
```

## Returns Tear Sheet

Returns Analysis 所有圖表。

```python
alphalens.tears.create_returns_tear_sheet(factor_data)
```