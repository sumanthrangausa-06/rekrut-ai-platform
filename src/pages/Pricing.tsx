import React, { useState } from 'react';
import { TrustBadges } from '../components/compliance/TrustBadges';

/**
 * Pricing Page - Three-tier pricing for recruiters
 * Free for candidates, paid tiers for employers/recruiters
 */

const plans = [
  {
    name: 'Starter',
    price: 49,
    description: 'Perfect for small teams hiring 1-3 roles per month',
    features: [
      'Up to 5 active job postings',
      '50 AI-generated assessments/month',
      'Basic candidate matching',
      'Interview scheduling',
      'Email support',
      'Standard analytics',
    ],
    notIncluded: [
      'AI video interviews',
      'Advanced analytics',
      'API access',
      'Custom branding',
      'Dedicated account manager',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Growth',
    price: 149,
    description: 'For growing companies hiring 5-10 roles per month',
    features: [
      'Unlimited job postings',
      '200 AI-generated assessments/month',
      'Advanced AI profile matching',
      'AI video interviews',
      'Customizable hiring workflows',
      'Advanced analytics & reporting',
      'Priority support (24h response)',
      'Team collaboration tools',
      'Zapier + Slack integrations',
    ],
    notIncluded: [
      'API access',
      'Custom branding',
      'Dedicated account manager',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Scale',
    price: 499,
    description: 'For enterprises and agencies hiring at scale',
    features: [
      'Everything in Growth',
      'Unlimited assessments',
      'Full API access',
      'Custom branding & white-label',
      'SSO & advanced security',
      'Dedicated account manager',
      'Custom AI model training',
      'Onboarding & migration support',
      'SLA guarantee (99.9% uptime)',
      'Quarterly business reviews',
    ],
    notIncluded: [],
    cta: 'Contact Sales',
    popular: false,
  },
];

const candidateFeatures = [
  'AI Interview Practice (unlimited)',
  'AI Skill Assessments (1/month free)',
  'Job recommendations',
  'Resume builder',
  'Interview feedback & scoring',
  'Progress tracking',
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const discount = billingCycle === 'annual' ? 0.17 : 0; // 17% discount for annual

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-8">
            Free for candidates. Affordable for employers. Scale as you grow.
          </p>
          <TrustBadges variant="compact" className="justify-center" />
        </div>
      </div>

      {/* Free for Candidates Banner */}
      <div className="bg-emerald-50 border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-emerald-800">Always free for job seekers</p>
              <p className="text-sm text-emerald-600">Practice interviews, take assessments, get matched — no credit card required</p>
            </div>
          </div>
          <a href="/register?role=candidate" className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap">
            Get Started Free
          </a>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="max-w-6xl mx-auto px-4 pt-12">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              billingCycle === 'annual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Annual
            <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = Math.round(plan.price * (1 - discount));
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 p-6 flex flex-col ${
                  plan.popular
                    ? 'border-blue-500 shadow-lg shadow-blue-500/10 scale-105 z-10 bg-white'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">${price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  {discount > 0 && (
                    <p className="text-sm text-emerald-600 mt-1">${plan.price * 12 - price * 12} saved annually</p>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Included</p>
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-sm text-gray-700">{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Not included</p>
                      {plan.notIncluded.map((f) => (
                        <div key={f} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-sm text-gray-400">{f}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <button
                  className={`mt-6 w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">No credit card required</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Features */}
      <div className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">For Job Seekers</h2>
          <p className="text-gray-600 mb-8">Everything you need to land your dream job — completely free</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {candidateFeatures.map((f) => (
              <div key={f} className="flex items-center gap-2 bg-white rounded-lg p-3 border border-gray-200">
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-sm text-gray-700 text-left">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes. All paid plans can be cancelled at any time with no penalty. You keep access until the end of your billing period.' },
            { q: 'Is there a free trial for paid plans?', a: 'Yes. Every paid plan includes a 14-day free trial. No credit card required to start.' },
            { q: 'What happens to my data if I cancel?', a: 'Your data remains accessible for 30 days after cancellation, then is securely deleted per our data retention policy. You can export your data anytime.' },
            { q: 'Do you offer discounts for nonprofits or educational institutions?', a: 'Yes. Contact us at sales@rekrutai.co for special pricing for qualifying organizations.' },
            { q: 'Is the candidate side really free forever?', a: 'Yes. Job seekers can practice interviews, take assessments, and get job matches for free — forever. We only charge employers who use our platform to hire.' },
            { q: 'How does the AI matching work?', a: 'Our AI analyzes resumes, assessment scores, and interview performance to create a compatibility score between candidates and job requirements. Scores are explainable and auditable.' },
          ].map((faq) => (
            <details key={faq.q} className="group border border-gray-200 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-900">{faq.q}</span>
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="px-4 pb-4 text-sm text-gray-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
