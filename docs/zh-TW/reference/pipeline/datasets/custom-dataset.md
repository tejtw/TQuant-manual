# 自訂資料集 (Custom DataSets)

!!! info
    本頁介紹如何在 TQuant Lab Pipeline 中創建和使用自訂資料集 (Custom DataSets)。這是一個進階功能，允許您將外部數據源（例如您自己的 CSV 檔案、資料庫查詢結果等）整合到 Pipeline 中，極大地擴展了 Pipeline 的數據來源和應用範圍。

雖然 TQuant Lab 提供了 `TWEquityPricing` 和 `TQDataSet` 等強大的內建資料集，但在某些情況下，您可能需要使用自己獨有的數據來進行策略研究，例如：

*   您透過爬蟲獲取的網路輿情數據。
*   您購買的第三方另類數據。
*   您自己計算的專有因子數據。

`Custom DataSets` 功能允許您將這些外部數據打包成 Pipeline 可識別的格式，並像使用內建資料集一樣在 Pipeline 中無縫使用。

---

## 1. `Custom DataSets` 核心概念

創建一個自訂資料集的過程，本質上是將您的外部數據轉換為 Zipline 的 `bcolz` 格式，並提供一個描述文件 (`extension.py`) 讓 Zipline 能夠識別和載入它。

**主要步驟**：

1.  **準備數據**：將您的數據整理成特定格式的 CSV 檔案。
2.  **編寫 `extension.py`**：創建一個 Python 腳本，定義您的 `Custom DataSet` 類別、欄位，以及數據的載入邏輯。
3.  **執行 `zipline ingest`**：使用 `zipline ingest` 指令，Zipline 會執行您的 `extension.py`，讀取 CSV 檔案，並將其轉換為 `bcolz` 格式儲存。

---

## 2. 實作步驟

以下我們將透過一個完整的範例，展示如何將一個包含「每日外資持股比例」的 CSV 檔案，轉換為一個可以在 Pipeline 中使用的自訂資料集。

### 步驟 1：準備數據 (CSV 檔案)

首先，您需要將您的數據整理成一個或多個 CSV 檔案。每個檔案應包含以下欄位：

*   `date`：日期，格式為 `YYYY-MM-DD`。
*   `sid`：股票代碼 (Zipline 內部 ID)。
*   您的自訂數據欄位 (例如 `foreign_ownership_ratio`)。

**範例 `my_custom_data.csv`**：

```csv
date,sid,foreign_ownership_ratio
2022-01-03,0,45.6
2022-01-03,1,23.4
2022-01-04,0,45.7
2022-01-04,1,23.5
...
```

!!! note
    `sid` 是 Zipline 內部的整數 ID，而不是股票代碼字串 (如 '2330')。您需要自行將股票代碼映射到 `sid`。

### 步驟 2：編寫 `extension.py`

接下來，在您的 Zipline 設定目錄下 (通常是 `~/.zipline/`) 創建一個名為 `extension.py` 的檔案。這個檔案是 Zipline 用於發現和載入自訂資料的入口。

**範例 `~/.zipline/extension.py`**：

```python
from zipline.pipeline.data import DataSet
from zipline.pipeline.loaders import CSVLoader
from zipline.pipeline.loaders.frame import DataFrameLoader
from zipline.pipeline.domain import US_EQUITIES # 或其他適用的 Domain
import pandas as pd

# 1. 定義 Custom DataSet 類別
class MyCustomDataSet(DataSet):
    # 定義您的數據欄位，並指定其數據類型
    foreign_ownership_ratio = Column(dtype=float)
    
    # 指定此 DataSet 適用的 Domain
    domain = US_EQUITIES # 根據您的需求選擇

# 2. 創建 CSVLoader 實例
my_csv_loader = CSVLoader(
    # 指定 CSV 檔案的路徑
    csvdir='/path/to/your/csv/files',
    # 將 CSV 檔案與您的 DataSet 類別和欄位進行映射
    data_query_path={
        MyCustomDataSet.foreign_ownership_ratio: 'my_custom_data.csv'
    }
)

# 3. 創建 DataFrameLoader
MyCustomDataSetLoader = DataFrameLoader(
    column=MyCustomDataSet.foreign_ownership_ratio,
    # 這裡的 'my_custom_data.csv' 應與 my_csv_loader 中的鍵一致
    baseline=my_csv_loader.load_adjusted_array(['my_custom_data.csv'])
)

# 4. 註冊您的 DataSet 和 Loader
register_dataset(MyCustomDataSet, MyCustomDataSetLoader)
```

**程式碼解釋**：

1.  **`MyCustomDataSet(DataSet)`**：我們創建了一個名為 `MyCustomDataSet` 的類別，並繼承自 `DataSet`。在其中，我們定義了一個名為 `foreign_ownership_ratio` 的 `Column`，並指定其數據類型為 `float`。
2.  **`CSVLoader`**：這是一個輔助類別，用於從 CSV 檔案中讀取數據。您需要提供 CSV 檔案所在的目錄 (`csvdir`)，並建立一個字典，將您的 `DataSet` 欄位映射到對應的 CSV 檔案。
3.  **`DataFrameLoader`**：這是實際的數據載入器。它會使用 `CSVLoader` 載入的數據，並將其與您的 `DataSet` 欄位進行綁定。
4.  **`register_dataset`**：最後，您需要調用 `register_dataset` 函數，將您的 `DataSet` 類別和 `DataFrameLoader` 實例註冊到 Zipline 中。

### 步驟 3：執行 `zipline ingest`

完成 `extension.py` 的編寫後，打開終端機，執行 `zipline ingest` 指令：

```bash
zipline ingest -b your_bundle_name
```

Zipline 在執行 `ingest` 時，會自動查找並執行 `~/.zipline/extension.py` 腳本。如果一切順利，它會讀取您的 CSV 檔案，將其轉換為 `bcolz` 格式，並儲存在您的 bundle 目錄中。

---

## 3. 在 Pipeline 中使用自訂資料集

一旦您的自訂資料集成功 `ingest`，您就可以像使用內建資料集一樣，在 Pipeline 中導入和使用它。

```python
from zipline.pipeline import Pipeline
# 從 extension.py 中導入您的 Custom DataSet
from .extension import MyCustomDataSet 

def make_my_pipeline():
    # 獲取最新的外資持股比例
    latest_foreign_ownership = MyCustomDataSet.foreign_ownership_ratio.latest
    
    return Pipeline(
        columns={
            'foreign_ownership': latest_foreign_ownership
        },
        # 您甚至可以基於自訂數據進行篩選
        screen=(latest_foreign_ownership > 30.0)
    )
```

---

## 總結

自訂資料集是 Zipline Pipeline 的一個強大擴展功能，它打破了內建數據源的限制，讓您可以將任何外部數據無縫整合到您的量化研究流程中。雖然創建自訂資料集的過程比直接使用內建資料集要複雜一些，但它所帶來的靈活性和擴展性，對於進行深入、獨特的量- 化策略研究來說，是無價的。
