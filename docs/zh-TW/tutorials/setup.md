# 環境建置：安裝與設定 TQuant Lab

!!! info
    本文件提供 TQuant Lab 的詳細安裝與環境設定指南，確保您能順利啟動並開始使用平台。

## 系統要求與支援環境

在安裝 TQuant Lab 之前，請確認您的系統符合以下要求：

*   **主要套件**：Zipline (Zipline-tej)
*   **支援 Python 版本**：Python 3.8 ~ 3.11 ( **建議使用 Python 3.11** )
*   **支援作業系統**：Microsoft Windows OS, macOS 或 Linux (Linux 使用者請優先採用「A. 透過 Docker 安裝」流程)
*   **Pandas 版本**：建議 1.5.3 或 2.0.0；高於 2.0.0 可能不相容。
*   **NumPy 版本**：建議 1.23.5；高於 1.23.5 可能不相容。

## 安裝方式

以下提供三種安裝 `zipline-tej` (TQuant Lab 的核心套件) 的方式， **建議優先採用 1 或 2 方式** 。

## 1. 透過 Docker 安裝 zipline-tej ( **推薦** )

使用 Docker 安裝是最推薦的方式，它提供了一個隔離且一致的運行環境，能有效避免套件相依性問題。

### 1.1 先決條件

請確保您的系統已安裝 Docker Desktop：

