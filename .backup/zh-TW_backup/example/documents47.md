# API 取得資料
* TEJTOOLAPI 主要整併股價與不同屬性的資料庫，透過輸入股票代碼 (TICKERS) 和欄位 (FIELD) 後，可將欲抓取的資料整併為以日頻率的 DataFrame。

* 主要整併方法是以交易日期表為索引整併股價與不同屬性的資料，以下示範 TEJTOOLAPI 利用`get_history_data`獲取歷史資料，並整併股價與不同屬性資料表的所有欄位。
* 財務數據是根據發布日（announcement date）來mapping，非發布日的財務數據會使用當下可獲得最新的資料為準進行填值。
    * ex: 2330 在 2010-02-01 時所能獲得最新的財務資料為 2009Q3 的財務資料，則 2010-01-01 會以 2009Q3 的資料進行填補。惟公司2009Q4自結財報早於 2010-02-01 發布時，且 include_self_acc = 'Y'，這時 2010-02-01 的財務數據使用自結財務數據。

* TEJTOOLAPI 可抓取的資料欄位可參考 : <https://tquant.tejwin.com/資料集/>



## Paramters:
* ticker: iterable[str] 欲查詢的資料的證券代碼。

* columns: iterable[str]

  欲查詢資料的欄位名稱，欄位名稱請見 https://api.tej.com.tw/。
* transfer_to_chinese: boolean 是否將欄位轉換為英文。

* start: pd.Timestamp or str 資料起始時間。

* end: pd.Timestamp or str 資料結束時間。

* fin_type = iterable[str] 決定資料型態。 A: 累績資料 F: 單季資料 TTM: 移動四季資料

* include_self_acc: str 投資用財務包含自結和董事會決議數(include_self_acc = 'Y') 僅投資用財務(include_self_acc = 'N')

## Returns:
pd.DataFrame

## 1. 環境設定
```python
import os
os.environ['TEJAPI_KEY'] = "your key" 
os.environ['TEJAPI_BASE'] = "https://api.tej.com.tw"

os.environ['ticker'] = '2330 2454 2317 2882 2881'
os.environ['mdate'] = '20000103 20230530'

import TejToolAPI 
from zipline.data import bundles
```
## 2. 取得 tickers
## 2.1 取得 bundle 的 tickers
```python
bundle_data = bundles.load('tquant')
universe = bundle_data.asset_finder.retrieve_all(bundle_data.asset_finder.equities_sids)  #.remove(symbol('IR0001'))   
tickers = [col.symbol for col in universe]
```

### 2.2 自行 key 入 tickers
```python 
tickers = ['2330','2454','2317','2882','2881']
```
## 3. tejtoolapi 取得單獨資料庫
## 3.1、月營收的欄位
```python
ticker = tickers
columns = ['Sales_Accu_LastYear', 'Sales_Accu_3M',
       'Sales_Per_Share_Accu_12M', 'YoY_Accu_Sales', 'YoY_Monthly_Sales',
       'Sales_Per_Share_Accu_3M', 'Sales_Accu_3M_LastYear', 'Sales_Monthly',
       'YoY_AccuSales_12M', 'YoY_Accu_Sales_3M', 'MoM_Monthly_Sales',
       'Sales_Accumulated', 'QoQ_Accu_Sales_3M', 'MoM_Accu_Sales_3M',
       'Sales_Monthly_LastYear', 'Outstanding_Shares_1000_Shares']

data = TejToolAPI.get_history_data(ticker=ticker, 
                                   columns=columns,
                                   transfer_to_chinese=False,                                   
                                  )
data   
```

## 3.2、量化籌碼_周 - 集保庫存欄位
```python 
ticker = tickers
columns = ['Total_Custodied_Shares_1000_Lots',
       'Custodied_Under_400_Lots_Total_Lots',
       'Custodied_Lots_Between_800_1000_Total_Lots',
       'Custodied_Larger_Than_400_Lots_Pct',
       'Custodied_Lots_Between_400_600_Total_Lots',
       'Custodied_Lots_Between_600_800_Pct', 'Pledged_Stock_Shares_1000_Lots',
       'Custodied_Under_400_Lots_Pct',
       'Custodied_Lots_Between_400_600_Total_Holders',
       'Custodied_Lots_Between_800_1000_Total_Holders',
       'Custodied_Under_400_Lots_Total_Holders',
       'Custodied_Lots_Between_400_600_Pct',
       'Custodied_Lots_Between_800_1000_Pct',
       'Custodied_Greater_Than_1000_Lots_Pct']

data1 = TejToolAPI.get_history_data(ticker=ticker, 
                                   columns=columns,
                                   transfer_to_chinese=False,                                    
                                  )                                 
    
data1 
```

## 3.3、抓取財務資料參數設定
`ticker`

* 單一股票 :['2330']
* 多股 :['2330','2317']

`columns`

* 欄位: columns=['r408','r409','r410','r502']
`transfer_chinese_columns`

* 預設 transfer_chinese_columns = False
* 測試欄位轉換成中文(transfer_chinese_columns = True)

`fin_type = [A, Q, TTM]`

* A: 表示累積
* Q: 表示單季
* TTM: 表示移動4季

`include_self_acc`

* 投資用財務包含自結和董事會決議數(include_self_acc = 'Y')
* 僅投資用財務(include_self_acc = 'N')

## 4、以下範例示範運用 TejToolAPI 一鍵抓取不同資料庫的欄位與整併。

* 股價資料庫(日頻)
    * 開盤價、收盤價
* 籌碼資料庫(日頻)
    * 外資買賣超張數、合計買賣超張數
* 交易註記資料庫(日頻)
    * 是否為注意股票、是否暫停交易、是否為臺灣50成分股、是否為處置股票、分盤間隔時間
* 集保資料庫(周頻)
    * 800-1000張集保占比、800-1000張集保張數
* 財報資料庫(季頻)
    * 營業毛利成長率_Q、營業利益成長率_Q、稅後淨利率_Q
```python
# 輸入欄位
icolumns = ['Open','Close','Qfii_Diff_Vol','Total_Diff_Vol','Custodied_Lots_Between_800_1000_Total_Lots','Custodied_Lots_Between_800_1000_Pct',
           'Attention_Stock_Fg','Disposition_Stock_Fg','Matching_Period','Suspended_Trading_Stock_Fg','Component_Stock_of_TWN50_Fg','Gross_Margin_Growth_Rate','Net_Income_Rate_percent','Operating_Income_Growth_Rate']
# TEJTOOLAPI整併
data = TejToolAPI.get_history_data(ticker=tickers[:5], 
                                   columns=icolumns,
                                   transfer_to_chinese=True, 
                                   fin_type = ['Q'],
                                   start = '2015-01-01', end = '2022-12-31')
data#.sort_values(by=['日期','股票代碼']).tail(10)
```
