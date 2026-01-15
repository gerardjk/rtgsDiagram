/**
 * REFERENCE FILE - Hover Behavior for ADIs and non-ADIs Boxes
 *
 * This file contains the key code sections that govern hover behavior.
 * These are COPIES from the actual implementation files for reference only.
 */

// ============================================================================
// FROM: diagram-interactive.js
// ============================================================================

// Main hover handler - Lines 314-365
function handleMouseEnter(event) {
  const elementId = event.currentTarget.dataset.interactiveId;
  if (!elementId) return;

  // Show tooltip for this specific element
  showTooltip(elementId, event);

  // Special handling for boxes that should highlight contained dots
  if (elementId === 'blue-dots-background') {
    // ESA box - highlight all blue and yellow dots (excluding RBA)
    highlightElement(elementId);

    const allCircles = document.querySelectorAll('circle');
    allCircles.forEach(circle => {
      if (circle.dataset.interactiveId === 'dot-0') {
        return;
      }

      const cx = parseFloat(circle.getAttribute('cx'));
      const cy = parseFloat(circle.getAttribute('cy'));
      const r = parseFloat(circle.getAttribute('r'));

      if (r && r < 20 && cx && cy) {
        circle.classList.add('highlighted');
        if (!circle.dataset.originalOpacity) {
          circle.dataset.originalOpacity = circle.style.opacity || getComputedStyle(circle).opacity || '1';
          circle.dataset.originalFilter = circle.style.filter || 'none';
        }
        circle.style.filter = 'brightness(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.6))';
        circle.style.opacity = '1';
        currentHighlightedElements.add(circle);
      }
    });
  } else if (elementId === 'adi-box' || elementId === 'non-adis-box' ||
             elementId === 'domestic-banks-box' || elementId === 'international-banks-box' ||
             elementId === 'foreign-branches-box' || elementId === 'foreign-subsidiaries-box' ||
             elementId === 'specialised-adis-box' || elementId === 'other-adis-box' ||
             elementId === 'psps-box' || elementId === 'cs-box') {
    // *** THIS IS THE KEY SECTION FOR ADI/NON-ADI HOVER ***
    // Highlight the box itself
    highlightElement(elementId);

    // Highlight all circles within this box
    highlightCirclesInBox(elementId);
  } else {
    // Normal highlighting - highlight this element and all related elements
    const relatedElements = window.getRelatedElements?.(elementId) || new Set([elementId]);

    relatedElements.forEach(id => {
      highlightElement(id);
    });
  }
}

// ============================================================================
// Helper: Highlight circles within a box - Lines 268-309
// ============================================================================
function highlightCirclesInBox(boxElementId) {
  const boxElement = document.getElementById(boxElementId);
  if (!boxElement) return;

  // Get box bounds
  const boxRect = boxElement.getBBox();
  const boxLeft = boxRect.x;
  const boxRight = boxRect.x + boxRect.width;
  const boxTop = boxRect.y;
  const boxBottom = boxRect.y + boxRect.height;

  // Find and highlight all circles within the box
  const allCircles = document.querySelectorAll('circle');
  allCircles.forEach(circle => {
    // Skip the RBA black circle (dot-0)
    if (circle.dataset.interactiveId === 'dot-0') {
      return;
    }

    const cx = parseFloat(circle.getAttribute('cx'));
    const cy = parseFloat(circle.getAttribute('cy'));
    const r = parseFloat(circle.getAttribute('r'));

    // Only highlight small circles (dots), not the big RITS/FSS circles
    if (r && r < 20 && cx && cy) {
      // Check if circle center is within box bounds
      if (cx >= boxLeft && cx <= boxRight && cy >= boxTop && cy <= boxBottom) {
        // Apply highlight directly to circle element
        circle.classList.add('highlighted');
        if (!circle.dataset.originalOpacity) {
          circle.dataset.originalOpacity = circle.style.opacity || getComputedStyle(circle).opacity || '1';
          circle.dataset.originalFilter = circle.style.filter || 'none';
        }
        circle.style.filter = 'brightness(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.6))';
        circle.style.opacity = '1';

        // Store reference so we can unhighlight later
        currentHighlightedElements.add(circle);
      }
    }
  });
}

// ============================================================================
// Highlight an element - Lines 172-209
// ============================================================================
function highlightElement(elementId) {
  const elements = document.querySelectorAll(`[data-interactive-id="${elementId}"]`);
  if (!elements.length) return;

  elements.forEach(element => {
    element.classList.add('highlighted');

    // Store original styles if not already stored
    if (!element.dataset.originalOpacity) {
      element.dataset.originalOpacity = element.style.opacity || '1';
      element.dataset.originalFilter = element.style.filter || 'none';
    }

    // Apply highlight effect
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'circle' || tagName === 'rect' || tagName === 'path') {
      // For shapes, add a glow filter and increase opacity
      element.style.filter = 'brightness(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.6))';
      element.style.opacity = '1';
    } else if (tagName === 'line') {
      // For lines, increase brightness and add strong glow
      if (!element.dataset.originalStrokeWidth) {
        element.dataset.originalStrokeWidth = element.getAttribute('stroke-width') || '1';
      }
      // Make line thicker and add strong glow
      const currentWidth = parseFloat(element.dataset.originalStrokeWidth);
      element.setAttribute('stroke-width', (currentWidth * 2.5).toString());
      element.style.filter = 'brightness(1.8) drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 4px rgba(255,255,255,0.9))';
      element.style.opacity = '1';
    } else if (tagName === 'text') {
      // For text, add glow
      element.style.filter = 'drop-shadow(0 0 3px rgba(255,255,255,0.8))';
    }
  });

  currentHighlightedElements.add(elementId);
}

// ============================================================================
// Mouse leave handler - Lines 393-396
// ============================================================================
function handleMouseLeave(event) {
  hideTooltip();
  clearHighlights();
}

// ============================================================================
// Clear all highlights - Lines 242-262
// ============================================================================
function clearHighlights() {
  currentHighlightedElements.forEach(item => {
    // Handle both string IDs and direct element references
    if (typeof item === 'string') {
      unhighlightElement(item);
    } else if (item instanceof Element) {
      // Directly unhighlight element
      item.classList.remove('highlighted');
      if (item.dataset.originalOpacity) {
        item.style.opacity = item.dataset.originalOpacity;
      }
      if (item.dataset.originalFilter) {
        item.style.filter = item.dataset.originalFilter;
      }
      if (item.tagName.toLowerCase() === 'line' && item.dataset.originalStrokeWidth) {
        item.setAttribute('stroke-width', item.dataset.originalStrokeWidth);
      }
    }
  });
  currentHighlightedElements.clear();
}

// ============================================================================
// FROM: diagram-core-refactored.js
// ============================================================================

// ADI box creation and making it interactive - Around line 7655
// Example:
/*
const adiRect = createStyledRect(...);
if (typeof makeInteractive === 'function') {
  makeInteractive(adiRect, 'adi-box');
}
*/

// Non-ADI box creation and making it interactive - Around line 8370
// Example:
/*
const nonAdiRect = createStyledRect(...);
if (typeof makeInteractive === 'function') {
  makeInteractive(nonAdiRect, 'non-adis-box');
}
*/
