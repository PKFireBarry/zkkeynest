'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Download, 
  GitBranch, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Lock,
  Users,
  CheckCircle
} from 'lucide-react';

interface AssurancePoint {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'commitment' | 'portability' | 'transparency';
  details?: string[];
}

interface FAQItem {
  question: string;
  answer: string;
  details?: string[];
}

interface LongevityAssuranceProps {
  className?: string;
}

const LongevityAssurance: React.FC<LongevityAssuranceProps> = ({ className = '' }) => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const assurancePoints: AssurancePoint[] = [
    {
      id: 'commitment',
      title: 'Long-term Commitment',
      description: 'Built for the long haul with sustainable development practices',
      icon: <Clock className="h-6 w-6" />,
      type: 'commitment',
      details: [
        'Sustainable business model focused on developer productivity',
        'Regular security updates and feature improvements',
        'Dedicated team committed to maintaining service quality',
        'Clear roadmap with community input and feedback'
      ]
    },
    {
      id: 'portability',
      title: 'Data Portability',
      description: 'Your data remains accessible with full export capabilities',
      icon: <Download className="h-6 w-6" />,
      type: 'portability',
      details: [
        'Encrypted export functionality built into the platform',
        'Standard JSON format for easy data migration',
        'No vendor lock-in - your keys, your control',
        'Compatible with other key management solutions'
      ]
    },
    {
      id: 'transparency',
      title: 'Open Development',
      description: 'Transparent development with future open-source considerations',
      icon: <GitBranch className="h-6 w-6" />,
      type: 'transparency',
      details: [
        'Public roadmap and development updates',
        'Community feedback integration',
        'Considering open-source format specification',
        'Clear communication about service changes'
      ]
    }
  ];

  const faqItems: FAQItem[] = [
    {
      question: "What if ZK Key Nest shuts down?",
      answer: "We've built multiple safeguards to protect your data even in worst-case scenarios.",
      details: [
        "30-day advance notice minimum for any service discontinuation",
      ]
    },
    {
      question: "What's your commitment to maintaining this service?",
      answer: "ZK Key Nest is built as a sustainable, long-term solution for developers.",
      details: [
        "Sustainable pricing model that supports ongoing development",
        "Dedicated team focused on developer productivity tools",
        "Community-driven feature development and feedback integration"
      ]
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const getTypeColor = (type: AssurancePoint['type']) => {
    switch (type) {
      case 'commitment':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'portability':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'transparency':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <section className={`py-16 px-4 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built to Last
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We understand your concerns about investing in a new tool. Here's our commitment 
            to your long-term success and data security.
          </p>
        </motion.div>



        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            Common Concerns Addressed
          </h3>
          <div className="max-w-4xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.question}</CardTitle>
                    {expandedFAQ === index ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <AnimatePresence>
                  {expandedFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="pt-0">
                        <p className="text-muted-foreground mb-4">{item.answer}</p>
                        {item.details && (
                          <ul className="space-y-2">
                            {item.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LongevityAssurance;