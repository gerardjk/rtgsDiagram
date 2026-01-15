/**
 * Defines relationships between elements for coordinated highlighting
 * When you hover over an element, all elements in its group(s) light up
 */

const elementRelationships = {
  // Example: RBA and related elements
  'dot-0': {
    groups: ['rba-system'],
    related: ['rba-blue-line', 'rba-yellow-line', 'rba-blue-dot', 'rba-yellow-dot', 'opa-box', 'opa-label', 'opa-to-rba-line']
  },
  'rba-blue-line': {
    groups: ['rba-system'],
    related: ['dot-0', 'rba-blue-dot', 'rba-yellow-line', 'rba-yellow-dot', 'opa-box', 'opa-label', 'opa-to-rba-line']
  },
  'rba-yellow-line': {
    groups: ['rba-system'],
    related: ['dot-0', 'rba-blue-line', 'rba-blue-dot', 'rba-yellow-dot', 'opa-box', 'opa-label', 'opa-to-rba-line']
  },
  'rba-blue-dot': {
    groups: ['rba-system'],
    related: ['dot-0', 'rba-blue-line', 'rba-yellow-line', 'rba-yellow-dot', 'opa-box', 'opa-label', 'opa-to-rba-line']
  },
  'rba-yellow-dot': {
    groups: ['rba-system'],
    related: ['dot-0', 'rba-blue-line', 'rba-yellow-line', 'rba-blue-dot', 'opa-box', 'opa-label', 'opa-to-rba-line']
  },
  'opa-box': {
    groups: ['rba-system'],
    related: ['dot-0', 'rba-blue-line', 'rba-yellow-line', 'rba-blue-dot', 'rba-yellow-dot', 'opa-label', 'opa-to-rba-line']
  },
  'opa-label': {
    groups: ['rba-system'],
    related: ['dot-0', 'rba-blue-line', 'rba-yellow-line', 'rba-blue-dot', 'rba-yellow-dot', 'opa-box', 'opa-to-rba-line']
  },
  'opa-to-rba-line': {
    groups: ['rba-system'],
    related: ['dot-0', 'rba-blue-line', 'rba-yellow-line', 'rba-blue-dot', 'rba-yellow-dot', 'opa-box', 'opa-label']
  },

  // RITS ecosystem - only RITS triggers the group highlight
  'rits-circle': {
    groups: ['rits-ecosystem'],
    related: ['rits-circle', 'blue-connecting-lines', 'rba-blue-line', 'small-group', 'yellow-circles', 'lvss-gear-group']
  },

  // FSS (Fast Settlement Service) - the small orange/yellow gearwheel
  'fss-circle': {
    groups: ['fss-ecosystem'],
    related: ['fss-circle', 'small-group', 'yellow-circles']
  },

  // BDF (Banknote Distribution Framework) ecosystem
  // Includes red BDF lines, blue/yellow connecting lines, and dots for big four banks (52-55)
  'bdf-box': {
    groups: ['bdf-system'],
    related: [
      'bdf-line-52', 'bdf-line-53', 'bdf-line-54', 'bdf-line-55',
      'blue-line-52', 'blue-line-53', 'blue-line-54', 'blue-line-55',
      'yellow-line-52', 'yellow-line-53', 'yellow-line-54', 'yellow-line-55',
      'yellow-dot-52', 'yellow-dot-53', 'yellow-dot-54', 'yellow-dot-55',
      'dot-52', 'dot-53', 'dot-54', 'dot-55'
    ]
  },
  'bdf-line-52': {
    groups: ['bdf-system'],
    related: ['bdf-box', 'bdf-line-53', 'bdf-line-54', 'bdf-line-55', 'blue-line-52', 'yellow-line-52', 'yellow-dot-52', 'dot-52']
  },
  'bdf-line-53': {
    groups: ['bdf-system'],
    related: ['bdf-box', 'bdf-line-52', 'bdf-line-54', 'bdf-line-55', 'blue-line-53', 'yellow-line-53', 'yellow-dot-53', 'dot-53']
  },
  'bdf-line-54': {
    groups: ['bdf-system'],
    related: ['bdf-box', 'bdf-line-52', 'bdf-line-53', 'bdf-line-55', 'blue-line-54', 'yellow-line-54', 'yellow-dot-54', 'dot-54']
  },
  'bdf-line-55': {
    groups: ['bdf-system'],
    related: ['bdf-box', 'bdf-line-52', 'bdf-line-53', 'bdf-line-54', 'blue-line-55', 'yellow-line-55', 'yellow-dot-55', 'dot-55']
  },

  'swift-pds-rect': {
    groups: ['swift-system', 'cls-system'],
    related: [
      // CLS elements (same as swift-hvcs-box hover)
      'cls-circle', 'blue-line-99', 'cls-aud-line-new', 'cls-s-curve', 'cls-to-rits-line-final',
      'cls-aud-rect', 'swift-hvcs-box',
      // Pacs boxes
      'pacs-009-box', 'pacs-008-box', 'pacs-004-box',
      // SWIFT PDS to RITS lines
      'swift-pds-to-rits-line-0', 'swift-pds-to-rits-line-1', 'swift-pds-to-rits-line-2',
      // Pacs to SWIFT PDS lines
      'pacs-to-swift-line-0', 'pacs-to-swift-line-1', 'pacs-to-swift-line-2',
      // Turquoise line to ADIs
      'hvcs-horizontal-line'
    ]
  },

  // CLS circle - CLS settlement system
  'cls-circle': {
    groups: ['cls-system'],
    related: [
      'blue-line-99', 'cls-aud-line-new', 'cls-s-curve', 'cls-to-rits-line-final',
      'swift-hvcs-box', 'cls-aud-rect', 'swift-pds-rect'
    ]
  },
  'cls-aud-rect': {
    groups: ['cls-system'],
    related: [
      'cls-circle', 'blue-line-99', 'cls-aud-line-new', 'cls-s-curve', 'cls-to-rits-line-final',
      'swift-hvcs-box', 'swift-pds-rect'
    ],
    tooltipFrom: 'cls-aud-line-new'
  },
  'swift-hvcs-box': {
    groups: ['swift-system', 'cls-system'],
    related: [
      // CLS elements (same as cls-circle hover)
      'cls-circle', 'blue-line-99', 'cls-aud-line-new', 'cls-s-curve', 'cls-to-rits-line-final',
      'cls-aud-rect', 'swift-pds-rect',
      // Pacs boxes
      'pacs-009-box', 'pacs-008-box', 'pacs-004-box',
      // SWIFT PDS to RITS lines
      'swift-pds-to-rits-line-0', 'swift-pds-to-rits-line-1', 'swift-pds-to-rits-line-2',
      // Pacs to SWIFT PDS lines
      'pacs-to-swift-line-0', 'pacs-to-swift-line-1', 'pacs-to-swift-line-2',
      // Turquoise line to ADIs
      'hvcs-horizontal-line'
    ]
  },
  'pacs-009-box': {
    groups: ['swift-system'],
    related: [
      'swift-hvcs-box', 'swift-pds-rect',
      'pacs-to-swift-line-0', 'swift-pds-to-rits-line-0',
      'hvcs-horizontal-line'
    ]
  },
  'pacs-008-box': {
    groups: ['swift-system'],
    related: [
      'swift-hvcs-box', 'swift-pds-rect',
      'pacs-to-swift-line-1', 'swift-pds-to-rits-line-1',
      'hvcs-horizontal-line'
    ]
  },
  'pacs-004-box': {
    groups: ['swift-system'],
    related: [
      'swift-hvcs-box', 'swift-pds-rect',
      'pacs-to-swift-line-2', 'swift-pds-to-rits-line-2',
      'hvcs-horizontal-line'
    ]
  },

  // Example: NPP ecosystem
  'npp-box': {
    groups: ['npp-ecosystem', 'fast-payments'],
    related: ['npp-purple-box', 'bsct-box', 'new-pacs-to-npp-line', 'npp-to-fss-path', 'npp-to-adi-line', 'fss-circle', 'swift-pds-rect']
  },
  'npp-purple-box': {
    groups: ['npp-ecosystem', 'fast-payments'],
    related: ['npp-box', 'osko-box', 'bpay-box', 'eftpos-box', 'osko-to-npp-line', 'npp-to-adi-line', 'payid-box', 'bsct-box', 'payto-box', 'new-pacs-to-npp-line', 'npp-to-fss-path']
  },
  'osko-box': {
    groups: ['npp-ecosystem', 'fast-payments'],
    related: ['npp-purple-box', 'osko-to-npp-line', 'bpay-box', 'eftpos-box', 'npp-to-adi-line', 'new-pacs-to-npp-line', 'npp-to-fss-path']
  },
  'payid-box': {
    groups: ['npp-ecosystem'],
    related: ['npp-purple-box', 'npp-box', 'osko-box', 'npp-to-fss-path', 'npp-to-adi-line']
  },
  'payto-box': {
    groups: ['npp-ecosystem'],
    related: ['npp-purple-box', 'npp-box', 'osko-box', 'npp-to-fss-path', 'npp-to-adi-line']
  },
  'bsct-box': {
    groups: ['npp-ecosystem'],
    related: ['npp-purple-box', 'npp-box', 'osko-box', 'new-pacs-to-npp-line', 'npp-to-fss-path', 'npp-to-adi-line']
  },

  // Example: Card payments
  'eftpos-box': {
    groups: ['card-payments', 'administered-batches'],
    related: ['eftpos-left-line', 'eftpos-left-line-horizontal', 'essb-box', 'eftpos-to-essb-line', 'essb-to-rits-line', 'bpay-box', 'npp-purple-box', 'osko-box']
  },
  'essb-box': {
    groups: ['card-payments', 'administered-batches'],
    related: ['eftpos-left-line', 'eftpos-left-line-horizontal', 'eftpos-box', 'eftpos-to-essb-line', 'essb-to-rits-line', 'bpay-box', 'npp-purple-box', 'osko-box']
  },
  'mcau-box': {
    groups: ['card-payments', 'administered-batches'],
    related: ['mastercard-left-line', 'mastercard-left-line-horizontal', 'mastercard-to-mcau-line', 'mastercard-box', 'mcau-to-rits-line']
  },
  'mastercard-box': {
    groups: ['card-payments', 'administered-batches'],
    related: ['mastercard-left-line', 'mastercard-left-line-horizontal', 'mastercard-to-mcau-line', 'mcau-box', 'mcau-to-rits-line']
  },
  'pexa-convey-box': {
    groups: ['property-settlement', 'administered-batches'],
    related: ['pexa-box', 'pexa-horizontal-line-0', 'pexa-horizontal-line-1', 'pexa-to-rits-line', 'pexa-to-adis-line']
  },
  'pexa-box': {
    groups: ['property-settlement', 'administered-batches'],
    related: ['pexa-convey-box', 'pexa-horizontal-line-0', 'pexa-horizontal-line-1', 'pexa-to-rits-line', 'pexa-to-adis-line']
  },
  'sympli-box': {
    groups: ['property-settlement', 'administered-batches'],
    related: ['asxf-box', 'sympli-horizontal-line-0', 'sympli-horizontal-line-1', 'asxf-to-rits-line', 'sympli-to-adis-line']
  },
  'asxf-box': {
    groups: ['property-settlement', 'administered-batches'],
    related: ['sympli-box', 'sympli-horizontal-line-0', 'sympli-horizontal-line-1', 'asxf-to-rits-line', 'sympli-to-adis-line', 'asx-box']
  },
  'asxb-box': {
    groups: ['asx-ecosystem', 'administered-batches'],
    related: ['chess-box', 'asx-box', 'asx-to-hvcs-line', 'asx-to-adi-line', 'clearing-box', 'clearing-to-asxb-line', 'asxb-to-rits-line']
  },
  'administered-batches-box': {
    groups: ['administered-batches'],
    related: [
      'mcau-box', 'essb-box', 'pexa-box', 'asxf-box', 'asxb-box',
      'mcau-to-rits-line', 'essb-to-rits-line', 'pexa-to-rits-line', 'asxf-to-rits-line', 'asxb-to-rits-line',
      'mastercard-to-mcau-line', 'eftpos-to-essb-line',
      'pexa-horizontal-line-0', 'pexa-horizontal-line-1',
      'sympli-horizontal-line-0', 'sympli-horizontal-line-1',
      'clearing-to-asxb-line'
    ]
  },

  // Example: ASX ecosystem
  'asx-box': {
    groups: ['asx-ecosystem', 'securities'],
    related: [
      'chess-box', 'asx-to-hvcs-line', 'asx-to-adi-line',
      'austraclear-box', 'chess-rtgs-box',
      'dvp-to-chess-rtgs-line', 'dvp-to-austraclear-line',
      'austraclear-to-rits-line', 'chess-rtgs-to-rits-line',
      'dvp-rtgs-box', 'rtgs-box',
      'cash-transfer-to-rtgs-line', 'dvp-cash-leg-to-dvp-rtgs-line', 'trade-by-trade-to-dvp-rtgs-line',
      'asxb-box', 'clearing-to-asxb-line', 'asxb-to-rits-line',
      'sympli-box', 'sympli-horizontal-line-0', 'sympli-horizontal-line-1', 'asxf-box', 'asxf-to-rits-line'
    ]
  },
  'asx-settlement-dot': {
    groups: ['asx-ecosystem', 'securities'],
    related: ['asx-settlement-label', 'asx-clearing-dot', 'lch-dot', 'chess-rtgs-box', 'austraclear-box']
  },
  'asx-clearing-dot': {
    groups: ['asx-ecosystem', 'securities'],
    related: ['asx-clearing-label', 'asx-settlement-dot', 'lch-dot']
  },
  'austraclear-box': {
    groups: ['asx-ecosystem', 'securities'],
    related: [
      'austraclear-to-rits-line', 'dvp-to-austraclear-line',
      'rtgs-box', 'dvp-rtgs-box',
      'cash-transfer-to-rtgs-line', 'cash-transfer-box',
      'dvp-cash-leg-to-dvp-rtgs-line', 'dvp-cash-leg-box',
      'asx-box', 'asx-to-hvcs-line', 'asx-to-adi-line',
      'clearing-box'
    ]
  },
  'chess-rtgs-box': {
    groups: ['asx-ecosystem', 'securities'],
    related: [
      'chess-rtgs-to-rits-line', 'dvp-to-chess-rtgs-line',
      'dvp-rtgs-box', 'trade-by-trade-to-dvp-rtgs-line', 'trade-by-trade-box',
      'chess-box', 'asx-box'
    ]
  },
  'chess-box': {
    groups: ['asx-ecosystem', 'securities'],
    related: [
      'asx-box', 'asx-to-hvcs-line', 'asx-to-adi-line',
      'clearing-box', 'clearing-to-asxb-line',
      'asxb-box', 'asxb-to-rits-line'
    ]
  },
  'clearing-box': {
    groups: ['asx-ecosystem', 'securities'],
    related: [
      'chess-box', 'asx-box', 'asx-to-hvcs-line', 'asx-to-adi-line',
      'clearing-to-asxb-line', 'asxb-box', 'asxb-to-rits-line',
      // From dvp-cash-leg-box
      'dvp-cash-leg-box', 'dvp-cash-leg-to-dvp-rtgs-line', 'dvp-rtgs-box',
      'dvp-rtgs-to-austraclear-line', 'austraclear-box', 'austraclear-to-rits-line-upper',
      // From cash-transfer-box
      'cash-transfer-box', 'cash-transfer-to-rtgs-line', 'rtgs-box',
      'rtgs-to-austraclear-line', 'austraclear-to-rits-line-lower'
    ]
  },
  'trade-by-trade-box': {
    groups: ['asx-ecosystem', 'securities'],
    related: [
      'chess-box', 'asx-box',
      'trade-by-trade-to-dvp-rtgs-line', 'dvp-rtgs-box',
      'dvp-to-chess-rtgs-line', 'chess-rtgs-box',
      'chess-rtgs-to-rits-line'
    ]
  },
  'dvp-cash-leg-box': {
    groups: ['asx-ecosystem', 'securities'],
    related: [
      'dvp-cash-leg-to-dvp-rtgs-line', 'dvp-rtgs-box',
      'dvp-rtgs-to-austraclear-line', 'austraclear-box', 'austraclear-to-rits-line-upper',
      'asx-box', 'asx-to-adi-line', 'asx-to-hvcs-line',
      'clearing-box'
    ]
  },
  'cash-transfer-box': {
    groups: ['asx-ecosystem', 'securities'],
    related: [
      'cash-transfer-to-rtgs-line', 'rtgs-box',
      'rtgs-to-austraclear-line', 'austraclear-box', 'austraclear-to-rits-line-lower',
      'asx-box', 'asx-to-adi-line', 'asx-to-hvcs-line',
      'clearing-box'
    ]
  },

  // ASX thick blue lines - from ADIs/Non-ADIs to ASX box
  'asx-to-adi-line': {
    groups: ['asx-ecosystem', 'securities'],
    related: [
      'asx-to-hvcs-line',
      'cash-transfer-to-rtgs-line', 'rtgs-box', 'rtgs-to-austraclear-line',
      'dvp-cash-leg-to-dvp-rtgs-line', 'dvp-rtgs-box', 'dvp-rtgs-to-austraclear-line',
      'austraclear-to-rits-line-upper', 'austraclear-to-rits-line-lower'
    ]
  },
  'asx-to-hvcs-line': {
    groups: ['asx-ecosystem', 'securities'],
    related: [
      'asx-to-adi-line',
      'cash-transfer-to-rtgs-line', 'rtgs-box', 'rtgs-to-austraclear-line',
      'dvp-cash-leg-to-dvp-rtgs-line', 'dvp-rtgs-box', 'dvp-rtgs-to-austraclear-line',
      'austraclear-to-rits-line-upper', 'austraclear-to-rits-line-lower'
    ]
  },

  // DvP cash leg settlement path - all elements glow together
  'dvp-cash-leg-to-dvp-rtgs-line': {
    groups: ['dvp-cash-leg-path'],
    related: ['dvp-cash-leg-box', 'dvp-rtgs-box', 'dvp-rtgs-to-austraclear-line', 'austraclear-to-rits-line-upper']
  },
  'dvp-rtgs-box': {
    groups: ['dvp-cash-leg-path'],
    related: ['dvp-cash-leg-box', 'dvp-cash-leg-to-dvp-rtgs-line', 'dvp-rtgs-to-austraclear-line', 'austraclear-to-rits-line-upper']
  },
  'dvp-rtgs-to-austraclear-line': {
    groups: ['dvp-cash-leg-path'],
    related: ['dvp-cash-leg-box', 'dvp-cash-leg-to-dvp-rtgs-line', 'dvp-rtgs-box', 'austraclear-to-rits-line-upper']
  },
  'austraclear-to-rits-line-upper': {
    groups: ['dvp-cash-leg-path'],
    related: ['dvp-cash-leg-box', 'dvp-cash-leg-to-dvp-rtgs-line', 'dvp-rtgs-box', 'dvp-rtgs-to-austraclear-line']
  },

  // Cash transfer settlement path - all elements glow together
  'cash-transfer-to-rtgs-line': {
    groups: ['cash-transfer-path'],
    related: ['cash-transfer-box', 'rtgs-box', 'rtgs-to-austraclear-line', 'austraclear-to-rits-line-lower']
  },
  'rtgs-box': {
    groups: ['cash-transfer-path'],
    related: ['cash-transfer-box', 'cash-transfer-to-rtgs-line', 'rtgs-to-austraclear-line', 'austraclear-to-rits-line-lower']
  },
  'rtgs-to-austraclear-line': {
    groups: ['cash-transfer-path'],
    related: ['cash-transfer-box', 'cash-transfer-to-rtgs-line', 'rtgs-box', 'austraclear-to-rits-line-lower']
  },
  'austraclear-to-rits-line-lower': {
    groups: ['cash-transfer-path'],
    related: ['cash-transfer-box', 'cash-transfer-to-rtgs-line', 'rtgs-box', 'rtgs-to-austraclear-line']
  },

  // Example: Direct Entry / BECS ecosystem
  'bpay-box': {
    groups: ['direct-entry', 'bulk-payments'],
    related: ['becs-box', 'becs-line', 'de-line', 'npp-purple-box', 'osko-box', 'eftpos-box']
  },

  // Example: LVSS and clearing systems
  'lvss-circle': {
    groups: ['lvss-ecosystem', 'clearing-settlement'],
    related: ['lvss-label', 'lvss-to-cecs', 'lvss-to-becs', 'lvss-to-apcs', 'lvss-to-gabs', 'lvss-to-cshd',
              'cecs-box', 'becs-box', 'apcs-box', 'gabs-box', 'cshd-box']
  },
  // LVSS gear hover - lights up clearing boxes and grey lines to RITS
  'lvss-gear': {
    groups: ['lvss-ecosystem'],
    related: [
      'apcs-box', 'becs-box', 'cshd-box', 'cecs-box', 'gabs-box',
      'lvss-line-apcs', 'lvss-line-becs', 'lvss-line-cshd', 'lvss-line-cecs', 'lvss-line-gabs'
    ]
  },
  // APCS box - triggers glowie group including LVSS gear, grey lines, Cheques box and connections
  'apcs-box': {
    groups: ['lvss-ecosystem', 'clearing-settlement'],
    related: ['lvss-gear-group', 'lvss-line-apcs', 'cheques-to-apcs-line', 'cheques-box', 'osko-to-adi-line']
  },

  // BECS box - triggers glowie group including BECN, BECG, DE boxes and red lines
  'becs-box': {
    groups: ['lvss-ecosystem', 'clearing-settlement', 'direct-entry'],
    related: ['becn-box', 'becg-box', 'becn-to-becs-line', 'becg-to-becs-line', 'de-box', 'directentry-to-adi-line', 'maroon-horizontal-branch', 'lvss-gear-group', 'lvss-line-becs']
  },

  // CECS box - triggers glowie group including LVSS gear, grey lines, IAC box and colored lines
  'cecs-box': {
    groups: ['lvss-ecosystem', 'clearing-settlement'],
    related: [
      'lvss-gear-group', 'lvss-line-cecs',
      'cecs-to-iac-line-1', 'cecs-to-iac-line-2',
      'direct-entry-stack-bounding-box',
      'direct-entry-stack-line-blue', 'direct-entry-stack-line-yellow',
      'direct-entry-stack-line-green', 'direct-entry-stack-line-brown',
      'direct-entry-stack-line-blue-horizontal', 'direct-entry-stack-line-yellow-horizontal',
      'direct-entry-stack-line-green-horizontal', 'direct-entry-stack-line-brown-horizontal'
    ]
  },

  // IAC (Issuers and Acquirers Community) box - lights up CECS group and internal card boxes
  'direct-entry-stack-bounding-box': {
    groups: ['iac-ecosystem', 'clearing-settlement'],
    related: [
      'cecs-box', 'lvss-gear-group', 'lvss-line-cecs',
      'cecs-to-iac-line-1', 'cecs-to-iac-line-2',
      'direct-entry-stack-line-blue', 'direct-entry-stack-line-yellow',
      'direct-entry-stack-line-green', 'direct-entry-stack-line-brown',
      'direct-entry-stack-line-blue-horizontal', 'direct-entry-stack-line-yellow-horizontal',
      'direct-entry-stack-line-green-horizontal', 'direct-entry-stack-line-brown-horizontal',
      'visa-box', 'other-cards-box', 'atms-box', 'claims-box'
    ]
  },

  // ATMs box - lights up with brown line and its horizontal branch to Non-ADIs
  'atms-box': {
    groups: ['iac-ecosystem'],
    related: ['direct-entry-stack-line-brown', 'direct-entry-stack-line-brown-horizontal', 'cecs-to-iac-line-1', 'cecs-to-iac-line-2']
  },

  // Claims box - lights up with green line and its horizontal branch to Non-ADIs
  'claims-box': {
    groups: ['iac-ecosystem'],
    related: ['direct-entry-stack-line-green', 'direct-entry-stack-line-green-horizontal', 'cecs-to-iac-line-1', 'cecs-to-iac-line-2']
  },

  // Visa box - lights up with yellow line and its horizontal branch to Non-ADIs
  'visa-box': {
    groups: ['iac-ecosystem'],
    related: ['direct-entry-stack-line-yellow', 'direct-entry-stack-line-yellow-horizontal', 'cecs-to-iac-line-1', 'cecs-to-iac-line-2']
  },

  // Other Cards box - lights up with blue line and its horizontal branch to Non-ADIs
  'other-cards-box': {
    groups: ['iac-ecosystem'],
    related: ['direct-entry-stack-line-blue', 'direct-entry-stack-line-blue-horizontal', 'cecs-to-iac-line-1', 'cecs-to-iac-line-2']
  },

  // GABS box - triggers glowie group including LVSS gear, grey lines, and OPA box
  'gabs-box': {
    groups: ['lvss-ecosystem', 'clearing-settlement'],
    related: ['lvss-gear-group', 'lvss-line-gabs', 'opa-box', 'opa-label']
  },

  // CSHD box - triggers glowie group including LVSS gear and grey lines
  'cshd-box': {
    groups: ['lvss-ecosystem', 'clearing-settlement'],
    related: ['lvss-gear-group', 'lvss-line-cshd']
  },

  // Cheques box - triggers entire APCS group
  'cheques-box': {
    groups: ['apcs-ecosystem'],
    related: ['apcs-box', 'lvss-gear-group', 'lvss-line-apcs', 'cheques-to-apcs-line', 'osko-to-adi-line']
  },

  // DE (Direct Entry) box - triggers entire BECS group plus BPAY
  'de-box': {
    groups: ['becs-ecosystem', 'direct-entry'],
    related: ['becs-box', 'becn-box', 'becg-box', 'becn-to-becs-line', 'becg-to-becs-line', 'directentry-to-adi-line', 'maroon-horizontal-branch', 'lvss-gear-group', 'lvss-line-becs', 'bpay-box']
  },

  // BECN box - lights up DE, BECN, BECS and associated lines
  'becn-box': {
    groups: ['becs-ecosystem', 'direct-entry'],
    related: ['de-box', 'becs-box', 'becn-to-becs-line', 'lvss-gear-group', 'lvss-line-becs', 'directentry-to-adi-line', 'maroon-horizontal-branch']
  },

  // BECG box - lights up DE, BECG, BECS and associated lines
  'becg-box': {
    groups: ['becs-ecosystem', 'direct-entry'],
    related: ['de-box', 'becs-box', 'becg-to-becs-line', 'lvss-gear-group', 'lvss-line-becs', 'directentry-to-adi-line', 'maroon-horizontal-branch']
  },

  // Example: ADI groups
  'adi-box': {
    groups: ['adis', 'participants'],
    related: ['domestic-banks-box', 'specialised-adis-box', 'other-adis-box', 'dot-1', 'dot-52', 'dot-53', 'dot-54', 'dot-55']
  },
  'domestic-banks-box': {
    groups: ['adis', 'participants', 'domestic-banks'],
    related: ['adi-box', 'dot-52', 'dot-53', 'dot-54', 'dot-55'] // ANZ, CBA, NAB, Westpac
  },

  // Major bank dots (Big Four at indices 52-55)
  'dot-52': { // ANZ
    groups: ['domestic-banks', 'big-four', 'adis'],
    related: ['blue-line-52', 'yellow-line-52', 'yellow-dot-52']
  },
  'dot-53': { // CBA
    groups: ['domestic-banks', 'big-four', 'adis'],
    related: ['blue-line-53', 'yellow-line-53', 'yellow-dot-53']
  },
  'dot-54': { // NAB
    groups: ['domestic-banks', 'big-four', 'adis'],
    related: ['blue-line-54', 'yellow-line-54', 'yellow-dot-54']
  },
  'dot-55': { // Westpac
    groups: ['domestic-banks', 'big-four', 'adis'],
    related: ['blue-line-55', 'yellow-line-55', 'yellow-dot-55']
  },

  // Non-ADI participants
  'non-adi-box': {
    groups: ['non-adis', 'participants'],
    related: ['psps-box', 'cs-box', 'dot-92', 'dot-93', 'dot-94', 'dot-96', 'dot-97', 'dot-98']
  },
  'psps-box': {
    groups: ['non-adis', 'payment-service-providers'],
    related: ['non-adi-box', 'dot-92', 'dot-93', 'dot-94', 'dot-95']
  },
  'cs-box': {
    groups: ['non-adis', 'clearing-settlement'],
    related: ['non-adi-box', 'dot-96', 'dot-97', 'dot-98']
  },

  // Foreign Branch banks with FSS membership (yellow dots/lines)
  'dot-1': { // Citibank, N.A. - FSS Member
    groups: ['foreign-branches', 'fss-members'],
    related: ['blue-line-1', 'yellow-line-1', 'yellow-dot-1']
  },
  'dot-2': { // JPMorgan Chase Bank - FSS Member
    groups: ['foreign-branches', 'fss-members'],
    related: ['blue-line-2', 'yellow-line-2', 'yellow-dot-2']
  },

  // Yellow dots should also highlight their blue companions
  'yellow-dot-1': { // Citibank yellow dot
    groups: ['fss-members'],
    related: ['dot-1', 'blue-line-1', 'yellow-line-1']
  },
  'yellow-dot-2': { // JPMorgan yellow dot
    groups: ['fss-members'],
    related: ['dot-2', 'blue-line-2', 'yellow-line-2']
  },

  // ISO 20022 (SWIFT) lines - all turquoise lines highlight together
  // Includes: HVCS, pacs-to-swift, swift-pds-to-rits, npp-to-adi, new-pacs-to-npp, npp-to-fss
  'hvcs-horizontal-line': {
    groups: ['iso20022-lines'],
    related: [
      'pacs-to-swift-line-0', 'pacs-to-swift-line-1', 'pacs-to-swift-line-2',
      'swift-pds-to-rits-line-0', 'swift-pds-to-rits-line-1', 'swift-pds-to-rits-line-2',
      'npp-to-adi-line', 'new-pacs-to-npp-line', 'npp-to-fss-path',
      'pacs-008-box', 'pacs-009-box', 'pacs-004-box', 'bsct-box'
    ]
  },
  'pacs-to-swift-line-0': {
    groups: ['iso20022-lines'],
    related: [
      'hvcs-horizontal-line',
      'pacs-to-swift-line-1', 'pacs-to-swift-line-2',
      'swift-pds-to-rits-line-0', 'swift-pds-to-rits-line-1', 'swift-pds-to-rits-line-2',
      'npp-to-adi-line', 'new-pacs-to-npp-line', 'npp-to-fss-path',
      'pacs-008-box', 'pacs-009-box', 'pacs-004-box', 'bsct-box'
    ]
  },
  'pacs-to-swift-line-1': {
    groups: ['iso20022-lines'],
    related: [
      'hvcs-horizontal-line',
      'pacs-to-swift-line-0', 'pacs-to-swift-line-2',
      'swift-pds-to-rits-line-0', 'swift-pds-to-rits-line-1', 'swift-pds-to-rits-line-2',
      'npp-to-adi-line', 'new-pacs-to-npp-line', 'npp-to-fss-path',
      'pacs-008-box', 'pacs-009-box', 'pacs-004-box', 'bsct-box'
    ]
  },
  'pacs-to-swift-line-2': {
    groups: ['iso20022-lines'],
    related: [
      'hvcs-horizontal-line',
      'pacs-to-swift-line-0', 'pacs-to-swift-line-1',
      'swift-pds-to-rits-line-0', 'swift-pds-to-rits-line-1', 'swift-pds-to-rits-line-2',
      'npp-to-adi-line', 'new-pacs-to-npp-line', 'npp-to-fss-path',
      'pacs-008-box', 'pacs-009-box', 'pacs-004-box', 'bsct-box'
    ]
  },
  'swift-pds-to-rits-line-0': {
    groups: ['iso20022-lines'],
    related: [
      'hvcs-horizontal-line',
      'pacs-to-swift-line-0', 'pacs-to-swift-line-1', 'pacs-to-swift-line-2',
      'swift-pds-to-rits-line-1', 'swift-pds-to-rits-line-2',
      'npp-to-adi-line', 'new-pacs-to-npp-line', 'npp-to-fss-path',
      'pacs-008-box', 'pacs-009-box', 'pacs-004-box', 'bsct-box'
    ]
  },
  'swift-pds-to-rits-line-1': {
    groups: ['iso20022-lines'],
    related: [
      'hvcs-horizontal-line',
      'pacs-to-swift-line-0', 'pacs-to-swift-line-1', 'pacs-to-swift-line-2',
      'swift-pds-to-rits-line-0', 'swift-pds-to-rits-line-2',
      'npp-to-adi-line', 'new-pacs-to-npp-line', 'npp-to-fss-path',
      'pacs-008-box', 'pacs-009-box', 'pacs-004-box', 'bsct-box'
    ]
  },
  'swift-pds-to-rits-line-2': {
    groups: ['iso20022-lines'],
    related: [
      'hvcs-horizontal-line',
      'pacs-to-swift-line-0', 'pacs-to-swift-line-1', 'pacs-to-swift-line-2',
      'swift-pds-to-rits-line-0', 'swift-pds-to-rits-line-1',
      'npp-to-adi-line', 'new-pacs-to-npp-line', 'npp-to-fss-path',
      'pacs-008-box', 'pacs-009-box', 'pacs-004-box', 'bsct-box'
    ]
  },
  // NPP-related turquoise lines
  'npp-to-adi-line': {
    groups: ['iso20022-lines'],
    related: [
      'hvcs-horizontal-line',
      'pacs-to-swift-line-0', 'pacs-to-swift-line-1', 'pacs-to-swift-line-2',
      'swift-pds-to-rits-line-0', 'swift-pds-to-rits-line-1', 'swift-pds-to-rits-line-2',
      'new-pacs-to-npp-line', 'npp-to-fss-path',
      'pacs-008-box', 'pacs-009-box', 'pacs-004-box', 'bsct-box'
    ]
  },
  'new-pacs-to-npp-line': {
    groups: ['iso20022-lines'],
    related: [
      'hvcs-horizontal-line',
      'pacs-to-swift-line-0', 'pacs-to-swift-line-1', 'pacs-to-swift-line-2',
      'swift-pds-to-rits-line-0', 'swift-pds-to-rits-line-1', 'swift-pds-to-rits-line-2',
      'npp-to-adi-line', 'npp-to-fss-path',
      'pacs-008-box', 'pacs-009-box', 'pacs-004-box', 'bsct-box'
    ]
  },
  'npp-to-fss-path': {
    groups: ['iso20022-lines'],
    related: [
      'hvcs-horizontal-line',
      'pacs-to-swift-line-0', 'pacs-to-swift-line-1', 'pacs-to-swift-line-2',
      'swift-pds-to-rits-line-0', 'swift-pds-to-rits-line-1', 'swift-pds-to-rits-line-2',
      'npp-to-adi-line', 'new-pacs-to-npp-line',
      'pacs-008-box', 'pacs-009-box', 'pacs-004-box', 'bsct-box'
    ]
  },

  // CLS PvP lines - neon green (#00FF33) - all highlight together
  'cls-aud-line-new': {
    groups: ['cls-pvp-lines'],
    related: ['cls-to-rits-line-final', 'cls-s-curve']
  },
  'cls-to-rits-line-final': {
    groups: ['cls-pvp-lines'],
    related: ['cls-aud-line-new', 'cls-s-curve']
  },
  'cls-s-curve': {
    groups: ['cls-pvp-lines'],
    related: ['cls-aud-line-new', 'cls-to-rits-line-final']
  },

  // Trade-by-trade dotted blue lines - all highlight together and show trade-by-trade tooltip
  'trade-by-trade-to-dvp-rtgs-line': {
    groups: ['trade-by-trade-lines'],
    related: ['dvp-to-chess-rtgs-line', 'chess-rtgs-to-rits-line', 'trade-by-trade-box', 'dvp-rtgs-box', 'chess-rtgs-box'],
    tooltipFrom: 'trade-by-trade-box'
  },
  'dvp-to-chess-rtgs-line': {
    groups: ['trade-by-trade-lines'],
    related: ['trade-by-trade-to-dvp-rtgs-line', 'chess-rtgs-to-rits-line', 'trade-by-trade-box', 'dvp-rtgs-box', 'chess-rtgs-box'],
    tooltipFrom: 'trade-by-trade-box'
  },
  'chess-rtgs-to-rits-line': {
    groups: ['trade-by-trade-lines'],
    related: ['trade-by-trade-to-dvp-rtgs-line', 'dvp-to-chess-rtgs-line', 'trade-by-trade-box', 'dvp-rtgs-box', 'chess-rtgs-box'],
    tooltipFrom: 'chess-rtgs-box'
  },

  // Direct Entry ABA lines - red (#ff073a) - all highlight together
  'directentry-to-adi-line': {
    groups: ['de-aba-lines'],
    related: ['maroon-horizontal-branch', 'becn-to-becs-line', 'becg-to-becs-line']
  },
  'maroon-horizontal-branch': {
    groups: ['de-aba-lines'],
    related: ['directentry-to-adi-line', 'becn-to-becs-line', 'becg-to-becs-line']
  },
  'becn-to-becs-line': {
    groups: ['de-aba-lines'],
    related: ['directentry-to-adi-line', 'maroon-horizontal-branch', 'becg-to-becs-line']
  },
  'becg-to-becs-line': {
    groups: ['de-aba-lines'],
    related: ['directentry-to-adi-line', 'maroon-horizontal-branch', 'becn-to-becs-line']
  },

  // APCS Cheques lines - grey (#e5e7eb) - all highlight together
  'cheques-to-apcs-line': {
    groups: ['apcs-cheques-lines'],
    related: ['osko-to-adi-line']
  },
  'osko-to-adi-line': {
    groups: ['apcs-cheques-lines'],
    related: ['cheques-to-apcs-line']
  },

  // LVSS FSI XML lines - all highlight together
  'lvss-line-gabs': {
    groups: ['lvss-fsi-lines'],
    related: ['lvss-line-cecs', 'lvss-line-cshd', 'lvss-line-becs', 'lvss-line-apcs', 'cecs-to-iac-line-1', 'cecs-to-iac-line-2']
  },
  'lvss-line-cecs': {
    groups: ['lvss-fsi-lines'],
    related: ['lvss-line-gabs', 'lvss-line-cshd', 'lvss-line-becs', 'lvss-line-apcs', 'cecs-to-iac-line-1', 'cecs-to-iac-line-2']
  },
  'lvss-line-cshd': {
    groups: ['lvss-fsi-lines'],
    related: ['lvss-line-gabs', 'lvss-line-cecs', 'lvss-line-becs', 'lvss-line-apcs', 'cecs-to-iac-line-1', 'cecs-to-iac-line-2']
  },
  'lvss-line-becs': {
    groups: ['lvss-fsi-lines'],
    related: ['lvss-line-gabs', 'lvss-line-cecs', 'lvss-line-cshd', 'lvss-line-apcs', 'cecs-to-iac-line-1', 'cecs-to-iac-line-2']
  },
  'lvss-line-apcs': {
    groups: ['lvss-fsi-lines'],
    related: ['lvss-line-gabs', 'lvss-line-cecs', 'lvss-line-cshd', 'lvss-line-becs', 'cecs-to-iac-line-1', 'cecs-to-iac-line-2']
  },
  'cecs-to-iac-line-1': {
    groups: ['lvss-fsi-lines'],
    related: ['lvss-line-gabs', 'lvss-line-cecs', 'lvss-line-cshd', 'lvss-line-becs', 'lvss-line-apcs', 'cecs-to-iac-line-2']
  },
  'cecs-to-iac-line-2': {
    groups: ['lvss-fsi-lines'],
    related: ['lvss-line-gabs', 'lvss-line-cecs', 'lvss-line-cshd', 'lvss-line-becs', 'lvss-line-apcs', 'cecs-to-iac-line-1']
  },

  // Reservation Batch XML lines - PEXA and Sympli/ASXF all highlight together
  'pexa-horizontal-line-0': {
    groups: ['reservation-batch-lines'],
    related: ['pexa-horizontal-line-1', 'pexa-to-rits-line', 'pexa-box', 'sympli-horizontal-line-0', 'sympli-horizontal-line-1', 'asxf-to-rits-line', 'asxf-box']
  },
  'pexa-horizontal-line-1': {
    groups: ['reservation-batch-lines'],
    related: ['pexa-horizontal-line-0', 'pexa-to-rits-line', 'pexa-box', 'sympli-horizontal-line-0', 'sympli-horizontal-line-1', 'asxf-to-rits-line', 'asxf-box']
  },
  'pexa-to-rits-line': {
    groups: ['reservation-batch-lines'],
    related: ['pexa-horizontal-line-0', 'pexa-horizontal-line-1', 'pexa-box', 'sympli-horizontal-line-0', 'sympli-horizontal-line-1', 'asxf-to-rits-line', 'asxf-box']
  },
  'sympli-horizontal-line-0': {
    groups: ['reservation-batch-lines'],
    related: ['sympli-horizontal-line-1', 'asxf-to-rits-line', 'asxf-box', 'pexa-horizontal-line-0', 'pexa-horizontal-line-1', 'pexa-to-rits-line', 'pexa-box']
  },
  'sympli-horizontal-line-1': {
    groups: ['reservation-batch-lines'],
    related: ['sympli-horizontal-line-0', 'asxf-to-rits-line', 'asxf-box', 'pexa-horizontal-line-0', 'pexa-horizontal-line-1', 'pexa-to-rits-line', 'pexa-box']
  },
  'asxf-to-rits-line': {
    groups: ['reservation-batch-lines'],
    related: ['sympli-horizontal-line-0', 'sympli-horizontal-line-1', 'asxf-box', 'pexa-horizontal-line-0', 'pexa-horizontal-line-1', 'pexa-to-rits-line', 'pexa-box']
  },

  // Batch Settlement Request lines - ASXB, MCAU, and ESSB all highlight together
  'clearing-to-asxb-line': {
    groups: ['batch-settlement-lines'],
    related: ['clearing-to-asxb-line-0', 'clearing-to-asxb-line-1', 'asxb-to-rits-line', 'asxb-box', 'mastercard-to-mcau-line', 'mcau-to-rits-line', 'mcau-box', 'eftpos-to-essb-line', 'essb-to-rits-line', 'essb-box']
  },
  'clearing-to-asxb-line-0': {
    groups: ['batch-settlement-lines'],
    related: ['clearing-to-asxb-line', 'clearing-to-asxb-line-1', 'asxb-to-rits-line', 'asxb-box', 'mastercard-to-mcau-line', 'mcau-to-rits-line', 'mcau-box', 'eftpos-to-essb-line', 'essb-to-rits-line', 'essb-box']
  },
  'clearing-to-asxb-line-1': {
    groups: ['batch-settlement-lines'],
    related: ['clearing-to-asxb-line', 'clearing-to-asxb-line-0', 'asxb-to-rits-line', 'asxb-box', 'mastercard-to-mcau-line', 'mcau-to-rits-line', 'mcau-box', 'eftpos-to-essb-line', 'essb-to-rits-line', 'essb-box']
  },
  'asxb-to-rits-line': {
    groups: ['batch-settlement-lines'],
    related: ['clearing-to-asxb-line', 'clearing-to-asxb-line-0', 'clearing-to-asxb-line-1', 'asxb-box', 'mastercard-to-mcau-line', 'mcau-to-rits-line', 'mcau-box', 'eftpos-to-essb-line', 'essb-to-rits-line', 'essb-box']
  },
  'mastercard-to-mcau-line': {
    groups: ['batch-settlement-lines'],
    related: ['mcau-to-rits-line', 'mcau-box', 'clearing-to-asxb-line', 'clearing-to-asxb-line-0', 'clearing-to-asxb-line-1', 'asxb-to-rits-line', 'asxb-box', 'eftpos-to-essb-line', 'essb-to-rits-line', 'essb-box']
  },
  'mcau-to-rits-line': {
    groups: ['batch-settlement-lines'],
    related: ['mastercard-to-mcau-line', 'mcau-box', 'clearing-to-asxb-line', 'clearing-to-asxb-line-0', 'clearing-to-asxb-line-1', 'asxb-to-rits-line', 'asxb-box', 'eftpos-to-essb-line', 'essb-to-rits-line', 'essb-box']
  },
  'eftpos-to-essb-line': {
    groups: ['batch-settlement-lines'],
    related: ['essb-to-rits-line', 'essb-box', 'clearing-to-asxb-line', 'clearing-to-asxb-line-0', 'clearing-to-asxb-line-1', 'asxb-to-rits-line', 'asxb-box', 'mastercard-to-mcau-line', 'mcau-to-rits-line', 'mcau-box']
  },
  'essb-to-rits-line': {
    groups: ['batch-settlement-lines'],
    related: ['eftpos-to-essb-line', 'essb-box', 'clearing-to-asxb-line', 'clearing-to-asxb-line-0', 'clearing-to-asxb-line-1', 'asxb-to-rits-line', 'asxb-box', 'mastercard-to-mcau-line', 'mcau-to-rits-line', 'mcau-box']
  },

  // eftpos lines - hit area highlights visible line
  'eftpos-left-line': {
    related: ['eftpos-left-line', 'eftpos-left-line-horizontal']
  },
  'eftpos-left-line-horizontal': {
    related: ['eftpos-left-line', 'eftpos-left-line-horizontal']
  },

  // Mastercard lines - hit area highlights visible line
  'mastercard-left-line': {
    related: ['mastercard-left-line', 'mastercard-left-line-horizontal']
  },
  'mastercard-left-line-horizontal': {
    related: ['mastercard-left-line', 'mastercard-left-line-horizontal']
  },

  // Cheques/APCS lines - hit area highlights visible line
  'cheques-to-apcs-line': {
    groups: ['apcs-cheques-lines'],
    related: ['cheques-to-apcs-line', 'osko-to-adi-line']
  },
  'osko-to-adi-line': {
    groups: ['apcs-cheques-lines'],
    related: ['osko-to-adi-line', 'cheques-to-apcs-line']
  },

  // IAC stack lines - hit area highlights visible line
  'direct-entry-stack-line-blue': {
    related: ['direct-entry-stack-line-blue']
  },
  'direct-entry-stack-line-yellow': {
    related: ['direct-entry-stack-line-yellow']
  },
  'direct-entry-stack-line-green': {
    related: ['direct-entry-stack-line-green']
  },
  'direct-entry-stack-line-brown': {
    related: ['direct-entry-stack-line-brown']
  },

  // E-conveyancing lines - hit area highlights visible line
  'sympli-to-adis-line': {
    related: ['sympli-to-adis-line']
  },
  'pexa-to-adis-line': {
    related: ['pexa-to-adis-line']
  }
};

