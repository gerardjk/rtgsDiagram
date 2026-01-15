/**
 * Tooltip copy rewrite: paragraph-based, public-audience explanations, with
 * (a) plain-English “how it works” descriptions,
 * (b) historical context and “why it exists” where it materially helps,
 * (c) quantified flow examples using your attached spreadsheets, and
 * (d) forward-looking transition notes that are grounded in published plans.
 *
 * Data notes:
 * - RTGS/FSS figures cited below are from your `australian-rtgs-settlement-detail.csv` (latest row: 2025-12).
 *   These are the RBA-style *average daily* statistics for the month (RTGS per business day; FSS per calendar day).
 * - Retail instrument figures cited below are from your `australian-payment-flows.csv` (latest row: 2025-11),
 *   and are *monthly totals* (with the units implied by the column headers).
 *
 * IMPORTANT UI NOTE (so you actually avoid bullet formatting):
 * This rewrite makes `details` a single multi-paragraph string (separated by blank lines).
 * If your tooltip renderer currently does `details.map(...)` into <li>, update it to render paragraphs.
 * A safe, backwards-compatible React snippet is included at the bottom of this file.
 */

const paragraphs = (...ps) => ps.filter(Boolean).join('\n\n');

const FLOW_SNAPSHOT = {
  // From australian-rtgs-settlement-detail.csv (Date = 2025-12)
  rtgs: {
    asAt: 'December 2025',
    unitNote:
      'Figures are average daily RTGS activity per business day in the month (the standard way RTGS statistics are reported).',
    total: { paymentsAvgDaily: 57989, valueAudMillionsAvgDaily: 294017 },
    swift: { paymentsAvgDaily: 52865, valueAudMillionsAvgDaily: 184847 },
    austraclear: { paymentsAvgDaily: 4967, valueAudMillionsAvgDaily: 101873 },
    ritsCash: { paymentsAvgDaily: 157, valueAudMillionsAvgDaily: 7296 },
    batch: { positionsAvgDaily: 16927, valueAudMillionsAvgDaily: 30608 }
  },

  // From australian-rtgs-settlement-detail.csv (Date = 2025-12)
  fss: {
    asAt: 'December 2025',
    unitNote:
      'Figures are average daily FSS activity per calendar day in the month (FSS runs 24/7, including weekends).',
    total: { paymentsAvgDaily: 4037870, valueAudMillionsAvgDaily: 6138 }
  },

  // From australian-payment-flows.csv (Date = 2025-11)
  retail: {
    asAt: 'November 2025',
    unitNote:
      'Figures are monthly totals for the instrument/rail (typical for retail payments statistics).',
    npp: { volume: 157347900, valueAudMillions: 222082.1, avgAudPerPayment: 1411 },
    directEntry: { volume: 299167800, valueAudMillions: 1611234.3, avgAudPerItem: 5385 },
    debitCards: { volume: 1043900000, valueAudMillions: 57237.3, avgAudPerTxn: 55 },
    creditCards: { volume: 332156500, valueAudMillions: 40462.5, avgAudPerTxn: 122 },
    cheques: { volume: 781000, valueAudMillions: 13119, avgAudPerCheque: 16800 },

    // Simple trend facts from 2023-01 to 2025-11 in your sheet (useful for “future” narrative)
    trend: {
      periodStart: 'January 2023',
      periodEnd: 'November 2025',
      chequesVolumeChangePct: -60.8,
      nppVolumeChangePct: 48.2,
      directEntryVolumeChangePct: 5.2,
      fssPaymentsChangePctApprox: 76.2, // derived from your flows sheet 2023-01 vs 2025-11
      rtgsValueChangePctApprox: 45.2 // derived from your flows sheet 2023-01 vs 2025-11
    }
  }
};

const fmtInt = (n) => Number(n).toLocaleString('en-AU');
const fmtMillionsToAud = (m) => {
  const v = Number(m) * 1_000_000;
  if (v >= 1_000_000_000_000) return `A$${(v / 1_000_000_000_000).toFixed(3)} trillion`;
  if (v >= 1_000_000_000) return `A$${(v / 1_000_000_000).toFixed(3)} billion`;
  return `A$${fmtInt(Math.round(v))}`;
};

/**
 * Shared “line” tooltips (so you don’t repeat copy 20 times).
 * Keep lineStyle/colorFrom fields where your UI expects them.
 */
const LINE_TOOLTIPS = {
  ISO20022_SWIFT: {
    title: 'ISO 20022 over SWIFT',
    description: 'Structured messaging standard for payment instructions. SWIFT delivers messages; RITS settles.',
    lineStyle: true
  },

  CLS_PVP: {
    title: 'ISO 20022 CLS PvP',
    description: 'Payment-versus-payment FX settlement. Links both currency legs so neither settles without the other.',
    lineStyle: true
  },

  DE_ABA: {
    title: 'DE (ABA) File Format',
    description: 'Batch file format for Direct Entry credits and debits. Settlement netted via LVSS.',
    lineStyle: true
  },

  LVSS_FSI_XML: {
    title: 'LVSS FSI (XML)',
    description: 'File Settlement Instructions carrying net positions from retail clearing into LVSS.',
    lineStyle: true
  },

  APCS_TRUNCATED_PRESENTMENT: {
    title: 'APCS Truncated Presentment',
    description: 'Cheque clearing via electronic images rather than physical paper transport.',
    lineStyle: true
  },

  RESERVATION_BATCH_XML: {
    title: 'Reservation Batch (XML)',
    description: 'Batch settlement with pre-reserved funds. Used for property settlement coordination.',
    lineStyle: true
  },

  SWIFT_MT198_SMT131: {
    title: 'SWIFT MT198 / SMT131',
    description: 'Batch settlement instructions delivered via SWIFT into RITS.',
    lineStyle: true
  },

  EPAL: {
    title: 'ePAL Format',
    description: 'eftpos scheme clearing and settlement file format.',
    lineStyle: true
  },

  MASTERCARD_IPM: {
    title: 'Mastercard IPM',
    description: 'Integrated Product Messages for Mastercard clearing between issuers and acquirers.',
    lineStyle: true
  },

  VISA_BASEII: {
    title: 'Visa BASE II',
    description: 'Visa clearing file format for transaction detail and net settlement calculations.',
    lineStyle: true
  },

  PROPRIETARY_SCHEME_FORMATS: {
    title: 'Scheme-specific formats',
    description: 'Other card network clearing formats (Amex, Diners, etc.).',
    lineStyle: true
  },

  HEALTH_CLAIMS: {
    title: 'Health Claims Protocols',
    description: 'Medicare and private health insurance claim messaging via terminals.',
    lineStyle: true
  },

  ATM_AS2805: {
    title: 'AS 2805 (ATM)',
    description: 'ATM interchange messaging for withdrawals and balance enquiries.',
    lineStyle: true
  },

  NECDS_PEXA: {
    title: 'PEXA NECDS',
    description: 'National Electronic Conveyancing Data Standard messages for PEXA property settlement.',
    lineStyle: true
  },

  NECDS_SYMPLI: {
    title: 'Sympli NECDS',
    description: 'NECDS messages for Sympli e-conveyancing platform.',
    lineStyle: true
  }
};

/**
 * ASX quantitative snapshot
 * Source: ASX Group Monthly Activity Report – November 2025 (published December 2025).
 * (We embed only what is explicitly stated in the report excerpt you provided via web-open text extraction.)
 */
const ASX_SNAPSHOT = {
  asAt: 'November 2025',
  cashMarkets: { avgDailyTrades: 2654856, avgDailyValueAudBillions: 7.263, totalValueAudBillions: 159.783 },
  futures: { totalVolumeContracts: 17183000, avgDailyVolumeContracts: 781042, totalNotionalAudBillionsSingleSided: 5800.703 },
  options: { totalVolumeContracts: 6546000, avgDailyVolumeContracts: 297537, totalNotionalAudBillionsSingleSided: 1002.622 },
  otcIrd: {
    totalNotionalClearedAudBillionsDoubleSided: 747.559,
    openNotionalClearedAudBillionsDoubleSided: 5092.675
  },
  clearingRisk: {
    initialMarginHeldAudBillions: { asxClear: 1.2, asxClearFutures: 10.7, total: 12.6 },
    variationMarginPaidAudBillions: { asxClear: 4.7, asxClearFutures: 38.5, total: 43.2 }
  },
  billableCashMarketValueClearedAudBillions: 158.651,
  chess: { holdingsAudBillions: 3416.3, dominantSettlementMessagesMillions: 2.034 },
  austraclear: { holdingsAudBillions: 3403.1, tradeSourceMessagesThousands: 457 }
};

