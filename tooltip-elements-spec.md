# RITS Diagram - Interactive Elements Specification

## Main Circles (2 elements)

### 1. RITS Settlement Engine (Big Blue Circle)
**Tooltip:** "RITS Settlement Engine - Real-time gross settlement system operated by the Reserve Bank of Australia. Operating hours: Monday-Friday, 7:30-22:00 AEST/AEDT"
**Group:** RITS Core

### 2. FSS (Small Yellow/Orange Circle)
**Tooltip:** "Fast Settlement Service (FSS) - RBA's 24/7 liquidity management facility"
**Group:** FSS Core

---

## Exchange Settlement Account Holders (ESA Dots)

### Dot Pair 0: Reserve Bank of Australia
**Tooltip:** "Reserve Bank of Australia (RBA) - Central bank and RITS operator"
**Group:** RBA

### Dot Pairs 1-2: Foreign Banks
**Tooltip (1):** "Citibank, N.A. - Exchange Settlement Account holder"
**Group:** Foreign Banks
**Tooltip (2):** "JPMorgan Chase Bank, National Association - Exchange Settlement Account holder"
**Group:** Foreign Banks

### Dot Pairs 3-44: Other Foreign Bank ESAs
**Tooltip:** "Foreign Bank - Exchange Settlement Account holder (ESA)"
**Group:** Foreign Banks

### Dot Pairs 45-46: HSBC and ING
**Tooltip (45):** "HSBC Bank Australia Limited - Exchange Settlement Account holder"
**Group:** Domestic Banks
**Tooltip (46):** "ING Bank (Australia) Limited - Exchange Settlement Account holder"
**Group:** Domestic Banks

### Dot Pairs 47-49: Other Domestic Banks
**Tooltip:** "Domestic Bank - Exchange Settlement Account holder (ESA)"
**Group:** Domestic Banks

### Dot Pairs 50-53: Big Four Banks
**Tooltip (50):** "Australia and New Zealand Banking Group Limited (ANZ) - Major domestic bank with ESA"
**Group:** Big Four Banks
**Tooltip (51):** "Commonwealth Bank of Australia (CBA) - Major domestic bank with ESA"
**Group:** Big Four Banks
**Tooltip (52):** "National Australia Bank Limited (NAB) - Major domestic bank with ESA"
**Group:** Big Four Banks
**Tooltip (53):** "Westpac Banking Corporation - Major domestic bank with ESA"
**Group:** Big Four Banks

### Dot Pair 54: Macquarie Bank
**Tooltip:** "Macquarie Bank Limited - Major domestic bank with ESA"
**Group:** Other Major Banks

### Dot Pair 55: Bendigo and Adelaide Bank
**Tooltip:** "Bendigo and Adelaide Bank Limited - Regional bank with ESA"
**Group:** Other Major Banks

### Dot Pairs 56-83: Other Domestic Bank ESAs
**Tooltip:** "Domestic Bank - Exchange Settlement Account holder (ESA)"
**Group:** Domestic Banks

### Dot Pairs 84-85: Payment Service Providers (Settlement)
**Tooltip (84):** "Australian Settlements Limited - Payment service provider with ESA"
**Group:** Payment Service Providers
**Tooltip (85):** "Indue Ltd - Payment service provider with ESA"
**Group:** Payment Service Providers

### Dot Pair 86: Other PSP
**Tooltip:** "Payment Service Provider - Exchange Settlement Account holder"
**Group:** Payment Service Providers

### Dot Pairs 87-88: Non-ADI PSPs
**Tooltip (87):** "CUSCAL Limited - Non-ADI payment service provider with ESA"
**Group:** Non-ADI Institutions
**Tooltip (88):** "Wise Australia Pty Limited - Non-ADI payment service provider with ESA"
**Group:** Non-ADI Institutions

### Dot Pairs 89-91: Other Non-ADI ESAs
**Tooltip:** "Non-ADI Institution - Exchange Settlement Account holder"
**Group:** Non-ADI Institutions

