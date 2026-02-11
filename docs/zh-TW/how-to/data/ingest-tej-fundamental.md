# 如何 Ingest TEJ 財務/非財務資料

!!! info
    本頁提供如何將 TEJ 財務/非財務資料 Ingest 到 TQuant Lab 的詳細指南，並說明相關的參數設定與步驟。

---

## 1. 使用 zipline ingest 載入非價量資料

*   欄位對照清單可參考TQuant官方網站最下方的 TEJ TOOL API 欄位對照清單。
設定完 `os.environ['fields']` 後，便可使用 `!zipline ingest -b fundamentals` 載入所需要的非價量資料。

```python
columns = ['Sales_Growth_Rate','Operating_Income_Growth_Rate', 
           'Pre_Tax_Income_Growth_Rate','Net_Income_Growth_Rate',
           'Industry_Eng','Industry', 'roi', 'YoY_Monthly_Sales','mktcap']
```
```python
os.environ['fields'] = " ".join(columns)
!zipline ingest -b fundamentals
```

---

## 2. 使用 simple_ingest() 載入非價量資料

`simple_ingest()`函數提供另一種取得指定股票非價量資料的方法，資料同樣會存入 bundle 中：

`simple_ingest()`函數載入非價量資料所需參數資訊如下：

*   `name` (`str`) = `'fundamentals'`
    *   定義 bundle 名稱
*   `tickers` (`list` or `str`) = `['xxxx', 'xxxx', 'xxxx']` or `'xxxx xxxx xxxx'`
    *   設置我們需要的股票代碼
*   `fields` (`list` or `str`) = `['field1', 'field2', 'field3']` or `'field1, field2, field3'`
    *   設置撈取非價量資料的欄位，其中 field1、field2、field3 代表資料欄位名稱
*   `start_date` (`str`) = `'yyyy-mm-dd'`
    *   設置起始日期
*   `end_date` (`str`) = `'yyyy-mm-dd'`
    *   設置結束日期
*   `self_acc` (`str`) = `'N'`(預設)
    *   設置是否涵蓋公司自結財務，其中設定`'Y'`代表財務資料包含自結財務，`'N'`則表示不包含

!!! note
    預設 `self_acc` 為 `'N'`，即不包含公司自結財務。若要包含，請設定為 `'Y'`。

```python
simple_ingest(name = 'fundamentals',
              tickers = tickers,
              fields = columns,
              start_date = start,
              end_date = end,
              # self_acc = 'Y'
              )
```

---

## 3. 更新非價量資料

透過輸入 `!zipline update -b tquant` 指令，可以更新當前使用的 fundamentals bundle，以獲得最新的資訊。

```python
## update 前
from zipline.data.data_portal import get_fundamentals
df = get_fundamentals()
print('股票池為:',df['symbol'].unique())
print('起始日:',df['date'].min())
print('結束日:',df['date'].max())
print('欄位:',df.columns)
```
```bash
!zipline update -b fundamentals
```
```python
# update 後
df = get_fundamentals()
print('股票池為:',df['symbol'].unique())
print('起始日:',df['date'].min())
print('結束日:',df['date'].max())
print('欄位:',df.columns)
```

---

## 4. 新增非價量資料

*   執行指令 `zipline add -b fundamentals -t <tickers_want_to_add>` 可以根據當前 fundamentls bundle 的欄位，新增所選擇的公司到 bundle 中。

*   （fundamentls bundle 限定）透過指令 `!zipline add -b fundamentals -f <columns_want_to_add>`（其中 -f 代表 field）來新增當前已有公司的指定資料欄位。

*   請注意，目前系統不支援同時新增公司和資料欄位，因此需要分別進行這些操作。

```bash
# add 公司
!zipline add -b fundamentals -t "6523 6208"
```
```python
# add 公司後
df = get_fundamentals()
print('股票池為:',df['symbol'].unique())
print('起始日:',df['date'].min())
print('結束日:',df['date'].max())
print('欄位:',df.columns)
```
```python
# add 欄位
!zipline add -b fundamentals -f Gross_Margin_Growth_Rate
```
```python
# add 欄位後
df = get_fundamentals()
print('股票池為:',df['symbol'].unique())
print('起始日:',df['date'].min())
print('結束日:',df['date'].max())
print('欄位:',df.columns)
```