*   [Mac 使用者請點此](https://docs.docker.com/docker-for-mac/install/)
*   [Windows 使用者請點此](https://docs.docker.com/docker-for-windows/install/)
*   [Linux 使用者請點此](https://docs.docker.com/engine/install/ubuntu/)

!!! warning "重新啟動您的電腦"
    如果您剛在 Windows 系統上安裝了 Docker，請記得重新啟動電腦，否則可能會遇到容器網路連線方面的異常問題。

### 1.2 安裝步驟

1.  **從 Docker Hub 下載映像檔** ：
    在終端機中執行以下指令，下載官方 `tquant` Docker 映像檔：

    ```bash
    docker pull tej87681088/tquant:latest
    ```

2.  **建立資料儲存空間 (Volume)** ：
    建立一個 Docker Volume 來持久化您的資料，避免容器刪除後資料遺失：

    ```bash
    docker volume create data
    ```

3.  **啟動 `tquant` 容器** ：
    執行以下指令啟動容器。此命令會將 `data` volume 掛載到容器內部的 `/app` 目錄，並將您的本機 8888 埠映射到容器內的 8888 埠。

    ```bash
    docker run -v data:/app -p 8888:8888 --name tquant tej87681088/tquant
    ```

    !!! tip "補充說明"
        *   `volume` 在 Windows 10 WSL 環境中的位置通常為：`\wsl$\docker-desktop-data\data\docker\volumes\data\_data`
        *   若您希望容器在停止時自動移除，可以在 `docker run` 命令中加入 `--rm` 參數。

### 1.3 使用 Jupyter Notebook

容器啟動後，您會在終端機中看到類似以下的網址。複製該網址並貼至瀏覽器即可開始使用 Jupyter Notebook。

```text
http://127.0.0.1:8888/tree?token=XXXXXXXXXXXXXXXX
```

### 1.3.1 進階：使用 VS Code 連線開發 (推薦)

雖然 Jupyter Notebook 很方便，但使用 VS Code 可以獲得更強大的程式碼補全與除錯功能。透過 **Dev Containers** 擴充套件，您可以直接連線到 Docker 容器內部進行開發。

**步驟說明：**

1.  **安裝擴充套件**：
    打開 VS Code，安裝微軟官方的 **[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)** 擴充套件。

2.  **啟動容器**：
    確保您的 `tquant` 容器已經處於執行狀態 (Running)。

3.  **連線至容器**：
    * 點擊 VS Code 左下角的綠色按鈕 (或是按 `F1` 開啟命令列)。
    * 輸入並選擇 **`Dev Containers: Attach to Running Container...`**。
    * 選擇 `/tquant` 容器。

4.  **開啟工作目錄**：
    連線成功後，VS Code 會開一個新視窗。點擊 **Open Folder**，輸入 `/app` 並按下確定。現在，您就像是在本機一樣編輯容器內的檔案了！

!!! tip "效率提升"
    在 VS Code 容器環境中，您依然可以安裝自己習慣的 Python 擴充套件 (如 Pylance)，這將大幅提升撰寫策略的流暢度。

### 1.4 操作已關閉的容器 (Container)

若您需要操作之前創建但已關閉的容器，請依照以下步驟：

1.  **列出所有容器** (包括已停止的)：

    ```bash
    docker ps -a
    ```

2.  **啟動指定容器** ：
    將 `<CONTAINER_ID>` 替換為 `docker ps -a` 查詢到的實際容器 ID。

    ```bash
    docker start <CONTAINER_ID>
    ```

3.  **查看容器日誌** ：
    顯示指定容器的最近日誌 (例如最後 50 行)：

    ```bash
    docker logs --tail 50 <CONTAINER_ID>
    ```

### 1.5 更新 TQuant Docker 容器

為確保您使用的 `tquant` 環境是最新版本，請定期更新您的 Docker 容器。這些步驟會停止並刪除現有容器，但由於資料儲存在 `volume` 中，您的資料將不會遺失。

1.  **停止並刪除現有 `tquant` 容器** ：

    ```bash
    docker stop tquant
    docker rm tquant
    ```

2.  **下載最新 `tquant` 映像檔** ：

    ```bash
    docker pull tej87681088/tquant:latest
    ```

3.  **重新啟動容器** ：
    使用建立 `volume` 的方式重新啟動容器。

    ```bash
    docker run -v data:/app -p 8888:8888 --name tquant tej87681088/tquant
    ```

### 1.6 Docker 常見問題排除 (Troubleshooting)

如果您在啟動或使用容器時遇到問題，請參考以下解決方案：

??? failure "問題 1：Error response from daemon: driver failed programming external connectivity..."
    **原因**：這通常表示您設定的 Port (8888) 已經被其他應用程式佔用了。
    
    **解決方法**：
    請修改啟動指令中的 Port 映射，將冒號前的數字改為其他未被使用的 Port (例如 8889)：
    ```bash
    docker run -v data:/app -p 8889:8888 --name tquant tej87681088/tquant
    ```
    啟動後，您的 Jupyter Notebook 網址將變為 `http://127.0.0.1:8889/...`。

??? failure "問題 2：回測執行到一半，核心 (Kernel) 自動重啟或崩潰"
    **原因**：Zipline 進行回測時需要較大的記憶體，若 Docker 分配的記憶體不足 (預設通常為 2GB)，就會導致崩潰。
    
    **解決方法** (針對 Windows/Mac Docker Desktop)：
    1. 開啟 Docker Desktop 的 **Settings** (齒輪圖示)。
    2. 前往 **Resources** > **Advanced** (或 Memory)。
    3. 將 **Memory limit** 拉高至 4GB 或 8GB 以上。
    4. 點擊 **Apply & Restart**。

??? failure "問題 3：Windows 用戶無法掛載 Volume 或權限錯誤"
    **原因**：Windows 檔案系統權限有時會阻止容器寫入資料。
    
    **解決方法**：
    建議在 Powershell 中執行指令，並確保您有管理員權限。若問題持續，請嘗試重新安裝 Docker Desktop 並確保勾選 "Use WSL 2 based engine"。

## 2. 透過 Anaconda Prompt 一鍵安裝 zipline-tej ( **推薦** )

此方式適用於已安裝 Anaconda 的使用者，可透過預設的環境配置文件快速設定好運行環境。

1.  **下載環境配置文件** ：
    根據您的作業系統下載對應的 `yml` 檔案：
    *   [Windows (zipline-tej.yml)](https://minhaskamal.github.io/DownGit/#/home?url=https://github.com/tejtw/zipline-tej/blob/main/zipline-tej.yml) ([Raw 連結](https://raw.githubusercontent.com/tejtw/zipline-tej/main/zipline-tej.yml))
    *   [Mac (zipline-tej_mac.yml)](https://minhaskamal.github.io/DownGit/#/home?url=https://github.com/tejtw/zipline-tej/blob/main/zipline-tej_mac.yml) ([Raw 連結](https://raw.githubusercontent.com/tejtw/zipline-tej/main/zipline-tej_mac.yml))

2.  **建立並啟動虛擬環境** ：
    開啟 **Anaconda Prompt** ，將下載好的 `yml` 檔案放置於任一目錄後，執行以下指令：

    ```bat
    # Windows 使用者
    # 將 zipline-tej.yml 檔案所在的目錄替換到 <C:\Users\username\Downloads>
    cd <C:\Users\username\Downloads>

    # 透過 yml 檔安裝所需套件並創建虛擬環境
    conda env create -f zipline-tej.yml

    # 啟動虛擬環境
    conda activate zipline-tej
    ```

    ```bash
    # Mac 使用者
    # 將 zipline-tej_mac.yml 檔案所在的目錄替換到 /Users/username/Downloads
    cd /Users/username/Downloads

    # 透過 yml 檔安裝所需套件並創建虛擬環境
    conda env create -f zipline-tej_mac.yml

    # 啟動虛擬環境
    conda activate zipline-tej
    ```

    !!! note "為什麼建議使用虛擬環境？"
        使用虛擬環境可以為不同的專案建立獨立的 Python 運行環境，有效避免不同專案間的套件衝突問題。

## 3. 直接透過 pip install 安裝 zipline-tej (可能會有未預期的錯誤)

此方法較不推薦，因為可能會有未預期的套件相依性問題，需自行除錯。

### 3.1 於本機端安裝 zipline-tej

建議在獨立的虛擬環境中進行安裝：

1.  **建立與啟動虛擬環境** ：透過 Anaconda 或 Python 原生 `venv` 建立。

    *   **方法一：Anaconda 指令**
        開啟 Anaconda Prompt：

        ```bash
        # 創建虛擬環境
        conda create -n <env_name> python=3.11

        # 啟動虛擬環境
        conda activate <env_name>
        ```

    *   **方法二：Python 原生指令**
        開啟終端機 (CMD)：

        ```bat
        # 創建虛擬環境
        python -m venv venv

        # 啟動虛擬環境 (Windows)
        venv\Scripts\activate.bat
        ```
        ```bash
        # 或 (macOS/Linux)
        source venv/bin/activate
        ```

2.  **安裝套件** ：

    #### 3.1.1 使用 pip 安裝

    ```bash
    pip install zipline-tej notebook
    ```

    #### 3.1.2 使用 conda 安裝 (針對 Jupyter 核心)

    ```bash
    conda install -c conda-forge nb_conda_kernels
    ```

### 3.2 於 Google Colab 使用 zipline-tej

若在 Google Colab 環境下使用，可直接執行以下指令安裝：

```python
!pip install zipline-tej
```

*   **選用：Colab 字體設定 (針對 Pyfolio 提醒)** ：
    若您在 Colab 中使用 Pyfolio 進行視覺化分析，可能會遇到字體顯示問題。可執行以下指令安裝中文字體以避免警告或亂碼。

    !!! warning "字體來源與授權提醒"
        以下指令會從外部連結下載字體檔案。請注意字體檔案的授權條款，並自行評估使用風險。若有疑慮，建議使用您本地已有的字體或公司內部提供的字體資源。

    ```python
    import matplotlib
    import matplotlib.font_manager as fm
    !wget -O MicrosoftJhengHei.ttf https://github.com/a7532ariel/ms-web/raw/master/Microsoft-JhengHei.ttf
    !wget -O ArialUnicodeMS.ttf https://github.com/texttechnologylab/DHd2019BoA/raw/master/fonts/Arial%20Unicode%20MS.TTF

    fm.fontManager.addfont('MicrosoftJhengHei.ttf')
    matplotlib.rc('font', family='Microsoft Jheng Hei')

    matplotlib.font_manager.fontManager.addfont('ArialUnicodeMS.ttf')
    matplotlib.rc('font', family='Arial Unicode MS')
    ```

## 4. 檢查與更新 TQuant Lab

### 4.1 檢查版本

安裝完成後，您可以使用以下指令檢查 `zipline-tej` 的當前版本：

```sh
!pip show zipline-tej
```

### 4.2 更新至最新版本

為確保您使用的是最新功能與修復，請執行以下指令更新 `zipline-tej`：

```sh
!pip install --upgrade zipline-tej
```

*   **官方版本資訊** ：您可以在 [PyPI - zipline-tej](https://pypi.org/project/zipline-tej/) 頁面查看最新的版本資訊。