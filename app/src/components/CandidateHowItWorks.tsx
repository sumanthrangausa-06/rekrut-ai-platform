import { useState } from 'react';
import { UserPlus, Mic, Send, BarChart3, ChevronDown } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { TiltCard } from '@/components/ui/TiltCard';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Create profile / upload resume',
    description: 'Set up your profile and let AI analyze your skills and experience.',
    details: 'Upload your resume and our AI will extract key skills, experience, and achievements to build a comprehensive profile.',
  },
  {
    icon: Mic,
    number: '02',
    title: 'Practice interviews using AI',
    description: 'Get role-specific mock interviews with actionable feedback on your answers.',
    details: 'Practice with AI-powered mock interviews tailored to your target roles. Receive instant feedback on clarity, structure, and content.',
  },
  {
    icon: Send,
    number: '03',
    title: 'Apply to roles & complete assessments',
    description: 'Apply to matched roles and complete skill assessments to showcase your abilities.',
    details: 'Take skill assessments designed by hiring teams and receive AI coaching to improve your performance.',
  },
  {
    icon: BarChart3,
    number: '04',
    title: 'Track application progress',
    description: 'Stay updated on where you stand in each hiring process.',
    details: 'Monitor your application status, view feedback from recruiters, and track your progress through each stage.',
  },
];

export function CandidateHowItWorks() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="mt-20 md:mt-32">
      <ScrollReveal>
        <div className="max-w-2xl mb-12 md:mb-16">
          <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
            Candidate Flow
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Four steps to landing your next role.
          </h2>
        </div>
      </ScrollReveal>

      {/* Timeline for desktop */}
      <div className="hidden lg:block relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-foreground/20" />
        
        <div className="space-y-6">
          {steps.map((step, index) => (
            <ScrollReveal key={step.number} delay={index * 100}>
              <div
                className="relative pl-20 cursor-pointer group"
                onClick={() => setActiveStep(activeStep === index ? null : index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveStep(activeStep === index ? null : index)}
              >
                {/* Timeline dot */}
                <div 
                  className={cn(
                    "absolute left-4 w-8 h-8 border-2 border-foreground flex items-center justify-center transition-all duration-300",
                    activeStep === index ? "bg-foreground text-background scale-110" : "bg-background group-hover:bg-secondary"
                  )}
                >
                  <span className="text-xs font-mono font-bold">{step.number}</span>
                </div>

                <TiltCard 
                  tiltStrength={3}
                  className={cn(
                    "bg-card border-2 border-foreground p-6 transition-all duration-300",
                    activeStep === index ? "shadow-md" : "shadow-xs group-hover:shadow-sm"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 border border-foreground/30 transition-colors",
                        activeStep === index ? "bg-foreground text-background" : "bg-secondary group-hover:bg-foreground group-hover:text-background"
                      )}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    <ChevronDown 
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-300",
                        activeStep === index && "rotate-180"
                      )} 
                    />
                  </div>
                  
                  {/* Expanded content */}
                  <div 
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      activeStep === index ? "max-h-40 mt-4 pt-4 border-t border-foreground/20" : "max-h-0"
                    )}
                  >
                    <p className="text-sm text-muted-foreground">{step.details}</p>
                  </div>
                </TiltCard>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Card grid for mobile/tablet */}
      <div className="lg:hidden grid md:grid-cols-2 gap-6">
        {steps.map((step, index) => (
          <ScrollReveal key={step.number} delay={index * 100}>
            <div className="relative">
              <TiltCard 
                tiltStrength={5}
                className="bg-card border-2 border-foreground p-6 h-full shadow-xs hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-foreground text-background">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-3xl font-bold text-muted-foreground/30">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </TiltCard>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
