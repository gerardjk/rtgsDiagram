// Box and rectangle creation logic

/**
 * Create SWIFT PDS box
 */
function createSwiftPdsBox(rectX, rectY, swiftRectWidth, rectHeight, labelsGroup) {
  const swiftRect = createStyledRect(rectX, rectY, swiftRectWidth, rectHeight, {
    fill: '#063d38',
    stroke: '#00ffdf',
    strokeWidth: '2'
  });
  swiftRect.setAttribute('id', 'swift-pds-rect');
  labelsGroup.appendChild(swiftRect);

  // Add text
  const swiftCenterX = rectX + swiftRectWidth / 2;
  const swiftCenterY = rectY + rectHeight / 2;
  const swiftRectText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  swiftRectText.setAttribute('x', swiftCenterX.toFixed(2));
  swiftRectText.setAttribute('y', swiftCenterY.toFixed(2));
  swiftRectText.setAttribute('text-anchor', 'middle');
  swiftRectText.setAttribute('dominant-baseline', 'middle');
  swiftRectText.setAttribute('fill', '#ffffff');
  swiftRectText.setAttribute('font-family', "'Nunito Sans', sans-serif");
  swiftRectText.setAttribute('font-size', '18');
  swiftRectText.setAttribute('font-weight', 'bold');

  const swiftLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  swiftLine1.setAttribute('x', swiftCenterX.toFixed(2));
  swiftLine1.setAttribute('dy', '-0.5em');
  swiftLine1.textContent = 'SWIFT';
  swiftRectText.appendChild(swiftLine1);

  const swiftLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  swiftLine2.setAttribute('x', swiftCenterX.toFixed(2));
  swiftLine2.setAttribute('dy', '1.2em');
  swiftLine2.textContent = 'PDS';
  swiftRectText.appendChild(swiftLine2);

  swiftRectText.setAttribute('id', 'swift-pds-text');
  labelsGroup.appendChild(swiftRectText);

  return { rect: swiftRect, text: swiftRectText, centerX: swiftCenterX, centerY: swiftCenterY };
}

/**
 * Create SWIFT HVCS bounding box with PACS boxes
 */
function createSwiftHvcsBox(smallRectX, rectY, pacsBoxWidth, smallRectHeight, verticalGap, labelsGroup, backgroundGroup) {
  const boundingBoxPaddingH = 10;
  const boundingBoxPaddingV = 5;
  const labelSpace = 45;

  // Create bounding box
  const boundingBox = createStyledRect(
    smallRectX - boundingBoxPaddingH,
    rectY - boundingBoxPaddingV,
    pacsBoxWidth + boundingBoxPaddingH * 2,
    (smallRectHeight + verticalGap) * 3 - verticalGap + boundingBoxPaddingV * 2 + labelSpace,
    {
      fill: '#063d38',
      stroke: '#00ffdf',
      strokeWidth: '3',
      rx: '8',
      ry: '8'
    }
  );

  if (backgroundGroup) {
    backgroundGroup.appendChild(boundingBox);
  }

  // Create PACS boxes
  const pacsElements = [];
  const pacsLabels = ['pacs.009', 'pacs.008', 'pacs.004'];

  for (let j = 0; j < 3; j++) {
    const smallRectY = rectY + (smallRectHeight + verticalGap) * j;

    const smallRect = createStyledRect(smallRectX, smallRectY, pacsBoxWidth, smallRectHeight, {
      fill: '#00ffdf',
      stroke: 'none',
      strokeWidth: '1',
      rx: '12',
      ry: '12'
    });
    labelsGroup.appendChild(smallRect);

    const pacsText = createStyledText(
      smallRectX + pacsBoxWidth / 2,
      smallRectY + smallRectHeight / 2,
      pacsLabels[j],
      {
        fill: '#063d38',
        fontSize: '11'
      }
    );
    labelsGroup.appendChild(pacsText);

    pacsElements.push({rect: smallRect, text: pacsText});
  }

  // Add SWIFT HVCS label
  const boundingBoxWidth = pacsBoxWidth + boundingBoxPaddingH * 2;
  const pacs004Y = rectY + (smallRectHeight + verticalGap) * 2;
  const pacs004Bottom = pacs004Y + smallRectHeight;
  const boundingBoxBottom = rectY + (smallRectHeight + verticalGap) * 3 - verticalGap + boundingBoxPaddingV * 2 + labelSpace;
  const labelY = pacs004Bottom + (boundingBoxBottom - pacs004Bottom) / 2;

  const hvcsLabel = createStyledText(
    smallRectX + pacsBoxWidth / 2,
    labelY,
    'SWIFT HVCS',
    {
      fill: '#ffffff',
      fontSize: '16',
      fontWeight: 'bold'
    }
  );
  labelsGroup.appendChild(hvcsLabel);

  return {
    boundingBox,
    pacsElements,
    hvcsLabel,
    width: boundingBoxWidth,
    height: (smallRectHeight + verticalGap) * 3 - verticalGap + boundingBoxPaddingV * 2 + labelSpace
  };
}

