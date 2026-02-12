#!/bin/bash

# ASC Lounge Booking System - 자동 배포 스크립트
# Oracle Cloud VPS용

set -e  # 오류 발생 시 스크립트 중단

echo "🚀 ASC Lounge Booking System 배포 시작..."

# 변수 설정
APP_DIR="/home/ubuntu/ASC-lounge-booking-system"
REPO_URL="https://github.com/ianyokoso/ASC-Lounge-Booking-System.git"

# 1. 디렉토리 확인 및 생성
echo "📁 디렉토리 확인 중..."
if [ ! -d "$APP_DIR" ]; then
    echo "📦 저장소 클론 중..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
else
    echo "🔄 기존 코드 업데이트 중..."
    cd $APP_DIR
    git pull origin main
fi

# 2. 의존성 설치
echo "📦 의존성 설치 중..."
npm install --production=false

# 3. Prisma 마이그레이션
echo "🗄️  데이터베이스 마이그레이션 중..."
npx prisma generate
npx prisma migrate deploy

# 4. 프로덕션 빌드
echo "🏗️  프로덕션 빌드 중..."
npm run build

# 5. 로그 디렉토리 생성
mkdir -p logs

# 6. PM2로 애플리케이션 재시작
echo "🔄 PM2로 애플리케이션 재시작 중..."
if pm2 list | grep -q "asc-lounge-booking"; then
    pm2 restart ecosystem.config.js
else
    pm2 start ecosystem.config.js
fi

# 7. PM2 저장 (재부팅 시 자동 시작)
pm2 save

echo "✅ 배포 완료!"
echo "📊 PM2 상태 확인:"
pm2 status
