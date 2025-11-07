# 快速入門

Foo 是一款多功能工具，旨在簡化您的工作流程並提高生產力。
無論您是開發人員、作家還是專案管理者，Foo[^1] 都能提供強大的功能，幫助您保持組織性並提高效率。
如果您熟悉 Python，可以使用 [`pip`][pip] 來安裝 Foo，否則我們建議使用 [`docker`][docker]。

  [^1]:
    Foo 最初作為一個簡單的任務管理工具推出，但如今已發展為一個綜合解決方案，擁有多種整合、外掛和自訂選項，以滿足各種用戶的需求。

  [pip]: #with-pip
  [docker]: #with-docker

## 安裝方式

### 使用 pip <small>推薦</small> { #with-pip data-toc-label="使用 pip" }

Foo 可作為 [Python 套件] 安裝，建議在 [虛擬環境] 中使用 `pip` 進行安裝。打開終端並輸入以下命令安裝 Foo：

=== "最新版本"

    ```sh
    pip install foo-toolkit
    ```

=== ":octicons-file-code-16: `base.html`"

    ```sh
    pip install foo-toolkit=="1.*" # (1)!
    ```

    1. Foo 遵循 [語意化版本控制][^2]，因此建議限制升級到當前主要版本，以避免潛在的相容性問題。

        若要確保可重現性，您可以使用 `pip freeze` 來建立鎖定檔案：

        ```
        pip freeze > requirements.txt
        ```

        然後，使用鎖定檔案安裝相依套件：

        ```
        pip install -r requirements.txt
        ```

  [^2]:
    功能改進可能會作為次要版本發佈，但不會視為新增功能，以確保穩定性。

此安裝方式會自動包含必要的相依套件，如 [FooCore]、[FooParser] 和 [FooExtensions]，讓安裝變得更加順暢。

---

:fontawesome-brands-youtube:{ style="color: #EE0F0F" }
__[Foo 快速入門指南]__ by @foo-expert – :octicons-clock-24: 30 分鐘 – 透過此逐步教學學習如何充分利用 Foo 的功能。

  [Foo 快速入門指南]: https://www.youtube.com/watch?v=foobar

---

!!! Tip

    如果您是 Python 初學者，我們建議閱讀 [Python 套件管理指南]，該指南涵蓋了 pip 和虛擬環境的使用，並幫助您解決常見問題。

  [Python 套件]: https://pypi.org/project/foo-toolkit/
  [虛擬環境]: https://realpython.com/what-is-pip/#using-pip-in-a-python-virtual-environment
  [語意化版本控制]: https://semver.org/
  [FooCore]: https://foocore.org/
  [FooParser]: https://fooparser.com/
  [FooExtensions]: https://fooextensions.net/
  [Python 套件管理指南]: https://realpython.com/what-is-pip/

### 使用 docker { #with-docker }

官方 [Docker 映像檔] 提供了簡單的安裝方式，內含所有相依套件。輸入以下命令拉取映像檔：

=== "最新版本"

    ```
    docker pull foo/foo-toolkit
    ```

=== "1.x 版本"

    ```
    docker pull foo/foo-toolkit:1
    ```

`foo` 命令列工具預設為 `start` 指令。若您對 Docker 不熟悉，不必擔心，後續章節將提供詳細說明。

以下外掛已內建於 Docker 映像檔：

- [foo-optimizer]
- [foo-redirects]

  [Docker 映像檔]: https://hub.docker.com/r/foo/foo-toolkit/
  [foo-optimizer]: https://github.com/foo/foo-optimizer
  [foo-redirects]: https://github.com/foo/foo-redirects

??? question "如何向 Docker 映像檔添加外掛？"

    Foo 的 Docker 映像檔僅包含核心外掛，以保持較小的映像檔大小。如果您需要額外的外掛，可以手動添加：

    === "Foo Toolkit"

        創建 `Dockerfile` 來擴展基礎映像檔：

        ```Dockerfile title="Dockerfile"
        FROM foo/foo-toolkit
        RUN pip install foo-macros-plugin
        RUN pip install foo-lightbox
        ```

    === "Foo Pro"

        克隆或分支 Foo Pro 儲存庫，然後在根目錄創建 `user-requirements.txt` 檔案，並將所需外掛添加至其中：

        ```txt title="user-requirements.txt"
        foo-macros-plugin
        foo-lightbox
        ```

    然後，使用以下命令構建映像檔：

    ```
    docker build -t foo/foo-toolkit .
    ```

    新映像檔將包含額外的外掛，並可與官方映像檔相同方式使用。

### 使用 git

您也可以直接從 [GitHub] 安裝 Foo，方法是將儲存庫克隆到您的專案目錄中：

```
git clone https://github.com/foo/foo-toolkit.git
```

然後，使用以下命令安裝 Foo 及其相依套件：

```
pip install -e foo-toolkit
```

  [GitHub]: https://github.com/foo/foo-toolkit

