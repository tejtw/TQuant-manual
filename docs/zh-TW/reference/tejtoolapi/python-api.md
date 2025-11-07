# Python API 文件

TEJ Python API 提供了訪問 TEJ 資料庫的 Python 方式。

## API 認證

### 取得 API key

您需要先向本公司註冊一個帳號，然後再申請取用資料所需的 API Key。

```python
api_key = "your_api_key_here"
```

### 設定 API Key

```python
import tejapi
tejapi.ApiConfig.api_key = "YOURAPIKEY"
```

## 資料庫類型

本公司提供免費及付費資料庫：

- 試用資料庫
  - 僅能使用試用資料庫內提供的表格
  - 每天最多 500 次呼叫
  - 每天呼叫最多 10,000 筆資料（可分頁取得，分頁總筆數上限為 50,000）

> 此頁面正在建構中

詳細內容請參考: `.backup/zh-TW_backup/python_api/document_pythonapi.md`