/**
 * Create Austraclear box
 */
function createAustraclearBox(baseX, austraclearY, rectWidth, austraclearHeight, labelsGroup) {
  const austraclearRect = createStyledRect(baseX, austraclearY, rectWidth, austraclearHeight, {
    fill: '#e8ecf7',
    stroke: '#071f6a',
    strokeWidth: '2'
  });
  labelsGroup.appendChild(austraclearRect);

  const austraclearText = createStyledText(
    baseX + rectWidth / 2,
    austraclearY + austraclearHeight / 2,
    'Austraclear',
    {
      fill: '#ffffff',
      fontSize: '18'
    }
  );
  labelsGroup.appendChild(austraclearText);

  return { rect: austraclearRect, text: austraclearText };
}

/**
 * Create CHESS-RTGS box
 */
function createChessRtgsBox(chessBoxX, chessY, chessBoxWidth, smallRectHeight, labelsGroup) {
  const narrowRect = createStyledRect(chessBoxX, chessY, chessBoxWidth, smallRectHeight, {
    fill: '#e8ecf7',
    stroke: 'white',
    strokeWidth: '0.5'
  });
  labelsGroup.appendChild(narrowRect);

  const chessText = createStyledText(
    chessBoxX + chessBoxWidth / 2,
    chessY + smallRectHeight / 2,
    'CHESS-RTGS',
    {
      fill: '#ffffff',
      fontSize: '11',
      dominantBaseline: 'middle',
      textAnchor: 'middle'
    }
  );
  labelsGroup.appendChild(chessText);

  return { rect: narrowRect, text: chessText };
}

/**
 * Create DvP RTGS box
 */
function createDvpRtgsBox(dvpRtgsX, dvpRtgsY, rectWidth, austraclearHeight, labelsGroup) {
  const dvpRtgsRect = createStyledRect(dvpRtgsX, dvpRtgsY, rectWidth / 2, austraclearHeight, {
    fill: '#4a5a8a',
    stroke: 'none',
    opacity: '0.5',
    rx: '10',
    ry: '10'
  });
  labelsGroup.appendChild(dvpRtgsRect);

  const dvpRtgsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  dvpRtgsText.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
  dvpRtgsText.setAttribute('y', (dvpRtgsY + austraclearHeight / 2).toFixed(2));
  dvpRtgsText.setAttribute('text-anchor', 'middle');
  dvpRtgsText.setAttribute('dominant-baseline', 'middle');
  dvpRtgsText.setAttribute('fill', '#ffffff');
  dvpRtgsText.setAttribute('font-family', "'Nunito Sans', sans-serif");
  dvpRtgsText.setAttribute('font-size', '11');
  dvpRtgsText.setAttribute('font-weight', 'normal');

  const dvpTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  dvpTspan.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
  dvpTspan.setAttribute('dy', '-0.5em');
  dvpTspan.textContent = 'DvP';
  dvpRtgsText.appendChild(dvpTspan);

  const rtgsTspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  rtgsTspan.setAttribute('x', (dvpRtgsX + rectWidth / 4).toFixed(2));
  rtgsTspan.setAttribute('dy', '1em');
  rtgsTspan.textContent = 'RTGS';
  dvpRtgsText.appendChild(rtgsTspan);

  labelsGroup.appendChild(dvpRtgsText);

  return { rect: dvpRtgsRect, text: dvpRtgsText };
}

