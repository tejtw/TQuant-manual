# Install TQuant Lab using Docker

This page explains how to install TQuant Lab using Docker.

## Install Docker

First, download and install Docker / Docker Desktop according to your operating system:

- For [Mac][Mac].
- For [Windows][windows].
- For [Linux][linux].

  [mac]: https://docs.docker.com/docker-for-mac/install/
  [windows]: https://docs.docker.com/docker-for-windows/install/
  [linux]: https://docs.docker.com/engine/install/ubuntu//

!!! warning "Restart Your Computer"
    If you have just installed Docker on Windows, remember to restart your computer, as otherwise, you may encounter issues with container network connections.

## Install TQuant Lab

TEJ provides the official tquantlab Docker image, which you can download and run from [Docker Hub] and create a volume to share data. Use the following commands:

  [Docker Hub]: https://hub.docker.com/r/tej87681088/tquant/tags

To install TQuant Lab, run the following commands:


1. Download the latest tquant image.
```sh
docker pull tej87681088/tquant:latest
```
2. Create a Volume (data storage space).
```sh
docker volume create data
```
3. Start the tquant container, mount the volume, and open port 8888.
```sh
docker run -v data:/app -p 8888:8888 --name tquant tej87681088/tquant
```

The above commands are used to download and run the `tquant` container and create a `volume` to share data.

First, download the latest image via `docker pull`
, then use `docker volume create` to create a storage space called `data`, and finally run the container via `docker run` to mount the volume to `/app` and map the local port 8888 to the container's internal port 8888 for accessing services.

!!! tip "Additional Information"

    1. The `volume` location (in the Windows 10 WSL environment) is usually located at:
        ```
        \wsl$\docker-desktop-data\data\docker\volumes\data_data
        ```

    2. If you don't need to keep the container, you can add the `--rm` parameter as shown in the command below:
        ```sh
        docker run --rm -v data:/app -p 8888:8888 --name tquant tej87681088/tquant
        ```

## Use Jupyter Notebook to run

After launching the container, you can start using Jupyter Notebook by typing the following URL in your browser:

```sh
http://127.0.0.1:8888/tree?token=XXXXXXXXXXXXXXXX
```

## Manipulating a Closed Container

To operate a created but closed Container, follow the steps below:

1. List all Container. (including stopped ones)
```sh
docker ps -a  
```
2. Starts the specified Container, replacing <CONTAINER_ID> with the actual Container ID.
```sh
docker start <CONTAINER_ID> 
```
3. View the recent logs for the specified Container, showing the last 50 rows of output.
```sh
docker logs --tail 50 <CONTAINER_ID>
```

##  Updating the tquant Docker container

If you need to update the `tquant` Docker container to the latest version, you can follow the steps below.

!!! note 
    These steps will stop and delete the existing container, but since `volume` is used, the data will be retained locally and not lost.


1. Stop and delete existing **tquant** containers.
```sh
docker stop tquant  
docker rm tquant
```
2. Download the latest **tquant** image file.
```sh
docker pull tej87681088/tquant:latest  
```
3. Restart the container and mount the data to volume.
```sh
docker run -v data:/app -p 8888:8888 --name tquant tej87681088/tquant
```

These steps update the tquant Docker container and preserve the data, ensuring that you are using the latest version of the image file.

## Check for updates <small>zipline-tej</small>

Check the update log (Changelog), and be sure to [check the update log] after performing an update to ensure that there are no major changes or manual operations required and that the container boots up properly after the update.

  [check the update log]: https://github.com/tejtw/zipline-tej/releases/tag/2.1.0
