#!/bin/bash

# 进入后端目录
cd "$(dirname "$0")"

echo "--- 检查并安装 Composer 依赖 ---"
composer install

echo "--- 检查 .env 文件 ---"
if [ ! -f .env ]; then
    echo "复制 .env.example 到 .env"
    cp .env.example .env
fi

echo "--- 生成应用程序密钥 ---"
php artisan key:generate --ansi

echo "--- 创建 SQLite 数据库文件 (如果不存在) ---"
touch database/database.sqlite

echo "--- 运行数据库迁移 ---"
php artisan migrate

echo "--- 填充数据库 ---"
php artisan db:seed

echo "--- 清除并缓存配置 ---"
php artisan config:clear
php artisan cache:clear
php artisan config:cache

echo "--- 启动 Laravel 开发服务器 ---"
php artisan serve