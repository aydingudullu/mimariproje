# Mimariproje.com - Development Setup Scripts

## Proje Kurulum Rehberi

Bu doküman, Mimariproje.com projesinin development environment'ını kurmak için gerekli adımları içermektedir.

## Gereksinimler

### Sistem Gereksinimleri

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Git
- Docker (opsiyonel)

### IDE/Editor

- VS Code (önerilen)
- Cursor (önerilen)
- WebStorm

## Kurulum Adımları

### 1. Repository Clone

```bash
git clone <repository-url>
cd mp-project
```

### 2. Backend Kurulumu

#### PostgreSQL Kurulumu

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql

# Windows
# PostgreSQL installer'ı indirin: https://www.postgresql.org/download/windows/
```

#### PostgreSQL Veritabanı Oluşturma

```bash
# PostgreSQL'e bağlan
sudo -u postgres psql

# Veritabanı oluştur
CREATE DATABASE mimariproje;
CREATE USER mimariproje_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mimariproje TO mimariproje_user;
\q
```

#### Python Environment Kurulumu

```bash
cd mimariproje-backend

# Virtual environment oluştur
python -m venv venv

# Virtual environment'ı aktifleştir
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Dependencies yükle
pip install -r requirements.txt

# Ek dependencies
pip install psycopg2-binary
pip install python-dotenv
pip install flask-jwt-extended
pip install flask-mail
pip install flask-cors
pip install werkzeug
pip install bcrypt
```

#### Environment Variables (.env)

```bash
# mimariproje-backend/.env dosyası oluştur
DATABASE_URL=postgresql://mimariproje_user:your_password@localhost/mimariproje
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ACCESS_TOKEN_EXPIRES=15m
JWT_REFRESH_TOKEN_EXPIRES=7d
EMAIL_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FLASK_ENV=development
FLASK_DEBUG=True
```

### 3. Frontend Kurulumu

#### Node.js Dependencies

```bash
cd project

# Dependencies yükle
npm install

# Development server başlat
npm run dev
```

#### Environment Variables (.env.local)

```bash
# project/.env.local dosyası oluştur
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws
NEXT_PUBLIC_APP_NAME=Mimariproje.com
```

### 4. Database Migration

#### Migration Script

```python
# mimariproje-backend/migrate_sqlite_to_postgres.py
import sqlite3
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def migrate_sqlite_to_postgres():
    # SQLite bağlantısı
    sqlite_conn = sqlite3.connect('src/database/app.db')
    sqlite_cursor = sqlite_conn.cursor()

    # PostgreSQL bağlantısı
    pg_conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    pg_cursor = pg_conn.cursor()

    # Tabloları migrate et
    tables = ['users', 'projects', 'jobs', 'messages']

    for table in tables:
        # SQLite'dan veri oku
        sqlite_cursor.execute(f'SELECT * FROM {table}')
        rows = sqlite_cursor.fetchall()

        # PostgreSQL'e yaz
        for row in rows:
            # Her tablo için özel insert logic'i
            pass

    sqlite_conn.close()
    pg_conn.close()

if __name__ == '__main__':
    migrate_sqlite_to_postgres()
```

### 5. Development Scripts

#### Backend Development

```bash
# mimariproje-backend/run_dev.sh
#!/bin/bash
export FLASK_APP=src/main.py
export FLASK_ENV=development
export FLASK_DEBUG=True

# Virtual environment'ı aktifleştir
source venv/bin/activate

# Development server'ı başlat
flask run --host=0.0.0.0 --port=5000
```

#### Frontend Development

```bash
# project/run_dev.sh
#!/bin/bash
npm run dev
```

### 6. Docker Setup (Opsiyonel)

#### Dockerfile (Backend)

```dockerfile
# mimariproje-backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "src/main.py"]
```

#### Dockerfile (Frontend)

```dockerfile
# project/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: mimariproje
      POSTGRES_USER: mimariproje_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./mimariproje-backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://mimariproje_user:your_password@postgres/mimariproje
    depends_on:
      - postgres

  frontend:
    build: ./project
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

## Development Workflow

### 1. Günlük Development

```bash
# Terminal 1: Backend
cd mimariproje-backend
source venv/bin/activate
flask run

# Terminal 2: Frontend
cd project
npm run dev

# Terminal 3: Database (gerekirse)
sudo -u postgres psql -d mimariproje
```

### 2. Code Quality

```bash
# Backend linting
cd mimariproje-backend
flake8 src/
black src/
isort src/

# Frontend linting
cd project
npm run lint
npm run format
```

### 3. Testing

```bash
# Backend tests
cd mimariproje-backend
python -m pytest tests/

# Frontend tests
cd project
npm run test
npm run test:e2e
```

### 4. Database Management

```bash
# Migration oluştur
cd mimariproje-backend
flask db migrate -m "Initial migration"

# Migration uygula
flask db upgrade

# Seed data
python scripts/seed_data.py
```

## Troubleshooting

### PostgreSQL Bağlantı Sorunları

```bash
# PostgreSQL servisini kontrol et
sudo systemctl status postgresql

# PostgreSQL servisini başlat
sudo systemctl start postgresql

# Bağlantıyı test et
psql -h localhost -U mimariproje_user -d mimariproje
```

### Python Environment Sorunları

```bash
# Virtual environment'ı yeniden oluştur
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Node.js Sorunları

```bash
# node_modules'ı temizle
rm -rf node_modules package-lock.json
npm install

# Cache'i temizle
npm cache clean --force
```

### Port Çakışması

```bash
# Port kullanımını kontrol et
lsof -i :5000
lsof -i :3000
lsof -i :5432

# Process'i sonlandır
kill -9 <PID>
```

## Production Setup

### Environment Variables

```bash
# Production .env
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET_KEY=production-secret-key
FLASK_ENV=production
FLASK_DEBUG=False
```

### SSL Certificate

```bash
# Let's Encrypt ile SSL
sudo certbot --nginx -d mimariproje.com
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/mimariproje.com
server {
    listen 80;
    server_name mimariproje.com www.mimariproje.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name mimariproje.com www.mimariproje.com;

    ssl_certificate /etc/letsencrypt/live/mimariproje.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mimariproje.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring ve Logging

### Application Logs

```bash
# Backend logs
tail -f mimariproje-backend/logs/app.log

# Frontend logs
tail -f project/.next/logs/next.log
```

### Database Logs

```bash
# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### System Monitoring

```bash
# System resources
htop
df -h
free -h

# Network connections
netstat -tulpn
```

Bu setup rehberi, Mimariproje.com projesinin development environment'ını kurmak için gerekli tüm adımları içermektedir. Her adım, projenin başarılı bir şekilde çalışması için kritik öneme sahiptir.
