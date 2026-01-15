/**
 * Interactive tooltip and highlighting system
 * Handles hover interactions, tooltips, and coordinated highlighting
 */

// Tooltip state
let currentTooltip = null;
let currentHighlightedElements = new Set();
let tooltipIsSticky = false;
let stickyElementId = null;
let lastHoveredElementId = null;  // Track for delegation-based hover
let justMadeSticky = false;  // Prevent document click from immediately dismissing
const highlightElementCache = new Map();
const boxCircleCache = new Map();
let allCircleElements = null;

/**
 * Create the tooltip element (only created once)
 */
function createTooltipElement() {
  if (document.getElementById('diagram-tooltip')) return;

  // Detect Firefox and DPI scaling
  const isFirefox = /firefox/i.test(navigator.userAgent);
  const dpr = window.devicePixelRatio || 1;
  const scaleFactor = isFirefox ? (2 / dpr) : 1; // Firefox dpr=10, Chrome dpr=2

  // Create wrapper div for scaling (Firefox only)
  let tooltip;
  if (isFirefox) {
    // Outer wrapper handles scaling
    const wrapper = document.createElement('div');
    wrapper.id = 'diagram-tooltip';
    wrapper.dataset.firefoxWrapper = 'true';
    wrapper.style.position = 'fixed';
    wrapper.style.transformOrigin = 'top left';
    wrapper.style.transform = `scale(${scaleFactor})`;
    wrapper.style.pointerEvents = 'auto';
    wrapper.style.zIndex = '10000';
    wrapper.style.opacity = '0';
    wrapper.style.transition = 'opacity 0.15s ease';

    // Inner div handles content and width (wraps at 320px before scaling)
    tooltip = document.createElement('div');
    tooltip.id = 'diagram-tooltip-content';
    tooltip.style.width = '320px';
    tooltip.style.background = 'transparent';
    tooltip.style.color = 'white';
    tooltip.style.padding = '12px 14px';
    tooltip.style.borderRadius = '8px';
    tooltip.style.fontFamily = "'Roboto Mono', monospace";
    tooltip.style.fontSize = '13px';
    tooltip.style.lineHeight = '1.4';
    tooltip.style.letterSpacing = '0.02em';
    tooltip.style.boxShadow = '0 2px 12px rgba(0,0,0,0.5)';
    tooltip.style.border = '2px solid rgba(255, 255, 255, 0.45)';
    tooltip.style.cursor = 'pointer';
    tooltip.style.whiteSpace = 'normal';
    tooltip.style.overflowWrap = 'break-word';

    wrapper.appendChild(tooltip);
    document.body.appendChild(wrapper);

    // Dismiss tooltip when mouse leaves it (if sticky)
    wrapper.addEventListener('mouseleave', handleTooltipMouseLeave);
  } else {
    // Chrome: apply same scaling as Firefox for consistent size
    const chromeScaleFactor = 2 / dpr; // Match Firefox scaling

    tooltip = document.createElement('div');
    tooltip.id = 'diagram-tooltip';
    tooltip.style.position = 'fixed';
    tooltip.style.background = 'transparent';
    tooltip.style.color = 'white';
    tooltip.style.padding = '12px 14px';
    tooltip.style.borderRadius = '8px';
    tooltip.style.fontFamily = "'Roboto Mono', monospace";
    tooltip.style.fontSize = '13px';
    tooltip.style.lineHeight = '1.4';
    tooltip.style.letterSpacing = '0.02em';
    tooltip.style.pointerEvents = 'auto';
    tooltip.style.zIndex = '10000';
    tooltip.style.width = '320px';
    tooltip.style.boxShadow = '0 2px 12px rgba(0,0,0,0.5)';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.15s ease';
    tooltip.style.border = '2px solid rgba(255, 255, 255, 0.45)';
    tooltip.style.transformOrigin = 'top left';
    tooltip.style.transform = `scale(${chromeScaleFactor})`; // Scale down to match Firefox
    tooltip.style.cursor = 'pointer';
    tooltip.style.whiteSpace = 'normal';
    tooltip.style.overflowWrap = 'break-word';

    document.body.appendChild(tooltip);

    // Dismiss tooltip when mouse leaves it (if sticky)
    tooltip.addEventListener('mouseleave', handleTooltipMouseLeave);
  }
}

/**
 * Handle mouse leaving the tooltip
 */
function handleTooltipMouseLeave(event) {
  // If tooltip is sticky, don't dismiss on mouse leave - require click to dismiss
  if (tooltipIsSticky) return;

  // Check if moving back to the interactive element
  const relatedTarget = event.relatedTarget;
  if (relatedTarget && relatedTarget.closest && relatedTarget.closest('[data-interactive-id]')) {
    return;
  }

  hideTooltip();
  clearHighlights();
}

/**
 * Extract the primary color from an element (fill or stroke)
 */
function getElementColor(elementId, event) {
  // Helper to extract non-transparent color from an element
  const extractColor = (el) => {
    if (!el) return null;

    // For groups, look at the first child with a fill/stroke
    if (el.tagName.toLowerCase() === 'g') {
      const colorChild = el.querySelector('circle, rect, path');
      if (colorChild) el = colorChild;
    }

    // Get fill or stroke color
    let color = el.getAttribute('fill');
    if (!color || color === 'none' || color === 'transparent') {
      color = el.getAttribute('stroke');
    }

    // Return null if still transparent/none
    if (!color || color === 'none' || color === 'transparent') {
      return null;
    }

    return color;
  };

  // Try to find ALL elements with matching data-interactive-id
  // This handles cases where both hit area (transparent) and visible line share the same ID
  const elements = document.querySelectorAll(`[data-interactive-id="${elementId}"]`);
  for (const el of elements) {
    const color = extractColor(el);
    if (color) return color;
  }

  // Fallback: try event target
  if (event && event.currentTarget) {
    const color = extractColor(event.currentTarget);
    if (color) return color;
  }

  // Fallback: try by ID
  const elementById = document.getElementById(elementId);
  if (elementById) {
    const color = extractColor(elementById);
    if (color) return color;
  }

  return null;
}

/**
 * Darken a color for use as tooltip background
 */
function darkenColor(color, factor = 0.3) {
  if (!color || color === 'none' || color === 'transparent') return null;

  // Handle hex colors
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = Math.floor(parseInt(hex.slice(0, 2), 16) * factor);
    const g = Math.floor(parseInt(hex.slice(2, 4), 16) * factor);
    const b = Math.floor(parseInt(hex.slice(4, 6), 16) * factor);
    return `rgba(${r}, ${g}, ${b}, 0.97)`;
  }

  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = Math.floor(parseInt(rgbMatch[1]) * factor);
    const g = Math.floor(parseInt(rgbMatch[2]) * factor);
    const b = Math.floor(parseInt(rgbMatch[3]) * factor);
    return `rgba(${r}, ${g}, ${b}, 0.97)`;
  }

  return null;
}

/**
 * Lighten a color for use as tooltip background (for line tooltips)
 */
function lightenColor(color, factor = 0.7) {
  if (!color || color === 'none' || color === 'transparent') return null;

  // Handle hex colors
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    // Blend with white to lighten
    const newR = Math.floor(r + (255 - r) * factor);
    const newG = Math.floor(g + (255 - g) * factor);
    const newB = Math.floor(b + (255 - b) * factor);
    return `rgba(${newR}, ${newG}, ${newB}, 0.97)`;
  }

  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    // Blend with white to lighten
    const newR = Math.floor(r + (255 - r) * factor);
    const newG = Math.floor(g + (255 - g) * factor);
    const newB = Math.floor(b + (255 - b) * factor);
    return `rgba(${newR}, ${newG}, ${newB}, 0.97)`;
  }

  return null;
}

/**
 * Add alpha transparency to a color (keep original RGB values)
 */
