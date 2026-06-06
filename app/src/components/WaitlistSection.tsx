import { WaitlistForm } from './WaitlistForm';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export function WaitlistSection() {
  return (
    <section id="waitlist" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10">
              <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
                Get Early Access
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Get early access to Rekrut AI.
              </h2>
              <p className="text-lg text-muted-foreground">
                Join the waitlist. We'll invite early users as we roll out.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <WaitlistForm />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
