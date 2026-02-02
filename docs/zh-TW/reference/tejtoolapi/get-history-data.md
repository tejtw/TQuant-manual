# 如何取得歷史資料 (TejToolAPI)

!!! info
    本頁詳細說明如何使用 TEJ Tool API 的 `get_history_data` 函數來獲取歷史資料，並整併股價與不同屬性的資料表，包括參數說明和使用範例。

---

## 1. 概述

TEJTOOLAPI 主要整併股價與不同屬性的資料庫，透過輸入股票代碼 (TICKERS) 和欄位 (FIELD) 後，可將欲抓取的資料整併為日頻率的 DataFrame。

主要整併方法是以交易日期表為索引整併股價與不同屬性的資料。財務數據是根據發布日（announcement date）來 mapping，非發布日的財務數據會使用當下可獲得最新的資料為準進行填值。

例如：2330 在 2010-02-01 時所能獲得最新的財務資料為 2009Q3 的財務資料，則 2010-01-01 會以 2009Q3 的資料進行填補。惟公司 2009Q4 自結財報早於 2010-02-01 發布時，且 `include_self_acc = 'Y'`，這時 2010-02-01 的財務數據使用自結財務數據。

可抓取的資料欄位可參考：[TEJ 資料集](https://tquant.tejwin.com/資料集/)

---

## 2. 函數簽名

```python
TejToolAPI.get_history_data(ticker, columns, transfer_to_chinese=False, start=None, end=None, fin_type=None, include_self_acc=None)
```

---

## 3. 參數說明

| 參數 | 類型 | 說明 |
|------|------|------|
| `ticker` | iterable[str] | 欲查詢的資料的證券代碼 |
| `columns` | iterable[str] | 欲查詢資料的欄位名稱，詳見 [API 文件](https://api.tej.com.tw/) |
| `transfer_to_chinese` | boolean | 是否將欄位名稱轉換為中文，預設為 False |
| `start` | pd.Timestamp or str | 資料起始時間 (選用) |
| `end` | pd.Timestamp or str | 資料結束時間 (選用) |
| `fin_type` | iterable[str] | 決定財務資料型態：A (累積)、F (單季)、TTM (移動四季) |
| `include_self_acc` | str | Y: 投資用財務包含自結和董事會決議數；N: 僅投資用財務 |

---

## 4. 回傳值

- **類型**：`pd.DataFrame`
- **說明**：以交易日期為索引，包含所有請求欄位的 DataFrame

---

## 5. 使用範例

### 5.1 環境設定

```python
import os
os.environ['TEJAPI_KEY'] = "your key" 
os.environ['TEJAPI_BASE'] = "https://api.tej.com.tw"

import TejToolAPI 
from zipline.data import bundles
```

### 5.2 取得 Tickers

**方法一：從 bundle 取得**

```python
bundle_data = bundles.load('tquant')
universe = bundle_data.asset_finder.retrieve_all(bundle_data.asset_finder.equities_sids)
tickers = [col.symbol for col in universe]
```

**方法二：自行指定**

```python
tickers = ['2330', '2454', '2317', '2882', '2881']
```

### 5.3 範例一：取得月營收資料

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
                                   transfer_to_chinese=False)
print(data)
```

### 5.4 範例二：取得集保庫存資料

```python
ticker = tickers
columns = ['Total_Custodied_Shares_1000_Lots',
           'Custodied_Under_400_Lots_Total_Lots',
           'Custodied_Lots_Between_800_1000_Total_Lots',
           'Custodied_Larger_Than_400_Lots_Pct',
           'Custodied_Lots_Between_400_600_Total_Lots',
           'Custodied_Lots_Between_600_800_Pct', 
           'Pledged_Stock_Shares_1000_Lots',
           'Custodied_Under_400_Lots_Pct',
           'Custodied_Lots_Between_400_600_Total_Holders',
           'Custodied_Lots_Between_800_1000_Total_Holders',
           'Custodied_Under_400_Lots_Total_Holders',
           'Custodied_Lots_Between_400_600_Pct',
           'Custodied_Lots_Between_800_1000_Pct',
           'Custodied_Greater_Than_1000_Lots_Pct']

data1 = TejToolAPI.get_history_data(ticker=ticker, 
                                    columns=columns,
                                    transfer_to_chinese=False)
print(data1)
```

### 5.5 範例三：抓取財務資料

#### 參數設定說明

**ticker**
- 單一股票：`['2330']`
- 多股票：`['2330', '2317']`

**columns**
- 欄位範例：`columns=['r408', 'r409', 'r410', 'r502']`

**transfer_to_chinese**
- 預設：`False`
- 若要轉換為中文欄位名稱：`True`

**fin_type**
- `A`：表示累積
- `Q`：表示單季
- `TTM`：表示移動 4 季

**include_self_acc**
- `'Y'`：投資用財務包含自結和董事會決議數
- `'N'`：僅投資用財務

#### 完整範例

```python
# 輸入欄位
icolumns = ['Open', 'Close', 'Qfii_Diff_Vol', 'Total_Diff_Vol', 
            'Custodied_Lots_Between_800_1000_Total_Lots', 
            'Custodied_Lots_Between_800_1000_Pct',
            'Attention_Stock_Fg', 'Disposition_Stock_Fg', 'Matching_Period', 
            'Suspended_Trading_Stock_Fg', 'Component_Stock_of_TWN50_Fg', 
            'Gross_Margin_Growth_Rate', 'Net_Income_Rate_percent', 
            'Operating_Income_Growth_Rate']

# 使用 TEJTOOLAPI 整併
data = TejToolAPI.get_history_data(ticker=tickers[:5], 
                                   columns=icolumns,
                                   transfer_to_chinese=True, 
                                   fin_type=['Q'],
                                   start='2015-01-01', 
                                   end='2022-12-31')
print(data)
```

---

## 6. 常見問題

**Q：如何知道有哪些欄位可以使用？**

A：請參考 [TEJ 資料集文件](https://tquant.tejwin.com/資料集/) 或 [API 文件](https://api.tej.com.tw/)

**Q：時間篩選的格式是什麼？**

A：支援 `pd.Timestamp` 或字符串格式，例如 `'2020-01-01'` 或 `'20200101'`

**Q：如何獲取所有可用的 tickers？**

A：可以透過 `bundles.load('tquant')` 從 tquant bundle 中取得