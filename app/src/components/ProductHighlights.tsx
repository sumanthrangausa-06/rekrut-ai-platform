import { Brain, Target, Users, Calendar, BarChart3 } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { TiltCard } from '@/components/ui/TiltCard';

const features = [
  {
    icon: Brain,
    title: 'AI Skill Assessments',
    description: 'Generate role-based tests, auto-grading, and structured feedback for every candidate.',
    status: 'live',
  },
  {
    icon: Target,
    title: 'AI Interview Coaching',
    description: 'Mock interviews with actionable improvement tips to help candidates perform their best.',
    status: 'live',
  },
  {
    icon: Users,
    title: 'Matching & Ranking',
    description: 'Shortlist by skills and signals, not just keywords. Find the right fit faster.',
    status: 'live',
  },
  {
    icon: Calendar,
    title: 'Scheduling & Collaboration',
    description: 'Interview coordination and team notes in one place.',
    status: 'coming',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Pipeline insights and hiring metrics to optimize your process.',
    status: 'coming',
  },
];

export function ProductHighlights() {
  return (
    <section id="product" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-2xl mb-12 md:mb-16">
            <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
              What We're Building
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              One platform for smarter hiring.
            </h2>
            <p className="text-lg text-muted-foreground">
              Rekrut AI combines skill assessments, interview coaching, and intelligent matching to help you hire with confidence.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 100}>
              <TiltCard
                tiltStrength={8}
                className="bg-card border-2 border-foreground p-6 shadow-sm hover:shadow-md transition-all h-full group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-secondary border-2 border-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  {feature.status === 'coming' && (
                    <span className="text-xs font-mono uppercase px-2 py-1 bg-accent border border-foreground/30">
                      Coming Soon
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
