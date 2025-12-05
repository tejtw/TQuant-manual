# REST API 文件

!!! info
    本頁提供 TEJ REST API 的詳細說明，包括 Datatables API 的使用方法、範例，以及其他相關的提示資訊。

TEJ REST API 提供了一套簡易的方式來存取 TEJ 資料庫，並輸出 JSON 或 XML 格式。您也可以透過各種程式或工具快速取得需要的資料。

---

## 1. Datatables API

### 1.1 概述

TEJ REST API 提供一套簡易的方式來存取 TEJ 資料庫，並輸出 JSON 或 XML 格式。您可以直接使用瀏覽器來取得資料，也可以透過工具程式（例如 curl、wget 等）進行取得。

您也可以在[官方 OPEN API (Swagger) 說明文件](https://api.tej.com.tw/swagger/)查看詳細的 API 規格。

### 1.2 使用方法

**API 端點定義：**

```
GET https://api.tej.com.tw/api/datatables/{datatable_code}/{table_code}.{format}?<row_filter_criteria>
```

其中：
- `datatable_code`：資料庫代碼（例如 TWN 表示台灣資料庫）
- `table_code`：資料表代碼（例如 APRCD 表示未調整股價）
- `format`：輸出格式（json 或 xml）
- `row_filter_criteria`：篩選條件（可選）

### 1.3 範例

以上市(櫃)未調整股價(日)(TWN/APRCD)為例，您可以使用下列方式取得資料：

=== "JSON"
    ```bash
    GET https://api.tej.com.tw/api/datatables/TWN/APRCD.json?api_key=<YOURAPIKEY>
    ```

=== "XML"
    ```bash
    GET https://api.tej.com.tw/api/datatables/TWN/APRCD.xml?api_key=<YOURAPIKEY>
    ```

### 1.4 回應範例

回應資料格式如下（以 JSON 為例）：

```json
{
    "datatable": {
        "data": [
            ["Y9999", "2018-05-15T00:00:00Z", 10965.08, 10978.38, ...],
            ["Y9999", "2018-05-14T00:00:00Z", 10938.3, 10970.24, ...]
        ],
        "columns": [
            {"name": "code", "type": "string"},
            {"name": "mdate", "type": "date"},
            ...
        ]
    }
}
```

---

## 2. 提示

!!! tip
    您可以直接使用瀏覽器(Browser)來取得資料，也可以透過工具程式（例如 curl、wget 等）進行存取。

!!! note
    詳細的 API 參數說明和更多範例，請參考[官方 REST API 文件](https://api.tej.com.tw/swagger/)