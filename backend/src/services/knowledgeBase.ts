import { TicketCategory } from '../models/Ticket';

export interface PolicySection {
  title: string;
  category: TicketCategory;
  rules: string[];
  expectedTone: string;
}

/**
 * High-level overview of BookLeaf Publishing's business context and dataset
 */
export const BOOKLEAF_PUBLISHING_DATASET_OVERVIEW = `
[PUBLISHER CONTEXT: BOOKLEAF PUBLISHING]
- Business: Leading independent Indian publishing house empowering authors across Literary Fiction, Non-Fiction, Poetry, Self-Help, Business, and Memoirs.
- Catalog: Author roster of 10+ seeded active authors and 18 titles (including titles like "Whispers of the Ganges", "Startup Sutra", "Code & Karma", "The Nagpur Notebooks", "The Last Monsoon").
- Royalty Split: 80% Net Profit to Author, 20% to BookLeaf.
- Net Profit Formula: Book MRP minus Print-on-Demand (POD) manufacturing cost, marketplace commission (Amazon/Flipkart: 45–50%), and shipping fees.
- Payout Schedule: Quarterly calculation, distributed within 45 days of quarter end via direct bank transfer.
- Payout Minimum Threshold: ₹1,000. Balances below ₹1,000 safely roll over to the next quarter.
- Production Pipeline (9 Stages): Manuscript Received → Editing (if opted) → Cover Design → Typesetting → Proofreading → ISBN Assignment → Printing → Distribution Setup → Published & Live.
- Print Partners: In-House Delhi print facility (primary), Repro India (overflow/nationwide), Epitome Books (specialized formats). Standard print turnaround is 5–7 business days.
- Retail Channels: Amazon India, Flipkart, Amazon US, Amazon UK, and BookLeaf Store.
- Quality Guarantee: 100% complimentary reprint for verified manufacturing defects (blurry text, peeling binding, misaligned pages) delivered in 5–7 business days.
- Distribution Stock Sync: POD marketplace listings showing "Currently Unavailable" resolve via inventory feed re-sync within 24–48 hours.
- Metadata Updates: Author bio or book description updates take 3–5 business days to propagate across platforms.
- Resolution Standards: Strict 48-hour SLA for critical issues (ISBN/barcode mismatches and overdue royalty payouts).
`.trim();

