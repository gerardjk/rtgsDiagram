// Line and path drawing logic

/**
 * Create blue connecting lines from dots to big circle
 */
function createBlueConnectingLines(blueCircleX, cyBig, actualCircleX, actualCircleY, blueLinesGroup, skipBlueLines) {
  if (skipBlueLines) return null;

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', blueCircleX);
  line.setAttribute('y1', cyBig);
  line.setAttribute('x2', actualCircleX);
  line.setAttribute('y2', actualCircleY);
  line.setAttribute('stroke', '#3b82f6');
  line.setAttribute('stroke-width', '1.5');
  line.setAttribute('opacity', '0.9');
  line.setAttribute('pointer-events', 'none');

  blueLinesGroup.appendChild(line);
  return line;
}

/**
 * Create orange connecting lines from dots to small circle
 */
function createOrangeConnectingLine(cx, cySmall, innerCircleX, innerCircleY, orangeLinesGroup) {
  const orangeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  orangeLine.setAttribute('x1', cx);
  orangeLine.setAttribute('y1', cySmall);
  orangeLine.setAttribute('x2', innerCircleX.toFixed(2));
  orangeLine.setAttribute('y2', innerCircleY.toFixed(2));
  orangeLine.setAttribute('stroke', '#f59e0b');
  orangeLine.setAttribute('stroke-width', '2.5');
  orangeLine.setAttribute('opacity', '1');

  orangeLinesGroup.appendChild(orangeLine);
  return orangeLine;
}

/**
 * Create curved J-shaped lines from boxes to RITS circle
 */
function createCurvedLineToCircle(sourceX, sourceY, bigCircleX, bigCircleY, bigCircleRadius, strokeColor, strokeWidth) {
  // Calculate end point on circle edge
  const dx = bigCircleX - sourceX;
  const dy = bigCircleY - sourceY;
  const angleToCenter = Math.atan2(dy, dx);

  const endX = bigCircleX - bigCircleRadius * Math.cos(angleToCenter);
  const endY = bigCircleY - bigCircleRadius * Math.sin(angleToCenter);

  // Control points for J-shaped curve
  const distX = endX - sourceX;
  const distY = endY - sourceY;

  const controlX1 = sourceX + Math.abs(distX) * 0.7;
  const controlY1 = sourceY;
  const controlX2 = endX - 10;
  const controlY2 = sourceY + distY * 0.5;

  const d = `M ${sourceX} ${sourceY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;

  return createStyledPath(d, {
    stroke: strokeColor,
    strokeWidth: strokeWidth,
    fill: 'none',
    strokeLinecap: 'round'
  });
}

/**
 * Create connecting lines between DvP/RTGS boxes and CHESS/Austraclear
 */
function createAustraclearConnectingLines(dvpRtgsX, rectWidth, chessBoxX, chessY, smallRectHeight,
                                         verticalGap, austraclearLineColor, austraclearLineWidth, svg, labelsGroup) {
  const lines = [];

  for (let j = 0; j < 3; j++) {
    const lineY = chessY + (smallRectHeight + verticalGap) * j + smallRectHeight / 2;
    const x1 = dvpRtgsX + rectWidth / 2;
    const y1 = lineY;
    const x2 = chessBoxX;
    const y2 = lineY;

    const austLine = createStyledLine(x1, y1, x2, y2, {
      stroke: austraclearLineColor,
      strokeWidth: austraclearLineWidth,
      strokeLinecap: 'round',
      strokeDasharray: j === 0 ? '5,5' : undefined
    });
    svg.insertBefore(austLine, labelsGroup);
    lines.push(austLine);
  }

  return lines;
}

/**
 * Create NPP to ADI line
 */
function createNppToAdiLine(nppBoxEl, purpleBoxEl, adiBoxData, nonAdiBoxData) {
  if (!nppBoxEl || !adiBoxData) return null;

  const nppX = parseFloat(nppBoxEl.getAttribute('x'));
  const nppY = parseFloat(nppBoxEl.getAttribute('y'));
  const nppWidth = parseFloat(nppBoxEl.getAttribute('width'));
  const nppHeight = parseFloat(nppBoxEl.getAttribute('height'));

  if (![nppX, nppY, nppWidth, nppHeight].every(Number.isFinite)) return null;

  let startX = nppX + nppWidth;
  let startY = nppY + nppHeight / 2;

  if (purpleBoxEl) {
    const purpleX = parseFloat(purpleBoxEl.getAttribute('x'));
    const purpleWidth = parseFloat(purpleBoxEl.getAttribute('width'));
    if ([purpleX, purpleWidth].every(Number.isFinite)) {
      startX = purpleX + purpleWidth;
    }
  }

  const nonAdiRightEdge = nonAdiBoxData ? nonAdiBoxData.x + nonAdiBoxData.width : startX + 300;
  const extendPastNonAdi = nonAdiRightEdge + 60;
  const curveStartMinimum = startX + 120;
  let curveStartX = Math.max(curveStartMinimum, nonAdiRightEdge - 80);

  if (curveStartX < startX + 40) {
    curveStartX = startX + 40;
  }

  const strokeWidth = 6;
  const strokeHalf = strokeWidth / 2;
  const sourceTopY = nppY;
  const sourceHeight = nppHeight;
  const entryRatio = -0.4;
  const requestedY = sourceTopY + sourceHeight * entryRatio;
  const maxInside = sourceTopY + sourceHeight - strokeHalf - 1;
  startY = Math.min(maxInside, requestedY);

  const adiTop = adiBoxData.y;
  const endY = adiTop - strokeHalf;
  const endX = extendPastNonAdi + 15;

  const verticalDistance = endY - startY;
  const control1X = curveStartX + 60;
  const control1Y = startY;
  const control2X = extendPastNonAdi;
  const control2Y = startY + verticalDistance * 0.15;

  const pathData = `M ${startX.toFixed(2)} ${startY.toFixed(2)} ` +
                   `L ${curveStartX.toFixed(2)} ${startY.toFixed(2)} ` +
                   `C ${control1X.toFixed(2)} ${control1Y.toFixed(2)}, ` +
                     `${control2X.toFixed(2)} ${control2Y.toFixed(2)}, ` +
                     `${endX.toFixed(2)} ${endY.toFixed(2)}`;

  return createStyledPath(pathData, {
    stroke: '#5dd9b8',
    strokeWidth: '6',
    fill: 'none',
    strokeLinecap: 'round',
    id: 'npp-to-adi-line'
  });
}

/**
 * Create sigmoid S-curve between two points
 */
function createSigmoidCurve(startX, startY, endX, endY, strokeColor, strokeWidth) {
  const numPoints = 50;
  const points = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;

    // Basic S-curve: flat-slope-flat
    let progress;
    if (t < 0.2) {
      progress = 0;
    } else if (t > 0.8) {
      progress = 1;
    } else {
      // Linear slope in the middle
      progress = (t - 0.2) / 0.6;
    }

    const x = startX + (endX - startX) * t;
    const y = startY + (endY - startY) * progress;

    if (i === 0) {
      points.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`);
    } else {
      points.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
  }

  const pathData = points.join(' ');

  return createStyledPath(pathData, {
    stroke: strokeColor,
    strokeWidth: strokeWidth,
    fill: 'none',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  });
}

