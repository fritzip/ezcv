#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const ejs = require("ejs");

// Handle init command
if (process.argv[2] === "init") {
  console.log("🚀 Initializing new webcv project...");

  const filesToCopy = [
    { src: "resume.yaml", dest: "resume.yaml" },
    { src: "config.yaml", dest: "config.yaml" },
    { src: "templates/gitignore", dest: ".gitignore" },
  ];

  let createdCount = 0;

  filesToCopy.forEach(({ src, dest }) => {
    const srcPath = path.join(__dirname, src);
    const destPath = path.join(process.cwd(), dest);

    if (fs.existsSync(destPath)) {
      console.warn(`⚠️  skipped: ${dest} already exists.`);
    } else {
      try {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ created: ${dest}`);
        createdCount++;
      } catch (err) {
        console.error(`❌ error creating ${dest}:`, err.message);
      }
    }
  });

  // Create GitHub Action Workflow
  const workflowsDir = path.join(process.cwd(), ".github", "workflows");
  const workflowDest = path.join(workflowsDir, "deploy.yml");
  const workflowSrc = path.join(__dirname, "templates", "deploy.yml");

  if (!fs.existsSync(workflowsDir)) {
    fs.mkdirSync(workflowsDir, { recursive: true });
  }

  if (fs.existsSync(workflowDest)) {
    console.warn(`⚠️  skipped: .github/workflows/deploy.yml already exists.`);
  } else {
    try {
      fs.copyFileSync(workflowSrc, workflowDest);
      console.log(`✅ created: .github/workflows/deploy.yml`);
      createdCount++;
    } catch (err) {
      console.error(`❌ error creating workflow file:`, err.message);
    }
  }

  console.log(`\n🎉 Initialization complete! (${createdCount} files created)`);
  console.log(`\nNext steps:`);
  console.log(`1. Edit 'resume.yaml' with your details.`);
  console.log(`2. Commit and push your changes.`);
  console.log(
    `3. Go to your repository settings on GitHub -> Pages -> Build and deployment -> Source -> GitHub Actions.`,
  );
  console.log(`4. Watch the Action tab for your deployment!`);

  process.exit(0);
}

// Paths
// Allow passing an input file or default to resume.yaml
const inputFileArg = process.argv[2];
// Use process.cwd() to look for files in the user's current directory
const DATA_FILE = inputFileArg
  ? path.resolve(inputFileArg)
  : path.join(process.cwd(), "resume.yaml");

const CONFIG_FILE = path.join(process.cwd(), "config.yaml");
const OUTPUT_DIR = path.join(process.cwd(), "public");
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