/**
 * Create NPP box
 */
function createNppBox(nppRectX, nppY, nppSwiftRectWidth, nppRectHeight, labelsGroup) {
  const nppBox = createStyledRect(nppRectX, nppY, nppSwiftRectWidth, nppRectHeight + 5, {
    fill: '#063d38',
    stroke: '#00ffdf',
    strokeWidth: '2'
  });
  nppBox.setAttribute('id', 'npp-box');
  labelsGroup.appendChild(nppBox);

  const nppCenterX = nppRectX + nppSwiftRectWidth / 2;
  const nppCenterY = nppY + nppRectHeight / 2;
  const nppLineOffset = 10;

  const nppTopText = createStyledText(nppCenterX, nppCenterY - nppLineOffset, 'NPP BI', {
    fill: '#ffffff',
    fontSize: '18',
    fontWeight: 'bold'
  });
  nppTopText.setAttribute('id', 'npp-text-top');
  labelsGroup.appendChild(nppTopText);

  const nppBottomText = createStyledText(nppCenterX, nppCenterY + nppLineOffset, '(SWIFT)', {
    fill: '#ffffff',
    fontSize: '14',
    fontWeight: 'bold'
  });
  nppBottomText.setAttribute('id', 'npp-text-bottom');
  labelsGroup.appendChild(nppBottomText);

  return {
    box: nppBox,
    topText: nppTopText,
    bottomText: nppBottomText,
    centerX: nppCenterX,
    centerY: nppCenterY
  };
}

/**
 * Create Administered Batches boxes (Mastercard, Eftpos, PEXA, ASXF, ASX Settlement)
 */
function createAdministeredBatchesBoxes(widerAdminBoxX, mastercardY, eftposY, pexaY, asxfY, bridgeY,
                                       widerAdminBoxWidth, hexHeight, labelsGroup) {
  const boxes = {};

  // Mastercard box
  boxes.mastercard = createStyledRect(widerAdminBoxX, mastercardY, widerAdminBoxWidth, hexHeight, {
    fill: '#a52c28',
    stroke: 'white',
    strokeWidth: '0.5'
  });
  labelsGroup.appendChild(boxes.mastercard);

  boxes.mastercardText = createStyledText(
    widerAdminBoxX + widerAdminBoxWidth / 2,
    mastercardY + hexHeight / 2,
    'MCAU',
    {
      fill: '#ffffff',
      fontSize: '12'
    }
  );
  labelsGroup.appendChild(boxes.mastercardText);

  // Eftpos box
  boxes.eftpos = createStyledRect(widerAdminBoxX, eftposY, widerAdminBoxWidth, hexHeight, {
    fill: '#D8D0F0',
    stroke: 'white',
    strokeWidth: '0.5'
  });
  labelsGroup.appendChild(boxes.eftpos);

  boxes.eftposText = createStyledText(
    widerAdminBoxX + widerAdminBoxWidth / 2,
    eftposY + hexHeight / 2,
    'ESSB',
    {
      fill: '#ffffff',
      fontSize: '12'
    }
  );
  labelsGroup.appendChild(boxes.eftposText);

  // PEXA box
  boxes.pexa = createStyledRect(widerAdminBoxX, pexaY, widerAdminBoxWidth, hexHeight, {
    fill: '#FDE2F9',
    stroke: 'rgb(179,46,161)',
    strokeWidth: '2'
  });
  labelsGroup.appendChild(boxes.pexa);

  boxes.pexaText = createStyledText(
    widerAdminBoxX + widerAdminBoxWidth / 2,
    pexaY + hexHeight / 2,
    'PEXA',
    {
      fill: '#ffffff',
      fontSize: '12'
    }
  );
  labelsGroup.appendChild(boxes.pexaText);

  // ASXF box
  boxes.asxf = createStyledRect(widerAdminBoxX, asxfY, widerAdminBoxWidth, hexHeight, {
    fill: '#e8ecf7',
    stroke: '#071f6a',
    strokeWidth: '2'
  });
  labelsGroup.appendChild(boxes.asxf);

  boxes.asxfText = createStyledText(
    widerAdminBoxX + widerAdminBoxWidth / 2,
    asxfY + hexHeight / 2,
    'ASXF',
    {
      fill: '#ffffff',
      fontSize: '12'
    }
  );
  labelsGroup.appendChild(boxes.asxfText);

  // ASX Settlement box
  boxes.bridge = createStyledRect(widerAdminBoxX, bridgeY, widerAdminBoxWidth, hexHeight, {
    fill: '#e8ecf7',
    stroke: '#071f6a',
    strokeWidth: '2'
  });
  labelsGroup.appendChild(boxes.bridge);

  boxes.bridgeText = createStyledText(
    widerAdminBoxX + widerAdminBoxWidth / 2,
    bridgeY + hexHeight / 2,
    'ASXB',
    {
      fill: '#ffffff',
      fontSize: '12'
    }
  );
  labelsGroup.appendChild(boxes.bridgeText);

  return boxes;
}

