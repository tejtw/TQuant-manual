# REST API 文件

TEJ REST API 提供了一套簡易的方式來存取 TEJ 資料庫，並輸出 JSON 或 XML 格式。

## Datatables API

### 使用方法

```
GET https://api.tej.com.tw/api/datatables/{datatable_code}/{table_code}.{format}?<row_filter_criteria>
```

#### 範例

以上市(櫃)未調整股價(日)(TWN/APRCD)為例：

=== "JSON"
    ```
    GET https://api.tej.com.tw/api/datatables/TWN/APRCD.json?api_key=<YOURAPIKEY>
    ```

=== "XML"
    ```
    GET https://api.tej.com.tw/api/datatables/TWN/APRCD.xml?api_key=<YOURAPIKEY>
    ```

## 提示

您可以直接使用瀏覽器來取得資料，也可以透過工具程式（例如 curl, wget 等）

> 此頁面正在建構中

詳細內容請參考: `.backup/zh-TW_backup/rest_api/document_restapi.md`
