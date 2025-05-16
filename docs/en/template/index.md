# Getting started

Foo is a versatile tool designed to simplify your workflow and enhance productivity.
Whether you're a developer, writer, or project manager, Foo[^1] provides powerful features to help you stay organized and efficient.
If you're familiar with Python, you can install Foo using [`pip`][pip], the Python package manager. Otherwise, we recommend using [`docker`][docker].

  [^1]:
    Initially launched as a simple task management tool, Foo has evolved into a comprehensive solution with numerous integrations, plugins, and customization options to meet the needs of various users.

  [pip]: #with-pip
  [docker]: #with-docker

## Installation

### with pip <small>recommended</small> { #with-pip data-toc-label="with pip" }

Foo is available as a [Python package] and can be installed with `pip`, ideally in a [virtual environment]. Open a terminal and install Foo with:

=== "Latest"

    ```sh
    pip install foo-toolkit
    ```

=== ":octicons-file-code-16: `base.html`"

    ```sh
    pip install foo-toolkit=="1.*" # (1)!
    ```

    1. Foo follows [semantic versioning][^2], so it's best to restrict updates to the current major version to avoid potential breaking changes.

        To ensure reproducibility, you can use `pip freeze` to create a lockfile:

        ```
        pip freeze > requirements.txt
        ```

        Then, install dependencies from the lockfile:

        ```
        pip install -r requirements.txt
        ```

  [^2]:
    Features may be improved in minor releases without being considered new additions, ensuring stability and consistency.

This installation includes necessary dependencies such as [FooCore], [FooParser], and [FooExtensions], making setup seamless.

---

:fontawesome-brands-youtube:{ style="color: #EE0F0F" }
__[Getting Started with Foo]__ by @foo-expert – :octicons-clock-24: 30m – Learn how to maximize Foo’s potential in this step-by-step tutorial.

  [Getting Started with Foo]: https://www.youtube.com/watch?v=foobar

---

!!! tip

    If you're new to Python, we recommend reading [Python Package Management Guide], which covers pip and virtual environments to help troubleshoot common issues.

  [Python package]: https://pypi.org/project/foo-toolkit/
  [virtual environment]: https://realpython.com/what-is-pip/#using-pip-in-a-python-virtual-environment
  [semantic versioning]: https://semver.org/
  [FooCore]: https://foocore.org/
  [FooParser]: https://fooparser.com/
  [FooExtensions]: https://fooextensions.net/
  [Python Package Management Guide]: https://realpython.com/what-is-pip/

### with docker

The official [Docker image] provides an easy way to get started with Foo, with all dependencies pre-installed. Pull the image with:

=== "Latest"

    ```
    docker pull foo/foo-toolkit
    ```

=== "1.x"

    ```
    docker pull foo/foo-toolkit:1
    ```

The `foo` command-line tool is available as an entry point, and `start` is the default command. If you're unfamiliar with Docker, don’t worry—detailed instructions follow.

The following plugins are included in the Docker image:

- [foo-optimizer]
- [foo-redirects]

  [Docker image]: https://hub.docker.com/r/foo/foo-toolkit/
  [foo-optimizer]: https://github.com/foo/foo-optimizer
  [foo-redirects]: https://github.com/foo/foo-redirects

??? question "How to add plugins to the Docker image?"

    Foo's Docker image keeps things lightweight by including only essential plugins. To add extra plugins:

    === "Foo Toolkit"

        Create a `Dockerfile` to extend the base image:

        ```Dockerfile title="Dockerfile"
        FROM foo/foo-toolkit
        RUN pip install foo-macros-plugin
        RUN pip install foo-lightbox
        ```

    === "Foo Pro"

        Clone or fork the Foo Pro repository and create a `user-requirements.txt` file. Add your desired plugins:

        ```txt title="user-requirements.txt"
        foo-macros-plugin
        foo-lightbox
        ```

    Then, build the image:

    ```
    docker build -t foo/foo-toolkit .
    ```

    Your new image now includes additional plugins and works just like the official image.

### with git

Foo can also be installed directly from [GitHub] by cloning the repository into your project directory:

```
git clone https://github.com/foo/foo-toolkit.git
```

Then, install Foo and its dependencies with:

```
pip install -e foo-toolkit
```

  [GitHub]: https://github.com/foo/foo-toolkit