export const BOOKLEAF_KNOWLEDGE_BASE: Record<TicketCategory, PolicySection> = {
  'Royalty & Payments': {
    title: 'Royalty & Payout Policies',
    category: 'Royalty & Payments',
    rules: [
      'BookLeaf follows an 80/20 royalty split: 80% of net profit per book to author, 20% to BookLeaf.',
      'Net profit = MRP minus printing cost, platform commission (Amazon/Flipkart 45-50%), and shipping charges.',
      'Royalties are calculated quarterly and paid within 45 days of the quarter ending.',
      'Minimum payout threshold: ₹1,000. If accumulated royalties are below ₹1,000, they roll over to the next quarter.',
      'Payouts are made via direct bank transfer to the account linked in the author dashboard.',
      'Authors can view a detailed royalty breakdown in their dashboard, showing sales figures per platform.',
      'If payment is genuinely overdue beyond the 45-day window, apologize sincerely and escalate with a strict 48-hour resolution timeline.'
    ],
    expectedTone: 'Acknowledge frustration directly. Explain quarterly royalty cycle and 45-day payout window. Check if bank details are linked. Provide specific next payout date. Offer transparent line-by-line net profit breakdown without being defensive.'
  },
  'ISBN & Metadata Issues': {
    title: 'ISBN & Metadata Policies',
    category: 'ISBN & Metadata Issues',
    rules: [
      'Every book published through BookLeaf receives a unique 13-digit ISBN assigned under BookLeaf publisher imprint.',
      'If an author wants an ISBN under their own imprint, they must obtain it independently.',
      'Any ISBN error (duplicate, wrong book linked, barcode mismatch on Amazon vs physical copy) is treated as CRITICAL / HIGH priority.',
      'Immediately escalate ISBN issues to the production and cataloging team with a strict 48-hour resolution timeline.',
      'Metadata updates (book description, subtitle, category) on Amazon/Flipkart take 3–5 business days to reflect.'
    ],
    expectedTone: 'Treat as high priority. Acknowledge this is a serious data issue. Confirm immediate escalation to the production team with a 48-hour resolution timeline.'
  },
  'Printing & Quality': {
    title: 'Printing & Physical Quality Policies',
    category: 'Printing & Quality',
    rules: [
      'In-house printing in Delhi handles most orders. Overflow or specific format requirements go to Repro India or Epitome Books.',
      'Standard print turnaround: 5–7 business days from order confirmation.',
      'If an author reports a quality issue (misprints, binding defects, blurry images, misaligned pages, damaged shipment), BookLeaf arranges a 100% free reprint after verification.',
      'Author must share photos of the defective copy showing the defect clearly.',
      'Once verified, free replacement reprint is dispatched within 5–7 business days.'
    ],
    expectedTone: 'Apologise sincerely without deflection. Ask author to share photos of defective copies. Confirm BookLeaf arranges a 100% free reprint once verified with a 5–7 business day turnaround.'
  },
  'Distribution & Availability': {
    title: 'Distribution & Platform Availability Policies',
    category: 'Distribution & Availability',
    rules: [
      'Books are listed on Amazon India, Flipkart, Amazon US, Amazon UK, and the BookLeaf Store.',
      'New listings typically go live within 7–10 business days after publication is complete.',
      'If a book shows as "Currently Unavailable" or "Out of Stock" on Amazon/Flipkart, it usually indicates a temporary stock sync issue between Print-on-Demand (POD) feed and marketplace API.',
      'BookLeaf operations team triggers an automated catalog/inventory re-sync within 24–48 hours to restore availability.'
    ],
    expectedTone: 'Explain that this is typically a stock sync issue. Confirm you are triggering a re-sync with the distribution team. Set expectation: 24–48 hours for it to go live again.'
  },
  'Book Status & Production Updates': {
    title: 'Production Pipeline & Status Policies',
    category: 'Book Status & Production Updates',
    rules: [
      'Official production stages: Manuscript Received → Editing (if opted) → Cover Design → Typesetting → Proofreading → ISBN Assignment → Printing → Distribution Setup → Published & Live.',
      'Authors receive automated status updates via email and dashboard at each milestone.',
      'Delays typically occur at Cover Design (waiting for author feedback/approval) and Typesetting/Proofreading (revision rounds).',
      'Always check the actual production status. If delayed, be honest about why (e.g., waiting on author approval for proofs or fine-tuning layout). Provide specific updated timeline. Frame all delays collaboratively without blaming the author.'
    ],
    expectedTone: 'Check actual production status. If delayed, be honest about why. Provide a specific updated timeline. Don\'t blame the author even if delay is on their side—frame it collaboratively.'
  },
  'General Inquiry': {
    title: 'General Author Account & Publishing Policies',
    category: 'General Inquiry',
    rules: [
      'BookLeaf offers two packages: Standard Free (no upfront cost) and Bestseller Breakthrough (premium paid package with marketing add-ons).',
      'Services include cover design, typesetting, ISBN assignment, printing, distribution, and royalty management.',
      'Metadata edits (author bio, book description) can be requested via dashboard or support, taking 3–5 business days to propagate across retailer platforms.'
    ],
    expectedTone: 'Confirm metadata updates can be submitted through dashboard or email. Clarify changes typically reflect on platforms within 3–5 business days.'
  }
};

/**
 * Official few-shot dataset cases from BookLeaf Technical Assignment
 */
export interface OfficialSampleCase {
  id: string;
  category: TicketCategory;
  sampleQuery: string;
  expectedToneAndContent: string;
  goldStandardResponse: string;
}

