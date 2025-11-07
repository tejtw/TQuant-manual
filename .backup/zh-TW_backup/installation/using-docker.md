# 使用 Docker 安裝 TQuant Lab

本頁說明如何使用 Docker 安裝 TQuant Lab。

## 安裝 Docker

首先，請根據您的作業系統下載並安裝 Docker / Docker Desktop：

- 環境為 [Mac][Mac]。
- 環境為 [Windows][windows]。
- 環境為 [Linux][linux]。

  [mac]: https://docs.docker.com/docker-for-mac/install/
  [windows]: https://docs.docker.com/docker-for-windows/install/
  [linux]: https://docs.docker.com/engine/install/ubuntu//

!!! warning "重新啟動您的電腦"
    如果您剛在 Windows 系統上安裝了 Docker，請記得重新啟動電腦，否則可能會遇到容器網路連線方面的異常問題。


## 安裝 TQuant Lab

TEJ 提供了官方的 `tquantlab` Docker 映像檔，您可以從 [Docker Hub] 下載並運行 `tquant` 容器，同時建立 `volume` 來共享數據。使用以下指令：

  [Docker Hub]: https://hub.docker.com/r/tej87681088/tquant/tags


1. 下載 tquant 最新映像檔。
```sh
docker pull tej87681088/tquant:latest
```
2. 建立 Volume（資料存儲空間）。
```sh
docker volume create data
```
3. 啟動 tquant 容器，掛載 volume 並開放 8888 埠。
```sh
docker run -v data:/app -p 8888:8888 --name tquant tej87681088/tquant
```

以上指令用於下載並運行 `tquant` 容器，並建立 `volume` 共享數據。

首先，透過 `docker pull`
下載最新映像檔，接著使用 `docker volume create` 建立名為 `data` 的存儲空間，最後透過 `docker run` 啟動容器，將 `volume`
掛載至 `/app`，並將本機的 8888 埠對應至容器內部的 8888 埠，以便存取服務。

!!! tip "補充說明"

    1. `volume` 位置（Windows 10 WSL 環境）通常位於：
      ```
      \wsl$\docker-desktop-data\data\docker\volumes\data\_data
      ```
    2. 若不保留容器，可加 `--rm` 參數，如下方指令：
      ```sh
      docker run --rm -v data:/app -p 8888:8888 --name tquant tej87681088/tquant
      ```

## 使用 Jupyter Notebook 來執行

啟動容器後，可在瀏覽器中輸入以下網址，開始使用 Jupyter Notebook：

```sh
http://127.0.0.1:8888/tree?token=XXXXXXXXXXXXXXXX
```

## 操作已關閉的 Container

若需操作已創建但已關閉的 Container，可依照以下步驟進行：

1. 列出所有 Container。（包括已停止的）
```sh
docker ps -a  
```
2. 啟動指定的 Container，將 <CONTAINER_ID> 替換為實際的 Container ID。
```sh
docker start <CONTAINER_ID> 
```
3. 查看指定 Container 的最近日誌，顯示最後 50 行輸出。
```sh
docker logs --tail 50 <CONTAINER_ID>
```


## 更新 tquant Docker 容器

若您需要更新 `tquant` Docker 容器至最新版本，可以按照以下步驟操作。

!!! note 
    這些步驟會停止並刪除現有的容器，但由於使用了 `volume`，資料會保留在本機並不會丟失。


1. 停止並刪除現有的 **tquant** 容器。
```sh
docker stop tquant  
docker rm tquant
```
2. 下載最新的 **tquant** 映像檔。
```sh
docker pull tej87681088/tquant:latest  
```
3. 重新啟動容器，並掛載資料到 volume。
```sh
docker run -v data:/app -p 8888:8888 --name tquant tej87681088/tquant
```

這些步驟會更新 tquant Docker 容器並保留資料，確保您使用的是最新版本的映像檔。

## 檢查更新 <small>zipline-tej</small> { #upgrade data-toc-label="檢查更新" }

查看更新日誌（Changelog），在進行更新後，請務必 [檢查更新日誌]，以確保是否有重大變更心或需要手動操作的情況，並確認容器在更新後能正常啟動。

  [檢查更新日誌]: https://github.com/tejtw/zipline-tej/releases/tag/2.1.0
