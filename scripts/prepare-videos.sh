#!/usr/bin/env bash
# Подготовка роликов для сайта: сжатие H.264, постер, беззвучное превью.
# Запуск (Git Bash):  bash scripts/prepare-videos.sh "<папка с исходниками>"
# Исходники называются как угодно — соответствие задаётся в списке ниже.
set -euo pipefail
SRC="${1:-raw}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/apps/web/public/videos"
DEMO="$ROOT/apps/miniapp/public/demo"
mkdir -p "$OUT" "$DEMO"

# "исходник|имя на сайте"
LIST=(
  "БрендОдежды.mp4|01-clothing"
  "ВИДЕОВРАЧИ.mp4|02-dentist"
  "ВРАЧ2.mp4|03-doctor"
  "ВИДОС РИЕЛТОР1.mp4|04-realty"
  "БрендОдежды2.mp4|05-streetwear"
)

for item in "${LIST[@]}"; do
  in="$SRC/${item%%|*}"; name="${item##*|}"
  [ -f "$in" ] || { echo "нет файла: $in"; continue; }
  echo "== $name"
  # 1. ролик для веба
  ffmpeg -v error -y -i "$in" -vf "scale='min(720,iw)':-2" -c:v libx264 -preset slow -crf 26 \
    -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "$OUT/$name.mp4"
  # 2. постер — кадр на 1-й секунде
  ffmpeg -v error -y -ss 1 -i "$in" -frames:v 1 -vf "scale=720:-2" -q:v 4 "$OUT/$name.jpg"
  # 3. превью без звука, 6 секунд
  ffmpeg -v error -y -ss 1 -t 6 -i "$in" -vf "scale=480:-2" -c:v libx264 -preset slow -crf 28 \
    -pix_fmt yuv420p -an -movflags +faststart "$OUT/$name-preview.mp4"
done

# демо-ролики для Mini App (короткие, лёгкие)
for name in 01-clothing 02-dentist 04-realty; do
  cp "$OUT/$name-preview.mp4" "$DEMO/$name.mp4"
  ffmpeg -v error -y -i "$OUT/$name.jpg" -vf "scale=360:-2" -q:v 5 "$DEMO/$name.jpg"
done
ls -la "$OUT" "$DEMO"