### Dot Pairs 92-95: Financial Market Infrastructure
**Tooltip (92):** "Adyen Australia Pty Limited - Payment processor with ESA"
**Group:** Financial Market Infrastructure
**Tooltip (93):** "EFTEX Pty Limited - Card payment infrastructure provider"
**Group:** Financial Market Infrastructure
**Tooltip (94):** "First Data Network Australia Limited - Payment infrastructure provider"
**Group:** Financial Market Infrastructure
**Tooltip (95):** "Financial Market Infrastructure - Exchange Settlement Account holder"
**Group:** Financial Market Infrastructure

### Dot Pairs 96-98: Securities Settlement
**Tooltip (96):** "ASX Settlement Pty Limited - Equities settlement system"
**Group:** Securities Settlement
**Tooltip (97):** "ASX Clearing Corporation Limited - Central counterparty clearing"
**Group:** Securities Settlement
**Tooltip (98):** "LCH Limited - Global clearing house"
**Group:** Securities Settlement

### Dot 99: CLS Bank (Large Yellow Circle)
**Tooltip:** "CLS Bank International - Continuous Linked Settlement for foreign exchange PvP settlement"
**Group:** CLS FX Settlement

---

## Payment System Boxes

### NPP (New Payments Platform)
**Tooltip:** "New Payments Platform (NPP) - Real-time retail payments infrastructure (24/7)"
**Group:** NPP System
**Sub-elements:**
- NPP Bounding Box
- Osko logo/label
- PayID label

### SWIFT/HVCS
**Tooltip:** "SWIFT High-Value Clearing System (HVCS) - ISO 20022 messaging for high-value payments"
**Group:** SWIFT System
**Sub-messages:**
- pacs.008 (Customer Credit Transfer)
- pacs.004 (Payment Return)
- pacs.002 (Payment Status Report)

### Direct Entry (DE)
**Tooltip:** "Direct Entry (DE) - Bulk electronic payments system (Batch processing via AusPayNet)"
**Group:** Direct Entry System

### BPAY
**Tooltip:** "BPAY - Bill payment service"
**Group:** BPAY System

### BECS (Bulk Electronic Clearing System)
**Sub-elements:**
- **BECN:** "Bulk Electronic Clearing - Normal (BECN)"
- **BECG:** "Bulk Electronic Clearing - Government (BECG)"
**Group:** BECS System

---

## Card Payment Systems

### eftpos Settlement Batch (ESSB)
**Tooltip:** "eftpos Settlement Batch (ESSB) - Domestic debit card scheme settlement (Reservation Batch XML)"
**Group:** eftpos System
**Sub-elements within box:**
- eftpos label
- Other Cards label
- Visa label
- Claims label
- ATMs label

### Mastercard Australia (MCAU)
**Tooltip:** "Mastercard Australia (MCAU) - International card scheme settlement (Settlement-only Batch XML / IPM File Format)"
**Group:** Mastercard System

### ASX Bridge (ASXB)
**Tooltip:** "ASX Bridge (ASXB) - Connects ASX securities settlement to RITS (Visa Base II File Format)"
**Group:** ASX Bridge System

---

## Securities & Clearing Systems

### CHESS (Clearing House Electronic Sub-register System)
**Tooltip:** "CHESS - ASX equities settlement system"
**Group:** ASX Securities Settlement

### Austraclear
**Tooltip:** "Austraclear - Debt securities settlement system"
**Group:** ASX Securities Settlement

### ASX Settlement
**Tooltip:** "ASX Settlement - Central securities depository for Australian equities"
**Group:** ASX Securities Settlement

### DvP/RTGS Box
**Tooltip:** "Delivery versus Payment (DvP) / Real-Time Gross Settlement - Securities settlement against payment"
**Group:** DvP RTGS System

---

## Property Settlement (ELNO)