function addAlpha(color, alpha = 0.97) {
  if (!color || color === 'none' || color === 'transparent') return null;

  // Handle hex colors
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return null;
}

/**
 * Normalize an interactive element ID so variants (e.g., yellow-dot-#) map to their base entity
 */
function resolveHoverTarget(elementId) {
  let targetId = elementId;
  let dotIndex = null;
  let isYellowDot = false;

  if (elementId && elementId.startsWith('yellow-dot-')) {
    const idx = parseInt(elementId.replace('yellow-dot-', ''), 10);
    if (!Number.isNaN(idx)) {
      targetId = `dot-${idx}`;
      dotIndex = idx;
      isYellowDot = true;
    }
  } else if (elementId && elementId.startsWith('dot-')) {
    const idx = parseInt(elementId.replace('dot-', ''), 10);
    if (!Number.isNaN(idx)) {
      dotIndex = idx;
    }
  }

  return { targetId, dotIndex, isYellowDot };
}

/**
 * Show tooltip for an element
 * @param {string} elementId - The resolved element ID (used for tooltip content lookup)
 * @param {Event} event - The mouse event
 * @param {string} originalElementId - The original element ID before resolution (used for color)
 */
function showTooltip(elementId, event, originalElementId) {
  const tooltipWrapper = document.getElementById('diagram-tooltip');
  if (!tooltipWrapper) return;

  // Check if this is Firefox wrapper structure or Chrome single div
  const isFirefoxWrapper = tooltipWrapper.dataset.firefoxWrapper === 'true';
  const tooltipContentElement = isFirefoxWrapper ? document.getElementById('diagram-tooltip-content') : tooltipWrapper;

  // Check if this element has a tooltipFrom relationship (show another element's tooltip)
  const relationship = window.elementRelationships?.[elementId];
  let tooltipSourceId = relationship?.tooltipFrom || elementId;

  // Map blue-line-X and yellow-line-X to their corresponding dot-X for tooltip content
  const blueLineMatch = elementId.match(/^blue-line-(\d+)$/);
  const yellowLineMatch = elementId.match(/^yellow-line-(\d+)$/);
  if (blueLineMatch) {
    tooltipSourceId = `dot-${blueLineMatch[1]}`;
  } else if (yellowLineMatch) {
    tooltipSourceId = `dot-${yellowLineMatch[1]}`;
  }

  const content = window.tooltipContent?.[tooltipSourceId];
  if (!content) {
    tooltipWrapper.style.opacity = '0';
    return;
  }

  // Get element color and apply to tooltip background
  // Use originalElementId if provided (for yellow dots to show yellow color)
  const colorElementId = originalElementId || elementId;
  // Check for ESA dots and their lines (exclude RBA dot-0 which gets normal styling)
  const isRbaElement = colorElementId === 'dot-0' || elementId === 'dot-0';
  const isEsaDot = !isRbaElement && (colorElementId.startsWith('dot-') || colorElementId.startsWith('yellow-dot-'));
  const isEsaLine = colorElementId.startsWith('blue-line-') || colorElementId.startsWith('yellow-line-');

  // Use explicit color if specified, otherwise look up from element
  // ESA dots and lines use their own color (so yellow dots/lines show yellow, not blue)
  let elementColor;
  if (content.color) {
    // Explicit color specified in tooltip data
    elementColor = content.color;
  } else {
    let colorSourceId;
    if (content.colorFrom) {
      colorSourceId = content.colorFrom;
    } else if (isEsaLine) {
      // For ESA lines, always use the corresponding dot's color
      // blue-line-X -> dot-X, yellow-line-X -> yellow-dot-X
      if (blueLineMatch) {
        colorSourceId = `dot-${blueLineMatch[1]}`;
      } else if (yellowLineMatch) {
        colorSourceId = `yellow-dot-${yellowLineMatch[1]}`;
      } else {
        colorSourceId = colorElementId;
      }
    } else if (isEsaDot) {
      colorSourceId = colorElementId;
    } else {
      colorSourceId = tooltipSourceId;
    }
    elementColor = getElementColor(colorSourceId, event);
  }

  // Line style: light background with dark text
  const isLineStyle = content.lineStyle === true;

  // ESA dots and their lines use actual color with black text
  const isEsaElement = isEsaDot || isEsaLine;

  // RITS and CLS circles get square corners
  const isRitsCircle = elementId === 'rits-circle';
  const isClsCircle = elementId === 'cls-circle' || tooltipSourceId === 'cls-circle';
  const hasSipsStyle = content.sipsStyle === true;
  const isSipsStyle = isRitsCircle || isClsCircle || hasSipsStyle;

  // Prominent Payment Systems (eftpos, Mastercard, Visa, NPP, BECS) get similar styling to SIPS
  const isProminentSystem = content.prominentSystem === true;

  // RBA Systems (OPA, RBA, BDF, GABS, BECG) get dark red border
  const isRbaSystem = content.rbaSystem === true;

  let tooltipBgColor;
  if (isLineStyle) {
    tooltipBgColor = lightenColor(elementColor, 0.6) || 'rgba(220, 220, 220, 0.97)';
    tooltipContentElement.style.borderColor = elementColor || 'rgba(100, 100, 100, 0.6)';
  } else if (isEsaElement) {
    // ESA dots and lines: use actual color (slightly transparent) with black text
    tooltipBgColor = addAlpha(elementColor, 0.97) || 'rgba(100, 150, 255, 0.97)';
    tooltipContentElement.style.borderColor = 'rgba(0, 0, 0, 0.3)';
  } else {
    tooltipBgColor = darkenColor(elementColor) || 'rgba(12, 12, 12, 0.97)';
    tooltipContentElement.style.borderColor = 'rgba(255, 255, 255, 0.45)';
  }
  tooltipContentElement.style.background = tooltipBgColor;

  // Determine tooltip size based on element type
  const isRba = elementId === 'dot-0';
  const isDot = !isRba && (elementId.startsWith('dot-') || elementId.startsWith('yellow-dot-'));
  const isLine = elementId.startsWith('blue-line-') || elementId.startsWith('yellow-line-');
  const isSmallStyle = isDot || isLine || content.smallStyle;  // Use small style for dots, their lines, or elements with smallStyle flag
  const isCompactStyle = content.compactStyle;  // Compact style for batch boxes (MCAU, ESSB, PEXA, ASXF, ASXB)

  if (isCompactStyle) {
    // Compact tooltips for batch boxes - between small (240px) and normal (320px)
    tooltipContentElement.style.width = '280px';
    tooltipContentElement.style.minWidth = '';
    tooltipContentElement.style.maxWidth = '280px';
    tooltipContentElement.style.padding = '10px 12px';
    tooltipContentElement.style.borderWidth = '2px';
  } else if (isSmallStyle) {
    // Smaller tooltips for ESA dots and elements with smallStyle
    tooltipContentElement.style.width = '240px';
    tooltipContentElement.style.minWidth = '';
    tooltipContentElement.style.maxWidth = '240px';
    tooltipContentElement.style.padding = '8px 10px';
    tooltipContentElement.style.borderWidth = '1px';
  } else if (isLineStyle) {
    // LineStyle tooltips: fixed width for consistency
    tooltipContentElement.style.width = '400px';
    tooltipContentElement.style.minWidth = '';
    tooltipContentElement.style.maxWidth = '400px';
    tooltipContentElement.style.padding = '12px 14px';
    tooltipContentElement.style.borderWidth = '2px';
  } else {
    // Normal tooltips: fixed width for consistency
    tooltipContentElement.style.width = '400px';
    tooltipContentElement.style.minWidth = '';
    tooltipContentElement.style.maxWidth = '400px';
    tooltipContentElement.style.padding = '12px 14px';
    tooltipContentElement.style.borderWidth = '2px';
  }

  // Set border radius - square edges for RITS, CLS, and Prominent Systems
  const useSquareCorners = isSipsStyle || isProminentSystem;
  tooltipContentElement.style.borderRadius = useSquareCorners ? '0px' : '8px';

  // RITS, CLS, and Prominent Systems get lightened element color borders, thicker
  const accentColor = (isSipsStyle || isProminentSystem) ? lightenColor(elementColor, 0.5) : null;
  if (isRitsCircle || isClsCircle) {
    tooltipContentElement.style.borderColor = accentColor || 'rgba(255, 255, 255, 0.9)';
    tooltipContentElement.style.borderWidth = '3px';
    // Wider tooltip for RITS/CLS to avoid word wrap on long subtitles
    tooltipContentElement.style.width = '480px';
    tooltipContentElement.style.maxWidth = '480px';
  } else if (hasSipsStyle) {
    tooltipContentElement.style.borderColor = accentColor || 'rgba(255, 255, 255, 0.9)';
    tooltipContentElement.style.borderWidth = '3px';
  } else if (isProminentSystem) {
    tooltipContentElement.style.borderColor = accentColor || 'rgba(255, 255, 255, 0.9)';
    tooltipContentElement.style.borderWidth = '3px';
  } else if (isRbaSystem) {
    // Dark red border for RBA-related systems
    tooltipContentElement.style.borderColor = 'rgb(139, 69, 69)';
    tooltipContentElement.style.borderWidth = '3px';
  }

  // Build tooltip HTML with new design
  let html = '';

  // Font sizes - smaller for small style tooltips, medium for compact style
  const titleSize = isCompactStyle ? '15px' : (isSmallStyle ? '13px' : '18px');
  const subtitleSize = isCompactStyle ? '12px' : (isSmallStyle ? '10px' : '15px');
  const textSize = isCompactStyle ? '11px' : (isSmallStyle ? '9px' : '13px');
  const detailSize = isSmallStyle ? '9px' : '11px';  // Not used for compactStyle

  // Text colors - dark for line style, ESA dots and ESA lines, light for normal
  const useDarkText = isLineStyle || isEsaElement;
  const titleColor = useDarkText ? '#222' : 'white';
  const subtitleColor = useDarkText ? '#333' : 'white';
  const textColor = useDarkText ? '#444' : 'white';
  const detailColor = useDarkText ? '#555' : 'white';

  // For Prominent Systems, add "Prominent Payment System" as pre-pre-heading
  if (isProminentSystem) {
    const ppsColor = accentColor || subtitleColor;
    html += `<div style="font-weight: normal; font-style: italic; font-size: 11px; color: ${ppsColor}; margin-bottom: 6px;">Prominent Payment System</div>`;
  }

  // PreHeading - smaller
  // Italic for RITS/CLS (SIPS), NOT italic for Prominent Systems
  // "Australian Payments Plus" is always bold, and white for Prominent Systems
  if (content.preHeading) {
    const isAustralianPaymentsPlus = content.preHeading === 'Australia Payments Plus';
    const preHeadingColor = (isProminentSystem && isAustralianPaymentsPlus) ? 'white' : (accentColor || subtitleColor);
    const preHeadingWeight = isAustralianPaymentsPlus ? 'font-weight: bold;' : 'font-weight: normal;';
    const preHeadingStyle = (isRitsCircle || isClsCircle) ? 'font-style: italic;' : '';
    html += `<div style="${preHeadingWeight} ${preHeadingStyle} font-size: 11px; color: ${preHeadingColor}; margin-bottom: 10px;">${content.preHeading}</div>`;
  }

  // Title - larger, bold (italicised for line tooltips and small tooltips)
  if (content.title) {
    const titleStyle = (isLineStyle || isSmallStyle) ? 'font-style: italic;' : '';
    const titleMargin = content.title2 ? '4px' : (isSmallStyle ? '2px' : (isCompactStyle ? '6px' : '10px'));
    html += `<div style="font-weight: bold; font-size: ${titleSize}; color: ${titleColor}; ${titleStyle} margin-bottom: ${titleMargin};">${content.title}</div>`;
  }

  // Title2 - same size as title, for double-heading tooltips
  if (content.title2) {
    const titleStyle = (isLineStyle || isSmallStyle) ? 'font-style: italic;' : '';
    html += `<div style="font-weight: bold; font-size: ${titleSize}; color: ${titleColor}; ${titleStyle} margin-bottom: ${isSmallStyle ? '4px' : (isCompactStyle ? '8px' : '12px')};">${content.title2}</div>`;
  }

  // Subtitle - normal size, bold (show for lineStyle if present)
  if (content.subtitle) {
    const subtitleStyle = isLineStyle ? 'font-style: italic;' : '';
    html += `<div style="font-size: ${subtitleSize}; color: ${subtitleColor}; font-weight: bold; ${subtitleStyle} margin-bottom: ${isSmallStyle ? '4px' : (isCompactStyle ? '8px' : '12px')};">${content.subtitle}</div>`;
  }

  // Description - smaller, italic for normal style (not compact), bold for lineStyle
  if (content.description) {
    const descStyle = (!isLineStyle && !isSmallStyle && !isEsaElement && !isCompactStyle) ? 'font-style: italic;' : '';
    const descWeight = isLineStyle ? 'font-weight: bold;' : '';
    html += `<div style="font-size: ${textSize}; color: ${textColor}; ${descStyle} ${descWeight} line-height: 1.4; margin-bottom: ${isSmallStyle ? '4px' : (isCompactStyle ? '0px' : '12px')};">${content.description}</div>`;
  }

  // Details - each on new line, smaller, no bullet points, bold for lineStyle
  // Skip details for compactStyle tooltips
  // Supports both array format (old) and paragraph string format (new)
  if (content.details && !isCompactStyle) {
    const detailWeight = isLineStyle ? 'font-weight: bold;' : '';
    // Handle both string (paragraph format with \n\n) and array format
    const detailItems = typeof content.details === 'string'
      ? content.details.split(/\n{2,}/).filter(Boolean)
      : Array.isArray(content.details)
        ? content.details
        : [];
    detailItems.forEach(detail => {
      html += `<div style="font-size: ${detailSize}; color: ${detailColor}; ${detailWeight} line-height: 1.4; margin-bottom: 8px;">${detail}</div>`;
    });
  }

  tooltipContentElement.innerHTML = html;

  // Store link for click handler
  tooltipContentElement.dataset.link = content.link || '';

  // Remove old click listeners and add new one
  tooltipContentElement.onclick = function(e) {
    // Only open link if tooltip is sticky (user clicked once to pin it)
    if (!tooltipIsSticky) return;

    if (tooltipContentElement.dataset.link) {
      const newWindow = window.open(tooltipContentElement.dataset.link, '_blank', 'noopener,noreferrer');
      if (newWindow) newWindow.blur();
      window.focus();
      // Dismiss tooltip after opening link
      hideTooltip();
      clearHighlights();
    }
    e.stopPropagation();
  };

  // Position tooltip near mouse
  const padding = 15;
  let x = event.clientX + padding;
  let y = event.clientY + padding;

  // Keep tooltip on screen
  const rect = tooltipWrapper.getBoundingClientRect();
  if (x + rect.width > window.innerWidth) {
    x = event.clientX - rect.width - padding;
  }
  if (y + rect.height > window.innerHeight) {
    y = event.clientY - rect.height - padding;
  }

  tooltipWrapper.style.left = x + 'px';
  tooltipWrapper.style.top = y + 'px';
  tooltipWrapper.style.opacity = '1';
  tooltipWrapper.style.pointerEvents = 'auto';  // Re-enable pointer events when visible
}

