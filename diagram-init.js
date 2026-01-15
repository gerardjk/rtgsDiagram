function runDiagramInit() {
  // Add animation class immediately to prevent any interaction
  document.body.classList.add('animating-startup');

  if (typeof window.initializeDiagram === 'function') {
    window.initializeDiagram();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runDiagramInit);
} else {
  runDiagramInit();
}