const makeInstitutionTooltip = ({
  name,
  code,
  category,
  hqCountry,
  isFssMember,
  usesSettlementAgent,
  extraHistory
}) => {
  const branchVsSubsidiaryNote =
    category.includes('Foreign Branch')
      ? 'It operates in Australia as part of the parent legal entity rather than as a separately incorporated Australian company.'
      : category.includes('Foreign Subsidiary')
        ? 'It is locally incorporated in Australia even though it is ultimately foreign‑owned, and it is supervised as an Australian ADI.'
        : '';

  const settlementAgentNote = usesSettlementAgent
    ? 'This institution uses a settlement agent, relying on another ESA holder to settle on its behalf rather than settling directly in its own name.'
    : '';

  const fssNote = isFssMember
    ? 'This institution is an FSS participant, which means it can settle retail payments with other FSS participants in real time through the RBA’s Fast Settlement Service (24/7), rather than being limited to settling during RITS operating hours.'
    : '';

  return {
    title: name,
    subtitle: code,
    description: category,
    details: paragraphs(
      `${name} is headquartered in ${hqCountry}. ${branchVsSubsidiaryNote}`.trim(),
      settlementAgentNote,
      fssNote,
      extraHistory
    )
  };
};

const tooltipContent = {
  // ========== ESA / PARTICIPANT GROUPS ==========

  'blue-dots-background': {
    title: 'ESAs',
    subtitle: 'Exchange Settlement Accounts',
    description:
      'Exchange Settlement Accounts (ESAs) are accounts at the Reserve Bank of Australia used to settle obligations between financial institutions in central bank money.',
    details: paragraphs(
      'When Australians make payments, banks and other payment providers end up owing each other money. ESAs are the mechanism that lets those obligations settle with legal finally, using money issued by the central bank (rather than commercial bank money).',
      'Most major settlement services in Australia ultimately move funds across ESAs. High‑value payments settle in real time through RITS (the RTGS system). Many retail payment streams (like Direct Entry and cheque clearing) settle on a net basis through LVSS and then settle across ESAs in RITS. Fast payments (NPP) settle using the Fast Settlement Service (FSS), which uses a dedicated settlement balance that participants allocate for 24/7 settlement.',
      'As of early 2026, there are 101 Exchange Settlement Account holders in Australia: 92 ADIs (Authorised Deposit-taking Institutions), 8 non-ADIs (including payment service providers and clearing facilities), and the Reserve Bank itself. Some participants also hold separate FSS balances for 24/7 fast payment settlement.'
    ),
    link: 'https://www.rba.gov.au/payments-and-infrastructure/esa/'
  },

  'adi-box': {
    title: 'ADIs',
    subtitle: 'Authorised Deposit-taking Institutions',
    description:
      'Authorised and prudentially supervised to take deposits from the public. ',
    details: paragraphs(
      '“ADI” is a regulatory category used in Australia for deposit‑taking institutions such as banks, building societies and credit unions. Most households and businesses hold their main transaction accounts with an ADI. Most ADIs are banks, but a some non-bank institutions are also authorised to take deposits.',
      'ADIs are eligible to hold ESAs at the Reserve Bank, which enables them to settle interbank obligations in central bank money. Smaller ADIs that do not hold ESAs can still provide services to customers using a settlement agent or a sponsoring arrangement.',
      'ADIs are licensed and supervised by the Australian Prudential Regulatory Authority (APRA) under a regulatory framework designed to manage the systemic risks created by deposit‑taking.'
    ),
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'non-adis-box': {
    title: 'Non-ADIs',
    subtitle: 'Non Authorised Deposit-taking Institutions',
    description:
      'Payments system participants that do not take deposits.',
    details: paragraphs(
      'Payment service providers and financial market infrastructures do not take deposits, but may still need to hold ESAs to clear and settle payments. Like ADIs, non-ADIs are subject to regulatory oversight.',
    ),
    link: 'https://www.rba.gov.au/payments-and-infrastructure/'
  },

  'domestic-banks-box': {
    title: 'Domestic banks',
    subtitle: 'Australian‑owned banking institutions',
    description:
      'Banks incorporated and headquartered in Australia.',
    details: paragraphs(
      'Domestic banks provide most Australians’ regular transaction accounts for payments, along with lending and other financial services for households, businesses and capital markets.',
    ),
    link: 'https://www.apra.gov.au/monthly-authorised-deposit-taking-institution-statistics'
  },

  'international-banks-box': {
    title: 'International banks',
    subtitle: 'Foreign‑owned operations in Australia',
    description:
      'Branches or locally incorporated subsidiaries.',
    details: paragraphs(
      'Australia hosts many international banks, some operating as branches (part of the overseas legal entity) and some as subsidiaries (locally incorporated Australian entities). International banks are often important in high‑value interbank payments, securities settlement flows, and correspondent banking, providing payment services to corporate and institutional customers.'
    ),
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'foreign-branches-box': {
    title: 'Foreign branches',
    subtitle: 'Australian branches of foreign banks',
    description:
      'A foreign bank branch is not a separate legal entity from its parent; it operates in Australia under Australian supervision but as part of the overseas bank.',
    compactStyle: true,
    details: 'Branches are typically used for wholesale banking, institutional clients, markets activity and trade finance.',
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'foreign-subsidiaries-box': {
    title: 'Foreign subsidiaries',
    subtitle: 'Locally incorporated foreign‑owned banks',
    description:
      'A foreign‑owned subsidiary is incorporated in Australia and supervised as an Australian ADI, even though it is ultimately owned by a foreign banking group.',
    compactStyle: true,
    details: 'Subsidiaries are separate legal entities. That typically means local capital and governance requirements.',
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'specialised-adis-box': {
    title: 'Specialised ADIs',
    subtitle: 'Non-banks',
    description:
      'ADIs in this category are licensed by APRA to undertake a limited range of banking services.',
    details: 'Wise and Tyro are licensed with a narrower scope than full banking ADIs.',
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

'other-adis-box': {
    title: 'Other ADIs',
    subtitle: 'Non-banks',
    description:
      'Wholesale institutions that function as settlement agents allowing smaller ADIs andto access the payments system without maintaining their own ESAs.',
    details: paragraphs(
      'Settlement agents aggregate net obligations of hundreds of smaller client institutions (credit unions, mutuals, and neo-banks) and aggregate position using their own liquidity in RITS.'
    ),
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'psps-box': {
    title: 'PSPs',
    subtitle: 'Payment Service Providers',
    description:
      'PSPs provide payment acceptance, gateway, processing or orchestration services without being deposit‑taking institutions.',
    details: paragraphs(
      'Payment Service Providers (PSPs) connect merchants and platforms to card schemes, account‑to‑account payments, and financial and data services including fraud controls and reconciliation tools.',
    ),
    link: 'https://www.rba.gov.au/payments-and-infrastructure/'
  },

  'cs-box': {
    title: 'CS facilities',
    subtitle: 'Clearing and Settlement Facilities',
    description:
      'Clearing and settlement facilities (including central counterparties and securities settlement facilities) support financial markets by managing counterparty risk and ensuring trades settle safely.',
    details: paragraphs(
      'In markets, “clearing” is the step that determines who owes what after trades occur, and “settlement” is the step where securities and cash are actually exchanged. Clearing and settlement facilities are systemically important and are subject to specialised regulatory standards and oversight.'
    ),
    link: 'https://www.rba.gov.au/fin-stability/financial-market-infrastructure/'
  },

  // ========== RBA / GOVERNMENT / CASH ==========

  'dot-0': {
    title: 'RBA',
    subtitle: 'Reserve Bank of Australia',
    description:
      'Australia’s central bank. The RBA issues the national currency, implements monetary policy, and operates and oversees key payment and market infrastructures for financial stability.',
    details: paragraphs(
      'The Reserve Bank is the core of the Australian payments system because it provides the final settlement asset: central bank money. Banks and other eligible institutions hold Exchange Settlement Accounts at the RBA and use them to settle obligations arising from many different payment channels. The RBA also issues banknotes and works with industry to ensure their reliable distribution.'
    ),
    link: 'https://www.rba.gov.au/about-rba/'
  },

  'opa-box': {
    title: 'OPA',
    subtitle: 'Official Public Account',
    description:
      'The Commonwealth Government’s primary account at the Reserve Bank. It is where Commonwealth funds are held before being disbursed and where key government receipts are managed.',
    details: paragraphs(
      'Government payments (including welfare payments, tax refunds, Medicare payments, and supplier payments) are large, regular, and critical to the national economy and money supply. The Commonwealth banks with the RBA and its daily expenditures and receipts (taxes or bond issuances) constitute significant interbank settlement movements.'
    ),
    link: 'https://www.finance.gov.au/about-us/glossary/pgpa/term-official-public-account-opa'
  },

  'bdf-box': {
    title: 'BDF',
    subtitle: 'Banknote Distribution Framework',
    description:
      'A framework for distributing Australian banknotes from the Reserve Bank into the banking system, managed in cooperation with the "Big Four" domestic banks.',
    details: paragraphs(
      'The Banknote Distribution Framework manages the logistics of physical cash distribution: issuance, sorting, storing, transportation, and withdrawal.',
    ),
    link: 'https://www.rba.gov.au/banknotes/distribution/'
  },

  // ========== RITS / RTGS / FSS ==========

'rits-circle': {
    preHeading: 'Systemically Important Payment System (SIPS)',
    title: 'RITS',
    subtitle: 'Reserve Bank Information and Transfer System',
    description:
      'The RBA\'s central settlement system. Manages Exchange Settlement Accounts (ESAs) and settles high-value payments (RTGS) and net retail obligations (LVSS).',
    details: paragraphs(
      `In ${FLOW_SNAPSHOT.rtgs.asAt}, RITS settled ${fmtInt(FLOW_SNAPSHOT.rtgs.total.paymentsAvgDaily)} payments/day averaging ${fmtMillionsToAud(FLOW_SNAPSHOT.rtgs.total.valueAudMillionsAvgDaily)}/day.`,
      '**RTGS mode**: settles payments individually in real time. **Net settlement mode**: settles aggregated positions from retail clearing streams via LVSS.',
      'Instructions arrive via **SWIFT** (global messaging network) or **COIN** (domestic network for clearing files and NPP traffic). The **Fast Settlement Service** extends settlement to 24/7 for NPP.'
    ),
    link: 'https://www.rba.gov.au/payments-and-infrastructure/rits/about.html'
  },

  'small-circle': {
    title: 'FSS',
    subtitle: 'Fast Settlement Service',
    description:
      'The RBA\'s 24/7 settlement service for fast payments. Settles NPP transactions in central bank money around the clock.',
    details: paragraphs(
      `In ${FLOW_SNAPSHOT.fss.asAt}, FSS averaged ${fmtInt(FLOW_SNAPSHOT.fss.total.paymentsAvgDaily)} payments/day with value of ${fmtMillionsToAud(FLOW_SNAPSHOT.fss.total.valueAudMillionsAvgDaily)}/day. ${FLOW_SNAPSHOT.fss.unitNote}`,
      'NPP clears payments instantly; FSS provides settlement finality by moving funds between participants\' allocated settlement balances. Participants must maintain sufficient liquidity for settlement.'
    ),
    hours: '24/7/365',
    link: 'https://www.rba.gov.au/payments-and-infrastructure/rits/about.html'
  },

  'fss-circle': {
    title: 'FSS',
    subtitle: 'Fast Settlement Service',
    description:
      'The RBA\'s 24/7 settlement service for NPP payments.',
    details: 'Enables interbank settlement outside business hours. Participants pre-fund allocated settlement balances to support continuous operation.',
    link: 'https://www.rba.gov.au/payments-and-infrastructure/rits/'
  },

  // ========== SWIFT / HVCS / ISO 20022 ==========

  'swift-pds-box': {
    title: 'SWIFT',
    subtitle: 'Secure financial messaging',
    description:
      'Global secure messaging network for financial institutions. Delivers payment instructions; does not move money.',
    details: 'SWIFT carries high-value payment instructions (HVCS) and batch settlement instructions into RITS. Settlement finality occurs when RITS moves ESA balances.',
    link: 'https://www.swift.com/'
  },

  'swift-pds-rect': {
    title: 'SWIFT PDS',
    subtitle: 'Payment Delivery System',
    description:
      'SWIFT service that routes payment instructions between institutions and into RITS.',
    details: 'Handles the messaging layer (instruction delivery). Settlement occurs separately in RITS across Exchange Settlement Accounts.',
    link: 'https://www.swift.com/'
  },

  'swift-hvcs-box': {
    title: 'HVCS',
    subtitle: 'High Value Clearing System',
    description:
      'Australia\'s high-value payment clearing arrangements. Uses ISO 20022 messages delivered via SWIFT, settled in RITS.',
    details: paragraphs(
      `SWIFT-delivered payments are the dominant RTGS channel by count and value. In ${FLOW_SNAPSHOT.rtgs.asAt}, SWIFT payments averaged ${fmtInt(FLOW_SNAPSHOT.rtgs.swift.paymentsAvgDaily)}/day with value of ${fmtMillionsToAud(FLOW_SNAPSHOT.rtgs.swift.valueAudMillionsAvgDaily)}/day.`,
      'ISO 20022 adoption improved data richness and alignment with global standards, supporting automation and compliance screening.'
    ),
    link: 'https://www.rba.gov.au/payments-and-infrastructure/rits/'
  },

  'pacs-009-box': {
    title: 'pacs.009',
    subtitle: 'Financial Institution Credit Transfer',
    description:
      'ISO 20022 message for bank-to-bank transfers. Used for wholesale interbank payments settled via RTGS.',
    smallStyle: true,
    details: 'Used when both payer and payee are financial institutions. Settlement occurs when RITS debits/credits ESAs.'
  },

  'pacs-008-box': {
    title: 'pacs.008',
    subtitle: 'Customer Credit Transfer',
    description:
      'ISO 20022 message for customer payments requiring interbank settlement.',
    smallStyle: true,
    details: 'Carries structured customer and remittance data for reconciliation and compliance. Settlement via RTGS across ESAs.'
  },

  'pacs-004-box': {
    title: 'pacs.004',
    subtitle: 'Payment Return',
    description:
      'ISO 20022 message to return a payment that cannot be processed or must be reversed.',
    smallStyle: true,
    details: 'Used for closed accounts, invalid details, or compliance failures. Return ability depends on scheme rules and timing.'
  },

  // All turquoise ISO 20022 lines → shared definition
  'hvcs-horizontal-line': { ...LINE_TOOLTIPS.ISO20022_SWIFT },
  'pacs-to-swift-line-0': { ...LINE_TOOLTIPS.ISO20022_SWIFT },
  'pacs-to-swift-line-1': { ...LINE_TOOLTIPS.ISO20022_SWIFT },
  'pacs-to-swift-line-2': { ...LINE_TOOLTIPS.ISO20022_SWIFT },
  'swift-pds-to-rits-line-0': { ...LINE_TOOLTIPS.ISO20022_SWIFT },
  'swift-pds-to-rits-line-1': { ...LINE_TOOLTIPS.ISO20022_SWIFT },
  'swift-pds-to-rits-line-2': { ...LINE_TOOLTIPS.ISO20022_SWIFT },
  'npp-to-adi-line': { ...LINE_TOOLTIPS.ISO20022_SWIFT },
  'new-pacs-to-npp-line': { ...LINE_TOOLTIPS.ISO20022_SWIFT },
  'npp-to-fss-path': { ...LINE_TOOLTIPS.ISO20022_SWIFT },

  // CLS lines
  'cls-aud-line-new': { ...LINE_TOOLTIPS.CLS_PVP },
  'cls-to-rits-line-final': { ...LINE_TOOLTIPS.CLS_PVP },
  'cls-s-curve': { ...LINE_TOOLTIPS.CLS_PVP },
  'cls-aud-rect': { ...LINE_TOOLTIPS.CLS_PVP, colorFrom: 'cls-aud-line-new' },

  // ========== NPP ECOSYSTEM ==========

  'npp-box': {
    title: 'NPP Basic Infrastructure',
    subtitle: 'New Payments Platform (clearing layer)',
    description:
      'Australia\'s real-time payments clearing infrastructure. Supports overlay services (Osko, PayID, PayTo). Settlement via FSS.',
    prominentSystem: true,
    details: paragraphs(
      `In ${FLOW_SNAPSHOT.retail.asAt}, NPP processed ${fmtInt(FLOW_SNAPSHOT.retail.npp.volume)} payments totalling ${fmtMillionsToAud(FLOW_SNAPSHOT.retail.npp.valueAudMillions)}. Average ~A$${fmtInt(FLOW_SNAPSHOT.retail.npp.avgAudPerPayment)}/payment.`,
      'Clearing occurs on NPP infrastructure; settlement finality delivered by FSS in central bank money.'
    ),
    hours: '24/7/365',
    link: 'https://www.rba.gov.au/payments-and-infrastructure/new-payments-platform/'
  },

  'npp-purple-box': {
    preHeading: 'Australia Payments Plus',
    title: 'NPP',
    subtitle: 'New Payments Platform',
    description:
      'Real-time account-to-account payments. Supports push payments and (via PayTo) authorised pull payments.',
    prominentSystem: true,
    details: paragraphs(
      `In ${FLOW_SNAPSHOT.retail.asAt}: NPP handled ${fmtInt(FLOW_SNAPSHOT.retail.npp.volume)} payments; Direct Entry handled ${fmtInt(FLOW_SNAPSHOT.retail.directEntry.volume)} items.`,
      'NPP growing rapidly but legacy batch systems remain embedded in enterprise payroll and billing processes.'
    ),
    link: 'https://nppa.com.au/'
  },

  'osko-box': {
    preHeading: 'Australia Payments Plus',
    title: 'Osko',
    subtitle: 'Fast payment service',
    description:
      'Consumer-facing NPP overlay for near-instant account-to-account transfers.',
    prominentSystem: true,
    details: 'Runs on NPP clearing; settlement finality via FSS. Provides richer reference data than legacy transfers.'
  },

  'payid-box': {
    preHeading: 'Australia Payments Plus',
    title: 'PayID and PayTo',
    subtitle: 'NPP overlay services',
    description:
      'PayID: links phone/email/ABN to account for easier addressing. PayTo: authorised payment agreements visible in banking apps.',
    prominentSystem: true,
    details: paragraphs(
      '**PayID** reduces misdirected payments by replacing BSB/account numbers with memorable identifiers.',
      '**PayTo** replaces legacy direct debits with payer-controlled agreements—visible, pausable, cancellable in banking channels.'
    ),
    link: 'https://www.auspayplus.com.au/solutions/payto'
  },

  'payto-box': {
    preHeading: 'Australia Payments Plus',
    title: 'IPS',
    subtitle: 'International Payments Service',
    description:
      'Enables inbound cross-border payments to credit via NPP fast payment rails for the final AUD leg.',
    prominentSystem: true,
    details: 'Cross-border networks handle international leg; NPP/FSS handles domestic clearing and settlement in AUD.',
    link: 'https://www.auspayplus.com.au/solutions/npp'
  },

  'bsct-box': {
    title: 'BSCT',
    subtitle: 'Basic Single Credit Transfer',
    description:
      'Standard NPP message type for single account-to-account payments.',
    details: 'One payer, one payee, one payment. Structured fields support automated reconciliation and compliance.'
  },

  // ========== DIRECT ENTRY / BECS / LVSS / CHEQUES ==========

  'de-box': {
    title: 'Direct Entry',
    subtitle: 'Batch credits and debits',
    description:
      'Australia\'s batch payment system for payroll, bills, and direct debits. Files exchanged in bulk; net positions settled via LVSS.',
    details: paragraphs(
      `In ${FLOW_SNAPSHOT.retail.asAt}, Direct Entry processed ${fmtInt(FLOW_SNAPSHOT.retail.directEntry.volume)} items totalling ${fmtMillionsToAud(FLOW_SNAPSHOT.retail.directEntry.valueAudMillions)}. Average ~A$${fmtInt(FLOW_SNAPSHOT.retail.directEntry.avgAudPerItem)}/item.`,
      'Deeply embedded in enterprise payroll and billing systems. Migration to real-time alternatives requires business process change, not just technology.'
    )
  },

  'becs-box': {
    title: 'BECS',
    subtitle: 'Bulk Electronic Clearing System',
    description:
      'Clearing framework for Direct Entry file exchange between institutions. Rules govern validation, rejection, and correction.',
    prominentSystem: true,
    details: paragraphs(
      'Institutions exchange files and agree obligations via BECS; settlement occurs separately via LVSS.',
      'No fixed decommissioning date. BECS will remain while PayTo and other migration pathways mature.'
    ),
    link: 'https://www.auspaynet.com.au/payments-services/becs'
  },

  'becn-box': {
    title: 'BECN',
    subtitle: 'Bulk Electronic Clearing (Net)',
    description:
      'Net settlement stream for bulk payments. Obligations netted across clearing cycle; only net amounts settled.',
    details: 'Efficient for high-volume low-value payments—reduces settlement traffic and liquidity needs. Introduces timing dependencies around cut-offs.'
  },

  'becg-box': {
    title: 'BECG',
    subtitle: 'Bulk Electronic Clearing (Gross)',
    description:
      'Gross settlement stream for bulk payments where item-by-item settlement is preferred.',
    details: 'Used where risk or operational rules favour gross treatment over multilateral netting.'
  },

  'lvss-circle': {
    title: 'LVSS',
    subtitle: 'Low Value Settlement Service',
    description:
      'RBA service that settles net obligations from retail clearing streams (Direct Entry, cheques, cards) across ESAs.',
    details: 'Clearing systems determine net positions; LVSS settles them in central bank money. Reduces settlement traffic and liquidity needs.'
  },

  'lvss-gear': {
    title: 'LVSS',
    subtitle: 'Settlement hub for retail clearing streams',
    description:
      'Receives File Settlement Instructions from multiple retail streams; settles net positions across ESAs.',
    details: 'Convergence point where Direct Entry, cheques, and card obligations become interbank positions settled in central bank money.',
    link: 'https://www.rba.gov.au/payments-and-infrastructure/payments-system.html'
  },

  // LVSS FSI lines
  'lvss-line-gabs': {
    title: 'GABS FSI',
    description: 'Government sweep settlement instructions to/from Official Public Account.',
    lineStyle: true
  },
  'lvss-line-cecs': { ...LINE_TOOLTIPS.LVSS_FSI_XML },
  'lvss-line-cshd': {
    title: 'CSHD FSI (Legacy)',
    description: 'Former Cashcard ATM network settlement instructions. Network defunct since 2016.',
    lineStyle: true
  },
  'lvss-line-becs': { ...LINE_TOOLTIPS.LVSS_FSI_XML },
  'lvss-line-apcs': { ...LINE_TOOLTIPS.LVSS_FSI_XML },
  'cecs-to-iac-line-1': { ...LINE_TOOLTIPS.LVSS_FSI_XML },
  'cecs-to-iac-line-2': { ...LINE_TOOLTIPS.LVSS_FSI_XML },

  // Direct Entry ABA lines
  'directentry-to-adi-line': { ...LINE_TOOLTIPS.DE_ABA },
  'maroon-horizontal-branch': { ...LINE_TOOLTIPS.DE_ABA },
  'becn-to-becs-line': { ...LINE_TOOLTIPS.DE_ABA },
  'becg-to-becs-line': { ...LINE_TOOLTIPS.DE_ABA },

  'apcs-box': {
    title: 'APCS',
    subtitle: 'Australian Paper Clearing System',
    description:
      'Clearing system for cheques. Images exchanged electronically but legal instrument remains paper-based.',
    details: 'Being wound down as cheque volumes decline. Focus shifted to orderly exit with support for remaining users.'
  },

  'gabs-box': {
    title: 'GABS',
    subtitle: 'Government Agencies Balances Sweep',
    description:
      'Daily sweep of Australian Government agency balances to/from the Official Public Account (OPA) at the RBA.',
    details: 'Consolidates agency balances from commercial banks into the OPA each evening, returning funds each morning. Settlement via LVSS.'
  },

  'cshd-box': {
    title: 'CSHD',
    subtitle: 'Cashcard',
    description: 'Former ATM network settlement stream (defunct).',
    details: 'Legacy LVSS payment service code.'
  },

  'cheques-box': {
    title: 'Cheques',
    subtitle: 'Paper-based payment instrument',
    description:
      'Declining payment method. Industry transition plan: issuance ends 30 June 2028; acceptance ends 30 September 2029.',
    details: paragraphs(
      `In ${FLOW_SNAPSHOT.retail.asAt}: ~${fmtInt(FLOW_SNAPSHOT.retail.cheques.volume)} cheques totalling ${fmtMillionsToAud(FLOW_SNAPSHOT.retail.cheques.valueAudMillions)}. Average ~A$${fmtInt(FLOW_SNAPSHOT.retail.cheques.avgAudPerCheque)}—low volume but high average value.`,
      `Volume fell ~${Math.abs(FLOW_SNAPSHOT.retail.trend.chequesVolumeChangePct).toFixed(0)}% from ${FLOW_SNAPSHOT.retail.trend.periodStart} to ${FLOW_SNAPSHOT.retail.trend.periodEnd}.`
    ),
    link: 'https://treasury.gov.au/consultation/c2024-556474'
  },

  // APCS truncated presentment lines
  'cheques-to-apcs-line': { ...LINE_TOOLTIPS.APCS_TRUNCATED_PRESENTMENT, colorFrom: 'cheques-to-apcs-line' },

  // ========== CARDS / CECS / IAC ==========

  'cecs-box': {
    title: 'CECS',
    subtitle: 'Consumer Electronic Clearing System',
    description:
      'Clearing stream for card obligations. Produces net positions settled via LVSS.',
    details: 'Cards authorise instantly but settle later on a net basis. Clearing calculates obligations between issuers and acquirers.'
  },

  'direct-entry-stack-bounding-box': {
    title: 'IAC',
    subtitle: 'Issuers and Acquirers Community',
    description:
      'Industry clearing arrangements for card issuers and acquirers. Obligations settle through interbank settlement.',
    details: 'Reconciles transaction volumes between issuers (card providers) and acquirers (merchant payment providers). Settlement via banking layer.'
  },

  'bpay-box': {
    preHeading: 'Australia Payments Plus',
    title: 'BPAY',
    subtitle: 'Bill payment service',
    description:
      'Electronic bill payment system allowing customers to pay bills from their bank accounts using BPAY biller codes and reference numbers.',
    details: paragraphs(
      'BPAY enables customers to initiate payments to billers through their internet or phone banking. Payments are processed through the Direct Entry system for settlement.',
      'The system provides a standardised way for billers to receive payments with automated reconciliation using the unique reference numbers.',
      'BPAY is widely used for utility bills, credit card payments, insurance premiums, and government payments, processing millions of transactions monthly.'
    ),
    link: 'https://www.auspayplus.com.au/solutions/bpay'
  },

  'eftpos-box': {
    preHeading: 'Australia Payments Plus',
    title: 'eftpos',
    subtitle: 'Domestic debit scheme',
    description:
      'Australia\'s domestic debit card scheme. Instant authorisation; deferred net settlement.',
    prominentSystem: true,
    details: paragraphs(
      `In ${FLOW_SNAPSHOT.retail.asAt}: ~${fmtInt(FLOW_SNAPSHOT.retail.debitCards.volume)} debit card transactions totalling ${fmtMillionsToAud(FLOW_SNAPSHOT.retail.debitCards.valueAudMillions)}. Average ~A$${fmtInt(FLOW_SNAPSHOT.retail.debitCards.avgAudPerTxn)}/txn.`,
      'Authorisation is instant; interbank settlement is netted and deferred. Scheme calculates obligations; RBA layer settles them.'
    )
  },

  'mastercard-box': {
    title: 'Mastercard',
    subtitle: 'International card scheme',
    description:
      'Global card network for credit and debit. Net obligations settled through scheme settlement arrangements.',
    prominentSystem: true,
    details: paragraphs(
      `In ${FLOW_SNAPSHOT.retail.asAt}: ~${fmtInt(FLOW_SNAPSHOT.retail.creditCards.volume)} credit card transactions totalling ${fmtMillionsToAud(FLOW_SNAPSHOT.retail.creditCards.valueAudMillions)}. Average ~A$${fmtInt(FLOW_SNAPSHOT.retail.creditCards.avgAudPerTxn)}/txn.`,
      'Authorisation is instant; settlement is netted and deferred.'
    )
  },

  'visa-box': {
    title: 'Visa',
    subtitle: 'International card scheme',
    description:
      'Global card network for debit and credit. Real-time authorisation; deferred net settlement.',
    prominentSystem: true,
    details: 'Scheme calculates net obligations across issuers and acquirers. Settlement via banking layer.'
  },

  'other-cards-box': {
    title: 'Other card schemes',
    subtitle: 'Additional networks',
    description:
      'Other schemes (e.g., Amex, Diners) with different commercial models. Still require interbank settlement.',
    details: 'Some operate three-party models. All ultimately rely on banking settlement for final value movement.'
  },

  'mcau-box': {
    title: 'MCAU',
    subtitle: 'Mastercard Australia settlement entity',
    description:
      'Interface between Mastercard scheme netting and Australian settlement layer.',
    compactStyle: true,
    details: 'Scheme computes net obligations; MCAU delivers settlement instructions for ESA settlement.'
  },

  'essb-box': {
    title: 'ESSB',
    subtitle: 'eftpos settlement entity',
    description:
      'Interface between eftpos scheme netting and Australian settlement layer.',
    compactStyle: true,
    details: 'Converts scheme-computed obligations into final interbank settlement movements.'
  },

  // Scheme file format lines
  'eftpos-left-line': { ...LINE_TOOLTIPS.EPAL, colorFrom: 'eftpos-left-line' },
  'eftpos-left-line-horizontal': { ...LINE_TOOLTIPS.EPAL, colorFrom: 'eftpos-left-line-horizontal' },
  'mastercard-left-line': { ...LINE_TOOLTIPS.MASTERCARD_IPM, colorFrom: 'mastercard-left-line' },
  'mastercard-left-line-horizontal': { ...LINE_TOOLTIPS.MASTERCARD_IPM, colorFrom: 'mastercard-left-line-horizontal' },
  'direct-entry-stack-line-yellow': { ...LINE_TOOLTIPS.VISA_BASEII, colorFrom: 'direct-entry-stack-line-yellow' },
  'direct-entry-stack-line-blue': { ...LINE_TOOLTIPS.PROPRIETARY_SCHEME_FORMATS, colorFrom: 'direct-entry-stack-line-blue' },
  'direct-entry-stack-line-green': { ...LINE_TOOLTIPS.HEALTH_CLAIMS, colorFrom: 'direct-entry-stack-line-green' },
  'direct-entry-stack-line-brown': { ...LINE_TOOLTIPS.ATM_AS2805, colorFrom: 'direct-entry-stack-line-brown' },

  'atms-box': {
    title: 'ATMs',
    subtitle: 'Cash withdrawals',
    description:
      'Instant cash dispensing; interbank settlement deferred and netted.',
    details: 'Customer experience is instant. Obligations between institutions settled later via net settlement arrangements.'
  },

  'claims-box': {
    title: 'Claims',
    subtitle: 'Medicare and health claims',
    description:
      'Health claims messaging for eligibility and reimbursement. Payment settles via banking channels.',
    details: 'Validates entitlements and allocates payments between government, insurers, providers, and patients. Resulting payments settle through standard banking infrastructure.'
  },

  // ========== ADMINISTERED BATCHES / PROPERTY SETTLEMENT ==========

  'administered-batches-box': {
    title: 'Administered batches',
    subtitle: 'Batch settlement in RITS',
    description:
      'External systems compute net positions; RITS settles across ESAs. Used for markets, schemes, and e-conveyancing.',
    details: paragraphs(
      `In ${FLOW_SNAPSHOT.rtgs.asAt}, batch positions averaged ${fmtInt(FLOW_SNAPSHOT.rtgs.batch.positionsAvgDaily)}/day with value of ${fmtMillionsToAud(FLOW_SNAPSHOT.rtgs.batch.valueAudMillionsAvgDaily)}/day.`,
      'Many specialised systems depend on the same central settlement layer for finality.'
    )
  },

  'pexa-convey-box': {
    title: 'PEXA e-conveyancing',
    subtitle: 'Property Exchange Australia',
    description:
      'Coordinates electronic property settlement: legal title transfer synchronised with banking settlement.',
    details: 'Orchestrates workflow between lenders, buyers, sellers, and registries. Funds settle via RBA settlement infrastructure in central bank money.'
  },

  'sympli-box': {
    title: 'Sympli e-conveyancing',
    subtitle: 'Electronic property settlement',
    description:
      'Alternative e-conveyancing platform coordinating with banks and registries.',
    details: 'Similar workflow to PEXA. Funds settle via interbank settlement arrangements, not the platform itself.'
  },

  'pexa-box': {
    title: 'PEXA',
    subtitle: 'PEXA settlement stream',
    description:
      'Settlement stream for PEXA property settlement obligations.',
    compactStyle: true,
    details: 'Interface between property workflow and banking settlement layer.'
  },

  'asxf-box': {
    title: 'ASXF',
    subtitle: 'ASX feeder / settlement stream',
    description:
      'Settlement interface for market and property-related batch flows into RITS.',
    compactStyle: true,
    details: 'Connector between external systems\' net positions and central bank settlement.'
  },

  'asxb-box': {
    title: 'ASXB',
    subtitle: 'ASX batch settlement stream',
    description:
      'Batch settlement stream for ASX clearing and settlement net obligations.',
    compactStyle: true,
    details: 'Markets net trades and settle net obligations on schedule. Reduces liquidity needs.'
  },

  // Reservation batch lines
  'pexa-horizontal-line-0': { ...LINE_TOOLTIPS.RESERVATION_BATCH_XML },
  'pexa-horizontal-line-1': { ...LINE_TOOLTIPS.RESERVATION_BATCH_XML },
  'pexa-to-rits-line': { ...LINE_TOOLTIPS.RESERVATION_BATCH_XML },
  'sympli-horizontal-line-0': { ...LINE_TOOLTIPS.RESERVATION_BATCH_XML },
  'sympli-horizontal-line-1': { ...LINE_TOOLTIPS.RESERVATION_BATCH_XML },
  'asxf-to-rits-line': { ...LINE_TOOLTIPS.RESERVATION_BATCH_XML },

  // Batch settlement request lines (MT198/SMT131)
  'clearing-to-asxb-line': { ...LINE_TOOLTIPS.SWIFT_MT198_SMT131 },
  'clearing-to-asxb-line-0': { ...LINE_TOOLTIPS.SWIFT_MT198_SMT131 },
  'clearing-to-asxb-line-1': { ...LINE_TOOLTIPS.SWIFT_MT198_SMT131 },
  'asxb-to-rits-line': { ...LINE_TOOLTIPS.SWIFT_MT198_SMT131 },
  'mastercard-to-mcau-line': { ...LINE_TOOLTIPS.SWIFT_MT198_SMT131 },
  'mcau-to-rits-line': { ...LINE_TOOLTIPS.SWIFT_MT198_SMT131 },
  'eftpos-to-essb-line': { ...LINE_TOOLTIPS.SWIFT_MT198_SMT131 },
  'essb-to-rits-line': { ...LINE_TOOLTIPS.SWIFT_MT198_SMT131 },

  // e‑conveyancing NECDS lines
  'sympli-to-adis-line': { ...LINE_TOOLTIPS.NECDS_SYMPLI, colorFrom: 'sympli-to-adis-line' },
  'pexa-to-adis-line': { ...LINE_TOOLTIPS.NECDS_PEXA, colorFrom: 'pexa-to-adis-line' },

  // ========== CLS ==========

  'cls-circle': {
    preHeading: 'Systemically Important Payment System (SIPS)',
    title: 'CLS',
    subtitle: 'Continuous Linked Settlement',
    description:
      'Global FX settlement system. Payment-versus-payment model links both currency legs to reduce settlement risk.',
    details: 'Eliminates FX settlement risk where one party pays but doesn\'t receive. RBA supports AUD settlement via CLS.',
    link: 'https://www.cls-group.com/'
  },

  // ========== ASX / MARKETS INFRASTRUCTURE ==========

  'asx-box': {
    title: 'ASX',
    subtitle: 'Australian Securities Exchange',
    description:
      'Market operator and provider of clearing (CCPs) and settlement (SSFs) infrastructure. Cash leg settles via RITS.',
    details: paragraphs(
      `Cash equities and listed options flow through **ASX Clear**, the primary CCP. In ${ASX_SNAPSHOT.asAt} the lit cash market averaged ${fmtInt(ASX_SNAPSHOT.cashMarkets.avgDailyTrades)} trades per day (≈A$${ASX_SNAPSHOT.cashMarkets.avgDailyValueAudBillions.toFixed(1)} billion). The CCP held ~A$${ASX_SNAPSHOT.clearingRisk.initialMarginHeldAudBillions.asxClear.toFixed(1)} billion in initial margin and called about A$${ASX_SNAPSHOT.clearingRisk.variationMarginPaidAudBillions.asxClear.toFixed(1)} billion of variation margin across a typical day.` ,
      `**ASX Clear (Futures)** novates SPI futures, listed interest-rate contracts, and a portfolio of cleared OTC IRS. Over ${ASX_SNAPSHOT.asAt} it cleared ≈${fmtInt(ASX_SNAPSHOT.futures.avgDailyVolumeContracts)} contracts a day (≈A$${ASX_SNAPSHOT.futures.totalNotionalAudBillionsSingleSided.toFixed(0)} billion single-sided notional across the month) and held ~A$${ASX_SNAPSHOT.clearingRisk.initialMarginHeldAudBillions.asxClearFutures.toFixed(1)} billion of initial margin. Variation margin flows were roughly A$${ASX_SNAPSHOT.clearingRisk.variationMarginPaidAudBillions.asxClearFutures.toFixed(1)} billion per day.` ,
      `Settlement facilities sit underneath the CCPs. **ASX Settlement (CHESS)** delivers DvP for equities with custody balances of ≈A$${ASX_SNAPSHOT.chess.holdingsAudBillions.toFixed(0)} billion and about ${ASX_SNAPSHOT.chess.dominantSettlementMessagesMillions.toFixed(1)} million settlement messages a month. **Austraclear** (also an SSF) safekeeps debt securities and structured finance paper with ≈A$${ASX_SNAPSHOT.austraclear.holdingsAudBillions.toFixed(0)} billion on register and ~${fmtInt(ASX_SNAPSHOT.austraclear.tradeSourceMessagesThousands)}k trade-source messages in ${ASX_SNAPSHOT.asAt}.` ,
      'All ASX clearing and settlement cash legs pay and receive funds in RITS: CCP margin is managed intraday in central-bank money and the SSFs use delivery-versus-payment so securities and cash complete simultaneously.'
    ),
    sipsStyle: true
  },

  'asx-clearing-dot': {
    title: 'ASX clearing facilities',
    subtitle: 'Central counterparties (CCPs)',
    description:
      'CCPs manage counterparty risk by becoming buyer to every seller and vice versa. Supported by margining.',
    details: paragraphs(
      `In ${ASX_SNAPSHOT.asAt}: initial margin held ~A$${ASX_SNAPSHOT.clearingRisk.initialMarginHeldAudBillions.total.toFixed(1)}b (ASX Clear A$${ASX_SNAPSHOT.clearingRisk.initialMarginHeldAudBillions.asxClear.toFixed(1)}b, Futures A$${ASX_SNAPSHOT.clearingRisk.initialMarginHeldAudBillions.asxClearFutures.toFixed(1)}b). Variation margin ~A$${ASX_SNAPSHOT.clearingRisk.variationMarginPaidAudBillions.total.toFixed(1)}b.`,
      '**ASX Clear**: cash equities and options. **ASX Clear (Futures)**: futures and some OTC derivatives.'
    ),
    link: 'https://www.rba.gov.au/fin-stability/financial-market-infrastructure/'
  },

  'asx-settlement-dot': {
    title: 'ASX Settlement',
    subtitle: 'Securities settlement facility (SSF)',
    description:
      'Operates CHESS for equities settlement. Delivery versus payment (DvP) links securities and cash legs.',
    details: paragraphs(
      `In ${ASX_SNAPSHOT.asAt}: CHESS holdings ~A$${ASX_SNAPSHOT.chess.holdingsAudBillions.toFixed(1)}b, ~${ASX_SNAPSHOT.chess.dominantSettlementMessagesMillions.toFixed(1)}m settlement messages.`,
      'CHESS coordinates securities leg; cash leg settles via RITS.'
    ),
    link: 'https://www.asx.com.au/'
  },

  'chess-box': {
    title: 'CHESS',
    subtitle: 'Clearing House Electronic Subregister System',
    description:
      'ASX system for equities post-trade processing: settlement workflows and electronic shareholding register.',
    details: 'Manages steps from trade execution to settlement and holdings update. Cash settlement via RITS.'
  },

  'chess-rtgs-box': {
    title: 'CHESS-RTGS',
    subtitle: 'DvP cash settlement interface',
    description:
      'Interface linking CHESS securities settlement to RTGS cash settlement for delivery-versus-payment.',
    details: 'DvP risk control: securities delivered only if cash paid, and vice versa.'
  },

  'austraclear-box': {
    title: 'Austraclear',
    subtitle: 'Debt securities depository and settlement',
    description:
      'Post-trade system for debt securities and money market instruments. Connects to RITS for cash settlement.',
    details: paragraphs(
      `Holdings ~A$${ASX_SNAPSHOT.austraclear.holdingsAudBillions.toFixed(1)}b (${ASX_SNAPSHOT.asAt}).`,
      `RTGS settlement (${FLOW_SNAPSHOT.rtgs.asAt}): ${fmtInt(FLOW_SNAPSHOT.rtgs.austraclear.paymentsAvgDaily)} payments/day averaging ${fmtMillionsToAud(FLOW_SNAPSHOT.rtgs.austraclear.valueAudMillionsAvgDaily)}/day.`
    )
  },

  'lch-dot': {
    title: 'LCH Limited',
    subtitle: 'OTC derivatives CCP (SwapClear)',
    description:
      'Global CCP for interest rate swaps. Licensed in Australia; clears majority of AUD OTC interest rate derivatives.',
    details: 'Central clearing reduces OTC derivatives counterparty risk via margining and default management. Assessed against RBA Financial Stability Standards.',
    link: 'https://www.rba.gov.au/fin-stability/financial-market-infrastructure/'
  },

  // ASX messaging lines
  'asx-to-adi-line': {
    title: 'EXIGO / ESI',
    description: 'EXIGO (Austraclear) and ESI (CHESS) messaging interfaces for ASX post-trade settlement.',
    lineStyle: true
  },
  'asx-to-hvcs-line': {
    title: 'EXIGO / ESI',
    description: 'EXIGO (Austraclear) and ESI (CHESS) messaging interfaces for ASX post-trade settlement.',
    lineStyle: true
  },

  'clearing-box': {
    title: 'Clearing / netting',
    subtitle: 'Obligations calculation',
    description:
      'Offsets obligations to reduce settlement payments. Efficient but concentrates risk at settlement time.',
    lineStyle: true,
    details: 'Netting compresses many trades to net positions. Reduces liquidity needs but creates settlement window dependencies.'
  },

  'trade-by-trade-box': {
    title: 'Trade-by-trade settlement',
    subtitle: 'Gross settlement approach',
    description:
      'Settles each transaction individually. Reduces net exposure build-up but increases settlement traffic.',
    lineStyle: true,
    details: 'Trade-off: risk reduction vs. operational and liquidity efficiency.'
  },

  // DvP cash leg path
  'dvp-cash-leg-box': {
    title: 'DvP cash leg',
    subtitle: 'RTGS cash settlement',
    description:
      'Cash side of DvP settles via RTGS, linked to securities delivery.',
    lineStyle: true,
    colorFrom: 'dvp-cash-leg-to-dvp-rtgs-line',
    details: 'Cash settles in central bank money. Securities only delivered if cash paid.'
  },
  'dvp-cash-leg-to-dvp-rtgs-line': {
    title: 'DvP cash leg',
    subtitle: 'RTGS cash settlement',
    description:
      'Cash settlement path linking to securities delivery.',
    lineStyle: true,
    details: 'DvP ensures both legs complete together, reducing principal risk.'
  },
  'dvp-rtgs-box': {
    title: 'DvP cash leg',
    subtitle: 'RTGS cash settlement',
    description:
      'RTGS cash settlement for DvP.',
    lineStyle: true,
    details: 'Central bank money finality for DvP cash payments. Reduces principal risk.'
  },
  'dvp-rtgs-to-austraclear-line': {
    title: 'DvP cash leg',
    subtitle: 'RTGS cash settlement',
    description:
      'Links Austraclear settlement to RTGS cash settlement.',
    lineStyle: true,
    details: 'Austraclear DvP events require corresponding RTGS cash movements.'
  },
  'austraclear-to-rits-line-upper': {
    title: 'DvP cash leg',
    subtitle: 'RTGS cash settlement',
    description:
      'RTGS cash path for Austraclear DvP.',
    lineStyle: true,
    details: 'Cash settlement path into central bank settlement layer.'
  },

  // Cash transfer path
  'cash-transfer-box': {
    title: 'Cash transfers',
    subtitle: 'RTGS cash movements',
    description:
      'Non-DvP cash transfers settle via RTGS in central bank money.',
    lineStyle: true,
    colorFrom: 'cash-transfer-to-rtgs-line',
    details: 'Standalone transfers for liquidity management or operational needs. RTGS provides finality.'
  },
  'cash-transfer-to-rtgs-line': {
    title: 'Cash transfers',
    subtitle: 'RTGS cash movements',
    description:
      'RTGS path for non-DvP cash transfers.',
    lineStyle: true,
    details: 'Cash transfers not coupled to securities delivery. RTGS finality in central bank money.'
  },
  'rtgs-box': {
    title: 'Cash transfers',
    subtitle: 'RTGS cash movements',
    description:
      'RTGS for market-related cash transfers.',
    lineStyle: true,
    details: 'Payments and markets share the same settlement layer.'
  },
  'rtgs-to-austraclear-line': {
    title: 'Cash transfers',
    subtitle: 'RTGS cash movements',
    description:
      'Links RTGS cash to Austraclear flows.',
    lineStyle: true,
    details: 'Austraclear activity triggers RTGS cash movements.'
  },
  'austraclear-to-rits-line-lower': {
    title: 'Cash transfers',
    subtitle: 'RTGS cash movements',
    description:
      'RTGS cash path for Austraclear-related cash movements.',
    lineStyle: true,
    details: 'Market infrastructure and central bank settlement interlock.'
  },

  // ========== APCS / CHEQUES LINE ==========
  'osko-to-adi-line': {
    ...LINE_TOOLTIPS.APCS_TRUNCATED_PRESENTMENT,
    colorFrom: 'osko-to-adi-line'
  },

  // ========== DOMESTIC BANK LINES (CASH DISTRIBUTION) ==========
  'bdf-line-50': {
    title: 'Domestic banks',
    subtitle: 'Cash distribution',
    description:
      'Major banks distribute cash to branches, ATMs, and cash services networks.',
    details: 'Interface between RBA banknote issuance and public access points.',
    link: 'https://www.rba.gov.au/banknotes/distribution/'
  },
  'bdf-line-51': null,
  'bdf-line-52': null,
  'bdf-line-53': null
};

// Fill the repeated BDF line tooltips with the same content (without duplicating text blocks)
tooltipContent['bdf-line-51'] = { ...tooltipContent['bdf-line-50'] };
tooltipContent['bdf-line-52'] = { ...tooltipContent['bdf-line-50'] };
tooltipContent['bdf-line-53'] = { ...tooltipContent['bdf-line-50'] };

/**
 * ========== DOT TOOLTIPS (INSTITUTIONS) ==========
 * Keep these concise and factual. The “educational depth” is concentrated in the system nodes above.
 */
const INSTITUTIONS = [
  // Foreign branches (1–45)
  { id: 1, name: 'Citibank, N.A.', code: 'CINA', category: 'International bank: Foreign Branch', hqCountry: 'United States', isFssMember: true },
  { id: 2, name: 'JPMorgan Chase Bank, National Association', code: 'CHAM', category: 'International bank: Foreign Branch', hqCountry: 'United States', isFssMember: true },
  { id: 3, name: 'Agricultural Bank of China Limited', code: 'ABOC', category: 'International bank: Foreign Branch', hqCountry: 'China' },
  { id: 4, name: 'Bank of America, National Association', code: 'BOFA', category: 'International bank: Foreign Branch', hqCountry: 'United States' },
  { id: 5, name: 'Bank of China Limited, Sydney Branch', code: 'BOCS', category: 'International bank: Foreign Branch', hqCountry: 'China' },
  { id: 6, name: 'Bank of Communications Co. Ltd.', code: 'BCOM', category: 'International bank: Foreign Branch', hqCountry: 'China' },
  { id: 7, name: 'Barclays Bank PLC', code: 'BARC', category: 'International bank: Foreign Branch', hqCountry: 'United Kingdom' },
  { id: 8, name: 'BNP Paribas', code: 'BNPT', category: 'International bank: Foreign Branch', hqCountry: 'France' },
  { id: 9, name: 'China Construction Bank Corporation', code: 'CCBC', category: 'International bank: Foreign Branch', hqCountry: 'China' },
  { id: 10, name: 'China Everbright Bank Co., Ltd', code: 'EVER', category: 'International bank: Foreign Branch', hqCountry: 'China' },
  { id: 11, name: 'China Merchants Bank Co., Ltd.', code: 'CMBC', category: 'International bank: Foreign Branch', hqCountry: 'China' },
  { id: 12, name: 'Cooperatieve Rabobank U.A.', code: 'RANE', category: 'International bank: Foreign Branch', hqCountry: 'Netherlands' },
  { id: 13, name: 'Credit Agricole Corporate and Investment Bank', code: 'CACB', category: 'International bank: Foreign Branch', hqCountry: 'France' },
  { id: 14, name: 'DBS Bank Ltd', code: 'DBSA', category: 'International bank: Foreign Branch', hqCountry: 'Singapore' },
  { id: 15, name: 'Deutsche Bank AG', code: 'DBAL', category: 'International bank: Foreign Branch', hqCountry: 'Germany' },
  { id: 16, name: 'Industrial and Commercial Bank of China Limited', code: 'ICBK', category: 'International bank: Foreign Branch', hqCountry: 'China' },
  { id: 17, name: 'ING Bank NV', code: 'INGA', category: 'International bank: Foreign Branch', hqCountry: 'Netherlands' },
  { id: 18, name: 'Mega International Commercial Bank Co. Ltd', code: 'ICBC', category: 'International bank: Foreign Branch', hqCountry: 'Taiwan' },
  { id: 19, name: 'Mizuho Bank, Ltd', code: 'MHCB', category: 'International bank: Foreign Branch', hqCountry: 'Japan' },
  { id: 20, name: 'MUFG Bank, Ltd.', code: 'BOTK', category: 'International bank: Foreign Branch', hqCountry: 'Japan' },
  { id: 21, name: 'Oversea-Chinese Banking Corporation Limited', code: 'OCBC', category: 'International bank: Foreign Branch', hqCountry: 'Singapore' },
  { id: 22, name: 'Royal Bank of Canada', code: 'ROYC', category: 'International bank: Foreign Branch', hqCountry: 'Canada' },
  { id: 23, name: 'Standard Chartered Bank', code: 'SCBA', category: 'International bank: Foreign Branch', hqCountry: 'United Kingdom' },
  { id: 24, name: 'State Bank of India', code: 'SBIS', category: 'International bank: Foreign Branch', hqCountry: 'India' },
  { id: 25, name: 'State Street Bank and Trust Company', code: 'SSBS', category: 'International bank: Foreign Branch', hqCountry: 'United States' },
  { id: 26, name: 'Sumitomo Mitsui Banking Corporation', code: 'SMBC', category: 'International bank: Foreign Branch', hqCountry: 'Japan' },
  { id: 27, name: 'Taiwan Business Bank, Ltd', code: 'TBBS', category: 'International bank: Foreign Branch', hqCountry: 'Taiwan' },
  { id: 28, name: 'The Hongkong and Shanghai Banking Corporation Limited', code: 'HKSB', category: 'International bank: Foreign Branch', hqCountry: 'Hong Kong' },
  { id: 29, name: 'The Northern Trust Company', code: 'TNTC', category: 'International bank: Foreign Branch', hqCountry: 'United States' },
  { id: 30, name: 'UBS AG', code: 'UBSB', category: 'International bank: Foreign Branch', hqCountry: 'Switzerland' },
  { id: 31, name: 'United Overseas Bank Limited', code: 'UOBL', category: 'International bank: Foreign Branch', hqCountry: 'Singapore' },

  { id: 32, name: 'Bank of Baroda', code: 'BOBA', category: 'International bank: Foreign Branch', hqCountry: 'India', usesSettlementAgent: true },
  { id: 33, name: 'Bank of Taiwan', code: 'BOTS', category: 'International bank: Foreign Branch', hqCountry: 'Taiwan', usesSettlementAgent: true },
  { id: 34, name: 'Canadian Imperial Bank of Commerce', code: 'CIBS', category: 'International bank: Foreign Branch', hqCountry: 'Canada', usesSettlementAgent: true },
  { id: 35, name: 'E.SUN Commercial Bank, Ltd.', code: 'ESUN', category: 'International bank: Foreign Branch', hqCountry: 'Taiwan', usesSettlementAgent: true },
  { id: 36, name: 'First Commercial Bank, Ltd', code: 'FCBL', category: 'International bank: Foreign Branch', hqCountry: 'Taiwan', usesSettlementAgent: true },
  { id: 37, name: 'Hua Nan Commercial Bank Ltd', code: 'HNCB', category: 'International bank: Foreign Branch', hqCountry: 'Taiwan', usesSettlementAgent: true },
  { id: 38, name: 'KEB Hana Bank', code: 'KEBL', category: 'International bank: Foreign Branch', hqCountry: 'South Korea', usesSettlementAgent: true },
  { id: 39, name: 'Shinhan Bank Co., Ltd.', code: 'SHIN', category: 'International bank: Foreign Branch', hqCountry: 'South Korea', usesSettlementAgent: true },
  { id: 40, name: 'Taishin International Bank Co., Ltd.', code: 'TAIS', category: 'International bank: Foreign Branch', hqCountry: 'Taiwan', usesSettlementAgent: true },
  { id: 41, name: 'Taiwan Cooperative Bank, Ltd', code: 'TCBA', category: 'International bank: Foreign Branch', hqCountry: 'Taiwan', usesSettlementAgent: true },
  { id: 42, name: 'The Bank of New York Mellon', code: 'BNYM', category: 'International bank: Foreign Branch', hqCountry: 'United States', usesSettlementAgent: true },
  { id: 43, name: 'The Bank of Nova Scotia', code: 'BNSS', category: 'International bank: Foreign Branch', hqCountry: 'Canada', usesSettlementAgent: true },
  { id: 44, name: 'Union Bank of India', code: 'UBOI', category: 'International bank: Foreign Branch', hqCountry: 'India', usesSettlementAgent: true },
  { id: 45, name: 'Woori Bank', code: 'WOOR', category: 'International bank: Foreign Branch', hqCountry: 'South Korea', usesSettlementAgent: true },

  // Foreign subsidiaries (46–51)
  { id: 46, name: 'HSBC Bank Australia Limited', code: 'HKBA', category: 'International bank: Foreign Subsidiary', hqCountry: 'United Kingdom', isFssMember: true },
  { id: 47, name: 'ING Bank (Australia) Limited', code: 'IMMB', category: 'International bank: Foreign Subsidiary', hqCountry: 'Netherlands', isFssMember: true },
  { id: 48, name: 'Arab Bank Australia Limited', code: 'ARAB', category: 'International bank: Foreign Subsidiary', hqCountry: 'Jordan' },
  { id: 49, name: 'Bank of China (Australia) Limited', code: 'BOCA', category: 'International bank: Foreign Subsidiary', hqCountry: 'China' },
  {
    id: 50,
    name: 'Bank of Sydney Ltd',
    code: 'LIKI',
    category: 'International bank: Foreign Subsidiary',
    hqCountry: 'Australia',
    extraHistory: 'This bank is historically associated with a change of ownership/branding (it was previously linked to the Laiki brand).'
  },
  { id: 51, name: 'Rabobank Australia Limited', code: 'RABL', category: 'International bank: Foreign Subsidiary', hqCountry: 'Netherlands', extraHistory: 'Rabobank is widely known for an agribusiness focus in many markets, which is reflected in its Australian positioning.' },

  // Major banks (52–57)
  { id: 52, name: 'ANZ', code: 'ANZB', category: 'Domestic bank (Big Four)', hqCountry: 'Australia', isFssMember: true },
  { id: 53, name: 'Commonwealth Bank', code: 'CBAA', category: 'Domestic bank (Big Four)', hqCountry: 'Australia', isFssMember: true },
  { id: 54, name: 'NAB', code: 'NABL', category: 'Domestic bank (Big Four)', hqCountry: 'Australia', isFssMember: true },
  { id: 55, name: 'Westpac', code: 'WPAC', category: 'Domestic bank (Big Four)', hqCountry: 'Australia', isFssMember: true },
  { id: 56, name: 'Macquarie Bank', code: 'MACQ', category: 'Domestic bank', hqCountry: 'Australia', isFssMember: true },
  { id: 57, name: 'Bendigo and Adelaide Bank', code: 'BEND', category: 'Domestic bank', hqCountry: 'Australia', isFssMember: true },

  // Domestic banks (58–86)
  { id: 58, name: 'Alex Bank', code: 'ALEX', category: 'Domestic bank', hqCountry: 'Australia' },
  { id: 59, name: 'AMP Bank', code: 'AMPB', category: 'Domestic bank', hqCountry: 'Australia' },
  { id: 60, name: 'Bank of Queensland', code: 'BQLQ', category: 'Domestic bank', hqCountry: 'Australia' },
  { id: 61, name: "Heritage and People's Choice", code: 'HBSL', category: 'Domestic bank', hqCountry: 'Australia' },
  { id: 62, name: 'Judo Bank', code: 'JUDO', category: 'Domestic bank', hqCountry: 'Australia' },
  { id: 63, name: 'Norfina', code: 'METW', category: 'Domestic bank', hqCountry: 'Australia' },

  { id: 64, name: 'Australian Military Bank', code: 'ADCU', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 65, name: 'Australian Mutual Bank', code: 'SYCU', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 66, name: 'B&E Ltd', code: 'BEPB', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 67, name: 'Bank Australia', code: 'MECU', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 68, name: 'Beyond Bank Australia', code: 'CCPS', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 69, name: 'Credit Union Australia', code: 'CUAL', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 70, name: 'Defence Bank', code: 'DEFB', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 71, name: 'Gateway Bank', code: 'GATE', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 72, name: 'Hume Bank', code: 'HUBS', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 73, name: 'IMB', code: 'IMBS', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 74, name: 'Maitland Mutual', code: 'MMBS', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 75, name: 'Members Banking Group', code: 'QTCU', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 76, name: 'MyState Bank', code: 'MSFL', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 77, name: 'Newcastle Greater Mutual', code: 'NEWC', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 78, name: 'Police & Nurses', code: 'PNCS', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 79, name: 'Police Bank', code: 'PCUL', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 80, name: 'Police Financial Services', code: 'PACC', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 81, name: 'QPCU', code: 'QPCU', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 82, name: 'Queensland Country Bank', code: 'QCCU', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 83, name: 'Regional Australia Bank', code: 'NECU', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 84, name: 'Teachers Mutual Bank', code: 'TMBL', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 85, name: 'Unity Bank', code: 'SGCU', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },
  { id: 86, name: 'Victoria Teachers', code: 'VTCU', category: 'Domestic bank (mutual)', hqCountry: 'Australia', usesSettlementAgent: true },

  // Specialised ADIs (87–88)
  { id: 87, name: 'Wise Australia', code: 'WISE', category: 'Specialised ADI', hqCountry: 'Australia', isFssMember: true, extraHistory: 'Specialised ADIs are a sign of how payments innovation and prudential frameworks intersect: you can build modern payment services while still being regulated as a deposit‑taking institution if you hold deposits.' },
  { id: 88, name: 'Tyro Payments', code: 'MONY', category: 'Specialised ADI', hqCountry: 'Australia' },

  // Other ADIs (89–91)
  { id: 89, name: 'Australian Settlements', code: 'ASLL', category: 'Other ADI (infrastructure-focused)', hqCountry: 'Australia', isFssMember: true },
  { id: 90, name: 'CUSCAL', code: 'CUFS', category: 'Other ADI (infrastructure-focused)', hqCountry: 'Australia', isFssMember: true },
  { id: 91, name: 'Indue', code: 'INDU', category: 'Other ADI (infrastructure-focused)', hqCountry: 'Australia', isFssMember: true },

  // PSPs (92–95)
  { id: 92, name: 'Adyen Australia', code: 'ADYE', category: 'Payment service provider', hqCountry: 'Netherlands' },
  { id: 93, name: 'EFTEX', code: 'ETXL', category: 'Payment service provider', hqCountry: 'Australia' },
  { id: 94, name: 'First Data Network', code: 'CSCD', category: 'Payment service provider', hqCountry: 'United States' },
  { id: 95, name: 'Citigroup', code: 'CITI', category: 'Payment service provider', hqCountry: 'United States', usesSettlementAgent: true },

  // CS facilities (96–98)
  { id: 96, name: 'ASX Clearing', code: 'ASXC', category: 'Clearing and settlement facility (CCP)', hqCountry: 'Australia' },
  { id: 97, name: 'ASX Settlement', code: 'ASTC', category: 'Clearing and settlement facility (SSF)', hqCountry: 'Australia' },
  { id: 98, name: 'LCH Limited', code: 'LCHC', category: 'Clearing and settlement facility (CCP)', hqCountry: 'United Kingdom' },

  // CLS (99)
  { id: 99, name: 'CLS Bank', code: 'CLSB', category: 'FX settlement system', hqCountry: 'United States' }
];

// Materialise institution tooltips into tooltipContent
for (const inst of INSTITUTIONS) {
  tooltipContent[`dot-${inst.id}`] = makeInstitutionTooltip(inst);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.tooltipContent = tooltipContent;
}

/**
 * ========== RENDERING PATCH (React example) ==========
 * If your tooltip UI currently renders `details` as bullet points,
 * replace that block with paragraph rendering.
 *
 * Example:
 *
 * const detailText = tooltip.details;
 * const paras = typeof detailText === 'string'
 *   ? detailText.split(/\n{2,}/).filter(Boolean)
 *   : Array.isArray(detailText)
 *     ? detailText
 *     : [];
 *
 * return (
 *   <div>
 *     <h3>{tooltip.title}</h3>
 *     {tooltip.subtitle && <div>{tooltip.subtitle}</div>}
 *     {tooltip.description && <div>{tooltip.description}</div>}
 *     {paras.map((p, i) => <p key={i}>{p}</p>)}
 *   </div>
 * );
 */
