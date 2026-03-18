# IYI Network BF1 - Hetzner Deployment Rehberi

Bu rehber, IYI Network Battlefield 1 Topluluk Portalı'nı Hetzner Cloud sunucusuna nasıl deploy edeceğinizi adım adım açıklar.

---

## Ön Gereksinimler

Hetzner Cloud üzerinde en az **CX21** (2 vCPU, 4 GB RAM) veya üzeri bir sunucu önerilir. İşletim sistemi olarak **Ubuntu 22.04 LTS** kullanılmalıdır.

---

## 1. Sunucu Hazırlığı

```bash
# Sistemi güncelle
sudo apt update && sudo apt upgrade -y

# Node.js 22 LTS kur
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm kur
npm install -g pnpm

# PM2 process manager kur
npm install -g pm2

# Nginx kur
sudo apt install -y nginx certbot python3-certbot-nginx

# Git kur
sudo apt install -y git
```

---

## 2. Proje Kurulumu

```bash
# Proje dizini oluştur
mkdir -p /var/www/iyi-network
cd /var/www/iyi-network

# Kodu klonla (GitHub'a push ettikten sonra)
git clone https://github.com/KULLANICI_ADI/iyi-network-bf1.git .

# Bağımlılıkları yükle
pnpm install

# Production build al
pnpm build
```

---

## 3. Ortam Değişkenleri

```bash
# .env dosyası oluştur
cat > /var/www/iyi-network/.env << 'EOF'
NODE_ENV=production
PORT=3000

# Veritabanı (TiDB Cloud veya MySQL)
DATABASE_URL=mysql://kullanici:sifre@host:4000/veritabani?ssl={"rejectUnauthorized":true}

# JWT Secret (güçlü rastgele string)
JWT_SECRET=BURAYA_GUCLU_BIR_SECRET_YAZIN

# Manus OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# Discord Webhook
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXXX/YYYY

# Stripe (opsiyonel)
STRIPE_SECRET_KEY=sk_live_XXXX
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_XXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXX

# S3 Depolama (dosya yükleme için)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=eu-central-1
AWS_BUCKET_NAME=iyi-network-uploads
EOF

chmod 600 /var/www/iyi-network/.env
```

---

## 4. PM2 ile Uygulama Başlatma

```bash
# PM2 ecosystem dosyası oluştur
cat > /var/www/iyi-network/ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'iyi-network-bf1',
    script: 'dist/index.js',
    cwd: '/var/www/iyi-network',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env'
  }]
};
EOF

# Uygulamayı başlat
pm2 start ecosystem.config.cjs

# PM2'yi sistem başlangıcına ekle
pm2 startup
pm2 save
```

---

## 5. Nginx Reverse Proxy Yapılandırması

```bash
# Nginx config dosyası oluştur
sudo cat > /etc/nginx/sites-available/iyi-network << 'EOF'
server {
    listen 80;
    server_name iyi-network.com www.iyi-network.com;

    # Dosya yükleme limiti
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Stripe webhook için özel ayar
    location /api/stripe/webhook {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Siteyi etkinleştir
sudo ln -s /etc/nginx/sites-available/iyi-network /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. SSL Sertifikası (Let's Encrypt)

```bash
# Certbot ile SSL kur
sudo certbot --nginx -d iyi-network.com -d www.iyi-network.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

---

## 7. Güvenlik Duvarı (UFW)

```bash
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 8. Veritabanı Kurulumu

Proje **TiDB Cloud** (MySQL uyumlu) kullanmaktadır. Alternatif olarak kendi MySQL sunucunuzu kurabilirsiniz:

```bash
# MySQL kur
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Veritabanı ve kullanıcı oluştur
sudo mysql << 'EOF'
CREATE DATABASE iyi_network_bf1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'iyi_network'@'localhost' IDENTIFIED BY 'GUCLU_SIFRE';
GRANT ALL PRIVILEGES ON iyi_network_bf1.* TO 'iyi_network'@'localhost';
FLUSH PRIVILEGES;
EOF
```

Ardından migration'ları uygulayın:

```bash
cd /var/www/iyi-network
pnpm drizzle-kit migrate
```

---

## 9. Güncelleme Prosedürü

```bash
cd /var/www/iyi-network
git pull origin main
pnpm install
pnpm build
pm2 restart iyi-network-bf1
```

---

## 10. İzleme ve Loglar

```bash
# PM2 loglarını görüntüle
pm2 logs iyi-network-bf1

# PM2 dashboard
pm2 monit

# Nginx logları
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Önerilen Hetzner Sunucu Planları

| Plan | vCPU | RAM | Disk | Aylık Fiyat | Önerilen Kullanım |
|------|------|-----|------|-------------|-------------------|
| CX21 | 2 | 4 GB | 40 GB | ~€4.35 | Geliştirme/Test |
| CX31 | 2 | 8 GB | 80 GB | ~€8.21 | Küçük topluluk |
| CX41 | 4 | 16 GB | 160 GB | ~€15.90 | Orta büyüklük |
| CX51 | 8 | 32 GB | 240 GB | ~€30.98 | Büyük topluluk |

---

## Notlar

- **Stripe Webhook:** Stripe Dashboard'dan webhook URL'ini `https://iyi-network.com/api/stripe/webhook` olarak ayarlayın.
- **Discord Webhook:** Discord sunucunuzdan webhook URL'ini alıp `.env` dosyasına ekleyin.
- **Gametools API:** Ücretsiz kullanım limitleri vardır; yoğun kullanımda rate limiting ile karşılaşabilirsiniz.
- **Dosya Yükleme:** S3 uyumlu bir depolama servisi (AWS S3, Hetzner Object Storage, Cloudflare R2) kullanmanız önerilir.
