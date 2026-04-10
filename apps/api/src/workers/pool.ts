import Piscina from "piscina";
import { fileURLToPath } from "url";
import path from "path";
import type { CompressInput, CompressOutput } from "../types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const useTsx = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

const pool = new Piscina({
  ...(useTsx
    ? {
        filename: path.resolve(__dirname, "compress.ts"),
        execArgv: ["--import", "tsx"],
      }
    : {
        filename: path.resolve(__dirname, "../../dist/workers/compress.js"),
      }),
  minThreads: 1,
  maxThreads: 6,
});

export async function compressImage(
  input: CompressInput,
): Promise<CompressOutput> {
  return pool.run(input);
}
