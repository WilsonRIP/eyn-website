// src/lib/ffmpeg.ts
import { FFmpeg } from "@ffmpeg/ffmpeg";

let _ffmpeg: FFmpeg | null = null;

/**
 * Returns a singleton FFmpeg instance.
 * Constructs and loads it on first call, then returns the same one thereafter.
 */
export async function loadFFmpeg(): Promise<FFmpeg> {
  if (_ffmpeg === null) {
    // FFmpeg constructor takes no args in this version
    const ffmpeg = new FFmpeg();
    await ffmpeg.load(); // loads the core .js/.wasm from its default URLs
    _ffmpeg = ffmpeg;
  }
  return _ffmpeg;
}
