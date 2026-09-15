import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { config } from "../config.mjs";
import { resolveInWorkspace } from "../workspace.mjs";

const run = promisify(execFile);

function slugify(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "video"
  );
}

async function ensureFfmpeg() {
  try {
    await run("ffmpeg", ["-version"]);
    return true;
  } catch {
    return false;
  }
}

export const videoTools = [
  {
    definition: {
      type: "function",
      function: {
        name: "make_slideshow_video",
        description:
          "Assemble a set of images (e.g. ones made with generate_image) into a vertical motion video " +
          "(slow zoom per image, crossfade-free straight cuts, fade in/out, optional background music). " +
          "Runs fully locally via ffmpeg \u2014 no AI video generation, just a polished slideshow-style edit. " +
          "Good for product reveals / ad hooks / social content.",
        parameters: {
          type: "object",
          properties: {
            image_paths: {
              type: "array",
              items: { type: "string" },
              description: "Workspace-relative paths to the images, in the order they should appear.",
            },
            output_name: { type: "string", description: "Optional name for the output file (without extension)." },
            seconds_per_image: { type: "number", description: "How long each image is shown, default 3." },
            audio_path: {
              type: "string",
              description: "Optional workspace-relative path to a music/audio file to lay under the video.",
            },
          },
          required: ["image_paths"],
        },
      },
    },
    async run({ image_paths, output_name, seconds_per_image = 3, audio_path }) {
      if (!(await ensureFfmpeg())) {
        return (
          "ffmpeg isn't installed. In Terminal, install Homebrew (see https://brew.sh) if you don't have it, " +
          "then run: brew install ffmpeg"
        );
      }
      if (!Array.isArray(image_paths) || image_paths.length === 0) {
        return "Provide at least one image path.";
      }

      const resolvedImages = [];
      for (const p of image_paths) {
        let full;
        try {
          full = resolveInWorkspace(p);
        } catch (err) {
          return err.message;
        }
        if (!fs.existsSync(full)) return `Image not found: ${p}`;
        resolvedImages.push(full);
      }

      let resolvedAudio = null;
      if (audio_path) {
        try {
          resolvedAudio = resolveInWorkspace(audio_path);
        } catch (err) {
          return err.message;
        }
        if (!fs.existsSync(resolvedAudio)) return `Audio file not found: ${audio_path}`;
      }

      const w = config.videoWidth;
      const h = config.videoHeight;
      const fps = 30;
      const frames = Math.round(seconds_per_image * fps);

      const outputsDir = resolveInWorkspace("generated-videos");
      fs.mkdirSync(outputsDir, { recursive: true });
      const tmpDir = path.join(outputsDir, `.tmp-${crypto.randomUUID().slice(0, 8)}`);
      fs.mkdirSync(tmpDir, { recursive: true });

      try {
        const clipPaths = [];
        for (let i = 0; i < resolvedImages.length; i++) {
          const clipPath = path.join(tmpDir, `clip-${i}.mp4`);
          const vf =
            `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},` +
            `zoompan=z='min(zoom+0.0015,1.2)':d=${frames}:s=${w}x${h}:fps=${fps},format=yuv420p`;
          await run("ffmpeg", [
            "-y",
            "-loop", "1",
            "-i", resolvedImages[i],
            "-vf", vf,
            "-t", String(seconds_per_image),
            "-r", String(fps),
            clipPath,
          ]);
          clipPaths.push(clipPath);
        }

        const listPath = path.join(tmpDir, "list.txt");
        fs.writeFileSync(
          listPath,
          clipPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n"),
        );

        const totalDuration = resolvedImages.length * seconds_per_image;
        const fadeOutStart = Math.max(totalDuration - 0.5, 0);
        const vf = `fade=t=in:st=0:d=0.5,fade=t=out:st=${fadeOutStart}:d=0.5`;

        const base = output_name ? slugify(output_name) : "slideshow";
        const outFile = path.join(outputsDir, `${base}-${crypto.randomUUID().slice(0, 8)}.mp4`);

        const args = ["-y", "-f", "concat", "-safe", "0", "-i", listPath];
        if (resolvedAudio) args.push("-i", resolvedAudio);
        args.push("-vf", vf, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", String(fps));
        if (resolvedAudio) args.push("-c:a", "aac", "-shortest");
        args.push(outFile);

        await run("ffmpeg", args);

        return `Generated video: generated-videos/${path.basename(outFile)} (${totalDuration}s, ${w}x${h})`;
      } catch (err) {
        return `Video generation failed: ${err.message}`;
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    },
  },
];