### PEXA
**Tooltip:** "PEXA (Property Exchange Australia) - Electronic property settlement network (ELNO Messages)"
**Group:** Property Settlement

### Sympli
**Tooltip:** "Sympli - Electronic property settlement network (ELNO Messages)"
**Group:** Property Settlement

### ASX Futurised (ASXF)
**Tooltip:** "ASX Futurised (ASXF) - Derivatives settlement via RITS"
**Group:** ASX Derivatives

---

## Administrative & Batch Systems

### LVSS (Low-Value Settlement Service)
**Tooltip:** "LVSS - Low-Value Settlement Service operated by the RBA (LVSS FSI XML)"
**Group:** LVSS System
**Sub-boxes:**
- **CECS:** "Card Exchange Clearing System (CECS)"
- **IAC:** "Image Archive & Clearing (IAC)"
- **SSS:** "Special Settlement Service (SSS)"
- **CCP:** "Central Counterparty (CCP) - ASX Clear"

### Money Market
**Tooltip:** "Money Market Operations - RBA open market operations and liquidity management"
**Group:** Money Market System

### GABS (Government & Agency Batch System)
**Tooltip:** "GABS - Government and Agency Batch Settlements"
**Group:** Government Systems

### APCS (Australian Paper Clearing System)
**Tooltip:** "APCS - Cheque and paper instrument clearing (Image Exchange Presentment)"
**Group:** Cheque Clearing

### Cheques Box
**Tooltip:** "Cheque Settlement - Physical and electronic cheque processing"
**Group:** Cheque Clearing

### EPAL
**Tooltip:** "EPAL - Enhanced Primary Auction Liquidity facility (Settlement File Formats)"
**Group:** RBA Liquidity Facilities

---

## Connecting Lines

### ISO 20022 (SWIFT) - Teal thick lines
**Tooltip:** "ISO 20022 SWIFT messages - International standard for financial messaging"
**Group:** SWIFT System

### ISO 20022 CLS PvP - Bright green thick line
**Tooltip:** "ISO 20022 CLS Payment-versus-Payment - FX settlement via CLS Bank"
**Group:** CLS FX Settlement

### ASX EXIGO - Blue thick lines
**Tooltip:** "ASX EXIGO - Proprietary messaging for ASX securities settlement"
**Group:** ASX Securities Settlement

### Settlement-only Batch XML - Purple double lines
**Tooltip:** "Settlement-only Batch XML - Card scheme batch settlement files (Mastercard)"
**Group:** Mastercard System

### Reservation Batch XML - Purple triple lines
**Tooltip:** "Reservation Batch XML - Pre-settlement liquidity reservation batches (eftpos)"
**Group:** eftpos System

### LVSS FSI XML - Silver/grey double lines
**Tooltip:** "LVSS FSI XML - Financial Services Interface for low-value settlements"
**Group:** LVSS System

### AusPayNet DE (ABA) file - Bright red thick line
**Tooltip:** "AusPayNet Direct Entry (ABA file format) - Bulk electronic payment batches"
**Group:** Direct Entry System

### APCS Image Exchange Presentment - Grey single line
**Tooltip:** "APCS Image Exchange Presentment - Electronic cheque image exchange"
**Group:** Cheque Clearing

### EPAL Settlement File Formats - Purple single line
**Tooltip:** "EPAL Settlement File Formats - RBA liquidity facility settlement files"
**Group:** RBA Liquidity Facilities

### Mastercard IPM File Format - Red single line
**Tooltip:** "Mastercard IPM (Interbank Payment Message) File Format - Card transaction clearing"
**Group:** Mastercard System

### Visa Base II File Format - Orange/yellow single line
**Tooltip:** "Visa Base II File Format - Card transaction clearing and settlement"
**Group:** ASX Bridge System

### Proprietary Scheme Formats (AMEX / UnionPay / Diners) - Cyan double lines
**Tooltip:** "Proprietary Scheme Formats - Other card scheme settlement formats (AMEX, UnionPay, Diners Club)"
**Group:** Other Card Schemes

