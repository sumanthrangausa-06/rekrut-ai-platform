import React, { useState } from 'react';

/**
 * EthicsCompliance Page - Full compliance transparency page
 * Place at /compliance route and link from footer + signup flow
 * Shows clients that Rekrut AI takes compliance seriously
 */

const aiRegsUSA = [
  { name: 'EEOC Guidance on AI in Hiring', status: 'compliant', detail: 'We follow EEOC May 2023 guidance ensuring our AI does not discriminate based on race, gender, age, or disability.' },
  { name: 'NYC Local Law 144', status: 'compliant', detail: 'Annual independent bias audits conducted. Audit results available to NYC employers upon request.' },
  { name: 'Illinois BIPA', status: 'compliant', detail: 'Written consent obtained before any biometric data (video/voice) processing. Retention policy: max 3 years.' },
  { name: 'Colorado SB 24-205', status: 'compliant', detail: 'Algorithm impact assessments completed. Consumers can appeal AI-influenced decisions and request human review.' },
  { name: 'California ADMT', status: 'in-progress', detail: 'Risk assessments and opt-out mechanisms being implemented. Deadline: January 2027.' },
];

const aiRegsEU = [
  { name: 'EU AI Act (Annex III)', status: 'compliant', detail: 'Recruitment AI classified as high-risk. Risk management, data governance, and human oversight systems implemented.' },
  { name: 'GDPR Article 9', status: 'compliant', detail: 'Explicit consent obtained for processing special category data (race, disability, biometric data).' },
  { name: 'GDPR Article 22', status: 'compliant', detail: 'Candidates have the right to human review of any automated hiring decision that produces legal effects.' },
  { name: 'GDPR Article 35', status: 'compliant', detail: 'Data Protection Impact Assessment (DPIA) completed before processing candidate data at scale.' },
  { name: 'EU AI Act Full Enforcement', status: 'in-progress', detail: 'Conformity assessment scheduled for Q3 2026. Full compliance deadline: December 2, 2027.' },
];

const aiRegsIndia = [
  { name: 'DPDP Act 2023', status: 'compliant', detail: 'Consent-based data processing. Grievance officer appointed. Cross-border transfers use Standard Contractual Clauses.' },
  { name: 'NITI Aayog Responsible AI', status: 'compliant', detail: 'Principles of safety, reliability, inclusivity, transparency, and accountability embedded in our AI design.' },
];

const privacyFrameworks = [
  { name: 'GDPR (EU/EEA)', scope: 'Candidate data from EU/EEA', requirements: 'Lawful basis, explicit consent for special categories, DPIA, DPO, 72-hour breach notification, data subject rights (access, rectification, erasure, portability)' },
  { name: 'CCPA/CPRA (California)', scope: 'California residents', requirements: 'Privacy policy disclosure, consumer rights (access, delete, opt-out, correct), sensitive personal information handling, no sale without opt-in for minors' },
  { name: 'India DPDP Act 2023', scope: 'Indian candidates', requirements: 'Consent-based processing, data fiduciary obligations, grievance officer, cross-border transfer restrictions, penalties up to INR 250 Crore' },
  { name: 'PIPEDA (Canada)', scope: 'Canadian candidates', requirements: 'Consent, 10 Fair Information Principles, breach notification, accountability for data transfers' },
  { name: 'UK GDPR', scope: 'UK candidates', requirements: 'Post-Brexit GDPR alignment, ICO guidance compliance, AI recruitment best practices' },
];

const laborLaws = [
  { jurisdiction: 'USA Federal', hours: '40 hrs/week', breaks: 'None (federal)', minWage: '$7.25/hr', key: 'FLSA overtime, Title VII, ADA, I-9 verification' },
  { jurisdiction: 'California', hours: '40 hrs/week', breaks: '30 min meal (5+ hrs)', minWage: '$16.50/hr', key: 'CCPA, AB 5, PAGA, paid sick leave' },
  { jurisdiction: 'New York', hours: '40 hrs/week', breaks: '30 min meal (6+ hrs)', minWage: '$16.50/hr', key: 'Paid sick leave, WARN Act, salary transparency' },
  { jurisdiction: 'Texas', hours: '40 hrs/week', breaks: 'None', minWage: '$7.25/hr', key: 'At-will employment, no state income tax' },
  { jurisdiction: 'India', hours: '48 hrs/week (8/day)', breaks: '30 min rest + 1 day off', minWage: 'State-specific', key: 'PF 12%, ESI, Gratuity, POSH Act, TDS' },
  { jurisdiction: 'EU', hours: '48 hrs/week (opt-out)', breaks: '11 hrs daily rest', minWage: 'Country-specific', key: 'Working Time Directive, non-discrimination directives' },
];

