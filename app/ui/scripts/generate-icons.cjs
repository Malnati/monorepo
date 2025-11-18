// app/ui/scripts/generate-icons.js
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SIZES = [192, 256, 512];
const INPUT_PATH = path.join(__dirname, "../public/icons/icon-512x512.png");
const OUTPUT_DIR = path.join(__dirname, "../public/icons");

async function generateIcons() {
  try {
    // Verificar se o arquivo de entrada existe
    if (!fs.existsSync(INPUT_PATH)) {
      console.error("Arquivo de entrada não encontrado:", INPUT_PATH);
      return;
    }

    // Criar diretório de saída se não existir
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Gerar ícones em diferentes tamanhos
    for (const size of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

      // Pular se o arquivo de saída for o mesmo que o de entrada
      if (path.resolve(outputPath) === path.resolve(INPUT_PATH)) {
        console.log(
          `⏭ Pulado: icon-${size}x${size}.png (já existe como entrada)`,
        );
        continue;
      }

      await sharp(INPUT_PATH)
        .resize(size, size, {
          fit: "contain",
          background: { r: 246, g: 248, b: 246, alpha: 1 },
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Gerado: icon-${size}x${size}.png`);
    }

    console.log("\n✅ Todos os ícones PWA foram gerados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao gerar ícones:", error);
    process.exit(1);
  }
}

generateIcons();