/**
 * Hide tooltip
 */
function hideTooltip() {
  const tooltip = document.getElementById('diagram-tooltip');
  if (tooltip) {
    tooltip.style.opacity = '0';
    tooltip.style.pointerEvents = 'none';  // Prevent blocking hover events when hidden
  }
  tooltipIsSticky = false;
  stickyElementId = null;
}

function applyTemporaryWillChange(element) {
  if (!element || element.dataset.tempWillChange === 'true') return;
  element.dataset.originalWillChange = element.style.willChange || '';
  element.style.willChange = 'filter';
  element.dataset.tempWillChange = 'true';
}

function clearTemporaryWillChange(element) {
  if (!element || element.dataset.tempWillChange !== 'true') return;
  if (element.dataset.originalWillChange) {
    element.style.willChange = element.dataset.originalWillChange;
  } else {
    element.style.removeProperty('will-change');
  }
  delete element.dataset.tempWillChange;
  delete element.dataset.originalWillChange;
}

/**
 * Highlight an element (make it glow/brighter)
 * Handles multiple elements with the same ID
 */
function highlightElement(elementId) {
  // Don't highlight during animation
  if (document.body.classList.contains('animating-startup')) return;

  let elements = highlightElementCache.get(elementId);
  if (!elements) {
    elements = Array.from(document.querySelectorAll(`[data-interactive-id="${elementId}"]`));
    if (elements.length) {
      highlightElementCache.set(elementId, elements);
    }
  }

  // Special handling for dots (e.g., dot-50, dot-51, etc.)
  if (!elements.length && elementId.startsWith('dot-')) {
    const dotIndex = parseInt(elementId.replace('dot-', ''));
    if (window.dotPositions && window.dotPositions[dotIndex]) {
      const dotPos = window.dotPositions[dotIndex];
      // Find circles at this position (both blue and yellow)
      if (!allCircleElements) {
        allCircleElements = Array.from(document.querySelectorAll('circle'));
      }
      const matchingCircles = [];
      allCircleElements.forEach(circle => {
        const cx = parseFloat(circle.getAttribute('cx'));
        const cy = parseFloat(circle.getAttribute('cy'));
        const r = parseFloat(circle.getAttribute('r'));

        // Check if circle is at this dot's position (within tolerance)
        if (r && r < 30 && Math.abs(cx - dotPos.x) < 5 && Math.abs(cy - dotPos.y) < 5) {
          circle.classList.add('highlighted');
          if (!circle.dataset.originalFilter) {
            circle.dataset.originalFilter = circle.style.filter || 'none';
          }
          circle.style.filter = 'brightness(1.6) drop-shadow(0 0 18px rgba(255,255,255,1)) drop-shadow(0 0 10px rgba(255,255,255,1)) drop-shadow(0 0 4px rgba(255,255,255,1))';
          applyTemporaryWillChange(circle);
          currentHighlightedElements.add(circle);
          matchingCircles.push(circle);
        }
      });
      if (matchingCircles.length) {
        highlightElementCache.set(elementId, matchingCircles);
      }
    }
    return;
  }

  // Special handling for group elements by ID (e.g., blue-connecting-lines, small-group, etc.)
  // Optimized: apply simple brightness filter to group instead of expensive per-element filters
  if (!elements.length) {
    const groupElement = document.getElementById(elementId);
    if (groupElement) {
      // For groups with many children, apply glow to the group as a whole (faster than per-child)
      if (elementId === 'blue-connecting-lines' || elementId === 'yellow-circles') {
        groupElement.classList.add('highlighted');
        if (!groupElement.dataset.originalFilter) {
          groupElement.dataset.originalFilter = groupElement.style.filter || 'none';
        }
        groupElement.style.filter = 'brightness(1.5) drop-shadow(0 0 10px rgba(255,255,255,0.9)) drop-shadow(0 0 5px rgba(255,255,255,0.8))';
        applyTemporaryWillChange(groupElement);
        currentHighlightedElements.add(groupElement);
        highlightElementCache.set(elementId, [groupElement]);
        return;
      }

      // For other groups, use glow
      groupElement.classList.add('highlighted');
      if (!groupElement.dataset.originalFilter) {
        groupElement.dataset.originalFilter = groupElement.style.filter || 'none';
      }
      groupElement.style.filter = 'brightness(1.4) drop-shadow(0 0 10px rgba(255,255,255,0.9)) drop-shadow(0 0 5px rgba(255,255,255,0.8))';
      applyTemporaryWillChange(groupElement);
      currentHighlightedElements.add(groupElement);
      highlightElementCache.set(elementId, [groupElement]);
      return;
    }
  }

  // Try to find elements by class name (for lines with class-based identification)
  if (!elements.length) {
    const classBased = document.querySelectorAll(`.${elementId}`);
    if (classBased.length) {
      classBased.forEach(el => {
        el.classList.add('highlighted');
        if (!el.dataset.originalFilter) {
          el.dataset.originalFilter = el.style.filter || 'none';
        }
        el.style.filter = 'brightness(1.5) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.8))';
        applyTemporaryWillChange(el);
        currentHighlightedElements.add(el);
      });
      return;
    }
  }

  if (!elements.length) return;

  elements.forEach(element => {
    // Special handling for RITS circle - skip filter to avoid interfering with rotation animation
    if (elementId === 'rits-circle' && element.id === 'big-group') {
      return;
    }

    // Special handling for FSS circle - glow static parts only (not rotating gears)
    if ((elementId === 'fss-circle' || elementId === 'small-group') && element.id === 'small-group') {
      // Glow the static circle parts (small-outer, small-inner) and text label - skip gears
      const smallOuter = document.getElementById('small-outer');
      const smallInner = document.getElementById('small-inner');
      const smallLabel = document.getElementById('small-label');
      [smallOuter, smallInner, smallLabel].forEach(el => {
        if (el) {
          el.classList.add('highlighted');
          if (!el.dataset.originalFilter) {
            el.dataset.originalFilter = el.style.filter || 'none';
          }
          el.style.filter = 'brightness(1.3) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.8))';
          applyTemporaryWillChange(el);
          currentHighlightedElements.add(el);
        }
      });
      return;
    }

    // Special handling for LVSS gear - include glow (single element, not animated)
    if (elementId === 'lvss-gear') {
      element.classList.add('highlighted');
      if (!element.dataset.originalFilter) {
        element.dataset.originalFilter = element.style.filter || 'none';
      }
      element.style.filter = 'brightness(1.3) drop-shadow(0 0 10px rgba(255,255,255,0.9)) drop-shadow(0 0 5px rgba(255,255,255,0.8))';
      applyTemporaryWillChange(element);
      currentHighlightedElements.add(element);
      return;
    }

    element.classList.add('highlighted');

    // Store original styles if not already stored
    if (!element.dataset.originalOpacity) {
      element.dataset.originalOpacity = element.style.opacity || '1';
      element.dataset.originalFilter = element.style.filter || 'none';
    }

    applyTemporaryWillChange(element);

    // Apply highlight effect - use CSS drop-shadow for glow (simpler elements are fine)
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'rect') {
      element.style.filter = 'brightness(1.3) drop-shadow(0 0 10px rgba(255,255,255,0.9)) drop-shadow(0 0 5px rgba(255,255,255,0.8))';
    } else if (tagName === 'circle') {
      element.style.filter = 'brightness(1.6) drop-shadow(0 0 18px rgba(255,255,255,1)) drop-shadow(0 0 10px rgba(255,255,255,1)) drop-shadow(0 0 4px rgba(255,255,255,1))';
    } else if (tagName === 'path' || tagName === 'line') {
      // Stronger glow for thin lines - triple drop-shadow for more visibility
      element.style.filter = 'brightness(1.6) drop-shadow(0 0 8px rgba(255,255,255,1)) drop-shadow(0 0 4px rgba(255,255,255,1)) drop-shadow(0 0 2px rgba(255,255,255,1))';
    } else if (tagName === 'text') {
      element.style.filter = 'brightness(1.3) drop-shadow(0 0 4px rgba(255,255,255,0.7))';
    }

    currentHighlightedElements.add(element);
  });
}

