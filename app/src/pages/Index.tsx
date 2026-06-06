import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductHighlights } from '@/components/ProductHighlights';
import { HowItWorks } from '@/components/HowItWorks';
import { ForCandidates } from '@/components/ForCandidates';
import { CandidateHowItWorks } from '@/components/CandidateHowItWorks';
import { WhoItsFor } from '@/components/WhoItsFor';
import { Roadmap } from '@/components/Roadmap';
import { WaitlistSection } from '@/components/WaitlistSection';
import { Footer } from '@/components/Footer';
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <ProductHighlights />
        <HowItWorks />
        <ForCandidates />
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <CandidateHowItWorks />
          </div>
        </section>
        <WhoItsFor />
        <Roadmap />
        <WaitlistSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
