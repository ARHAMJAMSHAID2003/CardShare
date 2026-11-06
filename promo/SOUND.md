# Original CardShare score

44 seconds; 100 BPM; E-minor extended harmony resolving into the final E–B–E signature. Generated from deterministic, seeded synthesis in `audio/score.mjs`, with no external recordings or stock samples.

`npm.cmd run audio` writes `assets/soundtrack.wav`: 48 kHz, stereo, 16-bit PCM. Peak is normalized to −1 dBFS; the current mix measures approximately −20.75 dBFS RMS. Start and end samples are zero. A browser sound toggle is required because autoplay with sound is restricted.

The arrangement has sustained harmonic beds, quiet stereo plucks, low impacts, filtered air sweeps, and short UI touches. Touch peaks align with the contact point of the visible tap indicator, rather than its first appearance.

| Time | Cue |
|---|---|
| 0.18s | Original mark reveal |
| 4.05s | Dashboard arrival |
| 6.70s | Cardholder scroll |
| 9.88s | Requester toggle tap |
| 12.45s | Circle scroll |
| 16.16s | Sidebar tap |
| 17.81s | History tap |
| 20.31s | Daraz row tap |
| 23.10s | Details scroll |
| 27.05s | Chat transition |
| 32.60s / 33.10s | Savings / earnings lift |
| 38.35s / 38.65s / 38.95s | E–B–E signature |

The browser uses the audio playhead as its clock when sound is enabled. The offline exporter muxes the same WAV at time zero. No live audio synthesis or device timing affects the export.
