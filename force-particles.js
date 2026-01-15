// Flow particles with proper configuration
(function() {
  console.warn('PARTICLES: Script loaded');

  function initParticles() {
    console.warn('PARTICLES: Initializing');

    if (typeof window.createFlowParticles !== 'function') {
      console.warn('PARTICLES: createFlowParticles not available');
      return;
    }

    // Clear ALL existing particles first
    if (typeof window.clearFlowParticles === 'function') {
      window.clearFlowParticles();
    }
    // Also remove any orphaned particles
    document.querySelectorAll('.flow-particle').forEach(p => p.remove());

    // Define all lines with their configurations
    // reverse: true = particles flow from end toward start of path
    // startProgress/endProgress: limit particles to portion of path (for branching lines)
    // speed: pixels per second (default 80 = fast, use ~30 for slow)

    // Fast moving particles (default speed 80)
    const fastLines = [
      // NPP lines - flow OUT of ADIs
      { id: 'npp-to-adi-line', reverse: true },
      { id: 'npp-to-fss-path', reverse: false },  // INTO FSS

      // Direct Entry - main line from ADIs (full path)
      { id: 'directentry-to-adi-line', reverse: true },

      // Direct Entry - branch to non-ADIs (stop at junction - halfway)
      { id: 'maroon-horizontal-branch', reverse: true, startProgress: 0.5, endProgress: 1.0 },

      // BECS lines - flow from BECN/BECG toward BECS
      { id: 'becn-to-becs-line', reverse: false },
      { id: 'becg-to-becs-line', reverse: false },

      // Direct Entry stack lines (blue, yellow, green, brown) - from ADIs, full path
      { id: 'direct-entry-stack-line-blue', reverse: true },
      { id: 'direct-entry-stack-line-yellow', reverse: true },
      { id: 'direct-entry-stack-line-green', reverse: true },
      { id: 'direct-entry-stack-line-brown', reverse: true },

      // IAC/CECS lines - flow toward IAC
      { id: 'cecs-to-iac-line-1', reverse: false },
      { id: 'cecs-to-iac-line-2', reverse: false },

      // Eftpos lines - from ADIs, full path to eftpos box
      { id: 'eftpos-left-line', reverse: true },
      { id: 'eftpos-left-line-horizontal', reverse: true },

      // Mastercard lines - from ADIs, full path to mastercard box
      { id: 'mastercard-left-line', reverse: true },
      { id: 'mastercard-left-line-horizontal', reverse: true },
    ];

    // Slow moving particles (speed 30)
    const slowLines = [
      // SWIFT HVCS - from ADIs
      { id: 'hvcs-horizontal-line', reverse: true },

      // ASX lines - flow OUT of ADIs/non-ADIs toward ASX
      { id: 'asx-to-adi-line', reverse: true },
      { id: 'asx-to-hvcs-line', reverse: true },  // from non-ADIs toward ASX

      // PEXA - from ADIs
      { id: 'pexa-to-adis-line', reverse: true },

      // Sympli - from ADIs
      { id: 'sympli-to-adis-line', reverse: true },

      // SWIFT PDS to RITS (3 lines) - flow INTO RITS
      { id: 'swift-pds-to-rits-line-0', reverse: false },
      { id: 'swift-pds-to-rits-line-1', reverse: false },
      { id: 'swift-pds-to-rits-line-2', reverse: false },

      // CLS circle to CLS AUD box (neon green line segments)
      { id: 'cls-s-curve', reverse: true },       // from CLS circle
      { id: 'cls-aud-line-new', reverse: true },  // to CLS AUD box

      // CLS AUD to RITS - flow INTO RITS
      { id: 'cls-to-rits-line-final', reverse: false },
    ];

    // Create fast particles
    fastLines.forEach(config => {
      const path = document.getElementById(config.id);
      if (path) {
        window.createFlowParticles(config.id, null, {
          reverse: config.reverse,
          startProgress: config.startProgress,
          endProgress: config.endProgress
        });
      }
    });

    // Create slow particles
    slowLines.forEach(config => {
      const path = document.getElementById(config.id);
      if (path) {
        window.createFlowParticles(config.id, null, {
          reverse: config.reverse,
          startProgress: config.startProgress,
          endProgress: config.endProgress,
          speed: 30,
          spacing: 120
        });
      }
    });

    console.warn('PARTICLES: Done, total:', document.querySelectorAll('.flow-particle').length);
  }

  // Wait for startup animation to complete
  function waitAndInit() {
    if (document.body.classList.contains('animating-startup')) {
      setTimeout(waitAndInit, 500);
      return;
    }
    // Start immediately
    setTimeout(initParticles, 0);
  }

  window.addEventListener('load', () => {
    console.warn('PARTICLES: Page loaded, waiting for animation...');
    waitAndInit();
  });
})();
