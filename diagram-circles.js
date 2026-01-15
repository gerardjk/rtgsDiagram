// Circle rendering and positioning logic

/**
 * Initialize and position the main RITS (blue) and FSS (orange/yellow) circles
 * @param {Object} params - Circle parameters
 * @returns {Object} - Circle positions {cySmall}
 */
function initializeMainCircles(params) {
  const {cx, cyBig, rBig, rSmall, strokeW} = params;

  // Position blue circle (RITS) - update all layers
  const bigOuter = document.getElementById('big-outer');
  const bigGearBorder = document.getElementById('big-gear-border');
  const bigInner = document.getElementById('big-inner');

  bigOuter.setAttribute('cx', cx);
  bigOuter.setAttribute('cy', cyBig);
  bigOuter.setAttribute('r', rBig + strokeW/2);

  bigInner.setAttribute('cx', cx);
  bigInner.setAttribute('cy', cyBig);
  bigInner.setAttribute('r', rBig - strokeW * 2.5);

  // Position orange/yellow circle (FSS)
  const smallOuter = document.getElementById('small-outer');
  const smallGearBorder = document.getElementById('small-gear-border');
  const smallInner = document.getElementById('small-inner');

  const cySmall = cyBig - (rBig + rSmall + strokeW);

  smallOuter.setAttribute('cx', cx);
  smallOuter.setAttribute('cy', cySmall);
  smallOuter.setAttribute('r', rSmall + strokeW/2);

  smallInner.setAttribute('cx', cx);
  smallInner.setAttribute('cy', cySmall);
  smallInner.setAttribute('r', rSmall - strokeW * 2);

  // Update circle labels
  const smallLabel = document.getElementById('small-label');
  if (smallLabel) {
    smallLabel.setAttribute('x', cx);
    smallLabel.setAttribute('y', cySmall);
  }

  const bigLabel = document.getElementById('big-label');
  if (bigLabel) {
    bigLabel.setAttribute('x', cx);
    bigLabel.setAttribute('y', cyBig);
    const tspans = bigLabel.getElementsByTagName('tspan');
    for (let tspan of tspans) {
      tspan.setAttribute('x', cx);
    }
  }

  // Create gear paths for both circles
  createMainCircleGears(cx, cyBig, cySmall, rBig, rSmall, strokeW);

  return {cySmall};
}

/**
 * Create gear-shaped borders for RITS and FSS circles
 */
