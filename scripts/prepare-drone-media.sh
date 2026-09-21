#!/usr/bin/env bash
set -euo pipefail

# Run from the project root after visually accepting the generated source clip.
# Refuse to overwrite an existing deliverable; use a new output directory for revisions.
source_clip=${1:?Usage: bash scripts/prepare-drone-media.sh SOURCE_CLIP [OUTPUT_DIRECTORY] [COLOR_FILTER]}
output_dir=${2:-public/video}
color_filter=${3:-null}
test -f "$source_clip"
mkdir -p "$output_dir"

# Frequent closed keyframes and no B frames keep forward/reverse seeks inexpensive.
ffmpeg -hide_banner -loglevel error -n -i "$source_clip" -an \
  -vf "${color_filter},fps=24,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1" \
  -c:v libx264 -preset slow -crf 23 -g 6 -keyint_min 6 -sc_threshold 0 -bf 0 \
  -pix_fmt yuv420p -movflags +faststart "$output_dir/course-drone.mp4"

# The accepted source keeps its approach in the center; inspect this crop separately.
ffmpeg -hide_banner -loglevel error -n -i "$source_clip" -an \
  -vf "${color_filter},fps=24,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1" \
  -c:v libx264 -preset slow -crf 23 -g 6 -keyint_min 6 -sc_threshold 0 -bf 0 \
  -pix_fmt yuv420p -movflags +faststart "$output_dir/course-drone-mobile.mp4"

ffmpeg -hide_banner -loglevel error -n -i "$output_dir/course-drone.mp4" \
  -frames:v 1 -q:v 2 "$output_dir/course-drone-poster.jpg"
ffmpeg -hide_banner -loglevel error -n -i "$output_dir/course-drone-mobile.mp4" \
  -frames:v 1 -q:v 2 "$output_dir/course-drone-poster-mobile.jpg"
