# Code blocks

Code blocks and examples are an essential part of technical project documentation. Material for MkDocs provides different ways to set up syntax highlighting for code blocks.

For more details, please refer to the official documentation: [Code Blocks Reference](https://squidfunk.github.io/mkdocs-material/reference/code-blocks/)

``` py title="bubble_sort.py" linenums="1" hl_lines="2-3"
def bubble_sort(items):
    for i in range(len(items)):
        for j in range(len(items) - 1 - i):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]
```