### PEXA ELNO Messages - Magenta thick lines
**Tooltip:** "PEXA ELNO Messages - Electronic property settlement instructions"
**Group:** Property Settlement

### Sympli ELNO Messages - Orange thick lines
**Tooltip:** "Sympli ELNO Messages - Electronic property settlement instructions"
**Group:** Property Settlement

---

## Enclosing/Container Boxes

### ESA Background Box (Grey rectangle around all blue dots)
**Tooltip:** "Exchange Settlement Accounts (ESAs) - Financial institutions holding accounts at the RBA for settlement"
**Group:** All ESAs

### Administered Batches Box (Dark grey box around card systems)
**Tooltip:** "RBA Administered Batch Settlements - Card and payment scheme batch processing"
**Group:** Administered Batches

### ADI Box (around major banks in NPP system)
**Tooltip:** "Authorised Deposit-taking Institutions (ADIs) - Licensed banks participating in NPP"
**Group:** NPP System

### Non-ADI Box (around non-bank NPP participants)
**Tooltip:** "Non-ADI NPP Participants - Payment service providers without banking licenses"
**Group:** NPP System

---

## Element Grouping Strategy

### Core Infrastructure Groups:
1. **RITS Core** - RITS circle + all ESA dots + ESA background
2. **FSS Core** - FSS circle + yellow dots paired with ESAs
3. **CLS FX Settlement** - CLS large circle + green line + relevant bank dots

### Payment System Groups:
4. **NPP System** - NPP box + ADI box + Non-ADI box + connecting lines
5. **SWIFT System** - SWIFT box + teal lines + pacs.xxx messages
6. **Direct Entry System** - DE box + BPAY + BECS boxes + red line
7. **BPAY System** - BPAY box + connections to DE and BECS
8. **BECS System** - BECN + BECG boxes

### Card Payment Groups:
9. **eftpos System** - eftpos box + purple triple lines + sub-labels
10. **Mastercard System** - Mastercard box + purple double lines + red line
11. **ASX Bridge System** - ASXB box + orange line (Visa)
12. **Administered Batches** - Container box around all card systems

### Securities Groups:
13. **ASX Securities Settlement** - CHESS + Austraclear + ASX Settlement + blue lines + DvP/RTGS box
14. **ASX Derivatives** - ASXF box + line to RITS

### Property Settlement Groups:
15. **Property Settlement** - PEXA + Sympli + their respective lines

### RBA Services Groups:
16. **LVSS System** - LVSS + CECS + IAC + SSS + CCP + silver lines
17. **Money Market System** - Money Market box
18. **RBA Liquidity Facilities** - EPAL box + line
19. **Government Systems** - GABS box
20. **Cheque Clearing** - APCS + Cheques boxes + grey line

### Bank Groups (for ESA dots):
21. **RBA** - Dot pair 0
22. **Foreign Banks** - Dot pairs 1-44
23. **Domestic Banks** - Dot pairs 45-49, 56-83
24. **Big Four Banks** - Dot pairs 50-53
25. **Other Major Banks** - Dot pairs 54-55
26. **Payment Service Providers** - Dot pairs 84-86
27. **Non-ADI Institutions** - Dot pairs 87-91
28. **Financial Market Infrastructure** - Dot pairs 92-95
29. **Securities Settlement** - Dot pairs 96-98
30. **All ESAs** - All blue dots + ESA background box

---

## Interaction Behavior Notes:

- **Individual hover:** Show specific tooltip for that element
- **Group highlight:** All elements in the same group light up (e.g., increase opacity, add glow, or brighten color)
- **Dot pairs:** Blue dot + yellow dot + blue line + orange line = single hoverable unit
- **Lines:** Each line type is independently hoverable and groups with its source/destination
- **Nested groups:** Some elements belong to multiple groups (e.g., Big Four Banks are also in Domestic Banks and All ESAs)
