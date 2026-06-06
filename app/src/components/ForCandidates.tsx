import { FileText, MessageSquare, Target, ListTodo } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { TiltCard } from '@/components/ui/TiltCard';

const features = [
  {
    icon: FileText,
    title: 'AI Resume & Profile Optimizer',
    bullets: [
      'Improve your resume for specific roles',
      'ATS-friendly suggestions',
    ],
  },
  {
    icon: MessageSquare,
    title: 'AI Interview Practice',
    bullets: [
      'Role-based mock interviews',
      'Feedback on answers, structure, and clarity',
    ],
  },
  {
    icon: Target,
    title: 'AI Job Matching',
    bullets: [
      'See roles you match based on skills',
      'Understand gaps to improve (planned)',
    ],
  },
  {
    icon: ListTodo,
    title: 'Application Tracker',
    bullets: [
      'Track where you stand in the hiring process (planned)',
    ],
  },
];

export function ForCandidates() {
  return (
    <section id="for-candidates" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-2xl mb-12 md:mb-16">
            <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
              For Candidates
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prepare smarter, land better roles.
            </h2>
            <p className="text-lg text-muted-foreground">
              Rekrut AI helps you improve your readiness, practice with confidence, and find roles that match your skills.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 100}>
              <TiltCard
                tiltStrength={8}
                className="bg-card border-2 border-foreground p-6 shadow-xs hover:shadow-sm transition-all h-full group"
              >
                <div className="p-3 bg-foreground text-background w-fit mb-4 transition-transform group-hover:scale-110">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <ul className="space-y-2">
                  {feature.bullets.map((bullet, bulletIndex) => (
                    <li 
                      key={bulletIndex} 
                      className="text-sm text-muted-foreground flex items-start gap-2"
                      style={{
                        transition: `opacity 0.3s ease-out ${bulletIndex * 100}ms`,
                      }}
                    >
                      <span className="text-foreground mt-1 transition-transform group-hover:translate-x-1">•</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
