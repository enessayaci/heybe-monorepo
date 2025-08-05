export default {
  // Extension source directory (current directory)
  source: ".",

  // Output directory for built extension
  output: "dist",

  // Manifest file path (relative to source)
  manifest: "manifest.json",

  // Entry point (relative to source)
  entry: "contentScript.js",

  // Root directory
  root: ".",

  // Build options
  build: {
    // Copy all files from source to output
    copy: true,

    // Minify JavaScript files
    minify: true,

    // Generate source maps
    sourcemap: false,
  },

  // Development options
  dev: {
    // Watch for file changes
    watch: true,

    // Hot reload
    hot: true,

    // Browser to use for development
    browser: "chrome",
  },
};
