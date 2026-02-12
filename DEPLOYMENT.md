# ASC Lounge Booking System - 서버 설정 가이드

## 1. 서버 초기 설정

### SSH 접속
```bash
ssh ubuntu@YOUR_SERVER_IP
# 또는
ssh -i /path/to/your-key.pem ubuntu@YOUR_SERVER_IP
```

### 시스템 업데이트
```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Node.js 설치

```bash
# Node.js 20.x LTS 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 버전 확인
node --version
npm --version
```

## 3. PM2 설치

```bash
sudo npm install -g pm2

# PM2 버전 확인
pm2 --version
```

## 4. Nginx 설치

```bash
sudo apt install -y nginx

# Nginx 시작 및 자동 시작 설정
sudo systemctl start nginx
sudo systemctl enable nginx

# 상태 확인
sudo systemctl status nginx
```

## 5. 방화벽 설정

```bash
# 방화벽 활성화
sudo ufw enable

# 필요한 포트 열기
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS (SSL 사용 시)
sudo ufw allow 3002    # Next.js (선택사항)

# 방화벽 상태 확인
sudo ufw status
```

## 6. 애플리케이션 배포

### 저장소 클론 및 배포
```bash
# 홈 디렉토리로 이동
cd ~

# 저장소 클론
git clone https://github.com/ianyokoso/ASC-Lounge-Booking-System.git
cd ASC-lounge-booking-system

# 환경 변수 설정
nano .env
# 다음 내용 입력:
# DATABASE_URL="file:./dev.db"
# DISCORD_WEBHOOK_URL="your-webhook-url"

# 배포 스크립트 실행 권한 부여
chmod +x deploy.sh

# 배포 실행
./deploy.sh
```

## 7. Nginx 설정

```bash
# Nginx 설정 파일 복사
sudo cp nginx.conf /etc/nginx/sites-available/asc-lounge-booking

# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/asc-lounge-booking /etc/nginx/sites-enabled/

# 기본 사이트 비활성화 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

## 8. PM2 자동 시작 설정

```bash
# PM2 startup 스크립트 생성
pm2 startup

# 위 명령어가 출력하는 명령어를 복사하여 실행
# 예: sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# 현재 PM2 프로세스 저장
pm2 save
```

## 9. 배포 확인

```bash
# PM2 상태 확인
pm2 status

# 로그 확인
pm2 logs asc-lounge-booking

# 애플리케이션 접속
curl http://localhost:3002
# 또는 브라우저에서 http://YOUR_SERVER_IP
```

## 10. 업데이트 배포

```bash
cd ~/ASC-lounge-booking-system
./deploy.sh
```

## 트러블슈팅

### PM2 프로세스 재시작
```bash
pm2 restart asc-lounge-booking
```

### PM2 로그 확인
```bash
pm2 logs asc-lounge-booking --lines 100
```

### Nginx 로그 확인
```bash
sudo tail -f /var/log/nginx/asc-lounge-booking-error.log
sudo tail -f /var/log/nginx/asc-lounge-booking-access.log
```

### 데이터베이스 초기화
```bash
cd ~/ASC-lounge-booking-system
rm dev.db
npx prisma migrate deploy
pm2 restart asc-lounge-booking
```
