# 程式碼區塊

程式碼區塊和範例是技術專案文件中不可或缺的一部分。Material for MkDocs 提供了多種方式來設置程式碼區塊的語法。

欲了解更多詳細資訊，請參閱官方文件：[Code Blocks 詳細說明](https://squidfunk.github.io/mkdocs-material/reference/code-blocks/)

``` py title="bubble_sort.py" linenums="1" hl_lines="2-3"
def bubble_sort(items):
    for i in range(len(items)):
        for j in range(len(items) - 1 - i):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]
```
