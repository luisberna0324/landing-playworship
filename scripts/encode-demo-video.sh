#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Uso: $0 VIDEO_ORIGINAL [VIDEO_WEB.mp4]" >&2
  exit 2
fi

for command in ffmpeg ffprobe; do
  command -v "$command" >/dev/null || { echo "Falta $command" >&2; exit 1; }
done

input="$1"
[[ -f "$input" ]] || { echo "No existe el video: $input" >&2; exit 1; }

output="${2:-${input%.*}-web.mp4}"
[[ "$output" == *.mp4 ]] || { echo "La salida debe terminar en .mp4" >&2; exit 2; }
poster="${output%.mp4}-poster.jpg"
[[ "$input" != "$output" ]] || { echo "La salida no puede ser el archivo original" >&2; exit 2; }
[[ ! -e "$output" && ! -e "$poster" ]] || {
  echo "La salida o el poster ya existe; no se sobrescribira" >&2
  exit 1
}

output_dir="$(dirname "$output")"
[[ -d "$output_dir" ]] || { echo "No existe el directorio: $output_dir" >&2; exit 1; }
temporary_dir="$(mktemp -d "$output_dir/.encode-video.XXXXXX")"
temporary_video="$temporary_dir/video.mp4"
temporary_poster="$temporary_dir/poster.jpg"
trap 'rm -f "$temporary_video" "$temporary_poster"; rmdir "$temporary_dir"' EXIT

ffmpeg -hide_banner -loglevel error -y -i "$input" \
  -vf "fps=24,scale='trunc(min(iw,1280)/2)*2':-2:flags=lanczos" \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
  -movflags +faststart -an "$temporary_video"

duration="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$temporary_video")"
poster_second="$(awk -v duration="$duration" 'BEGIN { if (duration < 6) printf "%.2f", duration / 2; else print "3" }')"
ffmpeg -hide_banner -loglevel error -y -ss "$poster_second" -i "$temporary_video" \
  -frames:v 1 -q:v 3 "$temporary_poster"

mv "$temporary_video" "$output"
mv "$temporary_poster" "$poster"
echo "Video: $output"
echo "Poster: $poster"
