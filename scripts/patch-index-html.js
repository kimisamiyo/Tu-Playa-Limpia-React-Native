/**
 * Post-export script: Injects @font-face CSS into dist/index.html
 * and flattens/replicates font structure for perfect CDN compatibility.
 * 
 * Run automatically via `npm run build:web`
 */
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const FONTS_TARGET_DIR = path.join(DIST_DIR, 'fonts');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');

// 1. Validate dist exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Error: dist directory not found. Run `expo export --platform web` first.');
  process.exit(1);
}

// 2. Create flat fonts directory for CSS injection
if (!fs.existsSync(FONTS_TARGET_DIR)) {
  fs.mkdirSync(FONTS_TARGET_DIR, { recursive: true });
}

// 3. Resolve source font directory - try multiple potential locations
const POSSIBLE_FONT_DIRS = [
  path.join(DIST_DIR, 'assets', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts'),
  path.join(DIST_DIR, 'assets', 'fonts'), // Sometimes they end up here
  path.join(__dirname, '..', 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts') // Fallback to local node_modules
];

let SOURCE_FONTS_DIR = null;
for (const dir of POSSIBLE_FONT_DIRS) {
  if (fs.existsSync(dir)) {
    SOURCE_FONTS_DIR = dir;
    console.log(`✅ Found fonts at: ${dir}`);
    break;
  }
}

if (!SOURCE_FONTS_DIR) {
  console.warn('⚠️  Warning: Could not locate font assets. Skipping font patch.');
}

function findAndCopyFont(prefix, targetName) {
  if (!SOURCE_FONTS_DIR) return null;

  try {
    const files = fs.readdirSync(SOURCE_FONTS_DIR);
    const match = files.find(f => f.startsWith(prefix) && f.endsWith('.ttf'));

    if (match) {
      const src = path.join(SOURCE_FONTS_DIR, match);
      // Copy to flat /fonts/ for our CSS
      const dstFlat = path.join(FONTS_TARGET_DIR, `${targetName}.ttf`);
      fs.copyFileSync(src, dstFlat);
      return `/fonts/${targetName}.ttf`;
    }
  } catch (e) {
    console.warn(`Could not copy font ${targetName}: ${e.message}`);
  }
  return null;
}

const fontFamilies = [
  { name: 'Ionicons', prefix: 'Ionicons' },
  { name: 'MaterialCommunityIcons', prefix: 'MaterialCommunityIcons' },
  { name: 'FontAwesome', prefix: 'FontAwesome' },
  { name: 'Feather', prefix: 'Feather' }
];

let cssRules = '';
for (const font of fontFamilies) {
  const fontPath = findAndCopyFont(font.prefix, font.name);
  if (fontPath) {
    cssRules += `
      @font-face {
        font-family: '${font.name}';
        src: url('${fontPath}') format('truetype');
        font-display: swap;
      }
      @font-face {
        font-family: '${font.name.toLowerCase()}'; // Lowercase alias
        src: url('${fontPath}') format('truetype');
        font-display: swap;
      }
      /* Special case for Material Design Icons which sometimes uses this name */
      @font-face {
        font-family: 'Material Design Icons';
        src: url('${fontPath}') format('truetype');
        font-display: swap;
      }`;
  }
}

if (!cssRules) {
  console.log('⚠️  No font files found to patch (or source directory empty).');
  process.exit(0);
}

const styleBlock = `<style id="icon-fonts">${cssRules}\n    </style>`;

try {
  let html = fs.readFileSync(INDEX_HTML, 'utf-8');

  // Remove old injection if present
  html = html.replace(/<style id="icon-fonts">[\s\S]*?<\/style>\s*/, '');

  // Inject before <style id="expo-reset"> or </head>
  if (html.includes('<style id="expo-reset">')) {
    html = html.replace('<style id="expo-reset">', `${styleBlock}\n    <style id="expo-reset">`);
  } else {
    html = html.replace('</head>', `${styleBlock}\n</head>`);
  }

  fs.writeFileSync(INDEX_HTML, html, 'utf-8');
  console.log('✅ Patched dist/index.html with explicit font-face definitions.');
} catch (e) {
  console.error('❌ Error patching index.html:', e.message);
  process.exit(1);
}
