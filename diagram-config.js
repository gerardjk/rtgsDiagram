// Configuration and constants for diagram rendering

// Global constants
const DIAGRAM_CONFIG = {
  // CLS sigmoid curve expansion
  CLS_SIGMOID_EXPANSION: 1.5,

  // Global horizontal lines offset
  GLOBAL_HORIZONTAL_LINES_OFFSET: 210,

  // Circle radii adjustments
  SMALL_CIRCLE_REDUCTION: 0.90, // 10% smaller

  // Arc configuration
  DOT_SPACING: 5.0,
  GAP_SPACING_MULTIPLIER: 2,
  ARC_EXTENSION: 120,
  ARC_OFFSET: 60,
  ARC_RADIUS_MULTIPLIER: 0.3,

  // Circle properties
  NUM_CIRCLES: 100,
  SMALL_CIRCLE_RADIUS: 3 * (4/5), // Reduced to 4/5 of original

  // Vertical stretch for elliptical arc
  VERTICAL_STRETCH: 1.05,

  // Stroke widths
  STROKE_WIDTH: 2,
  BLUE_LINE_STROKE: 1.5,
  THICK_LINE_STROKE: 6,
  MEDIUM_LINE_STROKE: 4,

  // Colors
  COLORS: {
    BLUE_CIRCLE_FILL: '#3b82f6',
    BLUE_CIRCLE_STROKE: '#1e3a8a',
    ORANGE_CIRCLE_FILL: '#f59e0b',
    ORANGE_CIRCLE_STROKE: '#9a3412',
    NEON_GREEN: '#00FF33',
    TEAL: '#5dd9b8',
    MAROON: '#800000',
    GREY: '#6b7280',
    DARK_BLUE: '#071f6a',
    LIGHT_BLUE_BG: 'rgba(219, 234, 254, 1)',
    LIGHT_GOLD_BG: 'rgba(254, 243, 199, 1)',
    LIGHT_MINT: '#bdf7e9',
    LIGHT_BLUE_GREY: '#e8ecf7'
  },

  // Box dimensions
  BOX_DIMENSIONS: {
    RECT_WIDTH_REDUCTION: 0.9,
    RECT_HEIGHT_REDUCTION: 0.81, // 0.9 * 0.9
    VERTICAL_GAP: 5,
    HORIZONTAL_GAP: 30,
    ADMIN_BOX_PADDING: 10
  },

  // Group boundaries
  GROUPS: {
    GROUP_1: {start: 0, end: 0},      // 1 dot
    GROUP_2: {start: 1, end: 44},     // 44 dots
    GROUP_3: {start: 45, end: 49},    // 5 dots (HSBC, ING)
    GROUP_4: {start: 50, end: 83},    // 34 dots
    GROUP_5A: {start: 84, end: 86},   // 3 dots
    GROUP_5B: {start: 87, end: 91},   // 5 dots
    GROUP_6: {start: 92, end: 99}     // 8 dots
  },

  // Dot labels mapping
  DOT_LABELS: {
    1: "Citibank, N.A.",
    2: "JPMorgan Chase Bank, National Association",
    45: "HSBC Bank Australia Limited",
    46: "ING Bank (Australia) Limited",
    50: "Australia and New Zealand Banking Group Limited",
    51: "Commonwealth Bank of Australia",
    52: "National Australia Bank Limited",
    53: "Westpac Banking Corporation",
    54: "Macquarie Bank Limited",
    55: "Bendigo and Adelaide Bank Limited",
    84: "Australian Settlements Limited",
    85: "Indue Ltd",
    86: "Tyro Payments Limited",
    87: "CUSCAL Limited",
    88: "Wise Australia Pty Limited",
    92: "Adyen Australia Pty Limited",
    93: "EFTEX Pty Limited",
    94: "First Data Network Australia Limited",
    96: "ASX Settlement Pty Limited",
    97: "ASX Clearing Corporation Limited",
    98: "LCH Limited"
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DIAGRAM_CONFIG };
}
