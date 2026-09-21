#!/usr/bin/env bash
set -euo pipefail

# Revision 3 preserves the complete approved composition on both screen sizes.
# Keep the existing revision 1/2 encoder unchanged for reproducibility.
source_clip=${1:?Usage: bash scripts/prepare-fairway-v3-media.sh SOURCE_CLIP OUTPUT_DIRECTORY}
output_dir=${2:?Choose a new, empty, versioned output directory}
test -f "$source_clip"
dimensions=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$source_clip")
if [ "$dimensions" != "1920x1080" ]; then
  echo "Expected a native 1920x1080 source; refusing an implicit upscale: $dimensions" >&2
  exit 1
fi
mkdir -p "$output_dir"

# CRF 18 retains more detail than revision 2's CRF 23. Short closed GOPs and
# no B frames favor precise forward/reverse seeking over minimum file size.
ffmpeg -hide_banner -loglevel error -n -i "$source_clip" -an \
  -vf "fps=24,setsar=1" \
  -c:v libx264 -preset slow -crf 18 -g 6 -keyint_min 6 -sc_threshold 0 -bf 0 \
  -pix_fmt yuv420p -movflags +faststart "$output_dir/course-drone.mp4"

# A landscape 720p derivative reduces mobile transfer size without cropping.
ffmpeg -hide_banner -loglevel error -n -i "$source_clip" -an \
  -vf "fps=24,scale=1280:720:flags=lanczos,setsar=1" \
  -c:v libx264 -preset slow -crf 18 -g 6 -keyint_min 6 -sc_threshold 0 -bf 0 \
  -pix_fmt yuv420p -movflags +faststart "$output_dir/course-drone-mobile.mp4"

ffmpeg -hide_banner -loglevel error -n -i "$output_dir/course-drone.mp4" \
  -frames:v 1 -q:v 2 "$output_dir/course-drone-poster.jpg"
ffmpeg -hide_banner -loglevel error -n -i "$output_dir/course-drone-mobile.mp4" \
  -frames:v 1 -q:v 2 "$output_dir/course-drone-poster-mobile.jpg"
