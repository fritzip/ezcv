const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const ejs = require("ejs");

// Paths
// Allow passing an input file or default to resume.yaml
const inputFileArg = process.argv[2];
const DATA_FILE = inputFileArg
  ? path.resolve(inputFileArg)
  : path.join(__dirname, "resume.yaml");

const CONFIG_FILE = path.join(__dirname, "config.yaml");
const OUTPUT_DIR = path.join(__dirname, "public");
const OUTPUT_HTML = path.join(OUTPUT_DIR, "index.html");
const OUTPUT_CSS = path.join(OUTPUT_DIR, "style.css");

// Ensure public dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

try {
  console.log(`📖 Reading resume data from ${DATA_FILE}...`);
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error(`Input file not found: ${DATA_FILE}`);
  }
  const resumeData = yaml.load(fs.readFileSync(DATA_FILE, "utf8"));

  console.log("⚙️  Reading configuration...");
  let config = { theme: "modern", style: {}, features: {} };
  if (fs.existsSync(CONFIG_FILE)) {
    const userConfig = yaml.load(fs.readFileSync(CONFIG_FILE, "utf8"));
    config = { ...config, ...userConfig };
  }

  // Resolve Theme Paths
  const THEME_DIR = path.join(__dirname, "themes", config.theme);
  const TEMPLATE_FILE = path.join(THEME_DIR, "template.ejs");
  const CSS_FILE = path.join(THEME_DIR, "style.css");

  if (!fs.existsSync(THEME_DIR)) {
    throw new Error(`Theme "${config.theme}" not found in themes/`);
  }

  console.log(`🎨 Compiling template using theme: ${config.theme}...`);
  const template = fs.readFileSync(TEMPLATE_FILE, "utf8");

  // Pass both resume data and config to template
  const html = ejs.render(template, {
    resume: resumeData,
    config: config,
  });

  console.log("💾 Writing files to public/ ...");
  fs.writeFileSync(OUTPUT_HTML, html);

  // Copy Base CSS if it exists
  const BASE_CSS = path.join(__dirname, "themes", "base.css");
  const OUTPUT_BASE_CSS = path.join(OUTPUT_DIR, "base.css");
  if (fs.existsSync(BASE_CSS)) {
    fs.copyFileSync(BASE_CSS, OUTPUT_BASE_CSS);
  }

  // Copy Theme CSS
  if (fs.existsSync(CSS_FILE)) {
    fs.copyFileSync(CSS_FILE, OUTPUT_CSS);
  } else {
    console.warn("⚠️  No style.css found for this theme.");
  }

  console.log("✅ Build complete! Open public/index.html to view.");
} catch (e) {
  console.error("❌ Build failed:", e);
}
