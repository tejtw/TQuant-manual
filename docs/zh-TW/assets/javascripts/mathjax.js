/**
 * MathJax Configuration for TQuant Lab Documentation
 * 
 * Configures MathJax to render mathematical formulas in documentation pages.
 * Supports both inline and display math modes.
 */

window.MathJax = {
  tex: {
    // Inline math delimiters: \( ... \)
    inlineMath: [["\\(", "\\)"]],
    // Display math delimiters: \[ ... \] and $$ ... $$
    displayMath: [["\\[", "\\]"], ["$$", "$$"]],
    // Allow \$ to escape dollar signs
    processEscapes: true,
    // Process LaTeX environments
    processEnvironments: true
  },
  options: {
    // Ignore all HTML classes by default
    ignoreHtmlClass: ".*|",
    // Only process elements with 'arithmatex' class
    processHtmlClass: "arithmatex"
  }
};

/**
 * Re-render MathJax content on page navigation
 * (MkDocs Material instant loading support)
 */
document$.subscribe(() => {
  MathJax.typesetPromise();
});
