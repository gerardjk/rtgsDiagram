// All lines from the diagram in specified order
const allLines = [
  { color: '#5dd9b8', strokeWidth: 6, style: 'solid', name: 'ISO 20022 (SWIFT)' },
  { color: '#00FF33', strokeWidth: 6, style: 'solid', name: 'ISO 20022 CLS PvP' },
  { color: '#5B8FE8', strokeWidth: 6, style: 'solid', name: 'ASX EXIGO' },
  { color: '#FFB380', strokeWidth: 2, style: 'double', name: 'Settlement-only Batch XML' },
  { color: '#E94B9C', strokeWidth: 1, style: 'triple', name: 'Reservation Batch XML' },
  { color: '#B5AFA0', strokeWidth: 1.5, style: 'double', name: 'LVSS FSI XML' },
  { color: '#800000', strokeWidth: 1.5, style: 'double', name: 'AusPayNet DE (ABA) file' },
  { color: '#808080', strokeWidth: 1, style: 'solid', name: 'APCS Image Exchange Presentment' },
  { color: 'rgb(100,80,180)', strokeWidth: 2, style: 'solid', name: 'EPAL Settlement File Formats' },
  { color: 'rgb(216,46,43)', strokeWidth: 2, style: 'solid', name: 'Mastercard IPM File Format' },
  { color: '#FFB380', strokeWidth: 2, style: 'solid', name: 'Visa Base II File Format' },
  { color: '#27AEE3', strokeWidth: 1, style: 'double', name: 'Proprietary Scheme Formats (AMEX / UnionPay / Diners)' },
  { color: '#E94B9C', strokeWidth: 3, style: 'solid', name: 'PEXA ELNO Messages' },
  { color: 'rgb(239,136,51)', strokeWidth: 3, style: 'solid', name: 'Sympli ELNO Messages' }
];

// Create SVG line sample
function createLineSample(lineConfig) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '200');
  svg.setAttribute('height', '30');
  svg.setAttribute('viewBox', '0 0 200 30');

  if (lineConfig.style === 'triple') {
    // Triple line for Sympli/PEXA
    const gap = 2;
    const positions = [-gap, 0, gap];
    positions.forEach(offset => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '10');
      line.setAttribute('y1', `${15 + offset}`);
      line.setAttribute('x2', '190');
      line.setAttribute('y2', `${15 + offset}`);
      line.setAttribute('stroke', lineConfig.color);
      line.setAttribute('stroke-width', lineConfig.strokeWidth);
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
    });
  } else if (lineConfig.style === 'double') {
    // Double line
    const gap = 1.5; // Match the spacing in the actual visualization
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', '10');
    line1.setAttribute('y1', `${15 - gap}`);
    line1.setAttribute('x2', '190');
    line1.setAttribute('y2', `${15 - gap}`);
    line1.setAttribute('stroke', lineConfig.color);
    line1.setAttribute('stroke-width', lineConfig.strokeWidth);
    line1.setAttribute('stroke-linecap', 'round');

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', '10');
    line2.setAttribute('y1', `${15 + gap}`);
    line2.setAttribute('x2', '190');
    line2.setAttribute('y2', `${15 + gap}`);
    line2.setAttribute('stroke', lineConfig.color);
    line2.setAttribute('stroke-width', lineConfig.strokeWidth);
    line2.setAttribute('stroke-linecap', 'round');

    svg.appendChild(line1);
    svg.appendChild(line2);
  } else {
    // Single line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '10');
    line.setAttribute('y1', '15');
    line.setAttribute('x2', '190');
    line.setAttribute('y2', '15');
    line.setAttribute('stroke', lineConfig.color);
    line.setAttribute('stroke-width', lineConfig.strokeWidth);
    line.setAttribute('stroke-linecap', 'round');

    if (lineConfig.style === 'dotted') {
      line.setAttribute('stroke-dasharray', '5,5');
    } else if (lineConfig.style === 'dashed') {
      line.setAttribute('stroke-dasharray', '10,5');
    }

    svg.appendChild(line);
  }

  return svg;
}

// Create legend item
function createLegendItem(lineConfig) {
  const item = document.createElement('div');
  item.className = 'legend-item';

  const sampleContainer = document.createElement('div');
  sampleContainer.className = 'line-sample';
  sampleContainer.appendChild(createLineSample(lineConfig));

  const label = document.createElement('div');
  label.className = 'line-label';
  label.textContent = lineConfig.name;

  item.appendChild(sampleContainer);
  item.appendChild(label);

  return item;
}

// Create dot sample
function createDotSample(color, strokeColor) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '200');
  svg.setAttribute('height', '30');
  svg.setAttribute('viewBox', '0 0 200 30');

  // Create a single dot with black outline, centered under the lines
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '100');  // Center of the 200px width
  circle.setAttribute('cy', '15');
  circle.setAttribute('r', '5');
  circle.setAttribute('fill', color);
  circle.setAttribute('stroke', strokeColor || '#000000');
  circle.setAttribute('stroke-width', '1');
  svg.appendChild(circle);

  return svg;
}

// Create dot legend item
function createDotLegendItem(color, strokeColor, name) {
  const item = document.createElement('div');
  item.className = 'legend-item';

  const sampleContainer = document.createElement('div');
  sampleContainer.className = 'line-sample';
  sampleContainer.appendChild(createDotSample(color, strokeColor));

  const label = document.createElement('div');
  label.className = 'line-label';
  label.textContent = name;

  item.appendChild(sampleContainer);
  item.appendChild(label);

  return item;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('legend-container');

  // Add all lines
  allLines.forEach(line => {
    container.appendChild(createLegendItem(line));
  });

  // Add dots at the bottom
  container.appendChild(createDotLegendItem('#3b82f6', '#000000', 'ESA (unconnected use Settlement Agent)'));
  container.appendChild(createDotLegendItem('#FFA500', '#000000', 'FSS Allocations'));
});