export const BOOKLEAF_OFFICIAL_FEW_SHOT_SAMPLES: OfficialSampleCase[] = [
  {
    id: 'royalty_delayed_payout',
    category: 'Royalty & Payments',
    sampleQuery: "I published my book 4 months ago and still haven't received any royalty. What's going on?",
    expectedToneAndContent:
      'Acknowledge the frustration. Explain the quarterly royalty cycle and 45-day payout window. Check if their bank details are linked. Provide the specific next payout date. If the payment is genuinely overdue, escalate with a 48-hour resolution timeline.',
    goldStandardResponse: `Dear Author,

Thank you for reaching out, and I completely understand your frustration regarding not having received any royalty four months after publishing your book. You have invested significant time and care into your writing, and you deserve complete transparency regarding your earnings.

At BookLeaf, royalties are calculated on a quarterly basis and disbursed within 45 days of each quarter ending (Q1 ending March 31, Q2 ending June 30, Q3 ending September 30, and Q4 ending December 31). In addition, payouts are triggered once your accumulated royalties cross our minimum payout threshold of ₹1,000. If your accumulated earnings are under ₹1,000, they safely roll over to the next quarter.

I have checked your account details:
1. Please ensure your active bank account number and IFSC code are linked and verified under Account Settings > Payment Details in your dashboard.
2. If your book was published four months ago and your sales surpassed the ₹1,000 threshold within the previous quarter, your payment should have been processed in the recent cycle.

Since this payout appears overdue against our 45-day window, I have escalated this directly to our accounts team with a strict 48-hour resolution timeline. They are reviewing your transfer logs right now, and I will personally follow up with your transaction reference number and payout confirmation within 48 hours.

Warm regards,
BookLeaf Author Support Team`,
  },
  {
    id: 'royalty_low_amount',
    category: 'Royalty & Payments',
    sampleQuery: 'My royalty amount seems too low. I sold 200 copies but only received ₹3,000.',
    expectedToneAndContent:
      'Explain the net profit calculation: MRP minus printing, platform commission, and shipping. Offer to share a detailed line-by-line royalty breakdown. Don’t be defensive—offer transparency.',
    goldStandardResponse: `Dear Author,

Thank you for contacting us with your question regarding your royalty calculation. I completely understand why seeing ₹3,000 for 200 copies feels lower than expected, and I am glad you reached out so we can provide full transparency.

Under BookLeaf's royalty policy, authors receive an 80% share of the Net Profit per copy sold (with BookLeaf retaining 20%). Net profit is determined by taking the book's retail price (MRP) and deducting:
1. Print-on-Demand (POD) manufacturing cost per unit
2. Distribution channel commission (Amazon and Flipkart typically charge 45%–50% of the MRP)
3. Shipping and order fulfillment fees

Because platform commissions and physical print costs constitute a significant portion of each retail sale, the net profit per copy varies depending on the retail channel and promotional discounts applied.

We believe in complete transparency with our authors. I would be more than happy to share a detailed line-by-line royalty breakdown showing your exact sales channel distribution, printing costs, platform fees, and net profit per book. You can also view this itemized breakdown directly in your dashboard under Royalty Reports.

Please let me know if you would like me to generate and email you the full itemized breakdown, and I will gladly assist!

Warm regards,
BookLeaf Author Support Team`,
  },
  {
    id: 'isbn_amazon_mismatch',
    category: 'ISBN & Metadata Issues',
    sampleQuery: "My book is showing a different ISBN on Amazon than what's on the physical copy.",
    expectedToneAndContent:
      'Treat as high priority. Acknowledge this is a serious data issue. Confirm you are escalating to the production team immediately. Provide a 48-hour resolution timeline.',
    goldStandardResponse: `Dear Author,

Thank you for bringing this to our attention immediately. We treat any discrepancy between your physical book and its online listing as a high-priority matter.

Having a mismatched ISBN on Amazon is a serious catalog data issue. The ISBN is the authoritative 13-digit identifier tied to your book's barcode, copyright registration, royalty accounting, and verified reader reviews.

I have immediately escalated this ticket to our senior cataloging and production team. We are currently cross-referencing the official ISBN assignment under our publisher imprint with Amazon Vendor Central to correct the catalog feed and ensure the listing matches your physical barcode. We have placed a strict 48-hour resolution timeline on this issue.

I will monitor this ticket closely and send you a confirmation as soon as Amazon's catalog reflects the corrected ISBN.

Warm regards,
BookLeaf Author Support Team`,
  },
  {
    id: 'print_quality_defect',
    category: 'Printing & Quality',
    sampleQuery: 'I received my author copies and the print quality is terrible. The images are blurry and pages are misaligned.',
    expectedToneAndContent:
      'Apologise sincerely. Ask the author to share photos of the defective copies. Confirm that BookLeaf will arrange a free reprint once verified. Provide a timeline of 5–7 business days for the reprint.',
    goldStandardResponse: `Dear Author,

I am sincerely sorry to hear that your author copies arrived with blurry images and misaligned pages. You worked hard to write and publish your book, and receiving copies that fail to meet physical print standards is deeply disappointing.

Please rest assured that BookLeaf stands 100% behind the physical quality of our books under our Quality Guarantee. You will never have to bear the cost for manufacturing or printing defects.

To help us arrange an immediate resolution, could you please reply with 2 to 3 clear photographs showing:
1. The blurry images or text
2. The page misalignment and spine binding
3. The barcode on the back cover

As soon as our production quality team verifies these photos, BookLeaf will immediately arrange a 100% complimentary reprint. Once verified, your replacement copies will be printed and dispatched within 5–7 business days directly to your delivery address.

Warm regards,
BookLeaf Author Support Team`,
  },
  {
    id: 'distribution_currently_unavailable',
    category: 'Distribution & Availability',
    sampleQuery: 'My book is published but it’s showing as “Currently Unavailable” on Amazon.',
    expectedToneAndContent:
      'Explain that this is typically a stock sync issue. Confirm you’re triggering a re-sync with the distribution team. Set expectation: 24–48 hours for it to go live again.',
    goldStandardResponse: `Dear Author,

Thank you for reaching out to us. I understand how concerning it is to see your published book displayed as "Currently Unavailable" on Amazon when readers are eager to order it.

Please be reassured that your book is in good standing and has not been delisted. Because BookLeaf operates on a Print-on-Demand (POD) distribution network, marketplace listings occasionally show "Currently Unavailable" due to a temporary stock feed synchronization delay between our print fulfillment system and Amazon's catalog API.

I have already triggered a manual inventory and catalog re-sync with our distribution operations team for your title. This synchronization typically takes 24 to 48 hours for Amazon's servers to process and restore the active buy button.

I will keep this ticket open and monitor the Amazon listing over the next 48 hours, and I will confirm with you the moment the active ordering link is restored.

Warm regards,
BookLeaf Author Support Team`,
  },
  {
    id: 'production_typesetting_delay',
    category: 'Book Status & Production Updates',
    sampleQuery: "It's been 3 weeks and my book is still in typesetting. When will it be done?",
    expectedToneAndContent:
      'Check the actual production status. If it’s delayed, be honest about why (e.g., waiting on author approval for proofs). Provide a specific updated timeline. Don’t blame the author even if the delay is on their side—frame it collaboratively.',
    goldStandardResponse: `Dear Author,

Thank you for checking in on the progress of your book. I completely understand your eagerness to see your manuscript move forward, and I appreciate your patience over the last 3 weeks.

I have checked the current production status of your title with our formatting team. Your book is in our Typesetting stage, where our layout artists design chapter headings, margins, and typography to professional publishing standards. While standard typesetting typically takes 1 to 2 weeks, delays can happen when fine-tuning complex interior layouts or coordinating proofing rounds.

We are actively working on finalizing your interior layout proofs. Our typesetter will have the complete PDF interior proof uploaded to your author dashboard by the upcoming Friday for your review and feedback.

Once you review and approve the typesetting proofs together with our team, your manuscript will advance immediately to proofreading, ISBN assignment, and distribution setup. Thank you for partnering with us to ensure your book looks stunning!

Warm regards,
BookLeaf Author Support Team`,
  },
  {
    id: 'general_amazon_description',
    category: 'General Inquiry',
    sampleQuery: 'Can I update the description of my book on Amazon after it’s already live?',
    expectedToneAndContent:
      'Yes, metadata updates can be submitted through the dashboard or by emailing the BookLeaf team. Changes typically reflect on platforms within 3–5 business days.',
    goldStandardResponse: `Dear Author,

Thank you for reaching out! Yes, you can certainly update your book's description on Amazon even after it is already published and live.

You can submit your updated book description in either of two convenient ways:
1. Author Dashboard: Log in to your BookLeaf Author Portal, navigate to "My Books", select your title, and submit your updated description under "Edit Metadata".
2. Email Support: Alternatively, you can reply directly to this message with your revised description and subtitle.

Once submitted, our catalog operations team will review the formatting and push the updated metadata feed to Amazon and other distribution platforms. Marketplace updates typically reflect on live platform listings within 3–5 business days.

Please feel free to send over the updated description whenever you are ready!

Warm regards,
BookLeaf Author Support Team`,
  },
];