/**
 * Get all elements that should highlight when hovering over an element
 * @param {string} elementId - ID of the element being hovered
 * @returns {Set<string>} - Set of element IDs to highlight
 */
function getRelatedElements(elementId) {
  const relationship = elementRelationships[elementId];
  if (!relationship) return new Set([elementId]); // Just highlight itself

  const toHighlight = new Set([elementId]); // Always include the element itself

  // Add directly related elements
  if (relationship.related) {
    relationship.related.forEach(id => toHighlight.add(id));
  }

  return toHighlight;
}

/**
 * Get all elements in the same group(s) as the hovered element
 * @param {string} elementId - ID of the element being hovered
 * @returns {Set<string>} - Set of element IDs in same groups
 */
function getGroupElements(elementId) {
  const relationship = elementRelationships[elementId];
  if (!relationship || !relationship.groups) return new Set([elementId]);

  const groupElements = new Set([elementId]);

  // Find all elements that share at least one group
  Object.entries(elementRelationships).forEach(([otherId, otherRel]) => {
    if (otherId === elementId) return;
    if (!otherRel.groups) return;

    // Check if any groups overlap
    const hasSharedGroup = relationship.groups.some(group =>
      otherRel.groups.includes(group)
    );

    if (hasSharedGroup) {
      groupElements.add(otherId);
    }
  });

  return groupElements;
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.elementRelationships = elementRelationships;
  window.getRelatedElements = getRelatedElements;
  window.getGroupElements = getGroupElements;
}
