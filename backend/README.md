# SBoard 后端应用程序

SBoard 后端是基于 Laravel 框架构建的 RESTful API 服务，负责处理用户认证、数据管理、业务逻辑等核心功能。

## 目录

- [先决条件](#先决条件)
- [安装](#安装)
- [配置](#配置)
- [数据库设置](#数据库设置)
- [运行应用程序](#运行应用程序)
- [默认管理员凭据](#默认管理员凭据)

## 先决条件

在启动 SBoard 后端之前，请确保您的系统已安装以下软件：

- PHP >= 8.2
- Composer
- Node.js (用于前端资产编译，如果需要)
- SQLite (或您在 `.env` 文件中配置的任何其他数据库)

## 安装

1.  **克隆仓库 (如果尚未克隆):**
    ```bash
    git clone [您的仓库URL] sboard
    cd sboard/backend
    ```

2.  **安装 Composer 依赖:**
    ```bash
    composer install
    ```

3.  **生成应用程序密钥:**
    ```bash
    php artisan key:generate
    ```

## 配置

1.  **复制 `.env.example` 文件:**
    ```bash
    cp .env.example .env
    ```
    这将创建一个 `.env` 文件，您可以在其中配置应用程序的环境变量。

2.  **编辑 `.env` 文件:**
    打开 `.env` 文件，并根据您的环境进行调整。以下是一些重要的配置项：

    ```dotenv
    APP_NAME=Laravel
    APP_ENV=local
    APP_KEY= # 在运行 php artisan key:generate 后会自动填充
    APP_DEBUG=true
    APP_URL=http://localhost:8000 # 根据您的后端运行端口调整

    DB_CONNECTION=sqlite
    # 如果使用 SQLite，确保以下行被注释掉或删除
    # DB_HOST=127.0.0.1
    # DB_PORT=3306
    # DB_DATABASE=laravel
    # DB_USERNAME=root
    # DB_PASSWORD=

    # JWT Secret (如果使用 JWT 认证)
    JWT_SECRET= # 确保这里有一个长而随机的字符串，可以通过 php artisan jwt:secret 生成
    ```

## 数据库设置

SBoard 后端默认使用 SQLite 数据库。

1.  **创建 SQLite 数据库文件:**
    ```bash
    touch database/database.sqlite
    ```

2.  **运行数据库迁移:**
    这将创建所有必要的数据库表。
    ```bash
    php artisan migrate
    ```

3.  **填充数据库 (可选，但推荐用于开发):**
    这将创建默认的用户、角色等数据。
    ```bash
    php artisan db:seed
    ```

## 运行应用程序

在完成上述安装和配置步骤后，您可以通过以下命令启动 Laravel 开发服务器：

```bash
php artisan serve
```
应用程序将在 `http://localhost:8000` (或您在 `.env` 中配置的 `APP_URL` 和端口) 上运行。

## 默认管理员凭据

如果您运行了 `php artisan db:seed` 命令，系统将创建一个默认的管理员用户，其凭据如下：

-   **邮箱 (Email):** `admin@example.com`
-   **密码 (Password):** `password`

**重要提示:** 在生产环境中，请务必更改此默认密码以确保应用程序的安全性。
