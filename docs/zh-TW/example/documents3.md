# TEJTOOLAPI 資料撈取整併
運用 TEJTOOLAPI 整併資料。TEJTOOLAPI 主要整併股價與不同屬性的資料庫，透過輸入股票代碼 (TICKERS) 和欄位 (FIELD) 後，可將欲抓取的資料整併為以日頻率的 DataFrame。

目前可抓取的資料庫為：

- 股價交易資訊(TWN/APIPRCD)
- 月營收(TWN/APISALE1)
- 會計師簽證財務資料(TWN/AINVFQ1)
- 三大法人、融資券、當沖(TWN/APISHRACT)
- 集保庫存(TWN/APISHRACTW)
- 股票日交易註記資訊(TWN/APISTKATTR)
- 交易日期表(TWN/TRADEDAY_TWSE)
- 董監全體持股狀況(TWN/APIBSTN1)
- 全面改選統計(TWN/APICHGSTAT)
- 董事長與高階主管變動事件(TWN/APIDIRCHG)
- 合併收購(TWN/APIMA)
- 股利政策(TWN/APIMT1)
- 資本形成(TWN/APISTK1)
- 私募應募人與公司的關係(TWN/APISTKPRV)
- 董監申報轉讓-轉讓(TWN/APITRANS1)
- 董監申報轉讓-未轉讓(TWN/APITRANS2)
- 庫藏股實施事件簿(TWN/APITRS)
- 主要整併方法是以交易日期表為索引整併股價與不同屬性的資料，以下示範 TEJTOOLAPI 整併股價與不同屬性資料表的所有欄位。

tejtoolapi 及以上資料庫相關欄位 : https://tquant.tejwin.com/資料集/

## 環境設定
```python
import os
os.environ['TEJAPI_KEY'] = "your key" 
os.environ['TEJAPI_BASE'] = "https://api.tej.com.tw"

os.environ['ticker'] = '2330 2454 2317 2882 2881'
os.environ['mdate'] = '20000103 20230530'

import TejToolAPI 
from zipline.data import bundles
```