/**
 * Remove highlight from an element
 * Handles multiple elements with the same ID
 */
function unhighlightElement(elementId) {
  const cached = highlightElementCache.get(elementId);
  const elements = cached && cached.length ? cached :
    Array.from(document.querySelectorAll(`[data-interactive-id="${elementId}"]`));
  if (!elements.length) return;

  elements.forEach(element => {
    element.classList.remove('highlighted');

    // Restore original styles
    if (element.dataset.originalOpacity) {
      element.style.opacity = element.dataset.originalOpacity;
    }
    if (element.dataset.originalFilter) {
      // If original was 'none' or empty, remove inline style to let CSS take over
      if (element.dataset.originalFilter === 'none' || element.dataset.originalFilter === '') {
        element.style.removeProperty('filter');
      } else {
        element.style.filter = element.dataset.originalFilter;
      }
    }

    clearTemporaryWillChange(element);

    // Restore original stroke width for lines
    if (element.tagName.toLowerCase() === 'line' && element.dataset.originalStrokeWidth) {
      element.setAttribute('stroke-width', element.dataset.originalStrokeWidth);
    }

    currentHighlightedElements.delete(element);
  });
}

/**
 * Clear all highlights
 */
function clearHighlights() {
  currentHighlightedElements.forEach(item => {
    if (!(item instanceof Element)) return;
    if (!item.parentNode) return;
    item.classList.remove('highlighted');
    if (item.dataset.originalOpacity) {
      item.style.opacity = item.dataset.originalOpacity;
    }
    if (item.dataset.originalFilter) {
      // If original was 'none' or empty, remove inline style to let CSS take over
      if (item.dataset.originalFilter === 'none' || item.dataset.originalFilter === '') {
        item.style.removeProperty('filter');
      } else {
        item.style.filter = item.dataset.originalFilter;
      }
    }
    if (item.tagName.toLowerCase() === 'line' && item.dataset.originalStrokeWidth) {
      item.setAttribute('stroke-width', item.dataset.originalStrokeWidth);
    }
    clearTemporaryWillChange(item);
  });
  setBlueDotsHighlight(false);
  setYellowDotsHighlight(false);
  setYellowLinesHighlight(false);
  setBlueLinesHighlight(false);
  setBigCircleHighlight(false);
  setSmallCircleHighlight(false);
  currentHighlightedElements.clear();
}

