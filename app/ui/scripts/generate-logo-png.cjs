// app/ui/scripts/generate-logo-png.cjs
/**
 * Script para gerar logo PNG com transparência a partir do SVG fonte.
 *
 * Este script converte o arquivo SVG `app-logo.svg` em um PNG otimizado
 * com canal alpha (transparência) para uso em interfaces web.
 *
 * Arquivo de entrada esperado:
 *   - Localização: `app/ui/public/assets/app-logo.svg`
 *   - Formato: SVG válido com viewBox definido
 *   - Conteúdo: Logo "APP" com gradiente verde-azul conforme identidade visual
 *   - Fonte original: `branding/assets/app-logo.svg` (deve ser copiado para public/assets/)
 *
 * Arquivo de saída gerado:
 *   - Localização: `app/ui/public/assets/dominio-logo-transparencia-colors.png`
 *   - Dimensões: 320x320 pixels
 *   - Formato: PNG com transparência (alpha channel)
 *   - Otimização: Paleta de cores para reduzir tamanho do arquivo
 *
 * Uso:
 *   cd app/ui
 *   node scripts/generate-logo-png.cjs
 *
 * Requisitos:
 *   - Node.js com módulo `sharp` instalado (npm install)
 *   - Arquivo SVG de entrada deve existir em `public/assets/app-logo.svg`
 *
 * Documentação relacionada:
 *   - docs/rup/06-ux-brand/identidades-visuais-spec.md
 *   - branding/assets/README.md
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Arquivo SVG de entrada: logo fonte em formato vetorial
// Deve estar localizado em app/ui/public/assets/app-logo.svg
// Se não existir, copie de branding/assets/app-logo.svg
const INPUT_SVG = path.join(__dirname, "../public/assets/app-logo.svg");

// Arquivo PNG de saída: logo colorida com transparência para fundos claros
// Conforme especificação em docs/rup/06-ux-brand/identidades-visuais-spec.md
const OUTPUT_PNG = path.join(
  __dirname,
  "../public/assets/dominio-logo-transparencia-colors.png",
);

async function generateLogoPNG() {
  try {
    // Validar existência do arquivo SVG de entrada
    if (!fs.existsSync(INPUT_SVG)) {
      console.error("❌ Arquivo SVG não encontrado:", INPUT_SVG);
      console.error(
        "   Dica: Copie o arquivo de branding/assets/app-logo.svg para public/assets/app-logo.svg",
      );
      process.exit(1);
    }

    // Ler arquivo SVG de entrada
    const svgBuffer = fs.readFileSync(INPUT_SVG);

    // Converter SVG para PNG com transparência
    // - Dimensões: 320x320px (tamanho padrão para logos web)
    // - Background transparente (alpha: 0) para uso sobre fundos variados
    // - Paleta de cores otimizada para reduzir tamanho do arquivo
    await sharp(svgBuffer)
      .resize(320, 320, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({
        quality: 100,
        compressionLevel: 9,
        palette: true, // Usa paleta de cores para otimização
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