const certifications = [
  { name: 'Delaware C-Corp Formation', timeline: 'Month 1', status: 'planned', cost: '$500-2,000' },
  { name: 'SOC 2 Type I', timeline: 'Q3 2026', status: 'planned', cost: '$10-15K' },
  { name: 'SOC 2 Type II', timeline: 'Q1 2027', status: 'planned', cost: '$15-25K' },
  { name: 'ISO 27001', timeline: 'Q2 2027', status: 'planned', cost: '$15-30K' },
  { name: 'EU AI Act CE Marking', timeline: 'Q4 2027', status: 'planned', cost: '$5-15K' },
  { name: 'ISO 27701 (Privacy)', timeline: '2028', status: 'planned', cost: '$10-20K' },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    compliant: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
    planned: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[status] || map.planned}`;
};

export default function EthicsCompliance() {
  const [activeTab, setActiveTab] = useState<'usa' | 'eu' | 'india'>('usa');
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const tabs = [
    { key: 'usa' as const, label: 'United States', count: aiRegsUSA.length },
    { key: 'eu' as const, label: 'European Union', count: aiRegsEU.length },
    { key: 'india' as const, label: 'India', count: aiRegsIndia.length },
  ];

  const activeRegs = { usa: aiRegsUSA, eu: aiRegsEU, india: aiRegsIndia }[activeTab];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium border border-emerald-500/30">
              Trust Center
            </span>
            <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm">
              Last updated: June 6, 2026
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Trust & Compliance</h1>
          <p className="text-xl text-blue-200 max-w-3xl">
            Rekrut AI is built on a foundation of ethical AI, data protection, and global legal compliance. We believe transparency builds trust.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            {[
              { label: 'GDPR Ready', color: 'text-emerald-400' },
              { label: 'SOC 2 In Progress', color: 'text-amber-400' },
              { label: 'EU AI Act Aligned', color: 'text-emerald-400' },
              { label: 'CCPA Compliant', color: 'text-emerald-400' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <svg className={`w-5 h-5 ${s.color}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-sm font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Commitment */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Our Compliance Commitment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Ethical AI', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', text: 'We design our AI systems to be fair, transparent, and accountable. Our bias detection algorithms are audited regularly. We never use emotion recognition in interviews (prohibited under EU AI Act since 2025).' },
              { title: 'Data Privacy First', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', text: 'We collect only necessary data, encrypt everything with AES-256, and give users full control over their information. Candidates can request data deletion at any time, no questions asked.' },
              { title: 'Global Standards', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064', text: 'We comply with the strictest regulations worldwide: GDPR, CCPA, EU AI Act, India DPDP Act, PIPEDA, and UK GDPR. We go beyond minimum requirements because our users deserve it.' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <svg className="w-8 h-8 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AI Regulations */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Ethics & Regulations</h2>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 inline-flex">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === t.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {activeRegs.map((reg) => (
              <div key={reg.name} className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
                <span className={statusBadge(reg.status)}>
                  {reg.status === 'compliant' ? 'Compliant' : 'In Progress'}
                </span>
                <div>
                  <h4 className="font-semibold text-gray-900">{reg.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{reg.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data Privacy */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Privacy Framework</h2>
          <div className="space-y-2">
            {privacyFrameworks.map((fw, i) => (
              <div key={fw.name} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">{fw.name}</span>
                    <span className="text-sm text-gray-500">{fw.scope}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${openAccordion === i ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openAccordion === i && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-gray-600 pl-5">{fw.requirements}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Labor Laws */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Labor Law Compliance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-3 font-semibold text-gray-700 border-b">Jurisdiction</th>
                  <th className="p-3 font-semibold text-gray-700 border-b">Working Hours</th>
                  <th className="p-3 font-semibold text-gray-700 border-b">Breaks</th>
                  <th className="p-3 font-semibold text-gray-700 border-b">Min Wage</th>
                  <th className="p-3 font-semibold text-gray-700 border-b">Key Requirements</th>
                </tr>
              </thead>
              <tbody>
                {laborLaws.map((law) => (
                  <tr key={law.jurisdiction} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{law.jurisdiction}</td>
                    <td className="p-3 text-gray-600">{law.hours}</td>
                    <td className="p-3 text-gray-600">{law.breaks}</td>
                    <td className="p-3 text-gray-600">{law.minWage}</td>
                    <td className="p-3 text-gray-600">{law.key}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Certifications Timeline */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Certifications & Licenses Roadmap</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {certifications.map((cert) => (
                <div key={cert.name} className="relative flex items-start gap-4 pl-10">
                  <div className="absolute left-2.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm mt-1.5" />
                  <div className="bg-gray-50 rounded-lg p-4 flex-1 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                      <span className="text-sm font-medium text-blue-600">{cert.timeline}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Estimated cost: {cert.cost}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What This Means */}
        <section className="bg-blue-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What This Means for You</h2>
          <p className="text-gray-600 mb-6">When you use Rekrut AI, you can be confident that:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Your candidate data is encrypted with AES-256 and protected by TLS 1.3',
              'Our AI is regularly audited for bias and discrimination',
              'Candidates have the right to human review of any AI-influenced decision',
              'We comply with GDPR, CCPA, EU AI Act, and India DPDP Act',
              'We never sell personal data to third parties',
              'All data processing is documented and auditable',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="text-center pb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Questions?</h2>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <span>Compliance: <a href="mailto:compliance@rekrutai.co" className="text-blue-600 hover:underline">compliance@rekrutai.co</a></span>
            <span>Privacy: <a href="mailto:privacy@rekrutai.co" className="text-blue-600 hover:underline">privacy@rekrutai.co</a></span>
            <span>Security: <a href="mailto:security@rekrutai.co" className="text-blue-600 hover:underline">security@rekrutai.co</a></span>
          </div>
          <p className="text-xs text-gray-400 mt-4">This page is updated quarterly. Last updated: June 6, 2026.</p>
        </section>
      </div>
    </div>
  );
}