/**
 * Helper function to highlight circles within a box's bounds
 * @param {string} boxElementId - ID of the box element
 */
function highlightCirclesInBox(boxElementId) {
  const circles = getCirclesForBox(boxElementId);
  if (!circles) return;

  circles.forEach(circle => {
    circle.classList.add('highlighted');
    if (!circle.dataset.originalFilter) {
      circle.dataset.originalFilter = circle.style.filter || 'none';
    }
    circle.style.filter = 'brightness(1.6) drop-shadow(0 0 18px rgba(255,255,255,1)) drop-shadow(0 0 10px rgba(255,255,255,1)) drop-shadow(0 0 4px rgba(255,255,255,1))';
    applyTemporaryWillChange(circle);
    currentHighlightedElements.add(circle);
  });
}

function getCirclesForBox(boxElementId) {
  if (boxCircleCache.has(boxElementId)) {
    return boxCircleCache.get(boxElementId);
  }

  const boxElement =
    document.getElementById(boxElementId) ||
    document.querySelector(`[data-interactive-id="${boxElementId}"]`);
  if (!boxElement) return null;

  const boxRect = boxElement.getBBox();
  const boxLeft = boxRect.x;
  const boxRight = boxRect.x + boxRect.width;
  const boxTop = boxRect.y;
  const boxBottom = boxRect.y + boxRect.height;

  if (!allCircleElements) {
    allCircleElements = Array.from(document.querySelectorAll('circle'));
  }

  const circles = allCircleElements.filter(circle => {
    if (circle.dataset.interactiveId === 'dot-0') {
      return false;
    }

    const smallGroup = document.getElementById('small-group');
    if (smallGroup && smallGroup.contains(circle)) {
      return false;
    }

    const bigGroup = document.getElementById('big-group');
    if (bigGroup && bigGroup.contains(circle)) {
      return false;
    }

    const cx = parseFloat(circle.getAttribute('cx'));
    const cy = parseFloat(circle.getAttribute('cy'));
    const r = parseFloat(circle.getAttribute('r'));

    if (!r || r >= 70 || !cx || !cy) {
      return false;
    }

    return cx >= boxLeft && cx <= boxRight && cy >= boxTop && cy <= boxBottom;
  });

  boxCircleCache.set(boxElementId, circles);
  return circles;
}

/**
 * Handle mouse enter on an interactive element
 */
const bigCircleIds = ['big-outer', 'big-inner', 'big-label'];
const smallCircleIds = ['small-outer', 'small-inner', 'small-label'];
let cachedBigCircleElements = null;
let cachedSmallCircleElements = null;
let cachedYellowLines = null;
let cachedYellowDots = null;
let cachedBlueDots = null;
let cachedBlueLinesGroup = null;

function toggleCollectionClass(elements, className, enable) {
  const method = enable ? 'add' : 'remove';
  elements.forEach(el => {
    if (!el) return;
    el.classList[method](className);
  });
}

let blueDotsHighlightActive = false;
function setBlueDotsHighlight(enable) {
  if (blueDotsHighlightActive === enable) return;
  ensureHoverStyleClasses();
  blueDotsHighlightActive = enable;
  toggleCollectionClass(getCachedBlueDots(), 'hover-dot-glow', enable);
}

let yellowDotsHighlightActive = false;
function setYellowDotsHighlight(enable) {
  if (yellowDotsHighlightActive === enable) return;
  ensureHoverStyleClasses();
  yellowDotsHighlightActive = enable;
  toggleCollectionClass(getCachedYellowDots(), 'hover-dot-glow', enable);
}

let yellowLinesHighlightActive = false;
function setYellowLinesHighlight(enable) {
  if (yellowLinesHighlightActive === enable) return;
  ensureHoverStyleClasses();
  yellowLinesHighlightActive = enable;
  toggleCollectionClass(getCachedYellowLines(), 'hover-line-glow', enable);
}

let blueLinesHighlightActive = false;
function setBlueLinesHighlight(enable) {
  if (blueLinesHighlightActive === enable) return;
  ensureHoverStyleClasses();
  blueLinesHighlightActive = enable;
  if (!cachedBlueLinesGroup) {
    cachedBlueLinesGroup = document.getElementById('blue-connecting-lines');
  }
  if (!cachedBlueLinesGroup) return;
  const method = enable ? 'add' : 'remove';
  cachedBlueLinesGroup.classList[method]('hover-blue-line');
}

let bigCircleHighlightActive = false;
function setBigCircleHighlight(enable) {
  if (bigCircleHighlightActive === enable) return;
  ensureHoverStyleClasses();
  bigCircleHighlightActive = enable;
  toggleCollectionClass(getCachedBigCircleElements(), 'hover-circle-glow', enable);
}

let smallCircleHighlightActive = false;
function setSmallCircleHighlight(enable) {
  if (smallCircleHighlightActive === enable) return;
  ensureHoverStyleClasses();
  smallCircleHighlightActive = enable;
  toggleCollectionClass(getCachedSmallCircleElements(), 'hover-circle-glow', enable);
}