function createMainCircleGears(cx, cyBig, cySmall, rBig, rSmall, strokeW) {
  // Big circle (RITS) gear
  const bigGearBorder = document.getElementById('big-gear-border');
  if (bigGearBorder) {
    const outerRadius = rBig - strokeW * 0.75;
    const innerRadius = rBig - strokeW * 2.5;
    const teeth = 20;
    const toothHeight = 6;

    let path = createGearPath(outerRadius - toothHeight, teeth, toothHeight, 0.25);
    path += ` M ${innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${-innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${innerRadius} 0`;

    bigGearBorder.setAttribute('d', path);
    bigGearBorder.setAttribute('transform', `translate(${cx}, ${cyBig})`);
    bigGearBorder.setAttribute('fill-rule', 'evenodd');

    if (!bigGearBorder.querySelector('animateTransform[data-spin="rits-outer"]')) {
      const rotateAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
      rotateAnim.setAttribute('attributeName', 'transform');
      rotateAnim.setAttribute('type', 'rotate');
      rotateAnim.setAttribute('from', '0 0 0');
      rotateAnim.setAttribute('to', '360 0 0');
      rotateAnim.setAttribute('dur', '18s');
      rotateAnim.setAttribute('repeatCount', 'indefinite');
      rotateAnim.setAttribute('additive', 'sum');
      rotateAnim.dataset.spin = 'rits-outer';
      bigGearBorder.appendChild(rotateAnim);
    }
  }

  const bigGear = document.getElementById('big-gear');
  if (bigGear) {
    const bigInnerRadius = rBig - strokeW * 2.5;
    const bigGearRadius = bigInnerRadius - 12;
    const bigToothHeight = 8;
    bigGear.setAttribute('d', createGearPath(bigGearRadius - bigToothHeight, 16, bigToothHeight, 0.25));
    bigGear.setAttribute('transform', `translate(${cx}, ${cyBig})`);

    if (!bigGear.querySelector('animateTransform[data-spin="rits-inner"]')) {
      const rotateAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
      rotateAnim.setAttribute('attributeName', 'transform');
      rotateAnim.setAttribute('type', 'rotate');
      rotateAnim.setAttribute('from', '0 0 0');
      rotateAnim.setAttribute('to', '-360 0 0');
      rotateAnim.setAttribute('dur', '18s');
      rotateAnim.setAttribute('repeatCount', 'indefinite');
      rotateAnim.setAttribute('additive', 'sum');
      rotateAnim.dataset.spin = 'rits-inner';
      bigGear.appendChild(rotateAnim);
    }
  }

  // Small circle (FSS) gear
  const smallGearBorder = document.getElementById('small-gear-border');
  if (smallGearBorder) {
    const outerRadius = rSmall - strokeW * 0.3;
    const innerRadius = rSmall - strokeW * 2;
    const teeth = 12;
    const toothHeight = 4;

    let path = createGearPath(outerRadius - toothHeight, teeth, toothHeight, 0.25);
    path += ` M ${innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${-innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${innerRadius} 0`;

    smallGearBorder.setAttribute('d', path);
    smallGearBorder.setAttribute('transform', `translate(${cx}, ${cySmall})`);
    smallGearBorder.setAttribute('fill-rule', 'evenodd');

    if (!smallGearBorder.querySelector('animateTransform[data-spin="fss-outer"]')) {
      const rotateAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
      rotateAnim.setAttribute('attributeName', 'transform');
      rotateAnim.setAttribute('type', 'rotate');
      rotateAnim.setAttribute('from', '0 0 0');
      rotateAnim.setAttribute('to', '-360 0 0');
      rotateAnim.setAttribute('dur', '12s');
      rotateAnim.setAttribute('repeatCount', 'indefinite');
      rotateAnim.setAttribute('additive', 'sum');
      rotateAnim.dataset.spin = 'fss-outer';
      smallGearBorder.appendChild(rotateAnim);
    }
  }

  const smallGear = document.getElementById('small-gear');
  if (smallGear) {
    const smallGearRadius = (rSmall - strokeW * 2) - 8;
    const smallToothHeight = 4;
    smallGear.setAttribute('d', createGearPath(smallGearRadius - smallToothHeight, 10, smallToothHeight, 0.25));
    smallGear.setAttribute('transform', `translate(${cx}, ${cySmall})`);

    if (!smallGear.querySelector('animateTransform[data-spin="fss-inner"]')) {
      const rotateAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
      rotateAnim.setAttribute('attributeName', 'transform');
      rotateAnim.setAttribute('type', 'rotate');
      rotateAnim.setAttribute('from', '0 0 0');
      rotateAnim.setAttribute('to', '360 0 0');
      rotateAnim.setAttribute('dur', '12s');
      rotateAnim.setAttribute('repeatCount', 'indefinite');
      rotateAnim.setAttribute('additive', 'sum');
      rotateAnim.dataset.spin = 'fss-inner';
      smallGear.appendChild(rotateAnim);
    }
  }
}

/**
 * Create LVSS gear circle with layered effect
 * @param {Object} params - LVSS parameters
 * @param {Object} labelsGroup - SVG group for labels
 * @returns {Object} - LVSS position data
 */
