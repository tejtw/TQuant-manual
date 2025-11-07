# TQuant Lab 安裝教學

## 使用的套件與環境

- **Main package**：Zipline
- **支援 Python 版本**：Python 3.8 ~ 3.11（**建議使用 Python 3.11**）
- **支援作業系統**：Windows OS 或 macOS
- **建議 Pandas 版本**：1.5.3 或 2.0.0（高於 2.0.0 可能會有未預期錯誤）
- **建議 Numpy 版本**：1.23.5（高於 1.23.5 可能會有未預期錯誤）

---

## 安裝方式（擇一即可，**推薦使用方法 A 或 B**）

## A. 透過 Docker 安裝 zipline-tej（**推薦**）

## 先決條件
- 已安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## 方法一：使用本地 Dockerfile 建構
```bash
# 下載 tquant_jupyter（適用 Jupyter 使用）
# 下載 tquant_bash（適用排程使用）

# 進入 Dockerfile 所在目錄
cd <path_to_dockerfile>

# 建立映像檔
docker build -f tquant_jupyter . -t "tquant:latest"
```

## (方法二) 直接從 Docker Hub 下載（推薦）

## 1. 從 Docker Hub 下載映像檔
於終端機輸入以下指令：
```bash
docker pull tej87681088/tquant:latest
```
## 2. 建立一個 volume 以傳輸資料
於終端機輸入以下指令：
```bash
docker volume create data
```
## 3. 透過 Image 建立 Container 並啟動
若透過方法一（Dockerfile）下載：
```bash
docker run -v data:/app -p 8888:8888 --name tquant tquant
```
若透過方法二（Docker Hub）下載：
```bash
docker run -v data:/app -p 8888:8888 --name tquant tej87681088/tquant
```
此命令將：

* 啟動一個 container
* 將 container 內的 8888 埠 映射至本機的 8888 埠
* 利用 volume data 與本機進行資料交換

若不希望保留 container，請加上 `--rm` 參數：
```bash
docker run --rm -v data:/app -p 8888:8888 --name tquant tej87681088/tquant
```
## 4. 開始使用 Jupyter
啟動後，終端機會顯示類似下列網址：

```arduino
http://127.0.0.1:8888/tree?token=XXXXXXXXXXXXXXXX
```
複製並貼上至瀏覽器，即可開啟 Jupyter Notebook 使用介面。
## Appendix
若想使用之前已創建過的但關閉的container操作，可透過以下指令取得網址
```bash
# 查看所有 Container（包含關閉的）
docker ps -a

# 啟動指定 Container
docker start <CONTAINER_ID>

# 查看 Container 終端機最近的輸出（含 Jupyter token）
docker logs --tail 3 <CONTAINER_ID>
```


## B. 透過 Anaconda Prompt 一鍵安裝 zipline-tej（推薦）

## 1. 下載套件設定檔
請先下載以下對應作業系統的安裝設定檔（`.yml` 檔案）：

- [Windows 版本：zipline-tej.yml](#)
- [Mac 版本：zipline-tej_mac.yml](#)

> ⚠️ **我們強烈推薦使用虛擬環境**，以保持每個專案的獨立性並避免套件版本衝突。

---

## 2. 使用者操作說明

##  Windows 使用者
```bash
# 將下載好的 zipline-tej.yml 檔案放到下載資料夾後，開啟 Anaconda Prompt 並執行：

cd C:\Users\<your_username>\Downloads

# 透過 yml 檔創建虛擬環境並安裝套件
conda env create -f zipline-tej.yml

# 啟用虛擬環境
conda activate zipline-tej
```

##  macOS 使用者
```bash
# 將下載好的 zipline-tej_mac.yml 檔案放到下載資料夾後，開啟終端機並執行：

cd /Users/<your_username>/Downloads

# 透過 yml 檔創建虛擬環境
conda env create -f zipline-tej_mac.yml

# 啟用虛擬環境
conda activate zipline-tej
```
至此，便可開始使用zipline-tej。

## C. 直接透過 pip install 安裝 zipline-tej（⚠️ 可能需自行除錯）

> **⚠️ 警告：此方式安裝 zipline-tej 可能會出現未預期錯誤，建議進階使用者採用。**

---

## 💡 建議使用 Anaconda 建立虛擬環境

為避免套件版本衝突，建議先建立虛擬環境後再安裝 zipline-tej。以下提供兩種建立方式（擇一即可）：

---

## 方法一：使用 Anaconda 指令（推薦）
於 Anaconda Prompt 執行以下指令：

```bash
# 建立虛擬環境（Python 3.11）
$ conda create -n <env_name> python=3.11
    
# activate virtual env
$ conda activate <env_name>

# download packages
$ pip install zipline-tej
$ pip install notebook
$ conda install -c conda-forge nb_conda_kernels
```

## 方法二：透過Python原生指令
於 CMD 執行以下指令：

```bash
# create virtual env
$ python -m venv venv

# activate virtual env
$ venv\Scripts\activate.bat
# download packages
$ pip install zipline-tej
$ pip install notebook
```

## 於 google colab 使用 zipline-tej
若您使用 google colab，可以直接執行以下程式碼，下載 zipline-tej
```python
!pip install zipline-tej
```
若有使用Pyfolio，可以一併執行下列指令避免出現 Warning
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