/**
 * Returns targeted policy rules and few-shot examples for this category.
 */
export function getContextForCategory(category: TicketCategory): string {
  const section = BOOKLEAF_KNOWLEDGE_BASE[category] || BOOKLEAF_KNOWLEDGE_BASE['General Inquiry'];
  const matchingSamples = BOOKLEAF_OFFICIAL_FEW_SHOT_SAMPLES.filter((s) => s.category === category);
  const sampleList = matchingSamples.length > 0 ? matchingSamples : [BOOKLEAF_OFFICIAL_FEW_SHOT_SAMPLES[0]];

  const samplesFormatted = sampleList
    .map(
      (s, idx) => `
[FEW-SHOT SAMPLE #${idx + 1} FOR ${category.toUpperCase()}]
Author Query: "${s.sampleQuery}"
Required Tone & Content Criteria:
${s.expectedToneAndContent}

Gold-Standard Approved Response:
"""
${s.goldStandardResponse}
"""`
    )
    .join('\n');

  return `
[BOOKLEAF OFFICIAL POLICY: ${section.title}]
${section.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Tone & Guidelines:
${section.expectedTone}

${samplesFormatted}
`.trim();
}

/**
 * Global Tone Guidelines matching BookLeaf's brand
 */
export const GLOBAL_TONE_GUIDELINES = `
- Always empathetic and professional. Authors are our partners, not customers to be managed.
- Acknowledge the author's concern directly before jumping into solutions.
- Be specific: include actual numbers, dates, monetary figures, and book titles wherever possible rather than vague reassurances.
- If something is BookLeaf's fault (delayed royalties, print defect, ISBN glitch), own it directly. No corporate deflection.
- If the issue requires escalation or investigation, give a clear timeline (e.g., "Our team will look into this and update you within 48 hours").
- Always end with a clear next step for the author and/or the BookLeaf team.
- Sign off consistently as:
  Warm regards,
  BookLeaf Author Support Team
`.trim();
