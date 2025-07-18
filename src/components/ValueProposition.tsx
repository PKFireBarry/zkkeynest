"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  Eye, 
  RotateCcw, 
  Share2, 
  Search, 
  CheckCircle, 
  XCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface CompetitorComparison {
  feature: string;
  zkKeynest: string;
  competitors: string;
  advantage: string;
}

const competitorComparisons: CompetitorComparison[] = [
  {
    feature: "API Key Focus",
    zkKeynest: "Built specifically for For Developers",
    competitors: "General password managers",
    advantage: "Specialized features like rotation reminders and copy-paste safety"
  },
  {
    feature: "Developer Workflow",
    zkKeynest: "Copy safe views, one-time shares, drag and drop .env secrets",
    competitors: "Basic password storage",
    advantage: "Designed for how developers actually work with keys"
  },
  {
    feature: "Team Sharing",
    zkKeynest: "Secure encrypted one-time sharing with expiration after its viewed",
    competitors: "Sent via insecure messaging",
    advantage: "One-time access for secure sharing"
  },
  {
    feature: "Pricing",
    zkKeynest: "Free tier or $3/month pro",
    competitors: "$.50/per key to $360/month per month",
    advantage: "Free when you only need to securely store a few secrets, More affordable when you need to manage lots of keys."
  }
];

const developerFeatures = [
  {
    title: "Copy Safe Views",
    description: "Find API keys without accidentally showing them on your screen, even with others watching",
    icon: Eye,
    timesSaved: "You from screen peekers",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950"
  },
  {
    title: "Rotation Reminders",
    description: "Never forget to rotate API keys with customizable reminder schedules",
    icon: RotateCcw,
    timesSaved: "10 min on rotations",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950"
  },
  {
    title: "One-Time Shares",
    description: "Share API keys securely with expiring, encrypted links",
    icon: Share2,
    timesSaved: "5 min per team share",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950"
  },
  {
    title: "Instant Search",
    description: "Find any API key in seconds with powerful search and organization",
    icon: Search,
    timesSaved: "7 min per search session",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950"
  }
];



export default function ValueProposition() {
  return (
    <section id="value-proposition" className="w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center bg-background">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Why Choose zKkeynest Over Alternatives?
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            We're not trying to replace your password manager. We're solving the specific pain points developers face with secure API key management that doesnt require trust.
          </motion.p>
        </div>

        {/* Developer-Specific Features */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">Features Built for Developer Workflows</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {developerFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 flex flex-col">
                  <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${feature.bgColor} mb-4 flex-shrink-0`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h4 className="font-bold text-lg mb-2 flex-shrink-0">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4 flex-grow leading-relaxed">
                      {feature.description}
                    </p>
                    <div className={`text-xs font-medium ${feature.color} bg-muted/50 px-3 py-2 rounded-md text-center flex-shrink-0`}>
                      Saves: {feature.timesSaved}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>


 

        {/* Comparison with Competitors */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">How We Compare</h3>
          
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold text-primary">zKkeynest</th>
                        <th className="text-left p-4 font-semibold text-muted-foreground">Password Managers</th>
                        <th className="text-left p-4 font-semibold">Our Advantage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitorComparisons.map((comparison, index) => (
                        <motion.tr
                          key={comparison.feature}
                          className="border-b last:border-b-0 hover:bg-muted/50"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm">{comparison.zkKeynest}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{comparison.competitors}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-medium text-primary">{comparison.advantage}</span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {competitorComparisons.map((comparison, index) => (
              <motion.div
                key={comparison.feature}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm text-primary mb-3">{comparison.feature}</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">zKkeynest</div>
                          <div className="text-sm">{comparison.zkKeynest}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Others</div>
                          <div className="text-sm text-muted-foreground">{comparison.competitors}</div>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Our Advantage</div>
                        <div className="text-sm font-medium text-primary">{comparison.advantage}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>


      </div>
    </section>
  );
}