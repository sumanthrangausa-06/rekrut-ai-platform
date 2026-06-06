import { Circle, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const roadmapItems = [
  { title: 'AI Skill Assessments', description: 'Role-based tests with auto-grading', status: 'done' },
  { title: 'AI Interview Coaching', description: 'Mock interviews + improvement tips', status: 'done' },
  { title: 'Matching & Ranking', description: 'Skills-based candidate shortlisting', status: 'done' },
  { title: 'Recruiter Dashboard', description: 'Pipeline analytics and team insights', status: 'in-progress' },
  { title: 'Automated Interview Scheduling', description: 'Calendar sync + smart scheduling', status: 'planned' },
  { title: 'Candidate Ranking Explanations', description: 'Transparent "why this candidate" insights', status: 'planned' },
  { title: 'Document Verification', description: 'ID and credential verification', status: 'planned' },
  { title: 'Onboarding Support', description: 'Seamless post-hire transition', status: 'planned' },
];

export function Roadmap() {
  return (
    <section id="roadmap" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-2xl mb-12 md:mb-16">
            <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">Roadmap</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Where we're headed.</h2>
            <p className="text-muted-foreground">We're building in the open. Here's what's live, in progress, and planned.</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-4">
          {roadmapItems.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 50}>
              <div
                className={`flex items-start gap-4 p-4 border-2 transition-all hover:shadow-sm ${
                  item.status === 'done' ? 'border-foreground bg-card' :
                  item.status === 'in-progress' ? 'border-foreground bg-secondary' : 'border-foreground/30 bg-card hover:border-foreground'
                }`}
              >
                <div className="flex-shrink-0 pt-0.5">
                  {item.status === 'done' ? <CheckCircle2 className="h-5 w-5" /> : <Circle className={`h-5 w-5 ${item.status === 'in-progress' ? '' : 'text-muted-foreground'}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold">{item.title}</h3>
                    {item.status === 'in-progress' && <span className="text-xs font-mono uppercase px-2 py-0.5 bg-foreground text-background">In Progress</span>}
                    {item.status === 'planned' && <span className="text-xs font-mono uppercase px-2 py-0.5 bg-accent border border-foreground/30">Planned</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground italic">* Roadmap is evolving based on user feedback and priorities.</p>
      </div>
    </section>
  );
}
