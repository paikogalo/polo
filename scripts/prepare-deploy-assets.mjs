import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const assetsDirectory = join(process.cwd(), ".deploy-assets");

if (existsSync(assetsDirectory)) {
  const assetNames = new Set(
    readdirSync(assetsDirectory)
      .map((file) => file.match(/^(.+)\.part-\d+\.b64$/)?.[1])
      .filter(Boolean),
  );

  for (const assetName of assetNames) {
    const parts = readdirSync(assetsDirectory)
      .filter((file) => file.startsWith(`${assetName}.part-`) && file.endsWith(".b64"))
      .sort();
    const encoded = parts
      .map((part) => readFileSync(join(assetsDirectory, part), "utf8"))
      .join("");
    const destination = join(process.cwd(), "public", assetName);

    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, Buffer.from(encoded, "base64"));
  }
}
