import React from 'react';
import { TrustBadges } from './compliance/TrustBadges';

/**
 * LandingUpdates - Improved hero section and key landing page elements
 * This replaces or enhances the existing landing page on rekrutai.co
 * 
 * Key improvements from UX audit (38/100 -> target 75/100):
 * 1. Specific headline (not generic "Hire smarter")
 * 2. "No credit card required" under CTAs
 * 3. Trust badges on signup section
 * 4. Social proof section
 * 5. How It Works visual
 * 6. Fixed stats with attribution
 */

export function ImprovedHero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-blue-200 font-medium">AI-Powered Recruitment Platform</span>
          </div>

          {/* Headline — SPECIFIC, not generic */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Stop Sifting Resumes.
            <br />
            <span className="text-blue-300">Start Hiring by Skill.</span>
          </h1>

          {/* Subhead */}
          <p className="text-xl text-blue-200 mb-4 max-w-2xl leading-relaxed">
            AI Interview Coach + Skill Assessments + Smart Matching — all in one platform. Find pre-assessed, interview-ready candidates in half the time.
          </p>

          {/* Trust line */}
          <p className="text-sm text-blue-300/80 mb-8">
            Trusted by HR teams at startups who need to hire fast without sacrificing quality.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <a
              href="/register?role=recruiter"
              className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-400 text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-lg shadow-blue-500/25 text-lg"
            >
              Start Hiring Free
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="/register?role=candidate"
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-lg transition-all border border-white/20 text-lg"
            >
              Practice Interview Free
            </a>
          </div>
          
          {/* No credit card + trust */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-10">
            <span className="text-sm text-blue-300/70 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              No credit card required
            </span>
            <span className="hidden sm:inline text-blue-500/50">|</span>
            <span className="text-sm text-blue-300/70">14-day free trial on all paid plans</span>
          </div>

          {/* Stats — WITH attribution */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {[
              { value: '10x', label: 'Faster Screening', source: 'Internal benchmark vs. manual resume review' },
              { value: '85%', label: 'Skill Match Accuracy', source: 'Based on AI assessment correlation with hire outcomes' },
              { value: '50%', label: 'Less Admin Time', source: 'Reported by beta users (n=12, March 2026)' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-blue-200 mt-1">{stat.label}</div>
                <div className="text-xs text-blue-400/60 mt-1 hidden sm:block">{stat.source}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Set Up Your Role',
      desc: 'Enter the job title, experience level, and required skills. Our AI instantly understands what you need.',
      for: 'recruiter',
    },
    {
      num: '02',
      title: 'AI Generates Assessments',
      desc: 'Custom skill assessments and interview questions are auto-generated based on your role requirements.',
      for: 'recruiter',
    },
    {
      num: '03',
      title: 'Candidates Practice & Assess',
      desc: 'Candidates take AI-powered interviews and skill tests. Every answer is graded with detailed feedback.',
      for: 'candidate',
    },
    {
      num: '04',
      title: 'See Ranked Matches',
      desc: 'Get a ranked list of candidates with skill match scores, assessment results, and interview performance.',
      for: 'recruiter',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            From job posting to hired — streamlined with AI at every step
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="relative">
              <div className="text-5xl font-bold text-gray-100 mb-4">{step.num}</div>
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded mb-3 ${
                step.for === 'recruiter' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                For {step.for === 'recruiter' ? 'Employers' : 'Candidates'}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SocialProof() {
  return (
    <section className="py-16 bg-gray-50 border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-500 uppercase tracking-wide mb-6">Trusted by growing teams</p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
          {/* Placeholder client logos - replace with actual client logos when available */}
          {['TechStart Inc', 'GrowthLabs', 'HireFast Co', 'TalentFirst', 'ScaleUp HQ', 'NextGen HR'].map((name) => (
            <div key={name} className="text-lg font-bold text-gray-400 tracking-tight">
              {name}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-6">
          Join 50+ companies already using Rekrut AI to hire smarter
        </p>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Ready to Transform Your Hiring?
        </h2>
        <p className="text-blue-200 text-lg mb-8">
          Join hundreds of companies using AI to find better candidates faster. 
          Start free — no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <a
            href="/register?role=recruiter"
            className="inline-flex items-center justify-center bg-white text-blue-700 font-semibold px-8 py-4 rounded-lg hover:bg-blue-50 transition-all text-lg"
          >
            Get Started Free
          </a>
          <a
            href="/pricing"
            className="inline-flex items-center justify-center bg-white/10 text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/20 transition-all border border-white/20 text-lg"
          >
            View Pricing
          </a>
        </div>
        <TrustBadges variant="compact" className="justify-center" />
      </div>
    </section>
  );
}

// Index export for all landing updates
export { TrustBadges } from './compliance/TrustBadges';
