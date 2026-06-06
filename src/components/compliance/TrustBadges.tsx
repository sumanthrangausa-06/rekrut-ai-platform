import React from 'react';

/**
 * TrustBadges - Display compliance and security trust badges
 * Place this component near signup CTAs, registration forms, and pricing sections
 * to increase conversion by demonstrating legal compliance and security
 */

const badges = [
  {
    label: 'GDPR Ready',
    status: 'ready',
    tooltip: 'Fully compliant with EU General Data Protection Regulation',
  },
  {
    label: 'SOC 2',
    status: 'progress',
    tooltip: 'SOC 2 Type II certification in progress (Expected Q1 2027)',
  },
  {
    label: 'EU AI Act Aligned',
    status: 'ready',
    tooltip: 'Aligned with EU AI Act requirements for high-risk AI systems',
  },
  {
    label: 'CCPA Compliant',
    status: 'ready',
    tooltip: 'Compliant with California Consumer Privacy Act',
  },
  {
    label: '256-bit AES Encryption',
    status: 'ready',
    tooltip: 'All data encrypted at rest and in transit with TLS 1.3',
  },
  {
    label: 'Human-in-the-Loop AI',
    status: 'ready',
    tooltip: 'AI decisions are explainable and include human review options',
  },
];

const statusStyles: Record<string, { dot: string; bg: string; text: string }> = {
  ready: {
    dot: 'bg-emerald-400',
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
  },
  progress: {
    dot: 'bg-amber-400',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
  },
};

interface TrustBadgesProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function TrustBadges({ variant = 'compact', className = '' }: TrustBadgesProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
        {badges.map((badge) => (
          <div
            key={badge.label}
            title={badge.tooltip}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusStyles[badge.status].bg} ${statusStyles[badge.status].text} cursor-help transition-all hover:shadow-sm`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyles[badge.status].dot}`} />
            {badge.label}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${className}`}>
      {badges.map((badge) => (
        <div
          key={badge.label}
          className={`flex items-start gap-3 p-3 rounded-lg border ${statusStyles[badge.status].bg} transition-all hover:shadow-md`}
        >
          <div className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusStyles[badge.status].dot}`} />
          <div>
            <p className={`text-sm font-semibold ${statusStyles[badge.status].text}`}>
              {badge.label}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">{badge.tooltip}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TrustBadges;
