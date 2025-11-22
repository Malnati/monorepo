// app/ui/scripts/generate-logo-png.cjs
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const INPUT_SVG = path.join(__dirname, "../public/assets/app-logo.svg");
const OUTPUT_PNG = path.join(
  __dirname,
  "../public/assets/dominio-logo-transparencia-colors.png",
);

async function generateLogoPNG() {
  try {
    if (!fs.existsSync(INPUT_SVG)) {
      console.error("❌ Arquivo SVG não encontrado:", INPUT_SVG);
      process.exit(1);
    }

    const svgBuffer = fs.readFileSync(INPUT_SVG);

    await sharp(svgBuffer)
      .resize(320, 320, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({
        quality: 100,
        compressionLevel: 9,
        palette: true,
      })
      .toFile(OUTPUT_PNG);

    const stats = fs.statSync(OUTPUT_PNG);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(`✅ PNG criado com sucesso: ${OUTPUT_PNG}`);
    console.log(`   Tamanho: ${sizeKB} KB`);
  } catch (error) {
    console.error("❌ Erro ao gerar PNG:", error.message);
    process.exit(1);
  }
}

generateLogoPNG();