function ensureHoverStyleClasses() {
  if (document.getElementById('diagram-hover-highlight-styles')) return;
  const style = document.createElement('style');
  style.id = 'diagram-hover-highlight-styles';
  style.textContent = `
    .hover-dot-glow { filter: brightness(1.6) drop-shadow(0 0 18px rgba(255,255,255,1)) drop-shadow(0 0 10px rgba(255,255,255,1)) drop-shadow(0 0 4px rgba(255,255,255,1)); }
    .hover-circle-glow { filter: brightness(1.35) drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.8)); }
    .hover-line-glow { filter: brightness(1.5) drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 4px rgba(255,255,255,0.8)); }
    .hover-blue-line { filter: brightness(1.4); }
  `;
  document.head.appendChild(style);
}

function getCachedBigCircleElements() {
  if (!cachedBigCircleElements) {
    cachedBigCircleElements = bigCircleIds.map(id => document.getElementById(id)).filter(Boolean);
  }
  return cachedBigCircleElements;
}

function getCachedSmallCircleElements() {
  if (!cachedSmallCircleElements) {
    cachedSmallCircleElements = smallCircleIds.map(id => document.getElementById(id)).filter(Boolean);
  }
  return cachedSmallCircleElements;
}

function getCachedYellowLines() {
  if (!cachedYellowLines) {
    cachedYellowLines = Array.from(document.querySelectorAll('[data-interactive-id^="yellow-line-"], [data-interactive-id="rba-yellow-line"]'));
  }
  return cachedYellowLines;
}

function getCachedYellowDots() {
  if (!cachedYellowDots) {
    cachedYellowDots = Array.from(document.querySelectorAll('[data-interactive-id^="yellow-dot-"], [data-interactive-id="rba-yellow-dot"]'));
  }
  return cachedYellowDots;
}

function getCachedBlueDots() {
  if (!cachedBlueDots) {
    cachedBlueDots = Array.from(document.querySelectorAll('circle[data-interactive-id^="dot-"], circle[data-interactive-id="rba-blue-dot"]'));
  }
  return cachedBlueDots;
}

function handleMouseEnter(event) {
  // Completely skip if animating
  if (document.body.classList.contains('animating-startup')) return;

  const elementId = event.currentTarget.dataset.interactiveId;
  if (!elementId) return;

  const { targetId, dotIndex, isYellowDot } = resolveHoverTarget(elementId);
  if (!targetId) return;
  const overrideTarget = getHigherPriorityInteractive(event, targetId);
  if (overrideTarget) {
    handleMouseEnter({
      currentTarget: overrideTarget,
      clientX: event.clientX,
      clientY: event.clientY
    });
    return;
  }

  if (tooltipIsSticky && stickyElementId && stickyElementId !== targetId) {
    return;
  }

  // Clear any lingering highlights before applying new ones (unless we're re-entering the sticky element)
  if (!tooltipIsSticky || stickyElementId !== targetId) {
    clearHighlights();
  }

  // Show tooltip for this specific element
  // Pass original elementId for color (so yellow dots show yellow, not blue)
  showTooltip(targetId, event, elementId);

  // Special handling for boxes that should highlight contained dots
  if (targetId === 'blue-dots-background') {
    highlightElement(targetId);
    setBlueDotsHighlight(true);
    setYellowDotsHighlight(true);
    highlightElement('cls-circle');
  } else if (targetId === 'rits-circle') {
    setBigCircleHighlight(true);
    setSmallCircleHighlight(true);
    setBlueLinesHighlight(true);
    setYellowLinesHighlight(true);
    setBlueDotsHighlight(true);
    setYellowDotsHighlight(true);
    highlightElement('lvss-gear');
    highlightElement('cls-circle');
    highlightElement('blue-dots-background');
    return;
  } else if (targetId === 'fss-circle') {
    setSmallCircleHighlight(true);
    setYellowLinesHighlight(true);
    setYellowDotsHighlight(true);
  } else if (targetId === 'adi-box' || targetId === 'non-adis-box' ||
             targetId === 'domestic-banks-box' || targetId === 'international-banks-box' ||
             targetId === 'foreign-branches-box' || targetId === 'foreign-subsidiaries-box' ||
             targetId === 'specialised-adis-box' || targetId === 'other-adis-box' ||
             targetId === 'psps-box' || targetId === 'cs-box') {
    // Highlight the box itself
    highlightElement(targetId);

    // Highlight all circles within this box
    highlightCirclesInBox(targetId);
  } else {
    // Normal highlighting - highlight this element and all related elements
    let relatedElements;
    if (isYellowDot) {
      // Yellow dots should only highlight their own dot/lines, not entire peer groups
      relatedElements = new Set([targetId]);
    } else {
      relatedElements = window.getRelatedElements?.(targetId) || new Set([targetId]);
    }

    if (targetId.startsWith('dot-')) {
      // Ensure the radial lines for this dot also highlight
      const derivedDotIndex = dotIndex ?? parseInt(targetId.replace('dot-', ''), 10);
      if (!Number.isNaN(derivedDotIndex)) {
        relatedElements = new Set(relatedElements);
        relatedElements.add(`blue-line-${derivedDotIndex}`);
        if (window.yellowLinesByDot && window.yellowLinesByDot[derivedDotIndex]) {
          relatedElements.add(`yellow-line-${derivedDotIndex}`);
          relatedElements.add(`yellow-dot-${derivedDotIndex}`);
        } else if (isYellowDot) {
          relatedElements.add(`yellow-dot-${derivedDotIndex}`);
        }
      }
    }

    // When hovering on a blue-line, also highlight its corresponding dot
    if (targetId.startsWith('blue-line-')) {
      const lineIndex = parseInt(targetId.replace('blue-line-', ''), 10);
      if (!Number.isNaN(lineIndex)) {
        relatedElements = new Set(relatedElements);
        relatedElements.add(`dot-${lineIndex}`);
        // Also add yellow dot/line if this dot has FSS membership
        if (window.yellowLinesByDot && window.yellowLinesByDot[lineIndex]) {
          relatedElements.add(`yellow-line-${lineIndex}`);
          relatedElements.add(`yellow-dot-${lineIndex}`);
        }
      }
    }

    relatedElements.forEach(id => {
      highlightElement(id);
    });
  }

  // Ensure the specific yellow dot element glows when hovered directly
  if (isYellowDot && dotIndex !== null) {
    highlightElement(`yellow-dot-${dotIndex}`);
  }
}

/**
 * Handle mouse move on an interactive element (update tooltip position)
 */
function handleMouseMove(event) {
  // Completely skip if animating
  if (document.body.classList.contains('animating-startup')) return;

  // Don't move tooltip if it's sticky (stationary)
  if (tooltipIsSticky) return;

  const tooltip = document.getElementById('diagram-tooltip');
  if (!tooltip || tooltip.style.opacity === '0') return;

  const padding = 15;
  let x = event.clientX + padding;
  let y = event.clientY + padding;

  const rect = tooltip.getBoundingClientRect();
  if (x + rect.width > window.innerWidth) {
    x = event.clientX - rect.width - padding;
  }
  if (y + rect.height > window.innerHeight) {
    y = event.clientY - rect.height - padding;
  }

  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}

/**
 * Handle mouse leave on an interactive element
 */
function handleMouseLeave(event) {
  // Completely skip if animating
  if (document.body.classList.contains('animating-startup')) return;

  // If tooltip is sticky, don't dismiss on mouse leave - require click to dismiss
  if (tooltipIsSticky) {
    return;
  }

  hideTooltip();
  clearHighlights();
}

/**
 * Handle click on an interactive element - toggle tooltip sticky state
 */
