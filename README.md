# Play_now

Cтриминговый сервис для меломанов

---

### Установка

-   клонирование репозитория:

```bash
git clone https://github.com/danil-baybakov/play-now.git
```

-   запуск сервера:
    1.  перейти в директорию сервера
        ```bash
        cd ./server
        ```
    2.  выполнить установку зависимостей
        ```bash
        npm install
        ```
    3.  выполнить миграцию БД
        ```bash
        npm run migration
        ```
    4.  запуск сервера
        ```bash
        npm run start
        ```
-   запуск клиента:
    1. перейти в директорию клиента
    ```bash
    cd ./client
    ```
    2.  выполнить установку зависимостей
        ```bash
        npm install
        ```
    3.  запуск клиента
        ```bash
        npm run serve
        ```
