"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, Key, DollarSign, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface FAQCategory {
  id: 'security' | 'features' | 'pricing' | 'technical' | 'all';
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  count: number;
}

interface CategoryFilterProps {
  categories: FAQCategory[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categoryConfig: Record<string, Omit<FAQCategory, 'count'>> = {
  all: {
    id: 'all',
    name: 'All Questions',
    icon: () => <div className="w-3.5 h-3.5 rounded-full bg-current" />,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800'
  },
  security: {
    id: 'security',
    name: 'Security',
    icon: Shield,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950'
  },
  features: {
    id: 'features',
    name: 'Features',
    icon: Key,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950'
  },
  pricing: {
    id: 'pricing',
    name: 'Pricing',
    icon: DollarSign,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950'
  },
  technical: {
    id: 'technical',
    name: 'Technical',
    icon: Settings,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950'
  }
};

export default function CategoryFilter({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="w-full mb-8">
      <motion.div
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {categories.map((category, index) => {
          const config = categoryConfig[category.id];
          const IconComponent = config.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <motion.button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                flex-shrink-0 group relative overflow-hidden
                transition-all duration-300 ease-out
                ${isActive 
                  ? 'scale-105 shadow-lg' 
                  : 'hover:scale-102 hover:shadow-md'
                }
              `}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: [0.04, 0.62, 0.23, 0.98]
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Badge 
                variant="secondary" 
                className={`
                  ${isActive 
                    ? `${config.bgColor} ${config.color} ring-2 ring-current ring-opacity-20` 
                    : `${config.bgColor} ${config.color} hover:ring-2 hover:ring-current hover:ring-opacity-10`
                  }
                  border-0 font-semibold text-sm px-4 py-2.5 h-auto
                  transition-all duration-300 ease-out
                  cursor-pointer select-none
                  flex items-center gap-2
                  min-w-fit whitespace-nowrap
                `}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{config.name}</span>
                <span className={`
                  ml-1 px-2 py-0.5 rounded-full text-xs font-bold
                  ${isActive 
                    ? 'bg-current bg-opacity-20 text-current' 
                    : 'bg-current bg-opacity-15 text-current'
                  }
                  transition-all duration-300
                `}>
                  {category.count}
                </span>
              </Badge>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-current opacity-60"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}