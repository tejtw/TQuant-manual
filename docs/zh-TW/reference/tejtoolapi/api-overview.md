# TEJ API 概述

!!! info
    本頁提供 TEJ API 的整體概述，包括 API 認證方式、資料庫類型，以及各種程式語言的 API 文件連結。

---

## 1. API 認證

### 1.1 取得 API Key

您需要先向 TEJ 公司註冊帳號，然後申請取用資料所需的 API Key。

```bash
api_key=a8sb1jska2lz03hc2
```

### 1.2 設定 API Key

每次存取資料時，都需要提供您的 API Key。

=== "環境變數 (推薦)"
    ```python
    import os
    os.environ['TEJAPI_KEY'] = "YOUR_API_KEY"
    os.environ['TEJAPI_BASE'] = "https://api.tej.com.tw"
    ```

=== "Python tejapi"
    ```python
    import tejapi
    tejapi.ApiConfig.api_key = "YOUR_API_KEY"
    ```

=== "REST API"
    ```bash
    GET https://api.tej.com.tw/api/datatables/TWN/APRCD.json?api_key=YOUR_API_KEY
    ```

---

## 2. 資料庫類型

TEJ 提供免費試用及付費資料庫：

| 項目 | 試用資料庫 | 付費資料庫 |
|------|-----------|-----------|
| 可用資料表 | 僅試用資料庫內的表格 | 完整資料庫 |
| 每日呼叫次數 | 最多 500 次 | 最多 2,000 次 |
| 每次呼叫筆數 | 最多 10,000 筆 | 最多 10,000 筆 |
| 分頁總筆數上限 | 50,000 筆 | 1,000,000 筆 |
| 每日資料上限 | 50,000 筆 | 3,000,000 筆 |

---

## 3. API 文件

<div class="grid cards" markdown>

-   :simple-python:{ .lg .middle } **TejToolAPI (Python)**

    ---

    使用 `get_history_data` 函數整併股價與財務資料

    [:octicons-arrow-right-24: 查看文件](get-history-data.md)

</div>

---

## 4. 外部資源

- [TEJ 資料集總覽](https://tquant.tejwin.com/資料集/)
- [TEJ API 官方文件](https://api.tej.com.tw/)
- [REST API Swagger 文件](https://api.tej.com.tw/swagger/)
- [PyPI - TejToolAPI](https://pypi.org/project/TejToolAPI/)
