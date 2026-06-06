import { useState, useEffect } from 'react';
import { ArrowDown, Star, TrendingUp, MessageSquare, FileText, Target } from 'lucide-react';
import { AnimatedLoopBackground } from '@/components/ui/AnimatedLoopBackground';
import { KineticText } from '@/components/ui/KineticText';
import { RippleButton } from '@/components/ui/RippleButton';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { TiltCard } from '@/components/ui/TiltCard';

type Persona = 'recruiter' | 'candidate';

export function Hero() {
  const [persona, setPersona] = useState<Persona>('recruiter');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen pt-20 md:pt-24 flex flex-col justify-center overflow-hidden">
      {/* Animated Loop Background */}
      <div className="absolute inset-0 z-0">
        <AnimatedLoopBackground />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Persona Toggle */}
        <div 
          className="flex justify-center mb-8"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s',
          }}
        >
          <div className="inline-flex border-2 border-foreground bg-card p-1 gap-1 shadow-sm">
            <button
              onClick={() => setPersona('recruiter')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                persona === 'recruiter'
                  ? 'bg-foreground text-background scale-[1.02]'
                  : 'hover:bg-secondary'
              }`}
            >
              For Recruiters
            </button>
            <button
              onClick={() => setPersona('candidate')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                persona === 'candidate'
                  ? 'bg-foreground text-background scale-[1.02]'
                  : 'hover:bg-secondary'
              }`}
            >
              For Candidates
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p 
                className="text-sm font-mono uppercase tracking-widest text-muted-foreground"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.6s ease-out 0.3s, transform 0.6s ease-out 0.3s',
                }}
              >
                AI-powered hiring, simplified.
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {mounted && (
                  <KineticText delay={400} stagger={25}>
                    {persona === 'recruiter' ? 'Hire smarter with AI.' : 'Land your next role with AI.'}
                  </KineticText>
                )}
              </h1>
              <p 
                className="text-lg md:text-xl text-muted-foreground max-w-lg"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.8s ease-out 1s, transform 0.8s ease-out 1s',
                }}
              >
                {persona === 'recruiter'
                  ? 'Rekrut AI helps you assess skills, coach candidates, and shortlist the right talent faster—without messy spreadsheets or guesswork.'
                  : 'Rekrut AI helps you optimize your profile, practice interviews, and find roles that match your skills—so you can prepare with confidence.'}
              </p>
            </div>

            <div 
              className="flex flex-col sm:flex-row gap-4"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.8s ease-out 1.2s, transform 0.8s ease-out 1.2s',
              }}
            >
              <RippleButton
                size="lg"
                onClick={() => scrollToSection('#waitlist')}
                className="shadow-md hover:shadow-sm hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-base"
              >
                Join Waitlist
              </RippleButton>
              <MagneticButton
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('#product')}
                className="group shadow-sm hover:shadow-2xs transition-all text-base"
                strength={0.2}
              >
                See What We're Building
                <ArrowDown className="ml-2 h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
              </MagneticButton>
            </div>
          </div>

          {/* Right: Product Preview Mock */}
          <div 
            className="space-y-4"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateX(0)' : 'translateX(40px)',
              transition: 'opacity 0.8s ease-out 0.8s, transform 0.8s ease-out 0.8s',
            }}
          >
            {persona === 'recruiter' ? (
              <>
                {/* Candidate Card */}
                <TiltCard className="bg-card border-2 border-foreground p-6 shadow-md">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">Sarah Chen</h3>
                      <p className="text-sm text-muted-foreground">Senior Frontend Engineer</p>
                    </div>
                    <div className="flex items-center gap-1 bg-secondary px-3 py-1 border border-foreground">
                      <Star className="h-4 w-4" />
                      <span className="font-mono font-bold">92%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-secondary p-3 border border-foreground/30">
                      <p className="text-xs font-mono uppercase text-muted-foreground mb-1">Match Score</p>
                      <p className="text-2xl font-bold">94</p>
                    </div>
                    <div className="bg-secondary p-3 border border-foreground/30">
                      <p className="text-xs font-mono uppercase text-muted-foreground mb-1">Assessment</p>
                      <p className="text-2xl font-bold">88</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-accent text-xs font-medium border border-foreground/30 hover:bg-foreground hover:text-background transition-colors cursor-default">React</span>
                    <span className="px-2 py-1 bg-accent text-xs font-medium border border-foreground/30 hover:bg-foreground hover:text-background transition-colors cursor-default">TypeScript</span>
                    <span className="px-2 py-1 bg-accent text-xs font-medium border border-foreground/30 hover:bg-foreground hover:text-background transition-colors cursor-default">System Design</span>
                  </div>
                </TiltCard>

                {/* Pipeline Preview */}
                <TiltCard tiltStrength={5} className="bg-card border-2 border-foreground p-4 shadow-sm">
                  <p className="text-xs font-mono uppercase text-muted-foreground mb-3">Pipeline Stages</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {['Applied', 'Screening', 'Interview', 'Offer'].map((stage, i) => (
                      <div
                        key={stage}
                        className={`flex-shrink-0 px-4 py-2 text-sm font-medium border-2 transition-all duration-300 hover:scale-105 cursor-default ${
                          i === 1 ? 'bg-foreground text-background border-foreground' : 'border-foreground/30 hover:border-foreground'
                        }`}
                      >
                        {stage}
                      </div>
                    ))}
                  </div>
                </TiltCard>

                {/* AI Feedback Snippet */}
                <TiltCard tiltStrength={5} className="bg-card border-2 border-foreground p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4" />
                    <p className="text-xs font-mono uppercase text-muted-foreground">AI Feedback</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Strong technical depth in React architecture. Recommend follow-up on system design experience for senior role requirements."
                  </p>
                </TiltCard>
              </>
            ) : (
              <>
                {/* Candidate Profile Preview */}
                <TiltCard className="bg-card border-2 border-foreground p-6 shadow-md">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">Your Profile</h3>
                      <p className="text-sm text-muted-foreground">Frontend Engineer</p>
                    </div>
                    <div className="flex items-center gap-1 bg-secondary px-3 py-1 border border-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="font-mono font-bold">Ready</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-secondary p-3 border border-foreground/30">
                      <p className="text-xs font-mono uppercase text-muted-foreground mb-1">Profile Strength</p>
                      <p className="text-2xl font-bold">85%</p>
                    </div>
                    <div className="bg-secondary p-3 border border-foreground/30">
                      <p className="text-xs font-mono uppercase text-muted-foreground mb-1">Practice Sessions</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-accent text-xs font-medium border border-foreground/30 hover:bg-foreground hover:text-background transition-colors cursor-default">React</span>
                    <span className="px-2 py-1 bg-accent text-xs font-medium border border-foreground/30 hover:bg-foreground hover:text-background transition-colors cursor-default">JavaScript</span>
                    <span className="px-2 py-1 bg-accent text-xs font-medium border border-foreground/30 hover:bg-foreground hover:text-background transition-colors cursor-default">CSS</span>
                  </div>
                </TiltCard>

                {/* Job Matches Preview */}
                <TiltCard tiltStrength={5} className="bg-card border-2 border-foreground p-4 shadow-sm">
                  <p className="text-xs font-mono uppercase text-muted-foreground mb-3">Role Matches</p>
                  <div className="space-y-2">
                    {[
                      { role: 'Frontend Engineer', match: 94 },
                      { role: 'React Developer', match: 91 },
                      { role: 'UI Engineer', match: 87 },
                    ].map((job) => (
                      <div 
                        key={job.role} 
                        className="flex items-center justify-between p-2 border border-foreground/30 hover:border-foreground hover:bg-secondary/50 transition-all cursor-default"
                      >
                        <span className="text-sm font-medium">{job.role}</span>
                        <span className="flex items-center gap-1 text-sm font-mono">
                          <Target className="h-3 w-3" />
                          {job.match}%
                        </span>
                      </div>
                    ))}
                  </div>
                </TiltCard>

                {/* AI Interview Feedback */}
                <TiltCard tiltStrength={5} className="bg-card border-2 border-foreground p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4" />
                    <p className="text-xs font-mono uppercase text-muted-foreground">Practice Feedback</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Great explanation of React hooks. Consider adding more context on performance optimization in your next answer."
                  </p>
                </TiltCard>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