## 取得tickers
```python
bundle_data = bundles.load('tquant')
universe = bundle_data.asset_finder.retrieve_all(bundle_data.asset_finder.equities_sids)#.remove(symbol('IR0001'))   
tickers = [col.symbol for col in universe]
```
自行key入tickers
```python
tickers = ['2330','2454','2317','2882','2881']
```
## tejtoolapi 取得單獨資料庫
**月營收的欄位**
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
**量化籌碼_周 - 集保庫存欄位**
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
**量化籌碼_日& 交易註記 欄位**
```python
ticker = tickers
columns =['Market', 'Dealer_Proprietary_Diff_Vol', 'Margin_Sale',
       'Cash_Redemption', 'Margin_Short_Balance_Amt',
       'Margin_Short_Balance_Vol', 'Dealer_Hedge_Buy_Vol',
       'Day_Trading_Volume_1000_Shares', 'SBL_Short_Returns_Vol',
       'Margin_Maintenance_Ratio', 'Account_Maintenance_Ratio',
       'Margin_Stock_Redemtion', 'Total_Sell_Amt',
       'Margin_Short_Maintenance_Ratio', 'SBL_Short_Balance_Vol',
       'Dealer_Hedge_Buy_Amt', 'Total_Buy_Amt', 'Total_Diff_Amt',
       'Fund_Diff_Vol', 'Dealer_Proprietary_Buy_Vol',
       'Dealer_Proprietary_Sell_Amt', 'Margin_Day_Trading_Amt',
       'Total_Diff_Vol', 'SBL_Short_Sales_Vol', 'SBL_Short_Balance_Amt',
       'Dealer_Stock_Holding_Pct', 'Dealer_Hedge_Sell_Vol', 'Qfii_Buy_Vol',
       'Qfii_Stock_Holding_Pct', 'Qfii_Sell_Vol', 'Fund_Stock_Holding_Pct',
       'Dealer_Proprietary_Buy_Amt', 'Dealer_Hedge_Diff_Amt', 'Qfii_Sell_Amt',
       'Margin_Day_Trading_Vol', 'Fund_Sell_Amt', 'Day_Trading_Pct',
       'Margin_Short_Sales', 'Fund_Diff_Amt', 'Margin_Balance_Ratio',
       'SBL_Short_Sales_Amt', 'Fund_Buy_Vol', 'Qfii_Buy_Amt',
       'Margin_Balance_Vol', 'Qfii_Diff_Vol', 'Margin_Purchase',
       'Dealer_Hedge_Sell_Amt', 'Dealer_Proprietary_Sell_Vol', 'Fund_Sell_Vol',
       'Margin_Quota', 'Qfii_Diff_Amt', 'Total_Sell_Vol', 'Margin_Short_Quota',
       'Margin_Short_Coverting', 'Fund_Buy_Amt', 'Dealer_Proprietary_Diff_Amt',
       'Total_Buy_Vol', 'Margin_Balance_Amt', 'SBL_Short_Quota',
       'Dealer_Hedge_Diff_Vol', 'Component_Stock_of_TPEx200_Fg', 'Industry',
       'Component_Stock_of_MSCI_TW_Fg', 'Component_Stock_of_High_Dividend_Fg',
       'Security_Type_Chinese', 'Suspension_of_Buy_After_Day_Trading_Fg',
       'Matching_Period', 'Component_Stock_of_TWN50_Fg',
       'Component_Stock_of_MidCap100_Fg', 'Suspended_Trading_Stock_Fg',
       'Market_Board', 'Full_Delivery_Stock_Fg', 'Disposition_Stock_Fg',
       'Security_Type_English', 'Attention_Stock_Fg', 'Industry_Eng',
       'Component_Stock_of_TPEx50_Fg', 'Limit_Up_or_Down_in_Opening_Fg',
       'Limit_Up_or_Down']

data2 = TejToolAPI.get_history_data(ticker=tickers, 
                                    columns=columns,
                                    transfer_to_chinese=False,                                    
                                   )                                 
    
data2 
```
**抓取財務資料參數設定**
`ticker`
- 單一股票：['2330]
- 多股：['2330','2317']
`columns`
- 欄位：columns = ['r408','r409','r410','r502']
`transfer_chinese_columns`
- 預設 transfer_chinese_columns = False
- 測試欄位轉換成中文(transfer_chinese_columns = True)
`fin_type = [A, Q, TTM]`
- A: 表示累積
- Q: 表示單季
- TTM: 表示移動4季
`include_self_acc`
- 投資用財務包含自結和董事會決議數(include_self_acc = 'Y')
- 僅投資用財務(include_self_acc = 'N')
**財務僅會計師核閱**
```python
columns =['Total_Operating_Cost','Sales_Per_Share','Return_Rate_on_Equity_A_percent',
       'Proceeds_from_Disposal_of_Fixed_and_Intangible_Assets',
       'Cash_Flow_from_Operating_Activities', 
       'Other_Adjustment_from_Operating_Activities', 'Borrowings',       
       'Total_Operating_Expenses', 'Gross_Margin_Rate_percent',
       'Sales_Growth_Rate', 'Net_Income_Per_Share','Total_Assets',
       'Short_Term_Borrowings_Financial_Institutions',
       'Pre_Tax_Income_Growth_Rate', 'Total_Equity_Growth_Rate',
       'Total_Operating_Income','Total_Assets_Turnover',
       'Operating_Income_Per_Share','Pre_Tax_Income_Rate_percent', 
       'Gross_Profit_Loss_from_Operations','Return_on_Total_Assets',
       'Depreciation_and_Amortisation','Total_Interest_Income',
       'Fixed_Asset_Turnover', 'Decrease_Increase_in_Prepayments',]

fin_type = ['A','Q','TTM']

data = TejToolAPI.get_history_data(ticker=tickers, columns=columns, transfer_to_chinese=False, fin_type=fin_type, include_self_acc='N')
data
```
**財務包含公司自結數與會計師核閱**
```python
columns =['Total_Operating_Cost','Sales_Per_Share','Return_Rate_on_Equity_A_percent',
       'Proceeds_from_Disposal_of_Fixed_and_Intangible_Assets',
       'Cash_Flow_from_Operating_Activities', 
       'Other_Adjustment_from_Operating_Activities', 'Borrowings',       
       'Total_Operating_Expenses', 'Gross_Margin_Rate_percent',
       'Sales_Growth_Rate', 'Net_Income_Per_Share','Total_Assets',
       'Short_Term_Borrowings_Financial_Institutions',
       'Pre_Tax_Income_Growth_Rate', 'Total_Equity_Growth_Rate',
       'Total_Operating_Income','Total_Assets_Turnover',
       'Operating_Income_Per_Share','Pre_Tax_Income_Rate_percent', 
       'Gross_Profit_Loss_from_Operations','Return_on_Total_Assets',
       'Depreciation_and_Amortisation','Total_Interest_Income',
       'Fixed_Asset_Turnover', 'Decrease_Increase_in_Prepayments',]

fin_type = ['A','Q','TTM']

data = TejToolAPI.get_history_data(ticker=tickers, columns=columns, transfer_to_chinese=True, fin_type=fin_type, include_self_acc='Y')
data
```
## 以下範例示範運用 TejToolAPI 一鍵抓取不同資料庫的欄位與整併。
- 股價資料庫(日頻)
  - 開盤價、收盤價
- 籌碼資料庫(日頻)
  - 外資買賣超張數、合計買賣超張數
- 交易註記資料庫(日頻)
  - 是否為注意股票、是否暫停交易、是否為臺灣50成分股、是否為處置股票、分盤間隔時間
- 集保資料庫(周頻)
  - 800-1000張集保占比、800-1000張集保張數
- 財報資料庫(季頻)
  - 營業毛利成長率_Q、營業利益成長率_Q、稅後淨利率_Q
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
抓取股價資料庫與籌碼料庫
```python
columns = ['Open','High','Low','Close','Adjust_Factor','Volume_1000_Shares','Value_Dollars'
           'Transaction','Last_Bid','Last_Offer','Average_Trade_Price','ROI','High_Low_Diff','Turnover'
           'Issue_Shares_1000_Shares','Market_Cap_Dollars','Market_Cap_Percentage','Trade_Value_Percentage'
           'PER_TWSE','PBR_TWSE','Dividend_Yield_TWSE','Cash_Dividend_Yield_TEJ',
           'Qfii_Buy_Vol','Qfii_Sell_Vol','Qfii_Diff_Vol','Qfii_Buy_Amt','Qfii_Sell_Amt','Qfii_Diff_Amt','Qfii_Stock_Holding_Pct','Fund_Buy_Vol',
           'Fund_Sell_Vol','Fund_Diff_Vol','Fund_Buy_Amt','Fund_Sell_Amt','Fund_Diff_Amt','Fund_Stock_Holding_Pct','Dealer_Proprietary_Buy_Vol','Dealer_Proprietary_Sell_Vol','Dealer_Proprietary_Diff_Vol','Dealer_Proprietary_Buy_Amt',
           'Dealer_Proprietary_Sell_Amt','Dealer_Proprietary_Diff_Amt','Dealer_Hedge_Buy_Vol','Dealer_Hedge_Sell_Vol','Dealer_Hedge_Diff_Vol','Dealer_Hedge_Buy_Amt','Dealer_Hedge_Sell_Amt','Dealer_Hedge_Diff_Amt',
           'Dealer_Stock_Holding_Pct','Total_Buy_Vol','Total_Sell_Vol','Total_Diff_Vol','Total_Buy_Amt','Total_Sell_Amt','Total_Diff_Amt'
            ]
data = TejToolAPI.get_history_data(ticker=ticker, 
                                   columns=columns,
                                   transfer_to_chinese=False, 
                                   start = '2015-01-01', end = '2022-12-31')
data
```
抓取財務資料(default:僅會計師核閱)
```python
ticker = ['2881', '1101','9958','2330']
columns = ['r404','r401','eps']
fin_type = ['A','Q','TTM']
data = TejToolAPI.get_history_data(ticker=ticker, columns=columns,transfer_to_chinese=True, fin_type=fin_type)
data
```
抓取財務資料僅會計師核閱
```python
ticker = ['2881', '1101','9958','2330']
columns = ['r404','r401','eps']
fin_type = ['A','Q','TTM']
data = TejToolAPI.get_history_data(ticker=ticker, columns=columns,transfer_to_chinese=True, fin_type=fin_type, include_self_acc='N')
data
```
抓取財務資料含自結數
```python
ticker = ['2881', '1101','9958','2330']
columns = ['r404','r401','eps']
fin_type = ['A','Q','TTM']
data = TejToolAPI.get_history_data(ticker=ticker, columns=columns, transfer_to_chinese=True, fin_type=fin_type, include_self_acc='Y')
data
```

# Data Collection

本課程實作如何將資料（如價量、基本面、籌碼面等）ingest 到 zipline 回測引擎中。透過這個動作，後續使用 Pipeline API 時，就可以很有效率地獲取資料並計算因子。

## 載入所需套件
```python
import os
```

## Bundle 設置

介紹環境變數設定，並運用設定的環境變數做價量、非價量資料的 bundle。

**在 import zipline 前，必須先設定以下環境變數(os.environ)：**

**價量資料 bundle（tquant bundle）設定**

- os.environ['TEJAPI_BASE'] = "https://api.tej.com.tw"
用於連結TEJ資料庫

- os.environ['TEJAPI_KEY'] = "Your_Key"
用於識別使用者

- os.environ['ticker']
tickers = 'xxxx xxxx xxxx' os.environ['ticker'] = tickers 設置我們所需要的股票代碼

- os.environ['mdate'] = 'yyyymmdd yyyymmdd'
設置取得資料的起始時間與結束時間

- !zipline ingest -b tquant 將上方資料 ingest 進 bundle。

**設置非價量資料 bundle（fundamentals bundle）需要的資訊：**

- os.environ['fields'] = 'field1, field2, field3'
設置撈取非價量資料的欄位，其中 field1、field2、field3 代表資料欄位名稱

- os.environ['include_self_acc'] = 'N'(預設)
設置是否涵蓋公司自結財務，其中設定'Y'代表財務資料包含自結財務，'N'則表示不包含

- !zipline ingest -b fundamentals 將非價量資料 ingest 進 bundle。

# 價量資料

- 價量資料指 OHLCV 與除權息相關資訊。以下範例載入指定股票價量資料：
載入指定股票的價量資料，其中 IR0001 為台灣發行量加權股價報酬指數。

```python
tickers = 'IR0001 0050 0056 00737 1108 1101 1102 1103 6243 6451 1216 1301 1303 1326 1402 1476 1590 1605 1722 1802 2002 2105 2201 2207 2227 2301 2939 4108 4148 6431 6541 6657 2883 2891 2543 2929 2303 6505 9926 2308 2311 2317 2324 2325 2327 2330 2347 2353 2354 2357 2379 2382 2395 2408 2409 2412 2448 2454 2474 2492 2498 2603 2609 2615 2618 2633 2801 2823 2880 2881 2882 2883 2884 2885 2886 2887 2888 2890 2891 2892 2912 3008 3009 3034 3037 3045 3231 3474 3481 3673 3697 3711 4904 4938 5854 5871 5876 5880 6239 6415 6505 6669 6770 8046 8454 9904 9910'
print("總共有 :",len(tickers.split()),"筆資料")


os.environ["TEJAPI_BASE"] = 'https://api.tej.com.tw'
os.environ['TEJAPI_KEY'] = "Your_Key"
os.environ['ticker'] = tickers
os.environ['mdate'] = '20200103 20230530'

!zipline ingest -b tquant
```

## 簡易 ingest 價量資料

simple_ingest()函數提供另一種取得指定股票價量資料的方法，資料同樣會存入 bundle 中：

simple_ingest()函數載入價量資料所需參數資訊如下：

- name ( str ) = 'tquant'
定義 bundle 名稱

- tickers ( list or str ) = ['xxxx', 'xxxx', 'xxxx'] or 'xxxx xxxx xxxx'
設置我們需要的股票代碼

- start_date ( str ) = 'yyyy-mm-dd'
設置起始日期

- end_date ( str ) = 'yyyy-mm-dd'
設置結束日期

```python
from zipline.data.run_ingest import simple_ingest

start = '2020-01-03'
end = '2023-05-30'

simple_ingest(name = 'tquant',
              tickers = tickers,
              start_date = start,
              end_date = end
              )
```

## 更新價量資料

透過輸入 zipline update -b tquant 指令，可以更新當前使用的 tquant bundle，以獲得最新的交易價格和交易量資訊。

```bash
# 執行前
!zipline bundle-info
```
```bash
!zipline update -b tquant
```
```bash
# 執行後
!zipline bundle-info
```

## 新增價量資料

使用 `zipline add -t <tickers_want_to_add>` 指令，可以向現有的 tquant bundle 中新增所選的股票。

```bash
# 執行前
!zipline bundle-info
```
```bash
!zipline add -t "6523 6208"
```
```bash
# 執行後
!zipline bundle-info
```