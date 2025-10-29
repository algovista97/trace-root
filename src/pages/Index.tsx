import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Leaf, Globe, QrCode, Users, CheckCircle } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { FeatureCard } from '@/components/FeatureCard';
import { StakeholderRoles } from '@/components/StakeholderRoles';
import { ProcessFlow } from '@/components/ProcessFlow';

const Index = () => {
  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Blockchain Security",
      description: "Immutable records ensure complete transparency and trust in every transaction"
    },
    {
      icon: <Leaf className="h-6 w-6" />,
      title: "Farm to Fork Tracking",
      description: "Track agricultural produce from harvest to consumer with complete transparency"
    },
    {
      icon: <QrCode className="h-6 w-6" />,
      title: "QR Code Integration",
      description: "Instant access to product history through simple QR code scanning"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Multi-Stakeholder Platform",
      description: "Farmers, distributors, retailers, and consumers all connected in one system"
    }
  ];

  const benefits = [
    "Eliminate food fraud and counterfeiting",
    "Reduce foodborne illness outbreaks",
    "Increase consumer confidence",
    "Enable rapid product recalls",
    "Fair pricing for farmers",
    "Sustainable agriculture practices"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Revolutionary Technology</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Transforming Agricultural Supply Chains
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our blockchain platform ensures complete transparency, traceability, and trust 
              throughout the entire agricultural supply chain journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholder Roles */}
      <StakeholderRoles />

      {/* Process Flow */}
      <ProcessFlow />

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Benefits for Everyone
            </h2>
            <p className="text-lg text-muted-foreground">
              Our platform creates value for every participant in the supply chain
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-growth" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Ready to Transform Your Supply Chain?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the future of agricultural transparency and build trust with your consumers 
            through our blockchain-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-forest hover:bg-forest/90" onClick={() => window.location.href = '/dashboard'}>
              Start Tracking Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.href = '/scanner'}>
              Try QR Scanner
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;