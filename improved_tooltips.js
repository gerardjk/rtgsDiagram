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
    description:
      'A modern, structured messaging standard (ISO 20022) carried over the SWIFT network to exchange payment instructions between financial institutions. Messaging is not settlement: final funds movement occurs in RITS across Exchange Settlement Accounts.',
    lineStyle: true,
    details: paragraphs(
      'ISO 20022 is best thought of as the “language” payments systems use to describe who is paying whom, for what, and with what reference information. It replaces older, less-structured message formats with a richer, more consistent data model that supports better automation, reconciliation, and screening.',
      'In Australia, ISO 20022 messages are widely used in the high‑value interbank space (for example, HVCS messages that settle in RITS) and in the NPP ecosystem. The SWIFT network provides the secure delivery rails for many institution‑to‑institution messages, but it does not itself settle money. Settlement happens when RITS debits and credits Exchange Settlement Accounts at the Reserve Bank.'
    )
  },

  CLS_PVP: {
    title: 'CLS payment‑versus‑payment messaging',
    description:
      'Messages and settlement instructions associated with CLS’s payment‑versus‑payment model for FX settlement. PvP links the two currency legs so neither settles without the other, reducing foreign‑exchange settlement risk.',
    lineStyle: true,
    details: paragraphs(
      'Foreign exchange (FX) trades have two currency legs. Without PvP, one party can pay away one currency and still risk not receiving the other (a classic “settlement risk” problem). CLS’s PvP approach links the two legs so settlement is coordinated and risk is reduced.',
      'In the Australian context, the AUD leg of CLS settlement is ultimately settled in central bank money at the Reserve Bank through accounts the Bank operates in support of CLS’s arrangements.'
    )
  },

  DE_ABA: {
    title: 'Direct Entry “ABA” file format',
    description:
      'A long‑standing, batch file format used to exchange Direct Entry credits and debits (such as payroll files and direct debits). Clearing is file‑based; settlement is netted and then settled across ESAs in RITS via LVSS.',
    lineStyle: true,
    details: paragraphs(
      'Direct Entry was designed for high‑volume, low‑value and operationally repetitive payments: salary runs, bulk bill payments, and direct debits. Institutions exchange files containing many individual items rather than sending each payment as a real‑time message.',
      'Because file exchange and cut‑offs are central to how Direct Entry works, change tends to be slow: the file format is embedded in payroll systems, enterprise software, and payment operations. That is one reason modern “overlay” services (like PayTo) focus on replicating Direct Entry use‑cases while reducing reliance on legacy batch constraints.'
    )
  },

  LVSS_FSI_XML: {
    title: 'LVSS File Settlement Instructions (FSIs)',
    description:
      'RBA‑specified settlement instruction messages that carry multilateral net positions from retail clearing streams into LVSS for settlement in RITS across Exchange Settlement Accounts.',
    lineStyle: true,
    details: paragraphs(
      'Most retail clearing streams do not settle each customer payment individually in real time. Instead, they calculate what each institution owes or is owed across the whole clearing cycle, producing net obligations.',
      'LVSS is the “settlement hub” that takes those net obligations (as File Settlement Instructions) and settles them in central bank money by moving funds across Exchange Settlement Accounts in RITS. This is a key reason LVSS is central to the resilience of low‑value payments: even if millions of customer transactions are exchanged, the settlement layer can be reduced to a smaller set of net movements.'
    )
  },

  APCS_TRUNCATED_PRESENTMENT: {
    title: 'APCS truncated presentment',
    description:
      'A method for clearing cheques by exchanging electronic images and data rather than physically transporting paper, while still settling the resulting net obligations through Australia’s low‑value settlement arrangements.',
    lineStyle: true,
    details: paragraphs(
      'Even when a payment begins life as paper, the banking system aims to move the information digitally. Truncated presentment is the practice of “stopping” the physical cheque early in the process and instead exchanging its image and key data for clearing.',
      'This reduces handling and transport, but it does not change the structural reality that cheques are slower, operationally heavy, and increasingly niche. That’s why policy has shifted from modernising cheques toward planning an orderly industry‑wide exit.'
    )
  },

  RESERVATION_BATCH_XML: {
    title: 'Reservation Batch messaging',
    description:
      'Messages used to coordinate batch‑style settlement where funds may be reserved (set aside) in advance of a coordinated settlement moment, which is common in property settlement workflows.',
    lineStyle: true,
    details: paragraphs(
      'Some real‑world transactions require many parties to coordinate so that everyone commits before anyone settles. Property settlement is a classic example: legal title transfer, lender actions, and buyer/seller funds movement must align.',
      'A “reservation” approach is one way to manage this: participants reserve the necessary liquidity so settlement can complete reliably at the agreed time, reducing the chance of late failure due to a last‑minute funding shortfall.'
    )
  },

  SWIFT_MT198_SMT131: {
    title: 'RITS batch settlement instructions (SWIFT MT198 / SMT131)',
    description:
      'A SWIFT message path used to deliver batch settlement instructions into RITS for certain administered batch arrangements. The batch is calculated outside RITS; RITS performs the final settlement across ESAs.',
    lineStyle: true,
    details: paragraphs(
      'Batch settlement is often “compute elsewhere, settle in RITS.” A scheme or infrastructure operator calculates who owes whom, and then sends RITS a settlement request so that the net obligations can be settled in central bank money.',
      'This structure lets external systems innovate in their own business logic while relying on the central bank settlement layer for finality.'
    )
  },

  EPAL: {
    title: 'eftpos scheme settlement files (ePAL formats)',
    description:
      'Scheme‑specific clearing and settlement file exchanges used for eftpos transactions, which ultimately result in net obligations that are settled via the banking system’s settlement layer.',
    lineStyle: true,
    details: paragraphs(
      'Card payments usually authorise in seconds but settle later in net. That means a scheme needs a way to exchange high volumes of transaction detail, compute net positions, and then instruct settlement.',
      'In Australia, eftpos uses scheme‑defined operational processes for this exchange. The important educational point is that the file format is a clearing mechanism; final settlement still occurs when ESAs are debited and credited in the Reserve Bank’s settlement infrastructure.'
    )
  },

  MASTERCARD_IPM: {
    title: 'Mastercard IPM clearing files',
    description:
      'Mastercard’s Integrated Product Messages (IPM) clearing files carry transaction detail used to compute obligations between issuers and acquirers. Settlement is then completed via scheme settlement arrangements connected to the banking settlement layer.',
    lineStyle: true,
    details: paragraphs(
      'Mastercard transaction “clearing” is the accounting step that determines how much each issuer and acquirer owes after a day’s activity. IPM files carry the data that supports that accounting and dispute processes.',
      'For public audiences, the key separation is: (1) authorisation at the point of sale, (2) clearing and netting between institutions, and (3) final settlement in the central bank settlement layer.'
    )
  },

  VISA_BASEII: {
    title: 'Visa BASE II (clearing format family)',
    description:
      'A Visa clearing file family used to exchange transaction detail and support net settlement calculations for Visa activity. Like other card schemes, it complements real‑time authorisation with later clearing and settlement.',
    lineStyle: true,
    details: paragraphs(
      'Visa’s scheme processing includes multiple stages and data artefacts. The clearing file layer exists because the system must reconcile, correct, dispute, and net huge transaction volumes across many institutions.',
      'The educational takeaway is that “tap‑and‑go” speed at the merchant does not imply “instant settlement” between banks; settlement is typically deferred and netted.'
    )
  },

  PROPRIETARY_SCHEME_FORMATS: {
    title: 'Other scheme‑specific formats',
    description:
      'Additional card networks and payment arrangements use their own clearing data formats and settlement operations. These formats vary, but the economic structure (authorise → clear/net → settle) is similar.',
    lineStyle: true,
    details: paragraphs(
      'American Express, Diners and other networks have their own data formats, reporting and settlement timelines. Some operate on a “three‑party” model that changes who is exposed to whom, but clearing and settlement still require robust operational processes.',
      'For an educational diagram, the safe generalisation is that most large‑scale card systems separate customer experience (fast authorisation) from institutional finality (settlement later, usually net).'
    )
  },

  HEALTH_CLAIMS: {
    title: 'Health claims message protocols',
    description:
      'Industry and government claim protocols used through terminals and service providers to lodge and reconcile Medicare and private health insurance claims. These are specialised message flows that connect to broader banking settlement arrangements.',
    lineStyle: true,
    details: paragraphs(
      'Claims flows are not “payments” in the retail sense of a person paying a merchant. They are entitlement and reimbursement processes: eligibility checks, claim submissions, adjustments, and reconciliation.',
      'Many claims are initiated through payment terminals for convenience, but the underlying rails include both sector‑specific message protocols and mainstream banking settlement for the money movement.'
    )
  },

  ATM_AS2805: {
    title: 'ATM interchange messaging (AS 2805 family)',
    description:
      'ATM networks use the AS 2805 message family (widely used across Australian electronic funds transfer contexts) to exchange withdrawal and balance enquiry instructions, and then settle the resulting obligations later.',
    lineStyle: true,
    details: paragraphs(
      'ATM cash withdrawals are typically authorised quickly, but the interbank obligations are then cleared and settled through deferred settlement arrangements.',
      'This is another case where “customer immediacy” (cash dispensed now) is supported by “institutional settlement later” (net obligations settled across banks).'
    )
  },

  NECDS_PEXA: {
    title: 'PEXA NECDS messages',
    description:
      'Messages based on the National Electronic Conveyancing Data Standard (NECDS) used by PEXA to coordinate property settlement tasks and communicate with financial institutions and land registries.',
    lineStyle: true,
    details: paragraphs(
      'Property settlement is a multi‑party coordination problem. NECDS defines common data structures so that participants (lenders, conveyancers, registries and platform operators) can exchange instructions reliably.',
      'In the funds layer, those instructions ultimately result in settlement movements that are executed through the banking settlement system, rather than inside the conveyancing platform itself.'
    )
  },

  NECDS_SYMPLI: {
    title: 'Sympli NECDS messages',
    description:
      'NECDS‑based message flows used by Sympli (an e‑conveyancing platform) to coordinate property settlement activities with financial institutions and registries.',
    lineStyle: true,
    details: paragraphs(
      'Like other e‑conveyancing approaches, Sympli standardises the information exchange and workflow so that settlement events can be coordinated safely.',
      'The platform may orchestrate, but it does not replace the need for central bank settlement finality when banks exchange value.'
    )
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
      ? 'Because it is shown as a foreign bank branch, it operates in Australia as part of the parent legal entity rather than as a separately incorporated Australian company.'
      : category.includes('Foreign Subsidiary')
        ? 'Because it is shown as a foreign bank subsidiary, it is locally incorporated in Australia even though it is ultimately foreign‑owned, and it is supervised as an Australian ADI.'
        : '';

  const settlementAgentNote = usesSettlementAgent
    ? 'The note “uses a settlement agent” indicates that, for at least some settlement obligations, it relies on another ESA holder to settle on its behalf rather than settling directly in its own name.'
    : '';

  const fssNote = isFssMember
    ? 'This diagram also marks it as an FSS participant, which means it can settle eligible fast retail payments through the Reserve Bank’s Fast Settlement Service (24/7) using its allocated settlement balance.'
    : '';

  return {
    title: name,
    subtitle: code,
    description: category,
    details: paragraphs(
      `${name} is included here as one of the institutions connected into Australia’s interbank settlement layer. In practice, institutions participate for different reasons: some are active in domestic retail banking, while others are present mainly to support wholesale markets, custody, capital markets activity, or cross‑border clients.`,
      `It is headquartered in ${hqCountry}. ${branchVsSubsidiaryNote}`.trim(),
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
      'When Australians make payments, banks and other payment providers end up owing each other money. ESAs are the mechanism that lets those interbank obligations be settled safely and finally, using money issued by the central bank (rather than commercial bank money). This is the foundation of “final settlement” for the Australian dollar system.',
      'Most major settlement services in Australia ultimately move funds across ESAs. High‑value payments settle in real time through RITS (the RTGS system). Many retail payment streams (like Direct Entry and cheque clearing) settle on a net basis through LVSS and then settle across ESAs in RITS. Fast payments (NPP) settle using the Fast Settlement Service, which uses a dedicated settlement balance that participants allocate for 24/7 settlement.',
      'This visual groups ESA holders by type. The counts shown in this diagram (for example, the number of ADIs and non‑ADIs) reflect the model you are presenting here and can change over time as institutions enter, exit, or change participation modes.'
    ),
    link: 'https://www.rba.gov.au/payments-and-infrastructure/esa/'
  },

  'adi-box': {
    title: 'ADIs',
    subtitle: 'Authorised Deposit-taking Institutions',
    description:
      'ADIs are institutions authorised and prudentially supervised to take deposits from the public, and they form the core set of direct participants in many Australian payment systems.',
    details: paragraphs(
      '“ADI” is a regulatory category used in Australia for deposit‑taking institutions such as banks, building societies and credit unions. ADIs sit at the centre of everyday money movement because most households and businesses hold their main transaction accounts with an ADI.',
      'In payments terms, many ADIs are direct participants in clearing arrangements and are eligible to hold ESAs at the Reserve Bank, which enables them to settle interbank obligations in central bank money. Where a smaller institution is not a direct settlement participant, it can still provide services to customers by using a settlement agent or a sponsoring arrangement.',
      'APRA’s licensing and prudential supervision framework exists because deposit‑taking creates systemic risk: depositors expect funds to be safe and available, and the broader economy depends on the reliability of the institutions that hold transaction balances.'
    ),
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'non-adis-box': {
    title: 'Non-ADIs',
    subtitle: 'Non‑bank participants',
    description:
      'Non‑ADIs participate in payments and market infrastructure without taking retail deposits. Some can access settlement directly; many access settlement via an ADI sponsor or settlement agent.',
    details: paragraphs(
      'Not every important payments participant is a bank. Payment service providers, specialist infrastructure operators, and financial market infrastructures may need to clear payments, calculate obligations, or connect into settlement to complete their services.',
      'Where non‑banks do not hold deposits, their risk profile differs from an ADI’s, but their operational importance can still be very high. For that reason, Australia uses a mix of regulation and oversight: prudential supervision for deposit‑taking, and functional oversight for systemically important payment and settlement activities.',
      'In practical terms, the question for a non‑ADI is “how do we get to final settlement?” That can mean holding an ESA (for eligible entities) or, more commonly, using a settlement agent that is an ESA holder.'
    ),
    link: 'https://www.rba.gov.au/payments-and-infrastructure/'
  },

  'domestic-banks-box': {
    title: 'Domestic banks',
    subtitle: 'Australian‑owned banking institutions',
    description:
      'Domestic banks are incorporated and headquartered in Australia, and many are major direct participants across retail and wholesale payment systems.',
    details: paragraphs(
      'Domestic banks provide most Australians’ day‑to‑day transaction accounts and also play large roles in business banking, lending and capital markets. Because they sit so centrally in customer money flows, they are major participants in clearing systems and in the settlement layer.',
      'In educational terms, it helps to separate “front‑end payments” (what customers see in apps, cards, or invoices) from “back‑end settlement” (how banks and infrastructures settle with each other). Domestic banks are usually present in both layers, and are often the sponsoring gateway for smaller institutions and fintechs.'
    ),
    link: 'https://www.apra.gov.au/monthly-authorised-deposit-taking-institution-statistics'
  },

  'international-banks-box': {
    title: 'International banks',
    subtitle: 'Foreign‑owned operations in Australia',
    description:
      'International banks participate in Australia’s payments and financial markets through branches or locally incorporated subsidiaries, often focusing on wholesale banking and cross‑border clients.',
    details: paragraphs(
      'Australia hosts many foreign banking groups. Some operate as branches (part of the overseas legal entity) and some as subsidiaries (locally incorporated Australian entities). The difference matters for regulation, resolution planning and how capital and liquidity support is structured.',
      'In payments, international banks are often important in high‑value interbank payments, securities settlement flows, custody and correspondent banking. They may also provide payment services to corporate and institutional customers who need cross‑border reach.'
    ),
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'foreign-branches-box': {
    title: 'Foreign branches',
    subtitle: 'Australian branches of foreign banks',
    description:
      'A foreign bank branch is not a separate legal entity from its parent; it operates in Australia under Australian supervision but as part of the overseas bank.',
    details: paragraphs(
      'Branches are typically used for wholesale banking, institutional clients, markets activity and trade finance. Because a branch is legally part of the parent, governance and balance sheet support ultimately sit at group level.',
      'In this diagram, branches appear alongside other ESA‑connected entities because they can be operationally important in high‑value settlement, even if their retail footprint is limited.'
    ),
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'foreign-subsidiaries-box': {
    title: 'Foreign subsidiaries',
    subtitle: 'Locally incorporated foreign‑owned banks',
    description:
      'A foreign‑owned subsidiary is incorporated in Australia and supervised as an Australian ADI, even though it is ultimately owned by a foreign banking group.',
    details: paragraphs(
      'Subsidiaries are separate legal entities. That typically means local capital and governance requirements and a clearer perimeter for Australian supervision and resolution. Many subsidiaries also offer a broader mix of products than branches, including retail banking.',
      'From a payments perspective, subsidiaries can be direct participants in domestic payment and settlement systems in much the same way as Australian‑owned banks.'
    ),
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'specialised-adis-box': {
    title: 'Specialised ADIs',
    subtitle: 'Focused banking models',
    description:
      'Specialised ADIs hold an ADI licence but focus on a narrower set of services, such as payments, merchant acquiring, or international money movement.',
    details: paragraphs(
      'Some ADIs exist primarily to deliver payments‑related services rather than the full traditional “deposit‑lend‑branch network” banking model. The reason this matters in an educational diagram is that licensing and prudential supervision are about the risks of deposit‑taking and settlement connectivity, not about whether an institution looks like a traditional retail bank.',
      'Specialised ADIs can be especially important in modern payments because they often sit close to merchant infrastructure, ecommerce rails, or cross‑border flows, and they may participate in fast settlement arrangements.'
    ),
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'other-adis-box': {
    title: 'Mutuals and other ADIs',
    subtitle: 'Building societies and credit unions',
    description:
      'Mutual and customer‑owned institutions provide retail banking at scale and often rely on shared infrastructure providers for clearing and settlement connectivity.',
    details: paragraphs(
      'Australia has many customer‑owned banks, building societies and credit unions. Individually they can be smaller, but collectively they serve large customer segments and regional communities.',
      'A key payments concept is “shared rails.” Mutuals may connect through specialist providers or use settlement agents, while still offering customers mainstream payment experiences (cards, Direct Entry, NPP payments) under the hood.'
    ),
    link: 'https://www.apra.gov.au/register-of-authorised-deposit-taking-institutions'
  },

  'psps-box': {
    title: 'PSPs',
    subtitle: 'Payment Service Providers',
    description:
      'PSPs provide payment acceptance, gateway, processing or orchestration services without necessarily being deposit‑taking institutions.',
    details: paragraphs(
      'Payment Service Providers (PSPs) are often the “plumbing” behind modern commerce: they connect merchants and platforms to card schemes, account‑to‑account payments, fraud controls and reconciliation tools.',
      'Because final settlement typically occurs across banks’ ESAs, many PSPs either partner with ADIs or access settlement through sponsored arrangements. The operational importance of PSPs is one reason regulators focus on resilience, governance and risk management across the broader payments ecosystem.'
    ),
    link: 'https://www.rba.gov.au/payments-and-infrastructure/'
  },

  'cs-box': {
    title: 'CS facilities',
    subtitle: 'Clearing and Settlement Facilities',
    description:
      'Clearing and settlement facilities (including central counterparties and securities settlement facilities) support financial markets by managing counterparty risk and ensuring trades settle safely.',
    details: paragraphs(
      'In markets, “clearing” is the step that determines who owes what after trades occur, and “settlement” is the step where securities and cash are actually exchanged. Central counterparties (CCPs) reduce counterparty risk by stepping between buyers and sellers, while securities settlement facilities (SSFs) run the systems that deliver securities and coordinate delivery‑versus‑payment.',
      'Because these facilities can be systemically important, they are subject to specialised regulatory standards and oversight, including by the Reserve Bank of Australia for financial stability objectives.'
    ),
    link: 'https://www.rba.gov.au/fin-stability/financial-market-infrastructure/'
  },

  // ========== RBA / GOVERNMENT / CASH ==========

  'dot-0': {
    title: 'RBA',
    subtitle: 'Reserve Bank of Australia',
    description:
      'Australia’s central bank. In payments, the RBA operates the settlement layer (RITS and FSS), provides ESAs, and oversees key payment and market infrastructures for financial stability.',
    details: paragraphs(
      'The Reserve Bank sits at the core of Australian payments because it provides the final settlement asset: central bank money. Banks and other eligible institutions hold Exchange Settlement Accounts at the RBA and use them to settle obligations arising from many different payment and market systems.',
      `In your attached RTGS settlement data (${FLOW_SNAPSHOT.rtgs.asAt}), RTGS activity averaged ${fmtInt(FLOW_SNAPSHOT.rtgs.total.paymentsAvgDaily)} payments per business day with an average daily value of ${fmtMillionsToAud(FLOW_SNAPSHOT.rtgs.total.valueAudMillionsAvgDaily)}. The largest channel by number was SWIFT‑delivered high‑value payments (${fmtInt(FLOW_SNAPSHOT.rtgs.swift.paymentsAvgDaily)} per day on average), while Austraclear‑related settlement carried very large value (${fmtMillionsToAud(FLOW_SNAPSHOT.rtgs.austraclear.valueAudMillionsAvgDaily)} per day on average).`,
      'The RBA also issues banknotes and works with industry to ensure cash distribution remains reliable. Even as electronic payments grow, cash remains important for resilience, accessibility, and consumer choice.'
    ),
    link: 'https://www.rba.gov.au/about-rba/'
  },

  'opa-box': {
    title: 'OPA',
    subtitle: 'Official Public Account',
    description:
      'The Commonwealth Government’s primary account at the Reserve Bank. It is where Commonwealth funds are held before being disbursed and where key government receipts are managed.',
    details: paragraphs(
      'Government payments are large, regular and operationally critical: welfare payments, tax refunds, Medicare payments, and supplier payments all require reliable banking and settlement arrangements.',
      'The Official Public Account is a core part of that machinery. In a payments map, the OPA helps explain why government flows show up both as retail-style payments (to households and businesses) and as significant interbank settlement movements when those payments are distributed through the banking system.'
    ),
    link: 'https://www.finance.gov.au/about-us/glossary/pgpa/term-official-public-account-opa'
  },

  'bdf-box': {
    title: 'BDF',
    subtitle: 'Banknote Distribution Framework',
    description:
      'A framework for distributing Australian banknotes from the Reserve Bank into the banking system, supporting cash availability across the country.',
    details: paragraphs(
      'Cash distribution is a logistics and resilience problem: demand varies by season and region, and banknotes must be issued, sorted, stored, transported, and withdrawn securely. The Banknote Distribution Framework is designed to coordinate those tasks between the central bank and key banking sector participants so that cash remains available even as overall usage trends downward.',
      'In a public educational tool, it is useful to treat “cash” as its own supply chain. Electronic payments depend on networks and power; cash depends on physical distribution and secure custody. Both require deliberate infrastructure planning.'
    ),
    link: 'https://www.rba.gov.au/banknotes/distribution/'
  },

  // ========== RITS / RTGS / FSS ==========

  'rits-circle': {
    title: 'RITS',
    subtitle: 'Reserve Bank Information and Transfer System',
    description:
      'Australia’s real‑time gross settlement (RTGS) system. RITS is where high‑value, time‑critical interbank payments are settled individually in central bank money across ESAs.',
    details: paragraphs(
      'RITS is the part of the system that turns “payment instructions” into final settlement. “Real‑time gross settlement” means each settlement payment is processed individually (gross) and completed in real time, rather than being accumulated and settled later as a net total. This dramatically reduces settlement risk for high‑value obligations.',
      `Your RTGS settlement spreadsheet shows that in ${FLOW_SNAPSHOT.rtgs.asAt}, RTGS averaged ${fmtInt(FLOW_SNAPSHOT.rtgs.total.paymentsAvgDaily)} payments per business day with an average daily value of ${fmtMillionsToAud(FLOW_SNAPSHOT.rtgs.total.valueAudMillionsAvgDaily)}. Of that, SWIFT‑delivered high‑value payments accounted for most payments by count (about ${fmtInt(FLOW_SNAPSHOT.rtgs.swift.paymentsAvgDaily)} per day) and a large share of value (${fmtMillionsToAud(FLOW_SNAPSHOT.rtgs.swift.valueAudMillionsAvgDaily)} per day). Austraclear‑related settlement was fewer payments (about ${fmtInt(FLOW_SNAPSHOT.rtgs.austraclear.paymentsAvgDaily)} per day) but extremely large value (${fmtMillionsToAud(FLOW_SNAPSHOT.rtgs.austraclear.valueAudMillionsAvgDaily)} per day).`,
      `RITS also settles “administered batch” positions, where external schemes compute net obligations and then instruct settlement in RITS. In ${FLOW_SNAPSHOT.rtgs.asAt}, those batch positions averaged ${fmtInt(FLOW_SNAPSHOT.rtgs.batch.positionsAvgDaily)} settled positions per business day with an average daily value of ${fmtMillionsToAud(FLOW_SNAPSHOT.rtgs.batch.valueAudMillionsAvgDaily)}. This illustrates a key architecture idea: many different systems can innovate “upstream,” but they converge on RITS for finality.`
    ),
    link: 'https://www.rba.gov.au/payments-and-infrastructure/rits/about.html'
  },

  'big-circle': {
    title: 'RITS settlement engine',
    subtitle: 'Real‑time gross settlement (RTGS)',
    description:
      'The settlement “core” inside RITS that debits and credits ESAs to deliver final settlement in central bank money for high‑value and time‑critical obligations.',
    details: paragraphs(
      'The settlement engine is the part of RITS that actually moves balances across Exchange Settlement Accounts. Once a payment settles here, it is final: the payer’s ESA is debited and the receiver’s ESA is credited.',
      'Different upstream systems feed instructions into the engine. Some instructions represent individual high‑value payments (for example, wholesale interbank transfers), while others represent net totals calculated elsewhere (for example, settlement of a card scheme’s net positions).'
    ),
    hours: 'Monday–Friday (RITS operating hours vary by session; refer to RBA for current hours)',
    link: 'https://www.rba.gov.au/payments-and-infrastructure/rits/'
  },

  'small-circle': {
    title: 'FSS',
    subtitle: 'Fast Settlement Service',
    description:
      'A 24/7 settlement service operated by the Reserve Bank that supports fast retail payments (including the NPP) by settling across participants’ allocated settlement balances in central bank money.',
    details: paragraphs(
      'Fast payments require fast settlement. The Fast Settlement Service extends central bank settlement beyond business hours so that eligible retail payments can settle continuously, including nights, weekends and public holidays.',
      `In your RTGS settlement spreadsheet, the FSS averaged ${fmtInt(FLOW_SNAPSHOT.fss.total.paymentsAvgDaily)} settled payments per day in ${FLOW_SNAPSHOT.fss.asAt}, with an average daily value of ${fmtMillionsToAud(FLOW_SNAPSHOT.fss.total.valueAudMillionsAvgDaily)}. ${FLOW_SNAPSHOT.fss.unitNote}`,
      'It is important for public understanding to separate “clearing” from “settlement.” NPP messages can clear in real time, but settlement finality is delivered when FSS moves central bank money between participants. That settlement process depends on participants maintaining sufficient liquidity in their allocated settlement balances.'
    ),
    hours: '24/7/365',
    link: 'https://www.rba.gov.au/payments-and-infrastructure/rits/about.html'
  },

  'fss-circle': {
    title: 'FSS',
    subtitle: 'Fast Settlement Service',
    description:
      'The Reserve Bank’s always‑on settlement service for fast retail payment obligations.',
    details: paragraphs(
      'FSS is the settlement layer that makes “real‑time payments” credible at the interbank level. Without 24/7 settlement, fast payments would either have to pause at night and on weekends or rely on delayed settlement models.',
      'Operationally, the system depends on participants allocating enough funds for settlement and on the resilience of the infrastructure that connects payment messages to settlement actions.'
    ),
    link: 'https://www.rba.gov.au/payments-and-infrastructure/rits/'
  },

  // ========== SWIFT / HVCS / ISO 20022 ==========

  'swift-pds-box': {
    title: 'SWIFT',
    subtitle: 'Secure financial messaging',
    description:
      'SWIFT provides a secure network used by financial institutions to exchange payment and settlement messages. It provides message delivery, not money movement.',
    details: paragraphs(
      'SWIFT is often misunderstood as “the system that moves money.” In reality, SWIFT is primarily a secure communications network and standards ecosystem that helps institutions exchange trusted payment instructions.',
      'In Australia, SWIFT is heavily used in high‑value interbank payments (HVCS) and in certain batch settlement instruction paths into RITS. Final settlement occurs only when the Reserve Bank’s settlement systems move ESA balances.'
    ),
    link: 'https://www.swift.com/'
  },

  'swift-pds-rect': {
    title: 'SWIFT PDS',
    subtitle: 'Payment Delivery System',
    description:
      'A SWIFT message delivery service used to route and deliver payment instructions between institutions and into settlement interfaces. It standardises transport and security for interbank messages, while settlement remains in RITS.',
    details: paragraphs(
      'A useful mental model is “message plane” and “money plane.” SWIFT PDS sits on the message plane: it ensures the right institutions receive the right instructions with integrity, security and operational reliability.',
      'Once the instruction arrives, the money plane takes over. In Australia’s high‑value system, that means settlement through RITS across Exchange Settlement Accounts.'
    ),
    link: 'https://www.swift.com/'
  },

  'swift-hvcs-box': {
    title: 'HVCS',
    subtitle: 'High Value Clearing System',
    description:
      'Australia’s high‑value clearing arrangements use SWIFT‑delivered ISO 20022 messages to exchange high‑value payment instructions that are then settled in RITS.',
    details: paragraphs(
      'HVCS is the part of the architecture that standardises how high‑value payment instructions are exchanged between institutions. The critical point is that HVCS is not where final settlement happens; it is where the instruction and validation flows happen before settlement.',
      'In the RTGS statistics you attached, the SWIFT channel is the dominant path by payment count in the RTGS layer. In December 2025, SWIFT‑delivered payments averaged tens of thousands per business day and carried a very large share of the system’s daily value, illustrating that the high‑value payments ecosystem is both frequent and economically significant.',
      'Australia’s move to ISO 20022 in high‑value payments improved data richness and alignment with global messaging standards, which supports automation and better compliance screening.'
    ),
    link: 'https://www.rba.gov.au/payments-and-infrastructure/rits/'
  },

  'pacs-009-box': {
    title: 'pacs.009',
    subtitle: 'Financial Institution Credit Transfer',
    description:
      'An ISO 20022 message used for bank‑to‑bank credit transfers, commonly used for high‑value interbank payments that settle through RTGS.',
    smallStyle: true,
    details: paragraphs(
      'A pacs.009 message is used when the payer and payee are financial institutions rather than end customers. In practical terms, it is a common “wholesale” payment message type.',
      'The message describes the instruction; final settlement happens when the central bank settlement system debits and credits the institutions’ settlement accounts.'
    )
  },

  'pacs-008-box': {
    title: 'pacs.008',
    subtitle: 'Customer Credit Transfer',
    description:
      'An ISO 20022 message used when the underlying payment is on behalf of a customer (for example, a business payment or customer transfer), even though the interbank leg is between institutions.',
    smallStyle: true,
    details: paragraphs(
      'A pacs.008 message is used for customer payments that require interbank settlement. It carries structured customer and remittance information that helps with reconciliation and compliance.',
      'As with other ISO 20022 messages, it is a standardised instruction format; settlement finality comes from RTGS settlement across ESAs.'
    )
  },

  'pacs-004-box': {
    title: 'pacs.004',
    subtitle: 'Payment Return',
    description:
      'An ISO 20022 message used to return a payment (for example, when a payment cannot be processed or must be reversed under scheme rules).',
    smallStyle: true,
    details: paragraphs(
      'Returns are an unavoidable part of payments: accounts can be closed, details can be invalid, or compliance checks can fail. A standard “return” message type supports consistent handling across institutions.',
      'For public understanding, the key is that the ability to return or reverse a payment depends on scheme rules and timing; it is not simply a technical “undo” button.'
    )
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
      'The NPP is Australia’s fast payments infrastructure. It clears payments and supports modern overlay services; settlement finality is delivered through the RBA’s Fast Settlement Service.',
    details: paragraphs(
      'The NPP was created to meet a clear public need: Australians increasingly expect money to move with the speed and convenience of modern digital services, not the cut‑offs and delays of legacy batch systems.',
      'NPP Basic Infrastructure is the shared “utility layer” that supports always‑on message exchange and the overlay services that people recognise (like PayID, Osko, PayTo and international inbound last‑mile services). Clearing happens here; settlement is performed by the RBA’s Fast Settlement Service so that funds move between institutions in central bank money.',
      `In your payments flow spreadsheet (${FLOW_SNAPSHOT.retail.asAt}), NPP processed ${fmtInt(FLOW_SNAPSHOT.retail.npp.volume)} payments in the month with a total value of ${fmtMillionsToAud(FLOW_SNAPSHOT.retail.npp.valueAudMillions)}. That implies an average value of about A$${fmtInt(FLOW_SNAPSHOT.retail.npp.avgAudPerPayment)} per payment, which is consistent with NPP’s role as a high‑volume retail rail used for everyday transfers as well as business payments.`
    ),
    hours: '24/7/365',
    link: 'https://www.rba.gov.au/payments-and-infrastructure/new-payments-platform/'
  },

  'npp-purple-box': {
    preHeading: 'Australia Payments Plus',
    title: 'NPP',
    subtitle: 'New Payments Platform',
    description:
      'Australia’s real‑time account‑to‑account payments infrastructure. It supports instant fund availability, richer payment data, and multiple overlay services designed for different user needs.',
    details: paragraphs(
      'The NPP is designed for “push payments” (sending money) and, through PayTo, controlled “pull‑like” use cases where a payer pre‑authorises a third party to initiate payments. This makes it a platform for consumer transfers, business payments, and new merchant payment models.',
      `A useful scale comparison from your spreadsheet (${FLOW_SNAPSHOT.retail.asAt}) is that NPP handled ${fmtInt(FLOW_SNAPSHOT.retail.npp.volume)} payments in the month, while Direct Entry handled ${fmtInt(FLOW_SNAPSHOT.retail.directEntry.volume)} items. NPP is growing quickly, but legacy systems still carry enormous operational weight because they are embedded in payroll, billing and enterprise processes.`,
      'For future planning, the key point is that modernisation is as much about changing business processes and adoption as it is about technology. New rails can exist for years before legacy usage declines meaningfully.'
    ),
    link: 'https://nppa.com.au/'
  },

  'osko-box': {
    preHeading: 'Australia Payments Plus',
    title: 'Osko',
    subtitle: 'Fast payment service',
    description:
      'Osko is a fast payments service running on the NPP, designed to make account‑to‑account payments near‑real‑time for end users, with improved messaging and addressing options.',
    details: paragraphs(
      'Osko is the part of the NPP ecosystem many consumers see most often: an account‑to‑account payment experience where money is typically available to the recipient quickly, with better reference information than legacy transfers.',
      'In a payments architecture view, Osko is not a settlement system by itself. It rides on NPP clearing and achieves finality when the Fast Settlement Service settles the interbank positions in central bank money.'
    )
  },

  'payid-box': {
    preHeading: 'Australia Payments Plus',
    title: 'PayID and PayTo',
    subtitle: 'NPP overlay services',
    description:
      'PayID simplifies addressing by linking a human‑friendly identifier to an account. PayTo modernises recurring and merchant payments by letting customers authorise payment agreements that are visible and controllable in their banking channels.',
    details: paragraphs(
      'PayID exists because BSB and account numbers are hard to remember and easy to mistype. By linking a phone number, email address or business identifier to an account, PayID makes it easier to send money and reduces misdirection risk.',
      'PayTo was introduced to tackle a different problem: recurring and merchant payments that historically relied on Direct Entry direct debits. PayTo is designed so the payer can see, approve, pause or cancel agreements in their own banking channel, creating a more transparent model than many legacy direct debit experiences.',
      'For public audiences, it helps to frame PayTo as a “rules and authorisation layer” on top of fast payments: the payment may be fast, but the important innovation is the visibility and control of the underlying agreement.'
    ),
    link: 'https://www.auspayplus.com.au/solutions/payto'
  },

  'payto-box': {
    preHeading: 'Australia Payments Plus',
    title: 'IPS',
    subtitle: 'International Payments Service',
    description:
      'IPS enables the final AUD leg of inbound cross‑border payments to be processed via NPP‑style fast payment rails, improving speed, data and controls compared with traditional inbound processing windows.',
    details: paragraphs(
      'International payments often arrive “into Australia” via correspondent banking chains and legacy operating windows. IPS is intended to improve the last‑mile domestic credit by allowing inbound payments to be credited via fast payment processing and settlement.',
      'From a systems perspective, this is an example of interlinking: cross‑border networks handle the international leg, and Australia’s fast payment infrastructure handles the domestic leg. That division is practical because domestic settlement finality still needs to occur in the Australian dollar central bank settlement layer.',
      'Delivery and adoption of newer capabilities can be uneven across institutions, which is why public roadmaps and supervisory focus often emphasise rollout discipline and resilience as much as new functionality.'
    ),
    link: 'https://www.auspayplus.com.au/solutions/npp'
  },

  'bsct-box': {
    title: 'BSCT',
    subtitle: 'Basic Single Credit Transfer',
    description:
      'A basic NPP credit transfer message type used for standard account‑to‑account payments, carrying structured data to support automation and reconciliation.',
    details: paragraphs(
      '“Basic single credit transfer” describes the common case: one payer, one payee, one payment, with structured fields for references and identifiers.',
      'Message standardisation matters because it allows banks and businesses to automate matching, reduce manual exception handling, and improve compliance and fraud controls.'
    )
  },

  // ========== DIRECT ENTRY / BECS / LVSS / CHEQUES ==========

  'de-box': {
    title: 'Direct Entry',
    subtitle: 'Batch account‑to‑account credits and debits',
    description:
      'Direct Entry is Australia’s long‑running batch system for credits and debits such as payroll, bill payments and direct debits. Items are exchanged in bulk; settlement is netted and then settled through LVSS in RITS.',
    details: paragraphs(
      'Direct Entry is built for scale and predictability. Instead of sending each payment in real time, organisations send large files that can contain thousands or millions of items, which suits payroll processors, utilities, large billers and government programs.',
      `In your spreadsheet (${FLOW_SNAPSHOT.retail.asAt}), Direct Entry processed ${fmtInt(FLOW_SNAPSHOT.retail.directEntry.volume)} items in the month, with a total value of ${fmtMillionsToAud(FLOW_SNAPSHOT.retail.directEntry.valueAudMillions)}. The average item value is about A$${fmtInt(FLOW_SNAPSHOT.retail.directEntry.avgAudPerItem)}, which reflects that Direct Entry still carries many high‑value business and government flows even as consumer “send money now” use cases migrate to NPP.`,
      'Modernisation pressure exists because batch cut‑offs and file operations can be slow and operationally costly. However, Direct Entry is deeply embedded in enterprise systems, so change requires coordinated migration of business processes, not just new technology.'
    )
  },

  'becs-box': {
    title: 'BECS',
    subtitle: 'Bulk Electronic Clearing System',
    description:
      'BECS is the clearing framework and operational arrangement that supports Direct Entry item exchange between institutions. It underpins payroll credits and direct debits at very large scale.',
    details: paragraphs(
      'BECS is where institutions exchange the Direct Entry files and apply rules that govern how items are validated, rejected, or corrected. Clearing is about agreeing the obligation; settlement is the later step where money is moved between institutions.',
      'A central policy challenge has been how to transition legacy batch clearing to modern alternatives without breaking critical payroll and billing processes. Industry consultations have explored decommissioning pathways, but the practical challenges are large because replacement requires both new rails and broad adoption.',
      'Recent industry updates have explicitly removed a fixed “end date” target from BECS planning, reinforcing that BECS is likely to remain in service longer while migration pathways (such as PayTo for direct debit use‑cases) mature.'
    ),
    link: 'https://www.auspaynet.com.au/payments-services/becs'
  },

  'becn-box': {
    title: 'BECN',
    subtitle: 'Bulk Electronic Clearing (Net)',
    description:
      'A net settlement stream for bulk electronic payments. Many low‑value items are exchanged and netted so only net obligations are settled between institutions.',
    details: paragraphs(
      '“Net” settlement means the system totals what each institution owes and is owed across a clearing cycle, then settles only the net amounts. This is efficient for very high volumes of small payments because it reduces settlement traffic and liquidity needs.',
      'The trade‑off is that net settlement introduces timing and operational dependencies: institutions must manage cut‑offs, exceptions and settlement cycles carefully, especially when customer expectations shift toward “always‑on” payments.'
    )
  },

  'becg-box': {
    title: 'BECG',
    subtitle: 'Bulk Electronic Clearing (Gross)',
    description:
      'A gross settlement mode for certain bulk payments, designed for cases where institutions prefer or require gross settlement treatment rather than multilateral netting.',
    details: paragraphs(
      'Most Direct Entry is netted because it is efficient, but some contexts benefit from gross treatment (for example, where risk management or operational rules prefer item‑by‑item settlement).',
      'In an educational view, the key is that the same “file‑based” payment creation can lead to different settlement styles depending on stream rules and risk preferences.'
    )
  },

  'lvss-circle': {
    title: 'LVSS',
    subtitle: 'Low Value Settlement Service',
    description:
      'LVSS is the Reserve Bank’s settlement service that takes net obligations from low‑value clearing streams (like Direct Entry and cheques) and settles them across ESAs in RITS.',
    details: paragraphs(
      'LVSS exists because millions (or billions) of retail payment events do not need to be settled one‑by‑one in real time. Instead, clearing systems determine net obligations, and LVSS settles those net positions in central bank money.',
      'This design reduces settlement traffic and liquidity needs while still achieving final settlement in the central bank. It is one of the key “bridges” between older batch clearing streams and the modern settlement layer.'
    )
  },

  'lvss-gear': {
    title: 'LVSS',
    subtitle: 'Settlement hub for retail clearing streams',
    description:
      'LVSS receives File Settlement Instructions for multiple retail clearing streams and settles the resulting net positions across ESAs in RITS.',
    details: paragraphs(
      'Retail clearing streams generate net obligations. LVSS is where those obligations are standardised into settlement instructions and executed across Exchange Settlement Accounts.',
      'A practical way to interpret LVSS in the diagram is as a convergence point: it is where different retail instruments (Direct Entry, cheques, card clearing streams) become the same thing—interbank net positions to be settled in central bank money.'
    ),
    link: 'https://www.rba.gov.au/payments-and-infrastructure/payments-system.html'
  },

  // LVSS FSI lines
  'lvss-line-gabs': { ...LINE_TOOLTIPS.LVSS_FSI_XML },
  'lvss-line-cecs': { ...LINE_TOOLTIPS.LVSS_FSI_XML },
  'lvss-line-cshd': { ...LINE_TOOLTIPS.LVSS_FSI_XML },
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
      'APCS is the clearing system for cheques and some other paper instruments. Even where images are exchanged electronically, the legal instrument and many processes remain rooted in paper.',
    details: paragraphs(
      'APCS exists because cheques are legal instruments with their own operational and legal handling requirements. Over time, processes evolved to reduce physical handling through truncation and image exchange, but the instrument remains operationally heavy compared with modern electronic payments.',
      'Because cheque volumes have fallen sharply, the policy focus has shifted from “upgrade cheques” to “exit cheques safely,” including clear timelines and support for vulnerable users who still rely on paper.'
    )
  },

  'cheques-box': {
    title: 'Cheques',
    subtitle: 'Paper‑based payment instrument',
    description:
      'Cheques are declining but still used in specific niches. Australia has now published an industry transition plan to end cheque issuance and acceptance on defined dates.',
    details: paragraphs(
      `Your spreadsheet shows that in ${FLOW_SNAPSHOT.retail.asAt} there were about ${fmtInt(FLOW_SNAPSHOT.retail.cheques.volume)} cheques written in the month, with a total value of ${fmtMillionsToAud(FLOW_SNAPSHOT.retail.cheques.valueAudMillions)}. That implies a high average value (around A$${fmtInt(FLOW_SNAPSHOT.retail.cheques.avgAudPerCheque)}), which is typical for cheques: low volume, but often used for larger or specialised payments.`,
      `The same sheet shows how fast the decline is: from ${FLOW_SNAPSHOT.retail.trend.periodStart} to ${FLOW_SNAPSHOT.retail.trend.periodEnd}, monthly cheque volume fell by about ${Math.abs(FLOW_SNAPSHOT.retail.trend.chequesVolumeChangePct).toFixed(0)}%. This decline is one of the main drivers of “end‑of‑life” planning: maintaining specialist paper infrastructure becomes harder to justify as usage shrinks.`,
      'Australia’s published cheques transition plan sets a clear direction: cheque issuance is expected to cease by 30 June 2028 and cheque acceptance (including depositing) is expected to cease by 30 September 2029. The policy intent is to protect users through an orderly transition rather than a sudden loss of service.'
    ),
    link: 'https://treasury.gov.au/consultation/c2024-556474'
  },

  // APCS truncated presentment lines
  'cheques-to-apcs-line': { ...LINE_TOOLTIPS.APCS_TRUNCATED_PRESENTMENT, colorFrom: 'cheques-to-apcs-line-visible' },

  // ========== CARDS / CECS / IAC ==========

  'cecs-box': {
    title: 'CECS',
    subtitle: 'Consumer Electronic Clearing System',
    description:
      'A clearing stream for certain card‑related obligations, producing net positions that are settled through the low‑value settlement layer.',
    details: paragraphs(
      'Card ecosystems are large and complex because they must support authorisation, chargebacks, fraud controls, disputes and reconciliation. Clearing is the accounting step that turns transaction activity into obligations between issuers and acquirers.',
      'In the Australian architecture, some card‑related net obligations flow through low‑value settlement arrangements for settlement in central bank money. The key educational idea is that cards usually do not settle “in the moment” between banks; settlement is typically deferred and netted.'
    )
  },

  'direct-entry-stack-bounding-box': {
    title: 'IAC',
    subtitle: 'Issuers and Acquirers Community',
    description:
      'An industry clearing community that supports exchange of obligations between card issuers and acquirers, which ultimately settle through interbank settlement arrangements.',
    details: paragraphs(
      'Issuers (who provide cards to customers) and acquirers (who provide payment acceptance to merchants) must reconcile huge transaction volumes. Community clearing arrangements and scheme rules define how these obligations are calculated and exchanged.',
      'In public terms, IAC represents “the behind‑the‑scenes community layer” that makes the consumer card experience work while still relying on banking settlement for finality.'
    )
  },

  'eftpos-box': {
    preHeading: 'Australia Payments Plus',
    title: 'eftpos',
    subtitle: 'Domestic debit scheme',
    description:
      'eftpos is Australia’s domestic debit card scheme. It supports everyday merchant payments and withdrawals, with authorisation at the point of sale and settlement later through scheme and banking settlement processes.',
    details: paragraphs(
      `Your retail flows sheet shows the scale of debit card usage in ${FLOW_SNAPSHOT.retail.asAt}: about ${fmtInt(FLOW_SNAPSHOT.retail.debitCards.volume)} debit card transactions in the month, with a total value of ${fmtMillionsToAud(FLOW_SNAPSHOT.retail.debitCards.valueAudMillions)}. That equates to a typical transaction size of about A$${fmtInt(FLOW_SNAPSHOT.retail.debitCards.avgAudPerTxn)}.`,
      'Debit cards are “real time” for the customer experience because authorisation is immediate and the account impact is quickly visible, but interbank settlement usually happens later and on a net basis. Scheme settlement processes compute net obligations and then instruct settlement through the banking settlement layer.',
      'A useful educational distinction is: the card scheme governs how participants exchange data and calculate obligations, while the RBA settlement layer governs how final value moves between institutions.'
    )
  },

  'mastercard-box': {
    title: 'Mastercard',
    subtitle: 'International card scheme',
    description:
      'A global card network that supports credit and debit transactions. Clearing and settlement create net obligations between issuers and acquirers, which are then settled through scheme settlement arrangements.',
    details: paragraphs(
      `In ${FLOW_SNAPSHOT.retail.asAt}, your spreadsheet shows about ${fmtInt(FLOW_SNAPSHOT.retail.creditCards.volume)} credit card transactions for the month, with a total value of ${fmtMillionsToAud(FLOW_SNAPSHOT.retail.creditCards.valueAudMillions)}. That averages around A$${fmtInt(FLOW_SNAPSHOT.retail.creditCards.avgAudPerTxn)} per transaction, reflecting credit cards’ role in higher average purchase sizes.`,
      'Mastercard’s operational model separates customer‑facing authorisation (fast) from institution‑to‑institution settlement (typically net and later). This separation enables massive scale and sophisticated dispute handling, but it also means “payment accepted” and “money settled between banks” are different steps.'
    )
  },

  'visa-box': {
    title: 'Visa',
    subtitle: 'International card scheme',
    description:
      'A global card network that supports debit and credit payments. Like other schemes, it combines real‑time authorisation with later clearing and net settlement.',
    details: paragraphs(
      'Visa’s consumer experience is immediate, but the institutional back end requires clearing, reconciliation and net settlement at scale. The scheme’s processes calculate net obligations across issuers and acquirers and then settle them via agreed settlement arrangements that connect into the banking system.',
      'For an educational view, it is enough to understand that card schemes are not “settlement accounts”; they are rulebooks, networks and operational systems that ultimately rely on banks and the central bank settlement layer to exchange final value.'
    )
  },

  'other-cards-box': {
    title: 'Other card schemes',
    subtitle: 'Additional networks and models',
    description:
      'Other schemes (for example, American Express or Diners) have their own commercial and operational models, but still require clearing and settlement processes that connect to bank accounts.',
    details: paragraphs(
      'Some networks operate with different party structures (for example, three‑party models), which changes how obligations are distributed. However, they still need robust reconciliation and settlement processes and must ultimately interact with bank settlement to move money.',
      'For public education, the important constant is that schemes define the rules and data exchange; final value movement is still a banking and central bank settlement function.'
    )
  },

  'mcau-box': {
    title: 'MCAU',
    subtitle: 'Mastercard Australia settlement entity',
    description:
      'A settlement function/entity that represents Mastercard scheme settlement obligations into the Australian settlement layer.',
    compactStyle: true,
    details: paragraphs(
      'Scheme settlement entities act as the interface between the scheme’s internal netting and Australia’s settlement layer. The scheme computes who owes what, then settlement instructions are delivered so that banks can settle those obligations across ESAs.',
      'This box is intentionally “plumbing‑level”: it is not consumer‑visible, but it is essential to how card obligations become final money movements.'
    )
  },

  'essb-box': {
    title: 'ESSB',
    subtitle: 'eftpos settlement entity',
    description:
      'A settlement function/entity for eftpos scheme settlement obligations into the Australian settlement layer.',
    compactStyle: true,
    details: paragraphs(
      'Like other scheme settlement arrangements, the settlement entity exists to convert scheme‑computed obligations into final settlement movements in the banking system.',
      'It is a reminder that card payments have multiple layers: customer experience, scheme operations, and final interbank settlement.'
    )
  },

  // Scheme file format lines
  'eftpos-left-line': { ...LINE_TOOLTIPS.EPAL, colorFrom: 'eftpos-left-line-visible' },
  'eftpos-left-line-horizontal': { ...LINE_TOOLTIPS.EPAL, colorFrom: 'eftpos-left-line-horizontal-visible' },
  'mastercard-left-line': { ...LINE_TOOLTIPS.MASTERCARD_IPM, colorFrom: 'mastercard-left-line-visible' },
  'mastercard-left-line-horizontal': { ...LINE_TOOLTIPS.MASTERCARD_IPM, colorFrom: 'mastercard-left-line-horizontal-visible' },
  'direct-entry-stack-line-yellow': { ...LINE_TOOLTIPS.VISA_BASEII, colorFrom: 'direct-entry-stack-line-yellow-visible' },
  'direct-entry-stack-line-blue': { ...LINE_TOOLTIPS.PROPRIETARY_SCHEME_FORMATS, colorFrom: 'direct-entry-stack-line-blue-visible' },
  'direct-entry-stack-line-green': { ...LINE_TOOLTIPS.HEALTH_CLAIMS, colorFrom: 'direct-entry-stack-line-green-visible' },
  'direct-entry-stack-line-brown': { ...LINE_TOOLTIPS.ATM_AS2805, colorFrom: 'direct-entry-stack-line-brown-visible' },

  'atms-box': {
    title: 'ATMs',
    subtitle: 'Cash withdrawals and related transactions',
    description:
      'ATM transactions are authorised quickly over ATM message networks, then cleared and settled between institutions through deferred settlement arrangements.',
    details: paragraphs(
      'From a customer perspective, an ATM transaction feels instant because cash is dispensed immediately. That immediacy is supported by interbank arrangements that later calculate and settle the obligations created by those withdrawals.',
      'ATM networks illustrate a broader payments lesson: many customer experiences are “real time,” but settlement between institutions can still occur later, often netted for efficiency.'
    )
  },

  'claims-box': {
    title: 'Claims',
    subtitle: 'Medicare and health claims',
    description:
      'Health claims are specialised message flows for eligibility and reimbursement. They often use payment terminals and service providers as a convenient access channel, then settle through banking channels.',
    details: paragraphs(
      'Claims systems exist to validate entitlements and allocate payments between parties (government, insurers, providers and patients). The “message flow” is therefore as important as the “money flow.”',
      'Once a claim is validated, the resulting payment still needs to move through mainstream banking and settlement infrastructure to reach the recipient’s account.'
    )
  },

  // ========== ADMINISTERED BATCHES / PROPERTY SETTLEMENT ==========

  'administered-batches-box': {
    title: 'Administered batches',
    subtitle: 'Batch settlement facilities in RITS',
    description:
      'Arrangements where external systems compute net obligations and RITS performs the final settlement across ESAs. This pattern is used for several important infrastructures (including market and scheme settlements).',
    details: paragraphs(
      'An “administered batch” is a division of labour: an external system (a scheme, market infrastructure or platform) calculates the net positions for its participants, then submits a settlement request so RITS can move the money across Exchange Settlement Accounts.',
      `In your RTGS settlement detail sheet (${FLOW_SNAPSHOT.rtgs.asAt}), batch positions settled in RITS averaged ${fmtInt(FLOW_SNAPSHOT.rtgs.batch.positionsAvgDaily)} positions per business day with an average daily value of ${fmtMillionsToAud(FLOW_SNAPSHOT.rtgs.batch.valueAudMillionsAvgDaily)}. This highlights that “batch settlement” is not small or peripheral; it is a meaningful component of daily interbank settlement activity.`,
      'For public understanding, this is one of the most important interrelationships in the diagram: many specialised systems depend on the same central settlement layer for finality.'
    )
  },

  'pexa-convey-box': {
    title: 'PEXA e‑conveyancing',
    subtitle: 'Property Exchange Australia',
    description:
      'A platform that coordinates electronic property settlement workflows, aligning legal title transfer steps with the banking settlement movements required to complete settlement.',
    details: paragraphs(
      'Property settlement requires synchronisation: lenders, buyers, sellers and registries must all act together. PEXA provides the workflow and messaging framework that coordinates this.',
      'When it comes to money, PEXA does not replace the banking settlement layer. Instead, it orchestrates instructions that result in settlement movements executed through the Reserve Bank settlement infrastructure so that participating banks exchange funds with central bank finality.'
    )
  },

  'sympli-box': {
    title: 'Sympli e‑conveyancing',
    subtitle: 'Electronic property settlement',
    description:
      'An alternative e‑conveyancing platform that provides electronic workflow and messaging for property settlements, coordinating with banks and registries.',
    details: paragraphs(
      'Sympli provides an e‑conveyancing workflow similar in intent to other platforms: standardising messages, coordinating steps, and reducing paper handling and settlement-day friction.',
      'As with other platforms, settlement of funds still relies on interbank settlement arrangements rather than the platform itself acting as the final settlement asset.'
    )
  },

  'pexa-box': {
    title: 'PEXA',
    subtitle: 'PEXA settlement stream',
    description:
      'A representation of the settlement stream that carries PEXA‑related obligations into the settlement layer.',
    compactStyle: true,
    details: paragraphs(
      'This element represents the interface between a property settlement workflow and the banking settlement layer.',
      'It exists because, in the end, property settlement requires final money movement between banks, not just workflow completion.'
    )
  },

  'asxf-box': {
    title: 'ASXF',
    subtitle: 'ASX feeder / settlement stream',
    description:
      'A settlement interface used for certain market and property-related batch settlement flows into RITS.',
    compactStyle: true,
    details: paragraphs(
      'Feeder arrangements represent the operational connection that turns “positions calculated elsewhere” into “settlement executed here.”',
      'In a public-facing diagram, this is best understood as plumbing: it is the connector between an external system’s net positions and the central bank settlement engine.'
    )
  },

  'asxb-box': {
    title: 'ASXB',
    subtitle: 'ASX batch settlement stream',
    description:
      'A batch settlement stream associated with ASX clearing and settlement net obligations.',
    compactStyle: true,
    details: paragraphs(
      'Securities market infrastructures typically net large numbers of trades, then settle net obligations on a schedule. This reduces liquidity needs and operational load.',
      'The batch stream exists to ensure those net obligations are settled with finality in the settlement layer.'
    )
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
  'sympli-to-adis-line': { ...LINE_TOOLTIPS.NECDS_SYMPLI, colorFrom: 'sympli-to-adis-line-visible' },
  'pexa-to-adis-line': { ...LINE_TOOLTIPS.NECDS_PEXA, colorFrom: 'pexa-to-adis-line-visible' },

  // ========== CLS ==========

  'cls-circle': {
    title: 'CLS',
    subtitle: 'Continuous Linked Settlement',
    description:
      'A global foreign‑exchange settlement system that reduces settlement risk by linking the two currency legs of an FX trade under a payment‑versus‑payment model.',
    details: paragraphs(
      'CLS exists because FX settlement risk is real: one party can pay away one currency and still face the risk of not receiving the other. By coordinating settlement of both legs, CLS reduces this risk for participating currencies and institutions.',
      'In Australia, the Reserve Bank supports AUD settlement within CLS’s arrangements through accounts and operational connections that allow AUD obligations to settle in central bank money.'
    ),
    link: 'https://www.cls-group.com/'
  },

  // ========== ASX / MARKETS INFRASTRUCTURE ==========

  'asx-box': {
    title: 'ASX',
    subtitle: 'Australian Securities Exchange',
    description:
      'Australia’s major market operator and provider of clearing and settlement infrastructure through licensed CCPs and securities settlement facilities. Its systems connect into the RBA settlement layer for the cash leg of many transactions.',
    details: paragraphs(
      'Securities markets create two types of obligations: a securities obligation (deliver the asset) and a cash obligation (pay for it). Australia’s market infrastructure uses specialised systems to ensure these obligations are managed safely, including central counterparty clearing for risk management and securities settlement systems for delivery versus payment.',
      `The ASX Group Monthly Activity Report for ${ASX_SNAPSHOT.asAt} illustrates scale at a glance: cash markets averaged ${fmtInt(ASX_SNAPSHOT.cashMarkets.avgDailyTrades)} trades per day, with an average daily on‑market value traded of A$${ASX_SNAPSHOT.cashMarkets.avgDailyValueAudBillions.toFixed(3)} billion (total A$${ASX_SNAPSHOT.cashMarkets.totalValueAudBillions.toFixed(3)} billion for the month).`,
      'The interrelationship to highlight in a payments diagram is that market infrastructures often net and coordinate obligations, but final AUD settlement still converges on the central bank settlement layer for finality.'
    )
  },

  'asx-clearing-dot': {
    title: 'ASX clearing facilities',
    subtitle: 'Central counterparties (CCPs)',
    description:
      'ASX operates licensed CCPs that manage counterparty risk for market trades by becoming the buyer to every seller and the seller to every buyer, supported by margining and default management.',
    details: paragraphs(
      'A CCP reduces counterparty risk by “stepping in the middle.” After a trade is executed, the CCP becomes the counterparty to both sides, so participants face the CCP rather than facing each other directly. This structure concentrates risk management and makes default handling more predictable, but it requires strong safeguards.',
      `The ASX monthly activity report for ${ASX_SNAPSHOT.asAt} provides a concrete sense of risk controls at scale: average daily initial margin held was about A$${ASX_SNAPSHOT.clearingRisk.initialMarginHeldAudBillions.total.toFixed(1)} billion across ASX clearing (A$${ASX_SNAPSHOT.clearingRisk.initialMarginHeldAudBillions.asxClear.toFixed(1)}b for ASX Clear and A$${ASX_SNAPSHOT.clearingRisk.initialMarginHeldAudBillions.asxClearFutures.toFixed(1)}b for ASX Clear (Futures)). Variation margin paid in the month was reported at about A$${ASX_SNAPSHOT.clearingRisk.variationMarginPaidAudBillions.total.toFixed(1)} billion in total.`,
      'CCP activity spans products. In Australia that includes cash equities and options (ASX Clear) and futures and certain OTC interest rate derivatives clearing (ASX Clear (Futures)). Each product class has different risk characteristics, which is why margining and default resources are product‑aware.'
    ),
    link: 'https://www.rba.gov.au/fin-stability/financial-market-infrastructure/'
  },

  'asx-settlement-dot': {
    title: 'ASX Settlement',
    subtitle: 'Securities settlement facility (SSF)',
    description:
      'ASX Settlement operates the settlement system for ASX‑listed equities via CHESS, coordinating delivery versus payment and maintaining shareholding records through the electronic subregister.',
    details: paragraphs(
      'A securities settlement facility is responsible for ensuring that securities move from seller to buyer in a controlled, final way. In equities, the settlement process is typically “delivery versus payment” (DvP): the security should not be delivered unless the cash payment is made, and vice versa.',
      `In the ASX monthly activity report for ${ASX_SNAPSHOT.asAt}, CHESS holdings were reported at about A$${ASX_SNAPSHOT.chess.holdingsAudBillions.toFixed(1)} billion, and dominant settlement messages were about ${ASX_SNAPSHOT.chess.dominantSettlementMessagesMillions.toFixed(3)} million. These figures help explain why settlement system resilience matters: even modest disruptions can have broad market impacts.`,
      'In system terms, ASX Settlement coordinates the securities leg while the cash leg relies on the banking settlement layer. That is why CHESS connects to RITS for cash settlement finality.'
    ),
    link: 'https://www.asx.com.au/'
  },

  'chess-box': {
    title: 'CHESS',
    subtitle: 'Clearing House Electronic Subregister System',
    description:
      'CHESS is the core ASX system for equities post‑trade processing, supporting settlement workflows and maintaining the electronic subregister of shareholdings.',
    details: paragraphs(
      'CHESS underpins the “back half” of equities trading: after a trade is executed, CHESS manages the steps that lead to settlement, including instructions, netting processes and the updating of holdings records.',
      'For public understanding, CHESS is the system that makes “I bought shares” turn into “I own shares.” The money part of that journey still requires interbank settlement finality, which is why CHESS interacts with the RBA settlement layer.'
    )
  },

  'chess-rtgs-box': {
    title: 'CHESS‑RTGS',
    subtitle: 'DvP cash settlement interface',
    description:
      'The interface between CHESS and the RBA settlement layer, used to support delivery‑versus‑payment settlement by linking securities settlement steps to RTGS cash settlement.',
    details: paragraphs(
      'Delivery‑versus‑payment is a risk control: it reduces the chance that one party delivers securities but does not receive cash, or pays cash but does not receive securities.',
      'CHESS‑RTGS is the operational bridge that links the securities system to the cash settlement system. It is a good example of “interrelationships between objects” in the payments map: securities settlement cannot be fully understood without understanding the cash settlement layer.'
    )
  },

  'austraclear-box': {
    title: 'Austraclear',
    subtitle: 'Debt securities depository and settlement',
    description:
      'Austraclear is Australia’s key post‑trade system for debt securities and money market instruments. It coordinates securities settlement and connects into RITS for the associated cash settlement.',
    details: paragraphs(
      'Austraclear supports settlement and custody processes for debt markets, which are central to how governments and large corporates fund themselves and how banks manage liquidity. Debt markets are also closely tied to monetary policy operations and collateral frameworks.',
      `The ASX monthly activity report for ${ASX_SNAPSHOT.asAt} reported Austraclear holdings at about A$${ASX_SNAPSHOT.austraclear.holdingsAudBillions.toFixed(1)} billion, illustrating the scale of instruments sitting in this infrastructure.`,
      `On the cash settlement side, your RTGS settlement data (${FLOW_SNAPSHOT.rtgs.asAt}) shows Austraclear‑related RTGS settlement averaged ${fmtInt(FLOW_SNAPSHOT.rtgs.austraclear.paymentsAvgDaily)} payments per business day with an average daily value of ${fmtMillionsToAud(FLOW_SNAPSHOT.rtgs.austraclear.valueAudMillionsAvgDaily)}. This is a direct, quantified link between financial market infrastructure and the central bank settlement layer.`
    )
  },

  'lch-dot': {
    title: 'LCH Limited',
    subtitle: 'OTC derivatives CCP (SwapClear service)',
    description:
      'LCH operates SwapClear, a major global central counterparty for interest rate swaps. In Australia, it is licensed and assessed against the RBA’s Financial Stability Standards due to its systemic relevance.',
    details: paragraphs(
      'OTC derivatives can create large, complex and fast‑moving exposures. Central clearing reduces counterparty risk by shifting exposures into a CCP that applies margining, default management and robust operational controls.',
      'In Australian dollar interest rate derivatives, central clearing is important enough that the Reserve Bank has published assessment material and market commentary on the role of SwapClear. In its payments system developments reporting, the RBA has noted that SwapClear clears the majority of centrally cleared AUD OTC interest rate derivatives activity, highlighting its relevance to Australian financial stability.',
      'For public audiences, the key takeaway is that “payments system stability” is not only about retail payments. Wholesale market infrastructures can generate large cash flows and liquidity demands that ultimately depend on the same settlement layer.'
    ),
    link: 'https://www.rba.gov.au/fin-stability/financial-market-infrastructure/'
  },

  // ASX messaging lines (kept, but rewritten)
  'asx-to-adi-line': {
    title: 'ASX messaging interfaces (post‑trade)',
    title2: 'Participant connectivity',
    description:
      'ASX uses dedicated messaging interfaces to exchange post‑trade instructions with participants for equities and debt market settlement. These messages coordinate settlement workflows; final cash settlement for many obligations occurs through the RBA settlement layer.',
    lineStyle: true,
    details: paragraphs(
      'Market infrastructure needs reliable, standardised participant connectivity so that settlement instructions, confirmations and exception handling can be automated at scale.',
      'This line represents that “post‑trade messaging plane.” The “money plane” is separate: when cash must move between banks, settlement finality relies on the central bank settlement layer.'
    )
  },
  'asx-to-hvcs-line': {
    title: 'ASX messaging interfaces (post‑trade)',
    title2: 'Participant connectivity',
    description:
      'Post‑trade messaging for market settlement coordination, distinct from final interbank settlement.',
    lineStyle: true,
    details: paragraphs(
      'This path represents messaging used to coordinate settlement actions and obligations between participants and ASX infrastructure.',
      'Settlement finality for the cash leg still depends on central bank settlement mechanisms when obligations are between banks.'
    )
  },

  'clearing-box': {
    title: 'Clearing / netting',
    subtitle: 'Obligations calculation',
    description:
      'Clearing and netting reduce the number and value of settlement payments by offsetting obligations, which is efficient but creates dependencies on end‑of‑cycle settlement completion.',
    lineStyle: true,
    details: paragraphs(
      'Netting is a compression mechanism: instead of settling every trade individually, the system offsets buys and sells so only net obligations remain. This reduces settlement traffic and liquidity usage.',
      'The trade‑off is that net settlement concentrates risk at the settlement time. That is why market infrastructures and settlement systems focus heavily on operational resilience and liquidity arrangements around the settlement window.'
    )
  },

  'trade-by-trade-box': {
    title: 'Trade‑by‑trade settlement',
    subtitle: 'Gross settlement approach',
    description:
      'A gross approach settles each transaction individually, which can reduce certain settlement risks but typically increases settlement traffic and liquidity usage.',
    lineStyle: true,
    details: paragraphs(
      'Settling trade‑by‑trade can improve immediacy and reduce the build‑up of net exposures. However, it increases the number of settlement events and can increase the liquidity each participant must have available.',
      'This is a classic design trade‑off in financial infrastructure: risk reduction versus operational and liquidity efficiency.'
    )
  },

  // DvP cash leg path
  'dvp-cash-leg-box': {
    title: 'Delivery versus Payment cash leg',
    subtitle: 'RTGS cash settlement',
    description:
      'The cash side of a DvP transaction is settled through RTGS so that securities delivery and cash payment are linked.',
    lineStyle: true,
    colorFrom: 'dvp-cash-leg-to-dvp-rtgs-line',
    details: paragraphs(
      'DvP links the securities leg and the cash leg. The cash leg typically settles in central bank money to minimise settlement risk.',
      'This tooltip exists to make the interrelationship visible: the securities infrastructure needs the cash settlement infrastructure to complete safe delivery versus payment.'
    )
  },
  'dvp-cash-leg-to-dvp-rtgs-line': {
    title: 'Delivery versus Payment cash leg',
    subtitle: 'RTGS cash settlement',
    description:
      'Cash settlement path used to support DvP by linking cash movement to securities delivery.',
    lineStyle: true,
    details: paragraphs(
      'This path represents the settlement of cash obligations in RTGS that correspond to securities settlement events.',
      'DvP reduces settlement risk by ensuring the two legs complete together.'
    )
  },
  'dvp-rtgs-box': {
    title: 'Delivery versus Payment cash leg',
    subtitle: 'RTGS cash settlement',
    description:
      'Cash settlement component used in DvP.',
    lineStyle: true,
    details: paragraphs(
      'The RTGS cash leg ensures finality in central bank money for the payment side of a DvP settlement.',
      'This is one of the most important “why it exists” features in market infrastructure: it reduces principal risk.'
    )
  },
  'dvp-rtgs-to-austraclear-line': {
    title: 'Delivery versus Payment cash leg',
    subtitle: 'RTGS cash settlement',
    description:
      'Connectivity that links Austraclear settlement events to RTGS cash settlement.',
    lineStyle: true,
    details: paragraphs(
      'Austraclear settlement events often require corresponding RTGS cash movements.',
      'This line represents the operational connection that enables that linkage.'
    )
  },
  'austraclear-to-rits-line-upper': {
    title: 'Delivery versus Payment cash leg',
    subtitle: 'RTGS cash settlement',
    description:
      'RTGS cash settlement path associated with DvP for eligible Austraclear activity.',
    lineStyle: true,
    details: paragraphs(
      'DvP settlement requires a reliable cash settlement path into the central bank settlement layer.',
      'This line represents that path.'
    )
  },

  // Cash transfer path
  'cash-transfer-box': {
    title: 'Cash transfers',
    subtitle: 'RTGS cash movements',
    description:
      'Non‑DvP cash transfers associated with Austraclear activity can also settle through RTGS in central bank money.',
    lineStyle: true,
    colorFrom: 'cash-transfer-to-rtgs-line',
    details: paragraphs(
      'Not every cash movement is part of a DvP event. Some are standalone cash transfers linked to market activity, liquidity management, or operational needs.',
      'In all cases, RTGS settlement provides finality by moving ESA balances.'
    )
  },
  'cash-transfer-to-rtgs-line': {
    title: 'Cash transfers',
    subtitle: 'RTGS cash movements',
    description:
      'RTGS cash settlement path for non‑DvP cash transfers.',
    lineStyle: true,
    details: paragraphs(
      'This line represents the settlement of cash transfers that are not directly coupled to securities delivery.',
      'They still rely on RTGS finality in central bank money.'
    )
  },
  'rtgs-box': {
    title: 'Cash transfers',
    subtitle: 'RTGS cash movements',
    description:
      'RTGS processing for standalone cash transfers related to market infrastructure activity.',
    lineStyle: true,
    details: paragraphs(
      'RTGS settlement is used not only for interbank payment instructions but also for certain market‑related cash movements.',
      'This element highlights that “payments” and “markets” share the same settlement layer.'
    )
  },
  'rtgs-to-austraclear-line': {
    title: 'Cash transfers',
    subtitle: 'RTGS cash movements',
    description:
      'Connectivity linking RTGS cash movements to Austraclear processing flows.',
    lineStyle: true,
    details: paragraphs(
      'Austraclear activity often triggers cash movements that settle through RTGS.',
      'This line represents that operational connection.'
    )
  },
  'austraclear-to-rits-line-lower': {
    title: 'Cash transfers',
    subtitle: 'RTGS cash movements',
    description:
      'RTGS cash settlement path associated with Austraclear cash movements.',
    lineStyle: true,
    details: paragraphs(
      'This line represents cash settlement in RTGS arising from Austraclear-related activity.',
      'It is another view of how market infrastructure and central bank settlement interlock.'
    )
  },

  // ========== FIXES FOR OBVIOUS MIS-MAPPINGS (OSKO LINE) ==========
  // The original snippet mapped `osko-to-adi-line` to cheque presentment, which is inconsistent with the id.
  // This rewrite maps it to ISO 20022/NPP messaging instead.
  'osko-to-adi-line': {
    ...LINE_TOOLTIPS.ISO20022_SWIFT,
    title: 'ISO 20022 (NPP fast payments messaging)',
    description:
      'Structured ISO 20022 messages used for NPP fast payments (including Osko), exchanged between participants and settled via the RBA’s Fast Settlement Service.'
  },

  // ========== DUPLICATED DOMESTIC BANK LINES (KEEP AS ALIASES) ==========
  'bdf-line-50': {
    title: 'Domestic banks',
    subtitle: 'Cash distribution participants',
    description:
      'In the banknote distribution context, major domestic banks play a key operational role in distributing cash to branches, ATMs and cash services networks.',
    details: paragraphs(
      'Cash is a physical supply chain. Domestic banks often act as the main interface between the Reserve Bank’s issuance and the public’s access points (branches, ATMs and merchants).',
      'This line represents the operational and logistical connection that sits alongside the electronic payments infrastructure in a complete view of the payments system.'
    ),
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
