'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  Lock,
  FileText,
  Globe,
  Building
} from 'lucide-react';

interface ComplianceStandard {
  id: string;
  name: string;
  fullName: string;
  description: string;
  status: 'compliant' | 'working-toward' | 'planned';
  icon: React.ReactNode;
  details: string[];
  timeline?: string;
}

interface ComplianceSectionProps {
  className?: string;
}

const complianceStandards: ComplianceStandard[] = [
  {
    id: 'gdpr',
    name: 'GDPR',
    fullName: 'General Data Protection Regulation',
    description: 'EU data protection and privacy regulation compliance',
    status: 'compliant',
    icon: <Globe className="h-5 w-5" />,
    details: [
      'Data minimization: We only collect essential account information',
      'Right to erasure: Complete account deletion available',
      'Data portability: Export your encrypted data anytime',
      'Privacy by design: Zero-knowledge architecture ensures we cannot access your keys',
      'Transparent privacy policy with clear data handling practices'
    ]
  },
  {
    id: 'ccpa',
    name: 'CCPA',
    fullName: 'California Consumer Privacy Act',
    description: 'California privacy rights and data protection compliance',
    status: 'compliant',
    icon: <Shield className="h-5 w-5" />,
    details: [
      'Right to know: Clear disclosure of data collection practices',
      'Right to delete: Complete data deletion upon request',
      'Right to opt-out: No sale of personal information (we don\'t sell data)',
      'Non-discrimination: Equal service regardless of privacy choices',
      'Secure data handling with encryption at rest and in transit'
    ]
  },
  {
    id: 'soc2',
    name: 'SOC 2',
    fullName: 'Service Organization Control 2',
    description: 'Security, availability, and confidentiality controls audit',
    status: 'working-toward',
    icon: <Building className="h-5 w-5" />,
    timeline: 'Q4 2025',
    details: [
      'Security: Multi-layered security controls and monitoring',
      'Availability: 99.9% uptime SLA with redundant infrastructure',
      'Confidentiality: Zero-knowledge encryption protects all data',
      'Processing integrity: Automated testing and validation processes',
      'Privacy: Comprehensive privacy controls and data handling procedures'
    ]
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    fullName: 'ISO/IEC 27001',
    description: 'International information security management standard',
    status: 'planned',
    icon: <Lock className="h-5 w-5" />,
    timeline: 'Q4 2025',
    details: [
      'Information Security Management System (ISMS) implementation',
      'Risk assessment and management procedures',
      'Security incident response and management',
      'Regular security audits and continuous improvement',
      'Employee security training and awareness programs'
    ]
  }
];

const getStatusBadge = (status: ComplianceStandard['status']) => {
  switch (status) {
    case 'compliant':
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Compliant
        </Badge>
      );
    case 'working-toward':
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    case 'planned':
      return (
        <Badge variant="outline" className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300">
          <Calendar className="h-3 w-3 mr-1" />
          Planned
        </Badge>
      );
  }
};

export default function ComplianceSection({ className = '' }: ComplianceSectionProps) {
  const [expandedStandards, setExpandedStandards] = useState<Set<string>>(new Set());

  const toggleExpanded = (standardId: string) => {
    const newExpanded = new Set(expandedStandards);
    if (newExpanded.has(standardId)) {
      newExpanded.delete(standardId);
    } else {
      newExpanded.add(standardId);
    }
    setExpandedStandards(newExpanded);
  };

  return (
    <section id="compliance" className={`py-16 px-4 sm:px-6 lg:px-8 scroll-mt-20 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
            Enterprise-Ready Compliance
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Built with enterprise security and compliance requirements in mind. 
            We maintain the highest standards for data protection and regulatory alignment.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {complianceStandards.map((standard, index) => (
            <motion.div
              key={standard.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        {standard.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold">
                          {standard.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                          {standard.fullName}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(standard.status)}
                  </div>
                  
                  {standard.timeline && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Target: {standard.timeline}
                      </span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {standard.description}
                  </p>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(standard.id)}
                    className="w-full justify-between p-2 h-auto"
                  >
                    <span className="text-sm font-medium">
                      {expandedStandards.has(standard.id) ? 'Hide Details' : 'View Details'}
                    </span>
                    {expandedStandards.has(standard.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {expandedStandards.has(standard.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                      <ul className="space-y-2">
                        {standard.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {detail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Additional Security Measures
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3 text-sm">
                <div className="text-center">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="font-medium text-blue-900 dark:text-blue-100">PCI DSS Compliant Payments</p>
                  <p className="text-blue-700 dark:text-blue-300">Stripe handles all payment processing</p>
                </div>
                <div className="text-center">
                  <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="font-medium text-blue-900 dark:text-blue-100">Zero-Knowledge Architecture</p>
                  <p className="text-blue-700 dark:text-blue-300">We cannot access your encrypted data</p>
                </div>
                <div className="text-center">
                  <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="font-medium text-blue-900 dark:text-blue-100">Transparent Privacy Policy</p>
                  <p className="text-blue-700 dark:text-blue-300">Clear data handling practices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}