function createLvssCircle(params, labelsGroup) {
  const {redCircleX} = params;

  const lvssGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  lvssGroup.setAttribute('id', 'lvss-gear-group');
  lvssGroup.classList.add('stage-four-label'); // For fade transition

  // Calculate LVSS Y position
  const redCircleRadius = 37 * 1.2 * 0.9 * 0.9 * 0.9; // 10% smaller
  const mastercardY_ref = window.hexagonPositions ? window.hexagonPositions.mastercardY || 320 : 320;
  const verticalGap_ref = 5;
  const hexHeight_ref = window.hexagonPositions ? window.hexagonPositions.hexHeight || 20 : 20;
  const apcsY_ref = mastercardY_ref - (verticalGap_ref * 2) - hexHeight_ref - 20;

  let redCircleY;
  if (window.needsLvssUpdate && window.needsLvssUpdate.y) {
    redCircleY = window.needsLvssUpdate.y + 5;
  } else if (window.lvssBoxPositions && window.lvssBoxPositions.cecsY) {
    redCircleY = window.lvssBoxPositions.cecsY + (window.lvssBoxPositions.boxHeight / 2) + 5;
  } else {
    redCircleY = apcsY_ref + hexHeight_ref / 2 + 5;
  }

  const gearTranslateGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gearTranslateGroup.setAttribute('transform', `translate(${redCircleX}, ${redCircleY})`);
  lvssGroup.appendChild(gearTranslateGroup);

  const gearRotateGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gearTranslateGroup.appendChild(gearRotateGroup);

  // Create gear border
  const strokeW = 3;
  const outerRadius = redCircleRadius - strokeW * 0.5;
  const innerRadius = redCircleRadius - strokeW * 2;
  const teeth = 12;
  const toothHeight = 3;

  let path = createGearPath(outerRadius - toothHeight, teeth, toothHeight, 0.25);
  path += ` M ${innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${-innerRadius} 0 A ${innerRadius} ${innerRadius} 0 1 0 ${innerRadius} 0`;

  const gearBorder = createStyledPath(path, {
    fill: '#800040', // Purplish burgundy
    stroke: '#bcc3cf', // Brighter grey outline
    strokeWidth: '1'
  });
  gearBorder.setAttribute('fill-rule', 'evenodd');
  gearRotateGroup.appendChild(gearBorder);

  const rotateAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
  rotateAnim.setAttribute('attributeName', 'transform');
  rotateAnim.setAttribute('type', 'rotate');
  rotateAnim.setAttribute('from', '0 0 0');
  rotateAnim.setAttribute('to', '360 0 0');
  rotateAnim.setAttribute('dur', '12s');
  rotateAnim.setAttribute('repeatCount', 'indefinite');
  gearRotateGroup.appendChild(rotateAnim);

  // Inner circle
  const redCircleInner = createStyledCircle(0, 0, innerRadius, {
    fill: '#5A0030', // Darker purplish burgundy
    stroke: 'none'
  });
  gearRotateGroup.appendChild(redCircleInner);

  labelsGroup.appendChild(lvssGroup);

  // Make LVSS gear group interactive
  if (typeof makeInteractive === 'function') {
    makeInteractive(lvssGroup, 'lvss-gear');
  }

  // Add LVSS label (pointer-events none so hover passes through to gear)
  const lvssText = createStyledText(redCircleX, redCircleY, 'LVSS', {
    fill: '#ffffff',
    fontSize: '14'
  });
  lvssText.setAttribute('id', 'lvss-label');
  lvssText.setAttribute('pointer-events', 'none');
  lvssText.classList.add('stage-four-label'); // For fade transition
  labelsGroup.appendChild(lvssText);

  // Store LVSS position
  window.lvssPosition = {
    x: redCircleX,
    y: redCircleY,
    radius: redCircleRadius
  };

  window.lvssGearGroup = gearTranslateGroup;

  // Adjust LVSS position if needed to align with CECS
  adjustLvssPosition(labelsGroup);

  return window.lvssPosition;
}

/**
 * Adjust LVSS position to align horizontally with CECS box
 */
function adjustLvssPosition(labelsGroup) {
  if (!window.lvssBoxPositions || !window.lvssPosition) return;

  const lvssX = window.lvssPosition.x;
  let lvssY = window.lvssPosition.y;
  const boxHeight = window.lvssBoxPositions.boxHeight;
  const iacLineY = window.lvssBoxPositions.cecsY + boxHeight / 2;

  const yDiff = iacLineY - lvssY;
  if (Math.abs(yDiff) <= 1) return; // No adjustment needed

  if (window.lvssGearGroup) {
    window.lvssGearGroup.setAttribute('transform', `translate(${lvssX}, ${lvssY + yDiff})`);
  } else {
    // Move all LVSS circles (legacy structure)
    const allCircles = labelsGroup.querySelectorAll('circle');
    allCircles.forEach(circle => {
      const cx = parseFloat(circle.getAttribute('cx'));
      const cy = parseFloat(circle.getAttribute('cy'));
      if (Math.abs(cx - lvssX) < 1) {
        circle.setAttribute('cy', cy + yDiff);
      }
    });
  }

  // Move LVSS text
  const allTexts = labelsGroup.querySelectorAll('text');
  allTexts.forEach(text => {
    if (text.textContent === 'LVSS') {
      const currentY = parseFloat(text.getAttribute('y'));
      text.setAttribute('y', currentY + yDiff);
    }
  });

  if (!window.lvssGearGroup) {
    // Move gear paths in legacy structure
    const allPaths = labelsGroup.querySelectorAll('path');
    allPaths.forEach(path => {
      const transform = path.getAttribute('transform') || '';
      if (transform.includes(`translate(${lvssX},`)) {
        const newTransform = transform.replace(/translate\([^,]+,\s*([^)]+)\)/, `translate(${lvssX}, ${iacLineY})`);
        path.setAttribute('transform', newTransform);
      }
    });
  }

  // Update stored position
  window.lvssPosition.y = iacLineY;
}

// Export functions for module usage
if (typeof window !== 'undefined') {
  window.initializeMainCircles = initializeMainCircles;
  window.createLvssCircle = createLvssCircle;
}
