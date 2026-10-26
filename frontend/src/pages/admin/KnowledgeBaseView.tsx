import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Compass,
  DollarSign,
  FileText,
  Globe,
  Layers,
  Printer,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const [testSubject, setTestSubject] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleRunSimulator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testSubject.trim() || !testDescription.trim()) return;

    setIsTesting(true);
    try {
      const res = await api.testAIClassification(testSubject, testDescription);
      setTestResult(res.result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTesting(false);
    }
  };

  const handlePreloadQuery = (subject: string, desc: string) => {
    setTestSubject(subject);
    setTestDescription(desc);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 className="font-serif" style={{ fontSize: '1.65rem', fontWeight: 600, color: '#0f172a', margin: '0 0 6px 0' }}>
          Publishing SOPs & Author Policy Playbook
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
          Official operating guidelines, contractual royalty rules, and editorial response standards calibrated across all BookLeaf titles.
        </p>
      </div>

      {/* 4 Core Publishing Policy Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        {/* Policy 1: Royalties */}
        <div className="card" style={{ padding: '22px', borderLeft: '4px solid #059669', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 700, fontSize: '0.9rem' }}>
            <DollarSign size={18} />
            <span>Royalty & Accounting Policy</span>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            Authors retain <strong>80% of net profits</strong> on all physical and digital distributions. Royalties are calculated quarterly and dispatched within <strong>45 days</strong> of quarter-end for balances &ge; <strong>₹1,000</strong>. Sub-threshold amounts roll over indefinitely.
          </p>
          <div style={{ fontSize: '0.725rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, alignSelf: 'flex-start' }}>
            SOP Clause #RY-204 • Quarterly Settlement
          </div>
        </div>

        {/* Policy 2: ISBN & Metadata */}
        <div className="card" style={{ padding: '22px', borderLeft: '4px solid #2563eb', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 700, fontSize: '0.9rem' }}>
            <Compass size={18} />
            <span>ISBN & Metadata Guidelines</span>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            Every title receives a unique 13-digit ISBN registered with the national Raja Rammohun Roy National Agency. Barcode alignment must be verified prior to bulk imprint. Metadata modifications synchronize with Amazon within <strong>24–72 hours</strong>.
          </p>
          <div style={{ fontSize: '0.725rem', color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, alignSelf: 'flex-start' }}>
            SOP Clause #IS-108 • National Registry Sync
          </div>
        </div>

        {/* Policy 3: Printing Quality */}
        <div className="card" style={{ padding: '22px', borderLeft: '4px solid #b47820', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b47820', fontWeight: 700, fontSize: '0.9rem' }}>
            <Printer size={18} />
            <span>Printing & Paper Standards</span>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            Standard imprints utilize <strong>80 GSM Natural White</strong> or <strong>Cream Bookpaper</strong> with thermal matte/gloss cover finish. Defective batches exceeding 2% deviation qualify for immediate complimentary reprints under BookLeaf Quality Guarantee.
          </p>
          <div style={{ fontSize: '0.725rem', color: '#b47820', backgroundColor: '#fef7ed', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, alignSelf: 'flex-start' }}>
            SOP Clause #PR-302 • Quality Assurance
          </div>
        </div>

        {/* Policy 4: Distribution & Channels */}
        <div className="card" style={{ padding: '22px', borderLeft: '4px solid #0f766e', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f766e', fontWeight: 700, fontSize: '0.9rem' }}>
            <Globe size={18} />
            <span>Distribution & Retail Channels</span>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            Distribution feeds connect to Amazon India, Flipkart, and the BookLeaf Bookstore via Print-on-Demand (POD). Temporary 'Out of Stock' listing states trigger automatic vendor central replenishment within <strong>2 business days</strong>.
          </p>
          <div style={{ fontSize: '0.725rem', color: '#0f766e', backgroundColor: '#f0fdfa', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, alignSelf: 'flex-start' }}>
            SOP Clause #DS-401 • Marketplace Delivery Time
          </div>
        </div>
      </div>

      {/* Interactive Support Rules & Policy Sandbox */}
      <div
        className="card"
        style={{
          padding: '28px',
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid #e5e0d8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: '#0f766e' }}>
          <Sparkles size={20} />
          <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: '#0f172a' }}>
            Support Rules & Policy Sandbox
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px', lineHeight: 1.5 }}>
          Simulate incoming author messages to observe how BookLeaf's policy engine categorizes, computes urgency scores, and drafts contract-grounded replies.
        </p>

        {/* Quick Preload Scenarios */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f766e' }}>Preset Scenarios:</span>
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px' }}
            onClick={() =>
              handlePreloadQuery(
                'Haven\'t received royalties for 6 months',
                'I sold copies of my book 6 months ago, but no royalty payout has appeared in my linked bank account.'
              )
            }
          >
            Overdue Royalty Discrepancy
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px' }}
            onClick={() =>
              handlePreloadQuery(
                'Wrong ISBN showing on Amazon India',
                'The Amazon listing shows a different ISBN than what is printed on the physical copy barcode.'
              )
            }
          >
            Critical ISBN Mismatch
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px' }}
            onClick={() =>
              handlePreloadQuery(
                'Misprinted pages in author copies',
                'Received my printed author copies and several pages are blurry and misaligned.'
              )
            }
          >
            Print Defect Escalation
          </button>
        </div>

        {/* Simulator Form */}
        <form onSubmit={handleRunSimulator} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Inquiry Subject
            </label>
            <input
              type="text"
              className="form-input"
              value={testSubject}
              onChange={(e) => setTestSubject(e.target.value)}
              placeholder="e.g. Inquiring regarding quarterly royalty disbursement timeline..."
              style={{ borderRadius: '8px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Author Message Description
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              placeholder="Enter message text to test policy classification..."
              style={{ borderRadius: '8px', lineHeight: 1.5 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isTesting || !testSubject.trim() || !testDescription.trim()}
              className="btn-primary"
              style={{ padding: '9px 18px', borderRadius: '8px' }}
            >
              <Zap size={14} />
              <span>{isTesting ? 'Calibrating...' : 'Run Policy Assessment'}</span>
            </button>
          </div>
        </form>

        {/* Simulation Output */}
        {testResult && (
          <div
            className="card animate-fade-in"
            style={{
              marginTop: '20px',
              backgroundColor: '#faf8f5',
              border: '1px solid #e7e3da',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge badge-category" style={{ fontSize: '0.75rem' }}>
                  Category: {testResult.category}
                </span>
                <span
                  className="badge"
                  style={{
                    backgroundColor: testResult.priority === 'Critical' ? '#fee2e2' : '#f0fdfa',
                    color: testResult.priority === 'Critical' ? '#dc2626' : '#0f766e',
                    border: '1px solid',
                    borderColor: testResult.priority === 'Critical' ? '#fecaca' : '#ccfbf1',
                    fontSize: '0.75rem',
                  }}
                >
                  Priority: {testResult.priority}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.5 }}>
              <strong>Review Reason:</strong> {testResult.reasoning}
            </div>

            <div style={{ borderTop: '1px solid #ede9e1', paddingTop: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', marginBottom: '6px', textTransform: 'uppercase' }}>
                Contract-Grounded Response Draft:
              </div>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.825rem',
                  lineHeight: 1.6,
                  color: '#334155',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {testResult.draftResponse}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
