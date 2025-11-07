# Turnover Analysis


- 因子周轉率間接衡量**因子的穩定性**及**潛在的交易成本**（Aphalens並沒有考慮佣金、滑價等交易成本）。周轉率低的因子能使投資組合不需要頻繁調整持股，也間接代表因子有更好的持續性且享有較低的交易成本。
- 在過往文獻中，Carhart（1997）和Champagne, Karoui and Patel（2018）都發現，周轉率越高的共同基金績效就越差。因此，過高的周轉率會侵蝕投資策略的獲利，並且無論該筆交易最終結果是賺錢或賠錢，都需要支付因周轉率高而產生的成本，這是不可忽視的。
- 除此之外，周轉率也會隨**因子的資訊時域**不同而有所差異。
  - 資訊時域（**也稱為shelf life或information horizon**），資訊時域指的是利用特定因子資訊所能預測的時間範圍。有些因子的訊號可能在幾天內迅速消失，而有些則可能持續一年仍保有其預測能力（Grinold and Kahn, 2000）。
  - 如果一個因子具有相對短的資訊時域（例如短期反轉因子），代表它只能預測短期內的股價報酬，這樣的因子訊號會迅速衰減（signal decays），導致較高周轉率，因為我們需要不斷調整投資部位。如果一個因子具有相對長的資訊時域（例如基本面因子），因子訊號衰減速度就會較慢，周轉率也會相對較低（Qian, Sorensen and Hua, 2007）。
- Alphalens中提供了周轉率分析的兩種工具（**因子周轉率及因子自我相關係數**）供我們使用。在有多個候選因子的情形下，我們可以利用這些工具作為因子選擇標準之一。而當我們在實際回測中使用某個因子時，我們也可以利用這些工具來考慮要使用哪一種再平衡方案。


## 因子周轉率 Turnover
第N組（quantile）在時點t的周轉率 = 本期在第N組但前P期不在這一組的股票數量／本期在第N組的股票數量
- 若資料為日頻率且持有期為10日，則前P期就代表前10日。
- 根據上述公式，若資料為日頻率且持有期為10日，則前P期即代表前10日。若某一組的周轉率為5%，這意味著在10天前屬於這個分組的股票，有5%已經不再屬於這個分組。
- 周轉率本身沒有固定的標準來判定其理想範圍，有些經理人可能會設定特定的投資政策，例如：投資組合周轉率不得超過20%。此外，投資風格也會影響周轉率。當有多個同風格的因子時，可比較它們的周轉率，並在IC值相近時，優先選擇周轉率較低的因子。

        
## 因子自我相關係數 Autocorrelation
- 因子自我相關係數衡量**當期因子值排序**與**前一期因子值排序**的相關程度。
- **周轉率與自我相關係數呈現負相關**。因此，因子自我相關係數提供了另一種衡量因子周轉率的方式。如果自我相關性低，這意味著因子的當前排序與之前的排序關聯度不大，所以投資組合可能需要頻繁調整持股，導致高周轉率。而自我相關性高則代表因子在不同時期之間存在較大的相關性和穩定性（儘管這不會影響其預測價格變動的能力）。所以**自我相關係數可以與因子周轉率相互印證。**
- 計算因子自我相關的公式：  

  $${在時點t的自我相關係數 =}{Corr(因子值_{i,t}}{ ,}{因子值_{i,t-p})}$$  
  $$$$
  - 其中，i代表公司，p是持有期，Corr表示斯皮爾曼相關係數。
  - 若資料為日頻率且持有期為10日，則前P期就代表前10日。  
  
## Performance Metrics & Plotting Functions

### Quantile Turnover
`quantile_turnover`函數計算第N組周轉率的公式為：本期在第N組但前P期不在這一組的資產數量／本期在第N組的資產數量。

- P由period參數控制。若資料為日頻率且period＝10，則前P期就代表前10日；通常period會設定與持有期相同。  
- N由quantile參數來指定。若quantile＝1則計算第1組的周轉率。 
- 通常隨著**持有期的增長**，**周轉率也相應上升**，而周轉率的波動性亦增加。這是因為較長的時間間隔會帶來更多的新資訊，因此投資組合於**每一次再平衡**時需要進行更頻繁的調整。**這並不意味著持有期越短越好**，因為持有期=1D，就代表需要每天再平衡，一年以252天來算，就要換股252次。

以下計算持有期=1d的周轉率：

```python
quantile_turnover =\
{
        HOLDING_PERIODS: pd.concat([alphalens.performance.quantile_turnover(factor_data['factor_quantile'],
                                                           quantile=quantile,
                                                           period=HOLDING_PERIODS)
             for quantile in factor_data.factor_quantile.sort_values().unique().tolist()],axis=1,)
        for HOLDING_PERIODS in (1, 5, 10)
        }

quantile_turnover
```
將因子周轉率繪製成折線圖，觀察在時序列上的變化。
- 在此，我們只繪製**top quantile**與**bottom quantile**的周轉率。
- 這是因為在因子投資中，我們通常會做多top quantile並同時放空bottom quantile來建構多空對沖投組，或是僅做多top quantile來建立純做多投組。因此，這兩個分組尤為重要。

```python
for HOLDING_PERIODS in (1, 5, 10):
    alphalens.plotting.plot_top_bottom_quantile_turnover(quantile_turnover[HOLDING_PERIODS],
                                                         period=HOLDING_PERIODS)
    plt.tight_layout()
```
### Factor Rank Autocorrelation
利用`factor_rank_autocorrelation()`函數計算因子自我相關係數。

```python
factor_rank_autocorrelation=pd.DataFrame()
for HOLDING_PERIODS in (1, 5, 10):
    factor_rank_autocorrelation=pd.concat([factor_rank_autocorrelation,
                                           (alphalens.performance.factor_rank_autocorrelation(factor_data,
                                                                                              period=HOLDING_PERIODS))],
                                          axis=1
                                         )
factor_rank_autocorrelation.head(15)
```
將不同持有期的因子自我相關係數繪製成折線圖，觀察在時序列上的變化。同時折線圖左上角也呈現**平均自我相關係數**。

```python
for HOLDING_PERIODS in (1, 5, 10):
    alphalens.plotting.plot_factor_rank_auto_correlation(factor_rank_autocorrelation[HOLDING_PERIODS],
                                                         period=HOLDING_PERIODS)
    plt.tight_layout()
```
### Turnover table

```python
alphalens.plotting.plot_turnover_table(factor_rank_autocorrelation,
                                       quantile_turnover)
```

## Turnover Tear Sheet

所有 Turnover analysis 圖表
```python
alphalens.tears.create_turnover_tear_sheet(factor_data)
```