function handleClick(event) {
  const elementId = event.currentTarget.dataset.interactiveId;
  if (!elementId) return;

  const { targetId } = resolveHoverTarget(elementId);
  if (!targetId) return;
  const overrideTarget = getHigherPriorityInteractive(event, targetId);
  if (overrideTarget) {
    // Stop propagation on original event before recursive call
    if (event.stopPropagation) event.stopPropagation();
    handleClick({
      currentTarget: overrideTarget,
      clientX: event.clientX,
      clientY: event.clientY
    });
    return;
  }

  // If clicking on the same element that's already sticky, dismiss it
  if (tooltipIsSticky && stickyElementId === targetId) {
    hideTooltip();
    clearHighlights();
    tooltipIsSticky = false;
    stickyElementId = null;
    if (event.stopPropagation) event.stopPropagation();
    return;
  }

  // Make tooltip stationary (stop following mouse)
  tooltipIsSticky = true;
  stickyElementId = targetId;
  justMadeSticky = true;  // Prevent document handler from immediately dismissing

  // Clear flag after a short delay (after event bubbling completes)
  setTimeout(() => { justMadeSticky = false; }, 10);

  // Show tooltip in place; don't modify highlights (hover state controls glow)
  showTooltip(targetId, event);

  if (event.stopPropagation) event.stopPropagation();
}

/**
 * Make an SVG element interactive
 * Call this when creating elements in diagram-core-refactored.js
 */
function makeInteractive(element, elementId) {
  if (!element || !elementId) return;

  element.setAttribute('data-interactive-id', elementId);

  element.style.cursor = 'pointer';
  if (!element.style.pointerEvents || element.style.pointerEvents === 'none') {
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'path' || tagName === 'line') {
      element.style.pointerEvents = 'stroke';
    } else {
      element.style.pointerEvents = 'all';
    }
  }

}

function getHigherPriorityInteractive(event, targetId) {
  if (!event || !targetId || typeof event.clientX !== 'number' || typeof event.clientY !== 'number') {
    return null;
  }
  const overrideMap = {
    'directentry-to-adi-line': new Set(['osko-to-adi-line', 'cheques-to-apcs-line'])
  };
  const overrides = overrideMap[targetId];
  if (!overrides) return null;

  if (typeof document.elementsFromPoint !== 'function') return null;
  const stack = document.elementsFromPoint(event.clientX, event.clientY);
  if (!Array.isArray(stack)) return null;

  for (const el of stack) {
    if (!el) continue;
    const interactiveEl = el.closest ? el.closest('[data-interactive-id]') : null;
    if (!interactiveEl) continue;
    const id = interactiveEl.dataset.interactiveId;
    if (!id) continue;
    if (overrides.has(id)) {
      return interactiveEl;
    }
  }
  return null;
}

/**
 * Make an SVG element interactive for highlighting only (no tooltip)
 * Use this for elements that should trigger group highlights but not show tooltips
 */
function makeInteractiveHighlightOnly(element, elementId) {
  if (!element || !elementId) return;

  element.setAttribute('data-interactive-id', elementId);
  element.style.cursor = 'pointer';
  element.style.pointerEvents = 'all';  // Ensure element always receives pointer events

  // Custom handler that only does highlighting, no tooltip
  element.addEventListener('mouseenter', (event) => {
    const relatedElements = window.getRelatedElements?.(elementId) || new Set([elementId]);
    relatedElements.forEach(id => {
      highlightElement(id);
    });
  });
  element.addEventListener('mouseleave', handleMouseLeave);
}


/**
 * Handle document click to dismiss sticky tooltip
 */
function handleDocumentClick(event) {
  // Don't dismiss if tooltip was just made sticky (same click event)
  if (justMadeSticky) return;
  if (!tooltipIsSticky) return;

  const tooltip = document.getElementById('diagram-tooltip');
  const clickedOnTooltip = tooltip && tooltip.contains(event.target);
  const clickedOnInteractive = event.target.closest('[data-interactive-id]');

  // If clicked outside tooltip and outside interactive elements, dismiss
  if (!clickedOnTooltip && !clickedOnInteractive) {
    hideTooltip();
    clearHighlights();
  }
}

/**
 * Proximity-based hover detection for small blue dots
 * Finds the closest dot to the mouse cursor within a threshold
 */
let dotPositions = null;
let currentProximityDot = null;
let pendingSvgMouseMoveEvent = null;
let svgMouseMoveScheduled = false;

function cacheDotPositions() {
  dotPositions = [];
  const svg = document.querySelector('svg');
  if (!svg) return;

  // Find all small blue dots (circles with dot-N IDs, excluding CLS which is large)
  const dots = document.querySelectorAll('circle[data-interactive-id^="dot-"]');
  dots.forEach(dot => {
    const id = dot.dataset.interactiveId;
    const cx = parseFloat(dot.getAttribute('cx'));
    const cy = parseFloat(dot.getAttribute('cy'));
    const r = parseFloat(dot.getAttribute('r'));
    // Only include small dots (radius < 15)
    if (!isNaN(cx) && !isNaN(cy) && r < 15) {
      dotPositions.push({ id, cx, cy, r, element: dot });
    }
  });
}

function handleSvgMouseMove(event) {
  // Keep tooltip following the cursor via a single delegated listener
  handleMouseMove(event);
  if (tooltipIsSticky) return;
  pendingSvgMouseMoveEvent = {
    clientX: event.clientX,
    clientY: event.clientY,
    currentTarget: event.currentTarget
  };
  if (!svgMouseMoveScheduled) {
    svgMouseMoveScheduled = true;
    requestAnimationFrame(processSvgMouseMove);
  }
}

function processSvgMouseMove() {
  svgMouseMoveScheduled = false;
  const event = pendingSvgMouseMoveEvent;
  pendingSvgMouseMoveEvent = null;
  if (!event || tooltipIsSticky) return;

  if (!dotPositions || dotPositions.length === 0) {
    cacheDotPositions();
  }
  if (!dotPositions || dotPositions.length === 0) return;

  const svg = event.currentTarget;
  if (!svg) return;
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());

  // Find closest dot within threshold
  const threshold = 15; // Extra pixels beyond the dot radius
  let closestDot = null;
  let closestDist = Infinity;

  for (const dot of dotPositions) {
    const dx = svgPt.x - dot.cx;
    const dy = svgPt.y - dot.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const effectiveRadius = dot.r + threshold;

    if (dist < effectiveRadius && dist < closestDist) {
      closestDist = dist;
      closestDot = dot;
    }
  }

  // If we found a dot and it's different from current, trigger hover
  if (closestDot && closestDot.id !== currentProximityDot) {
    currentProximityDot = closestDot.id;
    // Simulate mouseenter on the dot
    const fakeEvent = {
      currentTarget: closestDot.element,
      clientX: event.clientX,
      clientY: event.clientY
    };
    handleMouseEnter(fakeEvent);
  } else if (!closestDot && currentProximityDot) {
    // Mouse moved away from all dots
    currentProximityDot = null;
    // Don't clear if tooltip is sticky
    if (!tooltipIsSticky) {
      hideTooltip();
      clearHighlights();
    }
  }
}

/**
 * Handle delegated mouseover on SVG - more reliable than individual mouseenter
 */
function handleSvgMouseOver(event) {
  // Find the interactive element under the mouse
  const interactiveEl = event.target.closest('[data-interactive-id]');

  if (interactiveEl) {
    const elementId = interactiveEl.dataset.interactiveId;
    const { targetId } = resolveHoverTarget(elementId);
    if (tooltipIsSticky && stickyElementId && stickyElementId !== targetId) {
      return;
    }

    // Only trigger if this is a different element than before
    if (targetId && targetId !== lastHoveredElementId) {
      lastHoveredElementId = targetId;

      // Create a fake event for handleMouseEnter
      const fakeEvent = {
        currentTarget: interactiveEl,
        clientX: event.clientX,
        clientY: event.clientY
      };
      handleMouseEnter(fakeEvent);
    }
  }
}

/**
 * Handle delegated mouseout on SVG
 */
