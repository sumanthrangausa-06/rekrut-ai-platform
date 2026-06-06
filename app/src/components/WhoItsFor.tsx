import { Building2, User } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { TiltCard } from '@/components/ui/TiltCard';

export function WhoItsFor() {
  return (
    <section id="who-its-for" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-2xl mb-12 md:mb-16">
            <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
              Who It's For
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Built for both sides of the table.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          <ScrollReveal delay={100}>
            <TiltCard tiltStrength={5} className="bg-card border-2 border-foreground p-8 shadow-md h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-foreground text-background">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">Recruiters & Teams</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { bold: 'Faster shortlist', text: 'AI-ranked candidates based on skills, not just resumes' },
                  { bold: 'Consistent evaluation', text: 'structured assessments remove bias and guesswork' },
                  { bold: 'Pipeline clarity', text: 'see where every candidate stands at a glance' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 group">
                    <span className="text-foreground font-bold transition-transform group-hover:translate-x-1">→</span>
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">{item.bold}</strong> — {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </TiltCard>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <TiltCard tiltStrength={5} className="bg-card border-2 border-foreground p-8 shadow-md h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-foreground text-background">
                  <User className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">Candidates</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { bold: 'Practice & prepare', text: 'AI coaching helps you perform your best' },
                  { bold: 'Actionable feedback', text: 'know exactly where to improve' },
                  { bold: 'Better role matches', text: 'get matched to jobs that fit your skills' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 group">
                    <span className="text-foreground font-bold transition-transform group-hover:translate-x-1">→</span>
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">{item.bold}</strong> — {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </TiltCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
