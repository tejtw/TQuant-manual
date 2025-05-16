# if_else(if_true, if_false) 函數介紹

此函數先給定一個布林條件，若條件為 True 則回傳 *if_true* 的值，否則回傳 *if_false* 的值。

> **Parameters:**
> - **if_true** _(zipline.pipeline.term.ComputableTerm)_  
>   條件成立時回傳的值。
> - **if_false** _(zipline.pipeline.term.ComputableTerm)_  
>   條件不成立時回傳的值。

## 範例 – if_else

例如，下列範例檢查子產業別 (Sub_Industry) 是否為空字串，若為空則回傳主產業別 (Industry)；否則回傳子產業別：
```python
ind = TQAltDataSet.Sub_Industry.latest.eq('').if_else(
          TQAltDataSet.Industry.latest,
          TQAltDataSet.Sub_Industry.latest
      )
```
你也可以將其納入 Pipeline：
```python
def make_pipeline():
    Industry = TQAltDataSet.Industry.latest
    Sub_Industry = TQAltDataSet.Sub_Industry.latest
    check = TQAltDataSet.Sub_Industry.latest.eq('')
    # 若 Sub_Industry 為空，則回傳 Industry，否則回傳 Sub_Industry
    ind = check.if_else(Industry, Sub_Industry)
    
    return Pipeline(
        columns={
            '主產業別': Industry,
            '子產業別': Sub_Industry,
            '是否符合條件': check,
            '回傳產業': ind
        }
    )

run_pipeline(make_pipeline(), end, end).head(10)

```
