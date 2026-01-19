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

    function findElement(id) {
      return document.getElementById(id) ||
             document.querySelector(`[data-interactive-id="${id}"]`);
    }

    const getSequencedFlowState = () => {
      if (!window.__flowSequencedStates) {
        window.__flowSequencedStates = {};
      }
      return window.__flowSequencedStates;
    };

    const clearSequencedFlow = (name) => {
      const state = getSequencedFlowState();
      const record = state[name];
      if (!record) return;
      if (record.intervalId) {
        clearInterval(record.intervalId);
      }
      if (record.timeouts) {
        record.timeouts.forEach(id => clearTimeout(id));
      }
      delete state[name];
    };

    const clearAllSequencedFlows = () => {
      const state = getSequencedFlowState();
      Object.keys(state).forEach(clearSequencedFlow);
    };

    const scheduleSequencedFlow = ({ name, label, spacing = 80, segments }) => {
      if (typeof window.createFlowParticle !== 'function') {
        console.warn('ERROR: createFlowParticle not available for sequenced flow', name);
        return;
      }

      const getElementLength = (element) => {
        if (!element) return 0;
        if (typeof element.getTotalLength === 'function') {
          return element.getTotalLength();
        }
        if (element.tagName && element.tagName.toLowerCase() === 'line') {
          const x1 = parseFloat(element.getAttribute('x1')) || 0;
          const y1 = parseFloat(element.getAttribute('y1')) || 0;
          const x2 = parseFloat(element.getAttribute('x2')) || 0;
          const y2 = parseFloat(element.getAttribute('y2')) || 0;
          const dx = x2 - x1;
          const dy = y2 - y1;
          return Math.sqrt(dx * dx + dy * dy);
        }
        return 0;
      };

      const resolvedSegments = [];
      let missingSegment = false;
      segments.forEach(seg => {
        const element = findElement(seg.id);
        if (!element) {
          console.warn(`ERROR: Sequenced flow ${name} missing element:`, seg.id);
          missingSegment = true;
          return;
        }
        const length = getElementLength(element);
        const speed = seg.speed || 150;
        const travelMs = length > 0 ? (length / speed) * 1000 : 0;
        const segmentConfig = { ...seg, speed };
        resolvedSegments.push({ segment: segmentConfig, length, travelMs });
      });

      if (missingSegment || resolvedSegments.length !== segments.length) {
        console.warn('Sequenced flow aborted for', name);
        return;
      }

      const cadenceMs = spacing * 10;

      console.warn('========================================');
      console.warn(`${label || name} SEQUENCED FLOW:`);
      resolvedSegments.forEach(({ segment, length, travelMs }) => {
        const roundedLength = typeof length === 'number' ? length.toFixed(1) : 'N/A';
        console.warn(`  ${segment.id}: length ${roundedLength}, travel ${Math.round(travelMs)}ms`);
      });
      console.warn('  Cadence (ms):', cadenceMs);
      console.warn('========================================');

      clearSequencedFlow(name);
      const state = getSequencedFlowState();
      const record = { timeouts: [] };
      state[name] = record;

      const spawn = () => {
        let delay = 0;
        resolvedSegments.forEach(({ segment, travelMs }) => {
          const timeoutId = setTimeout(() => {
            window.createFlowParticle(segment.id, {
              reverse: segment.reverse,
              speed: segment.speed,
              startProgress: segment.startProgress,
              endProgress: segment.endProgress
            });
            const index = record.timeouts.indexOf(timeoutId);
            if (index >= 0) {
              record.timeouts.splice(index, 1);
            }
          }, delay);
          record.timeouts.push(timeoutId);
          delay += travelMs;
        });
      };

      spawn();
      record.intervalId = setInterval(spawn, cadenceMs);
    };

    // Clean up any lingering sequenced flows
    clearAllSequencedFlows();

    // Patch clearFlowParticles once so manual clears also remove sequenced flows
    if (!window.__sequencedFlowClearPatched && typeof window.clearFlowParticles === 'function') {
      const originalClear = window.clearFlowParticles;
      window.clearFlowParticles = (...args) => {
        clearAllSequencedFlows();
        return originalClear.apply(window, args);
      };
      window.__sequencedFlowClearPatched = true;
    }

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
      { id: 'eftpos-left-line-horizontal', reverse: true, startProgress: 0.5, endProgress: 1.0 },

      // Mastercard lines - from ADIs, full path to mastercard box
      { id: 'mastercard-left-line', reverse: true },
      { id: 'mastercard-left-line-horizontal', reverse: true, startProgress: 0.5, endProgress: 1.0 },

      // Eftpos to ESSB - flow from eftpos toward ESSB (double line)
      { id: 'eftpos-to-essb-line-0', reverse: false },
      { id: 'eftpos-to-essb-line-1', reverse: false },

      // Mastercard to MCAU - flow from Mastercard toward MCAU (double line)
      { id: 'mastercard-to-mcau-line-0', reverse: false },
      { id: 'mastercard-to-mcau-line-1', reverse: false },

      // Cheques/Osko to ADIs - flow from ADIs toward Cheques
      { id: 'osko-to-adi-line', reverse: true },
    ];

    const fastFlowSpacing = 25;  // 4 dots/sec (spacing * 10ms)
    const slowFlowSpacing = 100; // 1-second cadence (spacing * 10ms)

    // Slow moving particles (speed 30)
    const slowLines = [
      // SWIFT HVCS - from ADIs (lower frequency)
      { id: 'hvcs-horizontal-line', reverse: true, spacing: slowFlowSpacing },

      // ASX lines - flow OUT of ADIs/non-ADIs toward ASX (lower frequency)
      { id: 'asx-to-adi-line', reverse: true, spacing: slowFlowSpacing },
      { id: 'asx-to-hvcs-line', reverse: true, spacing: slowFlowSpacing },  // from non-ADIs toward ASX

      // PEXA - from ADIs
      { id: 'pexa-to-adis-line', reverse: true },

      // Sympli - from ADIs
      { id: 'sympli-to-adis-line', reverse: true },

      // SWIFT PDS to RITS (3 lines) - flow INTO RITS (extra infrequent)
      { id: 'swift-pds-to-rits-line-0', reverse: false, spacing: slowFlowSpacing },
      { id: 'swift-pds-to-rits-line-1', reverse: false, spacing: slowFlowSpacing },
      { id: 'swift-pds-to-rits-line-2', reverse: false, spacing: slowFlowSpacing },

      // CLS AUD to RITS - removed from here, will be created with delay below
      // cls-s-curve and cls-aud-line-new handled as chained path below

      // ASX/DvP/Austraclear lines handled via sequenced flows below

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
          spacing: config.spacing || fastFlowSpacing
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
          spacing: actualSpacing
        });
        console.warn('PARTICLES: Infrequent', config.id, 'created', result ? result.length : 0, 'particles');
      } else {
        console.warn('PARTICLES: Infrequent element NOT FOUND:', config.id);
      }
    });

    // Create synchronized flows for CLS and DvP paths
    scheduleSequencedFlow({
      name: 'cls-flow',
      label: 'CLS FLOW',
      spacing: slowFlowSpacing,
      segments: [
        { id: 'cls-s-curve', reverse: true, speed: 150 },
        { id: 'cls-aud-line-new', reverse: true, speed: 150 },
        { id: 'cls-to-rits-line-final', reverse: false, speed: 150 }
      ]
    });

    scheduleSequencedFlow({
      name: 'dvp-cash-leg-flow',
      label: 'DvP CASH LEG FLOW',
      spacing: slowFlowSpacing,
      segments: [
        { id: 'dvp-cash-leg-to-dvp-rtgs-line', reverse: false, speed: 150 },
        { id: 'dvp-rtgs-to-austraclear-line', reverse: false, speed: 150 },
        { id: 'austraclear-to-rits-line-upper', reverse: false, speed: 150 }
      ]
    });

    scheduleSequencedFlow({
      name: 'cash-transfer-flow',
      label: 'CASH TRANSFER FLOW',
      spacing: slowFlowSpacing,
      segments: [
        { id: 'cash-transfer-to-rtgs-line', reverse: false, speed: 150 },
        { id: 'rtgs-to-austraclear-line', reverse: false, speed: 150 },
        { id: 'austraclear-to-rits-line-lower', reverse: false, speed: 150 }
      ]
    });

    // TEMPORARILY DISABLED - focusing on CLS circle to AUD box first
    // Will re-enable once the chained path works correctly
    /*
    setTimeout(() => {
      const clsSCurve = findElement('cls-s-curve');
      const clsAudLine = findElement('cls-aud-line-new');
      const clsToRitsLine = findElement('cls-to-rits-line-final');

      if (clsSCurve && clsAudLine && clsToRitsLine) {
        const sCurveLength = clsSCurve.getTotalLength ? clsSCurve.getTotalLength() : 0;
        const audLineLength = clsAudLine.getTotalLength ? clsAudLine.getTotalLength() : 0;
        const totalLength = sCurveLength + audLineLength;
        const speed = 150;
        const travelTimeMs = (totalLength / speed) * 1000;

        setTimeout(() => {
          if (!clsToRitsLine.id) clsToRitsLine.id = 'cls-to-rits-line-final';
          window.createFlowParticles('cls-to-rits-line-final', null, {
            reverse: false,
            speed: 150,
            spacing: 800,
            sizeOverride: 5
          });
        }, travelTimeMs);
      }
    }, 100);
    */

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
      { id: 'dvp-rtgs-to-austraclear-line', reverse: false, spacing: 800 },
      { id: 'rtgs-to-austraclear-line', reverse: false, spacing: 800 },
      { id: 'austraclear-to-rits-line-upper', reverse: false, spacing: 800 },
      { id: 'austraclear-to-rits-line-lower', reverse: false, spacing: 800 }
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
            spacing: config.spacing
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
