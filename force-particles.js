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
      // NPP lines - flow OUT of ADIs (higher frequency)
      { id: 'npp-to-adi-line', reverse: true, spacing: 53 },
      { id: 'npp-to-fss-path', reverse: false, spacing: 53 },  // INTO FSS

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

      // Eftpos to ESSB - flow from eftpos toward ESSB (double line)
      { id: 'eftpos-to-essb-line-0', reverse: false },
      { id: 'eftpos-to-essb-line-1', reverse: false },

      // Mastercard to MCAU - flow from Mastercard toward MCAU (double line)
      { id: 'mastercard-to-mcau-line-0', reverse: false },
      { id: 'mastercard-to-mcau-line-1', reverse: false },

      // Cheques/Osko to ADIs - flow from ADIs toward Cheques
      { id: 'osko-to-adi-line', reverse: true },
    ];

    // Slow moving particles (speed 30)
    // sizeOverride: 5 makes particles larger than their line width
    const slowLines = [
      // SWIFT HVCS - from ADIs (larger particles, lower frequency)
      { id: 'hvcs-horizontal-line', reverse: true, sizeOverride: 5, spacing: 800 },

      // ASX lines - flow OUT of ADIs/non-ADIs toward ASX (larger particles, lower frequency)
      { id: 'asx-to-adi-line', reverse: true, sizeOverride: 5, spacing: 800 },
      { id: 'asx-to-hvcs-line', reverse: true, sizeOverride: 5, spacing: 800 },  // from non-ADIs toward ASX

      // PEXA - from ADIs
      { id: 'pexa-to-adis-line', reverse: true },

      // Sympli - from ADIs
      { id: 'sympli-to-adis-line', reverse: true },

      // SWIFT PDS to RITS (3 lines) - flow INTO RITS (top 2 with larger particles, extra infrequent)
      { id: 'swift-pds-to-rits-line-0', reverse: false, sizeOverride: 5, spacing: 800 },
      { id: 'swift-pds-to-rits-line-1', reverse: false, sizeOverride: 5, spacing: 800 },
      { id: 'swift-pds-to-rits-line-2', reverse: false, spacing: 800 },

      // CLS AUD to RITS - removed from here, will be created with delay below
      // cls-s-curve and cls-aud-line-new handled as chained path below

      // ASX/DvP/Austraclear lines (medium particles, same frequency as SWIFT HVCS)
      { id: 'dvp-rtgs-to-austraclear-line', reverse: false, sizeOverride: 3.5, spacing: 800 },     // DvP RTGS to Austraclear
      { id: 'rtgs-to-austraclear-line', reverse: false, sizeOverride: 3.5, spacing: 800 },         // RTGS to Austraclear
      { id: 'dvp-cash-leg-to-dvp-rtgs-line', reverse: false, sizeOverride: 3.5, spacing: 800 },    // DvP Cash Leg to DvP RTGS
      { id: 'cash-transfer-to-rtgs-line', reverse: false, sizeOverride: 3.5, spacing: 800 },       // Cash Transfer to RTGS

      // Austraclear to RITS (2 lines) - flow INTO RITS (medium particles, same frequency as SWIFT HVCS)
      { id: 'austraclear-to-rits-line-upper', reverse: false, sizeOverride: 3.5, spacing: 800 },
      { id: 'austraclear-to-rits-line-lower', reverse: false, sizeOverride: 3.5, spacing: 800 },

      // PEXA e-conveyancing to PEXA - flow toward PEXA (double line)
      { id: 'pexa-horizontal-line-0', reverse: false },
      { id: 'pexa-horizontal-line-1', reverse: false },

      // Sympli e-conveyancing to ASXF - flow toward ASXF (double line)
      { id: 'sympli-horizontal-line-0', reverse: false },
      { id: 'sympli-horizontal-line-1', reverse: false },

      // Clearing/netting to ASXB - flow toward ASXB (double line)
      { id: 'clearing-to-asxb-line-0', reverse: false },
      { id: 'clearing-to-asxb-line-1', reverse: false },
    ];

    // Helper to find element by id or data-interactive-id
    const findElement = (id) => {
      return document.getElementById(id) ||
             document.querySelector(`[data-interactive-id="${id}"]`);
    };

    // Create fast particles (speed 150 px/sec)
    fastLines.forEach(config => {
      const path = findElement(config.id);
      if (path) {
        // Ensure element has an id for createFlowParticles
        if (!path.id) path.id = config.id;
        const result = window.createFlowParticles(config.id, null, {
          reverse: config.reverse,
          startProgress: config.startProgress,
          endProgress: config.endProgress,
          speed: 150,
          spacing: config.spacing || 80
        });
        console.warn('PARTICLES: Fast', config.id, 'created', result ? result.length : 0, 'particles');
      } else {
        console.warn('PARTICLES: Fast element NOT FOUND:', config.id);
      }
    });

    // Create infrequent particles (same speed as fast, but ~5x less frequent)
    slowLines.forEach(config => {
      const path = findElement(config.id);
      if (path) {
        // Ensure element has an id for createFlowParticles
        if (!path.id) path.id = config.id;
        const actualSpacing = config.spacing || 400;
        // Special debug for the lines in question
        if (config.id.includes('cash-transfer') || config.id.includes('dvp') || config.id.includes('austraclear') || config.id.includes('rtgs')) {
          console.warn('PARTICLES DEBUG:', config.id, 'spacing:', actualSpacing, 'element found:', !!path);
        }
        const result = window.createFlowParticles(config.id, null, {
          reverse: config.reverse,
          startProgress: config.startProgress,
          endProgress: config.endProgress,
          speed: 150,
          spacing: actualSpacing,
          sizeOverride: config.sizeOverride
        });
        console.warn('PARTICLES: Infrequent', config.id, 'created', result ? result.length : 0, 'particles');
      } else {
        console.warn('PARTICLES: Infrequent element NOT FOUND:', config.id);
      }
    });

    // Create chained particles for CLS circle to CLS AUD box
    // This creates continuous flow from circle through S-curve to AUD box
    if (typeof window.createChainedFlowParticles === 'function') {
      const clsResult = window.createChainedFlowParticles(
        ['cls-s-curve', 'cls-aud-line-new'],
        { reverse: true, speed: 150, spacing: 800, sizeOverride: 5 }
      );
      console.warn('PARTICLES: CLS circle to AUD box chained path created');
    }

    // Calculate travel time and create synchronized CLS AUD to RITS particles
    setTimeout(() => {
      const clsSCurve = findElement('cls-s-curve');
      const clsAudLine = findElement('cls-aud-line-new');
      const clsToRitsLine = findElement('cls-to-rits-line-final');

      if (clsSCurve && clsAudLine && clsToRitsLine) {
        // Calculate travel time from CLS circle to CLS AUD box
        const sCurveLength = clsSCurve.getTotalLength ? clsSCurve.getTotalLength() : 0;
        const audLineLength = clsAudLine.getTotalLength ? clsAudLine.getTotalLength() : 0;
        const totalLength = sCurveLength + audLineLength;
        const speed = 150; // pixels per second
        const travelTimeMs = (totalLength / speed) * 1000;

        console.warn('CLS SYNC: Travel time from circle to AUD:', (travelTimeMs/1000).toFixed(2), 'sec');
        console.warn('CLS SYNC: Delaying cls-to-rits-line-final by', travelTimeMs, 'ms');

        // Create CLS AUD to RITS particles with delay matching travel time
        setTimeout(() => {
          if (!clsToRitsLine.id) clsToRitsLine.id = 'cls-to-rits-line-final';
          window.createFlowParticles('cls-to-rits-line-final', null, {
            reverse: false,
            speed: 150,
            spacing: 800,  // Same 8-second interval
            sizeOverride: 5
          });
          console.warn('CLS SYNC: cls-to-rits-line-final started - particles should appear when CLS circle particles reach AUD box');
        }, travelTimeMs);
      }
    }, 100); // Small delay to ensure paths exist

    // Create synchronized pulse particles for settlement lines to RITS
    // These all start together, move at fast speed, and repeat every 5 seconds
    if (typeof window.createPulseParticles === 'function') {
      // Direct settlement lines to RITS (sync by speed only)
      window.createPulseParticles(
        [
          'mcau-to-rits-line',
          'essb-to-rits-line',
          'pexa-to-rits-line',
          'asxf-to-rits-line',
          'asxb-to-rits-line'
        ],
        { interval: 5000, speed: 150, reverse: false }
      );

      // LVSS lines (through LVSS circle to RITS) - sync by x-coordinate
      // so particles move together horizontally
      window.createPulseParticles(
        [
          'lvss-line-apcs',
          'lvss-line-becs',
          'lvss-line-cecs',
          'lvss-line-gabs'
        ],
        { interval: 5000, speed: 150, reverse: false, syncByX: true }
      );
    }

    console.warn('PARTICLES: Done, total:', document.querySelectorAll('.flow-particle').length);

  // Re-check for lines that might not have existed yet (created later in init)
  setTimeout(() => {
    const missingLines = [
      { id: 'dvp-rtgs-to-austraclear-line', reverse: false, sizeOverride: 3.5, spacing: 800 },
      { id: 'rtgs-to-austraclear-line', reverse: false, sizeOverride: 3.5, spacing: 800 },
      { id: 'austraclear-to-rits-line-upper', reverse: false, sizeOverride: 3.5, spacing: 800 },
      { id: 'austraclear-to-rits-line-lower', reverse: false, sizeOverride: 3.5, spacing: 800 }
    ];

    missingLines.forEach(config => {
      const existing = document.querySelectorAll(`.flow-particle[data-line="${config.id}"]`).length > 0;
      if (!existing) {
        const path = document.getElementById(config.id) ||
                    document.querySelector(`[data-interactive-id="${config.id}"]`);
        if (path) {
          console.warn('PARTICLES: Late init for', config.id);
          if (!path.id) path.id = config.id;
          window.createFlowParticles(config.id, null, {
            reverse: config.reverse,
            speed: 150,
            spacing: config.spacing,
            sizeOverride: config.sizeOverride
          });
        } else {
          console.warn('PARTICLES: Still not found:', config.id);
        }
      }
    });
  }, 1000);

    // Move elements to render ON TOP of particles
    const svg = document.getElementById('diagram');
    if (svg) {
      // Move RTGS and DvP RTGS boxes (with their labels) on top of particles
      ['rtgs-box', 'dvp-rtgs-box'].forEach(boxId => {
        const elements = document.querySelectorAll(`[data-interactive-id="${boxId}"]`);
        if (elements.length > 0) {
          // Create a wrapper group for the box and its label
          const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          wrapper.setAttribute('id', boxId + '-wrapper');
          wrapper.classList.add('diagram-visible');

          // Move all elements with this ID into the wrapper
          elements.forEach(el => {
            wrapper.appendChild(el);
          });

          // Add wrapper to end of SVG
          svg.appendChild(wrapper);
        }
      });

      // Move circles on top of boxes, with yellow lines between RITS and FSS
      // Order: LVSS (gear + label), big-group (RITS), yellow-circles (yellow lines/dots), small-group (FSS)
      ['lvss-gear-group', 'lvss-label', 'big-group', 'big-label', 'yellow-circles', 'small-group', 'small-label'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          svg.appendChild(el);
        }
      });

      console.warn('PARTICLES: Moved boxes and circles on top of particles');
    }
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
