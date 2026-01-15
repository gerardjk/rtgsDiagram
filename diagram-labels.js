// Text labels and positioning logic

/**
 * Get label position adjustments for specific dot indices
 */
function getLabelPosition(index, actualCircleX, actualCircleY, dotPositions) {
  let labelX = actualCircleX + 25;
  let labelY = actualCircleY;

  // Adjust vertical position to prevent overlaps
  if (index === 1) {
    labelY = actualCircleY - 12;
  } else if (index === 2) {
    labelY = actualCircleY - 2;
  } else if (index === 45) {
    labelX = actualCircleX + 25;
    labelY = actualCircleY - 1;
  } else if (index === 46) {
    labelX = actualCircleX + 25;
    labelY = actualCircleY + 6;
  } else if (index === 50) {
    labelX = actualCircleX + 25;
    labelY = 360;
  } else if (index === 51) {
    labelX = actualCircleX + 25;
    labelY = 370;
  } else if (index === 52) {
    labelX = actualCircleX + 25;
    labelY = 380;
  } else if (index === 53) {
    labelX = actualCircleX + 25;
    labelY = 390;
  } else if (index === 54) {
    labelX = actualCircleX + 25;
    labelY = 473;
  } else if (index === 55) {
    labelX = actualCircleX + 25;
    labelY = 483;
  } else if (index === 84) {
    labelX = actualCircleX + 25;
    labelY = actualCircleY - 2;
  } else if (index === 85) {
    labelX = actualCircleX + 25;
    labelY = dotPositions[84] ? dotPositions[84].y + 8 : actualCircleY + 8;
  } else if (index === 87) {
    labelX = actualCircleX + 25;
    labelY = dotPositions[84] ? dotPositions[84].y + 30 : actualCircleY + 30;
  } else if (index === 88) {
    labelX = actualCircleX + 25;
    labelY = dotPositions[84] ? dotPositions[84].y + 40 : actualCircleY + 40;
  } else if (index === 92) {
    labelX = actualCircleX + 25;
    labelY = actualCircleY - 6;
  } else if (index === 93) {
    labelX = actualCircleX + 25;
    labelY = dotPositions[92] ? dotPositions[92].y + 6 : actualCircleY + 6;
  } else if (index === 94) {
    labelX = actualCircleX + 25;
    labelY = dotPositions[92] ? dotPositions[92].y + 16 : actualCircleY + 16;
  } else if (index === 96) {
    labelX = actualCircleX + 35;
    labelY = actualCircleY - 1;
  } else if (index === 97) {
    labelX = actualCircleX + 35;
    labelY = dotPositions[96] ? dotPositions[96].y + 10 - 1 : actualCircleY + 10 - 1;
  } else if (index === 98) {
    labelX = actualCircleX + 35;
    labelY = dotPositions[96] ? dotPositions[96].y + 20 - 1 : actualCircleY + 20 - 1;
  }

  return { x: labelX, y: labelY };
}

/**
 * Create pointer line from dot to label
 */
function createPointerLine(index, actualCircleX, actualCircleY, dotRadius, labelX, labelY, labelsGroup) {
  // All labels get straight lines now
  const pointerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  pointerLine.setAttribute('x1', actualCircleX + dotRadius);
  pointerLine.setAttribute('y1', actualCircleY);
  pointerLine.setAttribute('x2', labelX - 5);
  pointerLine.setAttribute('y2', labelY);
  pointerLine.setAttribute('stroke', '#000000');
  pointerLine.setAttribute('stroke-width', '0.5');
  labelsGroup.appendChild(pointerLine);
  return labelX;
}

/**
 * Create text label for a dot
 */
function createDotLabel(index, labelText, finalLabelX, labelY, labelsGroup) {
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', finalLabelX);
  text.setAttribute('y', labelY);
  text.setAttribute('text-anchor', 'start');
  text.setAttribute('dominant-baseline', 'middle');

  // Make ANZ, Commonwealth, NAB, and Westpac labels red
  if (index >= 50 && index <= 53) {
    text.setAttribute('fill', '#991b1b');
  } else {
    text.setAttribute('fill', '#000000');
  }

  text.setAttribute('font-family', "'Nunito Sans', sans-serif");
  text.setAttribute('font-size', '10');
  text.textContent = labelText;
  labelsGroup.appendChild(text);

  return text;
}

/**
 * Add label to RBA dot
 */
function addRbaLabel(actualCircleX, actualCircleY, blackCircleRadius, labelsGroup) {
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', (actualCircleX + blackCircleRadius + 5).toFixed(2));
  text.setAttribute('y', actualCircleY.toFixed(2));
  text.setAttribute('text-anchor', 'start');
  text.setAttribute('dominant-baseline', 'middle');
  text.setAttribute('fill', '#991b1b');
  text.setAttribute('font-family', "'Nunito Sans', sans-serif");
  text.setAttribute('font-size', '16');
  text.setAttribute('font-weight', 'bold');
  text.textContent = 'RBA';
  labelsGroup.appendChild(text);

  return text;
}

/**
 * Add CLS text to last dot
 */
function addClsLabel(actualCircleX, actualCircleY, circlesGroup) {
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', actualCircleX.toFixed(2));
  text.setAttribute('y', actualCircleY.toFixed(2));
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'middle');
  text.setAttribute('fill', 'white');
  text.setAttribute('font-family', "'Nunito Sans', sans-serif");
  text.setAttribute('font-size', '16');
  text.setAttribute('font-weight', 'bold');
  text.textContent = 'CLS';
  circlesGroup.appendChild(text);

  return text;
}

/**
 * Create group label for bounding boxes
 */
function createGroupLabel(x, y, text, options = {}) {
  return createStyledText(x, y, text, {
    textAnchor: options.textAnchor || 'end',
    fill: options.fill || '#2563eb',
    fontSize: options.fontSize || '24',
    ...options
  });
}

/**
 * Create all dot labels based on configuration
 */
function createAllDotLabels(dotLabels, dotPositions, actualCircleX, actualCircleY,
                           dotRadius, showOrange, index, smallCircleRadius, labelsGroup) {
  if (!dotLabels[index]) return null;

  const label = dotLabels[index];

  // Get calculated dot radius
  let calculatedDotRadius = showOrange ? smallCircleRadius * 2 : smallCircleRadius;
  if (index >= 50 && index < 54) calculatedDotRadius = calculatedDotRadius * 1.5;
  if (index >= 96) calculatedDotRadius = smallCircleRadius * 2;
  if (index === 99) calculatedDotRadius = smallCircleRadius * 12;

  // Get label position
  const position = getLabelPosition(index, actualCircleX, actualCircleY, dotPositions);

  // Create pointer line
  const finalLabelX = createPointerLine(index, actualCircleX, actualCircleY,
                                       calculatedDotRadius, position.x, position.y, labelsGroup);

  // Create text label
  return createDotLabel(index, label, finalLabelX, position.y, labelsGroup);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getLabelPosition,
    createPointerLine,
    createDotLabel,
    addRbaLabel,
    addClsLabel,
    createGroupLabel,
    createAllDotLabels
  };
}
