# TejToolAPI
幫助使用者快速取得且整理 TEJ 資料庫所提供的資訊。

```python
import os 
os.environ['TEJAPI_BASE'] = "https://api.tej.com.tw"
os.environ['TEJAPI_KEY'] = "your key"
import TejToolAPI
import pandas as pd 
import numpy as np
```


## TejToolAPI.get_history_data
取的證券相關或交易相關等歷史資料。  
## Paramters:
- ticker: iterable[str] 欲查詢的資料的證券代碼。
- columns: iterable[str]

  欲查詢資料的欄位名稱，欄位名稱請見 https://api.tej.com.tw/。
- transfer_to_chinese: boolean 是否將欄位轉換為英文。
- start: pd.Timestamp or str 資料起始時間。
- end: pd.Timestamp or str 資料結束時間。
- fin_type = iterable[str] 決定資料型態。 A: 累績資料 F: 單季資料 TTM: 移動四季資料
- include_self_acc: str 投資用財務包含自結和董事會決議數(include_self_acc = 'Y') 僅投資用財務(include_self_acc = 'N')


## Returns:
pd.DataFrame

```python
ticker = ["2330", "1101", "3711"]
columns = ["eps"]
TejToolAPI.get_history_data(
    ticker = ticker,
    columns = columns,
    transfer_to_chinese = True,
    start = pd.Timestamp("2021-07-02"),
    end = pd.Timestamp("2022-07-02"),
    fin_type = ["A", "Q", "TTM"],
    include_self_acc = "Y"
)
```


