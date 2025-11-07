# Groupwise Performance

若提供群集資料(比如: 產業類別)，可以透過加入 `by_group=True` 根據不同群集繪製出不同因子分析圖表。

## IC by sector

```python
ic_by_sector = alphalens.performance.mean_information_coefficient(factor_data, 
                                                                  by_group=True)
ic_by_sector.head()

alphalens.plotting.plot_ic_by_group(ic_by_sector)
```

## Mean return quantile by sector

```python
mean_return_quantile_sector, mean_return_quantile_sector_err = alphalens.performance.mean_return_by_quantile(factor_data, 
                                                                                                             by_group=True)
mean_return_quantile_sector.head()
```
平均報酬率轉換：

```python
mean_return_quantile_sector_convertfreq=mean_return_quantile_sector.apply(alphalens.utils.rate_of_return,
                                                                          axis=0,
                                                                          base_period=mean_return_quantile_sector.columns[0])
mean_return_quantile_sector_convertfreq.head()
```
```python
alphalens.plotting.plot_quantile_returns_bar(mean_return_quantile_sector_convertfreq, 
                                             by_group=True);
```

## Summary Tear Sheet

匯出重點圖表 (請下載此檔案自行執行)
```python
# alphalens.tears.create_summary_tear_sheet(factor_data)
```
## The Whole Thing

一次匯出所有圖表 (請下載此檔案自行執行)
```python
# alphalens.tears.create_full_tear_sheet(factor_data)
```