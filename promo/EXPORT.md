# Preview and video delivery

Run from `promo/` in the VS Code terminal. Use `npm.cmd` on Windows to avoid PowerShell script-policy issues.

```text
npm.cmd start
```

Open http://127.0.0.1:4173. The standalone `output/CardShare — One Connection.html` also opens directly without a server.

## Export

```text
npm.cmd run export -- --fps 60
```

Output: `output/CardShare-1080x1920-60fps.mp4`. Duration: 44 seconds, 2,640 frames, H.264 CRF 17, yuv420p, AAC stereo 320 kbps at 48 kHz, fast-start MP4. Frames are rendered at exact times; rendering speed does not affect playback speed. Two browser pages render independent frames in parallel and feed them to FFmpeg in order.

```text
npm.cmd run export
npm.cmd run export -- --width 540 --fps 30
npm.cmd run export -- --fps 60 --workers 1
npm.cmd run export -- --silent
```

The default is 1080×1920 at 30 fps (1,320 frames). Workers may be 1–4. A partial output receives its final name only after successful encoding. FFmpeg comes from `ffmpeg-static`; Chrome is detected locally. `CHROME_PATH` and `FFMPEG_PATH` override executable locations.

Software WebGL is the default. To use the browser's default GPU path from a VS Code **Command Prompt** terminal:

```bat
set FILM_GPU=1
npm.cmd run export -- --fps 60 --workers 2
```

The PNG capture path is lossless; JPEG screenshot artifacts are not introduced during rendering. The supplied app artwork itself is JPEG at 720×1600, so source detail limits still apply.

## Verification

```text
npm.cmd run check
node scripts/check-standalone.mjs
python scripts/audit-sources.py
```

Review `output/qa/contact-sheet.png`, `output/qa/report.json`, `output/qa/standalone-report.json` and `output/qa/source-audit.json`. Check the final MP4 after encoding as well. `window.cardShareFilm` exposes `ready`, `duration`, `time`, `seek`, `play`, and `pause` for inspection.

The delivered 60 fps MP4 has also passed a full decode: 2,640 frames, exactly 44 seconds, H.264 video and 48 kHz stereo AAC. `output/qa/video-report.json` records the result. `output/qa/color-report.json` compares the preview and encoded emerald: the dominant sampled color differs by at most 4 levels per RGB channel after compression. The exporter explicitly converts RGB to BT.709 before tagging the video.

The WAV starts at video time zero. Keep all 44 seconds, including the ending hold; do not time-stretch the music or add automatic frame interpolation.