function handleSvgMouseOut(event) {
  // Check if we're leaving to a non-interactive element
  const relatedTarget = event.relatedTarget;
  const leavingToInteractive = relatedTarget && relatedTarget.closest && relatedTarget.closest('[data-interactive-id]');
  const leavingToTooltip = relatedTarget && (relatedTarget.id === 'diagram-tooltip' || relatedTarget.closest('#diagram-tooltip'));

  if (!leavingToInteractive && !leavingToTooltip && !tooltipIsSticky) {
    lastHoveredElementId = null;
    hideTooltip();
    clearHighlights();
  }
}

/**
 * Initialize the interactive system
 * Call this once after the diagram is rendered
 */
function initializeInteractive() {
  createTooltipElement();
  // Listen for clicks outside to dismiss sticky tooltip
  document.addEventListener('click', handleDocumentClick);

  // Add delegated event handling on SVG for more reliable hover detection
  setTimeout(() => {
    const svg = document.querySelector('svg');
    if (svg) {
      cacheDotPositions();
      svg.addEventListener('mousemove', handleSvgMouseMove);
      // Add delegated mouseover/mouseout for reliability
      svg.addEventListener('mouseover', handleSvgMouseOver);
      svg.addEventListener('mouseout', handleSvgMouseOut);
      // Add delegated click for reliability
      svg.addEventListener('click', handleSvgClick);

    }
  }, 200); // Delay to ensure diagram is rendered
}

/**
 * Handle delegated click on SVG - more reliable than individual click listeners
 */
function handleSvgClick(event) {
  const interactiveEl = event.target.closest('[data-interactive-id]');

  if (interactiveEl) {
    const elementId = interactiveEl.dataset.interactiveId;
    const { targetId } = resolveHoverTarget(elementId);

    if (!targetId) return;

    // Check for override target
    const overrideTarget = getHigherPriorityInteractive(event, targetId);
    const finalTargetId = overrideTarget ? overrideTarget.dataset.interactiveId : targetId;
    const { targetId: resolvedFinalTargetId } = resolveHoverTarget(finalTargetId);

    // If clicking on the same element that's already sticky, dismiss it
    if (tooltipIsSticky && stickyElementId === resolvedFinalTargetId) {
      hideTooltip();
      clearHighlights();
      tooltipIsSticky = false;
      stickyElementId = null;
      event.stopPropagation();
      return;
    }

    // Make tooltip stationary
    tooltipIsSticky = true;
    stickyElementId = resolvedFinalTargetId;
    justMadeSticky = true;

    setTimeout(() => { justMadeSticky = false; }, 10);

    // Ensure tooltip and highlights are shown
    showTooltip(resolvedFinalTargetId, event, elementId);

    // For RITS, don't call getRelatedElements - handleMouseEnter already handles the special highlighting
    if (resolvedFinalTargetId !== 'rits-circle' && resolvedFinalTargetId !== 'fss-circle') {
      // Highlight this element and all related elements
      const relatedElements = window.getRelatedElements?.(resolvedFinalTargetId) || new Set([resolvedFinalTargetId]);
      relatedElements.forEach(id => {
        highlightElement(id);
      });
    }

    event.stopPropagation();
  }
}

// Store active flow animations for cleanup
const activeFlowAnimations = new Map();

/**
 * Create multiple flowing particles on a path - single animation loop keeps them evenly spaced
 * @param {string} pathId - The ID of the path element
 * @param {number} count - Number of particles (default: 3)
 * @param {Object} options - Configuration options
 * @param {string} options.color - Particle color (default: inherit from path stroke)
 * @param {number} options.size - Particle radius in pixels (default: 4)
 * @param {number} options.duration - Time for one particle to traverse the path in ms (default: 3000)
 * @param {boolean} options.reverse - Flow in reverse direction (default: false)
 * @returns {SVGCircleElement[]} Array of created particles
 */
function createFlowParticles(pathId, count = 3, options = {}) {
  const path = document.getElementById(pathId);
  if (!path || typeof path.getTotalLength !== 'function') {
    console.warn(`Path not found or invalid: ${pathId}`);
    return [];
  }

  const svg = document.getElementById('diagram');
  if (!svg) return [];

  // Always use white particles for better visibility
  const particleColor = '#ffffff';
  const size = options.size || 4;
  const duration = options.duration || 6000;
  const reverse = options.reverse || false;
  const pathLength = path.getTotalLength();

  // Create all particles
  const particles = [];
  for (let i = 0; i < count; i++) {
    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particle.setAttribute('r', size);
    particle.setAttribute('fill', particleColor);
    particle.setAttribute('stroke', particleColor);
    particle.setAttribute('stroke-width', '1');
    particle.classList.add('flow-particle');
    particle.style.filter = `drop-shadow(0 0 6px rgba(255,255,255,0.9)) drop-shadow(0 0 12px rgba(255,255,255,0.6))`;
    particle.style.pointerEvents = 'none';

    // Set initial position
    const initialProgress = i / count;
    const initialPoint = path.getPointAtLength(initialProgress * pathLength);
    particle.setAttribute('cx', initialPoint.x);
    particle.setAttribute('cy', initialPoint.y);

    svg.appendChild(particle);
    particles.push(particle);
  }

  // Single animation loop for all particles
  let animationId;
  let startTime = null;

  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const baseProgress = (elapsed % duration) / duration;

    // Position each particle with even spacing
    for (let i = 0; i < count; i++) {
      const offset = i / count;
      let progress = (baseProgress + offset) % 1;
      if (reverse) progress = 1 - progress;

      const point = path.getPointAtLength(progress * pathLength);
      particles[i].setAttribute('cx', point.x);
      particles[i].setAttribute('cy', point.y);

      // Ensure particle is visible
      if (!particles[i].getAttribute('opacity')) {
        particles[i].setAttribute('opacity', '1');
      }
    }

    animationId = requestAnimationFrame(animate);
  };

  animationId = requestAnimationFrame(animate);

  // Store for cleanup
  particles._animationId = animationId;
  activeFlowAnimations.set(pathId, { particles, animationId });

  return particles;
}

/**
 * Create a single flowing particle (convenience wrapper)
 */
function createFlowParticle(pathId, options = {}) {
  return createFlowParticles(pathId, 1, options)[0];
}

/**
 * Remove all flow particles from the diagram
 */
function clearFlowParticles() {
  // Clear any leftover animated paths from the gradient system
  document.querySelectorAll('[id$="-animated"]').forEach(el => el.remove());
  document.querySelectorAll('[id$="-flow-gradient"]').forEach(el => el.remove());
  document.querySelectorAll('[id$="-light-mask"]').forEach(el => el.remove());

  activeFlowAnimations.forEach(({ particles, animationId }) => {
    cancelAnimationFrame(animationId);
    particles.forEach(p => p.remove());
  });
  activeFlowAnimations.clear();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeInteractive);
} else {
  initializeInteractive();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.makeInteractive = makeInteractive;
  window.makeInteractiveHighlightOnly = makeInteractiveHighlightOnly;
  window.initializeInteractive = initializeInteractive;
  window.showTooltip = showTooltip;
  window.hideTooltip = hideTooltip;
  window.highlightElement = highlightElement;
  window.unhighlightElement = unhighlightElement;
  window.clearHighlights = clearHighlights;
  window.highlightCirclesInBox = highlightCirclesInBox;
  // Export handlers for re-initialization after animation
  window.handleMouseEnter = handleMouseEnter;
  window.handleMouseMove = handleMouseMove;
  window.handleMouseLeave = handleMouseLeave;
  window.handleClick = handleClick;
  // Flow particle animation
  window.createFlowParticle = createFlowParticle;
  window.createFlowParticles = createFlowParticles;
  window.clearFlowParticles = clearFlowParticles;
}