/**
 * Create group bounding boxes (ADI, Non-ADI, PSPs, CS)
 */
function createGroupBoundingBoxes(dotPositions, dotRadius, svg, labelsGroup, blueLinesGroup) {
  const boxes = {};

  // ADI box (dots 1-91)
  let minX = null, minY = null, maxX = null, maxY = null;
  for (let j = 1; j < 92; j++) {
    if (dotPositions[j]) {
      if (minX === null || dotPositions[j].x < minX) minX = dotPositions[j].x;
      if (maxX === null || dotPositions[j].x > maxX) maxX = dotPositions[j].x;
      if (minY === null || dotPositions[j].y < minY) minY = dotPositions[j].y;
      if (maxY === null || dotPositions[j].y > maxY) maxY = dotPositions[j].y;
    }
  }

  if (minX !== null && maxX !== null) {
    const innerLeftPadding = 60;
    const innerTopPadding = 30;
    const innerBottomPadding = 6;
    const innerRightPadding = 284;

    boxes.adi = createStyledRect(
      minX - innerLeftPadding - dotRadius,
      minY - innerTopPadding - dotRadius,
      (maxX - minX) + innerLeftPadding + innerRightPadding + dotRadius * 2,
      (maxY - minY) + innerTopPadding + innerBottomPadding + dotRadius * 2,
      {
        fill: 'rgba(219, 234, 254, 1)',
        stroke: '#2563eb',
        strokeWidth: '2',
        rx: '8'
      }
    );
    boxes.adi.setAttribute('fill-opacity', '0.25');

    const esaRect = document.getElementById('blue-dots-background');
    svg.insertBefore(boxes.adi, esaRect.nextSibling);

    // Add ADIs label
    const adiRectX = parseFloat(boxes.adi.getAttribute('x'));
    const adiRectY = parseFloat(boxes.adi.getAttribute('y'));
    const adiRectWidth = parseFloat(boxes.adi.getAttribute('width'));

    boxes.adiText = createStyledText(
      adiRectX + adiRectWidth - 15,
      adiRectY + 35,
      'ADIs',
      {
        textAnchor: 'end',
        fill: '#2563eb',
        fontSize: '24'
      }
    );
    labelsGroup.appendChild(boxes.adiText);
  }

  return boxes;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createSwiftPdsBox,
    createSwiftHvcsBox,
    createAustraclearBox,
    createChessRtgsBox,
    createDvpRtgsBox,
    createNppBox,
    createAdministeredBatchesBoxes,
    createGroupBoundingBoxes
  };
}