/**
 * Create CLS AUD line that curves around SWIFT HVCS
 */
function createClsAudLine(clsAudRect, swiftHvcsRect, swiftPdsRect, smallRectHeight) {
  if (!clsAudRect || !swiftHvcsRect || !swiftPdsRect) return null;

  const clsBoxX = parseFloat(clsAudRect.getAttribute('x'));
  const clsBoxY = parseFloat(clsAudRect.getAttribute('y'));
  const clsStartY = clsBoxY + smallRectHeight / 2;

  const hvcsX = parseFloat(swiftHvcsRect.getAttribute('x'));
  const hvcsWidth = parseFloat(swiftHvcsRect.getAttribute('width'));
  const hvcsY = parseFloat(swiftHvcsRect.getAttribute('y'));
  const hvcsHeight = parseFloat(swiftHvcsRect.getAttribute('height'));
  const hvcsRightEdge = hvcsX + hvcsWidth;
  const hvcsBottomY = hvcsY + hvcsHeight;

  const swiftPdsX = parseFloat(swiftPdsRect.getAttribute('x'));
  const swiftPdsWidth = parseFloat(swiftPdsRect.getAttribute('width'));
  const swiftPdsRightEdge = swiftPdsX + swiftPdsWidth;

  const cornerRadius = 15;
  const leftPadding = 10;
  const bottomPadding = 10;

  const pathStartX = clsBoxX;
  const pathStartY = clsStartY;
  const verticalX = hvcsX - leftPadding;
  const turnY1 = clsStartY;
  const turnY2 = hvcsBottomY + bottomPadding;
  const pathEndX = swiftPdsRightEdge;

  const pathData = `M ${pathStartX} ${pathStartY} ` +
                   `L ${verticalX + cornerRadius} ${pathStartY} ` +
                   `Q ${verticalX} ${pathStartY}, ${verticalX} ${pathStartY + cornerRadius} ` +
                   `L ${verticalX} ${turnY2 - cornerRadius} ` +
                   `Q ${verticalX} ${turnY2}, ${verticalX + cornerRadius} ${turnY2} ` +
                   `L ${pathEndX} ${turnY2}`;

  return createStyledPath(pathData, {
    stroke: '#CCFF00',
    strokeWidth: '6',
    fill: 'none',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    id: 'cls-aud-line-new'
  });
}

/**
 * Create NPP to FSS sigmoid curve
 */
function createNppToFssCurve(nppRightX, nppCenterY, fssCenterX, fssCenterY, fssRadius) {
  const fssLeftEdgeX = fssCenterX - fssRadius;
  const midX = (nppRightX + fssLeftEdgeX) / 2;
  const fssConnectionY = fssCenterY + fssRadius * 0.5;

  const sigmoidData = `M ${nppRightX} ${nppCenterY}
                      C ${midX} ${nppCenterY},
                        ${midX} ${fssConnectionY},
                        ${fssLeftEdgeX} ${fssConnectionY}`;

  return createStyledPath(sigmoidData, {
    stroke: '#5dd9b8',
    strokeWidth: '6',
    fill: 'none',
    id: 'npp-to-fss-path'
  });
}

/**
 * Create double lines (for card connections)
 */
function createDoubleLine(x1, y1, x2, y2, strokeColor, strokeWidth, offset = 1.25) {
  const lines = [];

  for (let i = 0; i < 2; i++) {
    const yOffset = i === 0 ? -offset : offset;
    const line = createStyledLine(x1, y1 + yOffset, x2, y2 + yOffset, {
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      strokeLinecap: 'round'
    });
    lines.push(line);
  }

  return lines;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createBlueConnectingLines,
    createOrangeConnectingLine,
    createCurvedLineToCircle,
    createAustraclearConnectingLines,
    createNppToAdiLine,
    createSigmoidCurve,
    createClsAudLine,
    createNppToFssCurve,
    createDoubleLine
  };
}
