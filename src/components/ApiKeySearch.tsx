'use client';

import { useState, useMemo, useEffect } from 'react';
import { ApiKey, Folder } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getFolders } from '@/lib/database';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

interface ApiKeySearchProps {
  apiKeys: ApiKey[];
  onFilteredKeysChange: (filteredKeys: ApiKey[]) => void;
}

export default function ApiKeySearch({ apiKeys, onFilteredKeysChange }: ApiKeySearchProps) {
  const { hasAdvancedSearch, hasTagsAndCategories, hasFolderOrganization } = useSubscription();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedEmail, setSelectedEmail] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Get unique services and emails for filter options
  const services = useMemo(() => {
    const uniqueServices = [...new Set(apiKeys.map(key => key.service))].sort();
    return uniqueServices;
  }, [apiKeys]);

  const emails = useMemo(() => {
    const uniqueEmails = [...new Set(apiKeys.map(key => key.email).filter(Boolean))].sort();
    return uniqueEmails;
  }, [apiKeys]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(apiKeys.map(key => key.category).filter(Boolean))].sort();
    return uniqueCategories;
  }, [apiKeys]);

  const tags = useMemo(() => {
    const allTags = apiKeys.flatMap(key => key.tags || []);
    return [...new Set(allTags)].sort();
  }, [apiKeys]);

  // Load folders for filter
  useEffect(() => {
    (async () => {
      const userId = apiKeys[0]?.userId;
      if (userId) {
        const userFolders = await getFolders(userId);
        setFolders(userFolders);
      }
    })();
  }, [apiKeys]);

  // Filter API keys based on search term and filters
  const filteredKeys = useMemo(() => {
    return apiKeys.filter(key => {
      // Search term filter (case-insensitive)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        key.label.toLowerCase().includes(searchLower) ||
        key.service.toLowerCase().includes(searchLower) ||
        key.email?.toLowerCase().includes(searchLower) ||
        key.notes?.toLowerCase().includes(searchLower);

      // Service filter
      const matchesService = selectedService === 'all' || key.service === selectedService;

      // Email filter
      const matchesEmail = selectedEmail === 'all' || key.email === selectedEmail;

      // Category filter
      const matchesCategory = selectedCategory === 'all' || key.category === selectedCategory;

      // Folder filter
      const matchesFolder = selectedFolderId === 'all' || key.folderId === selectedFolderId;

      // Tag filter
      const matchesTag = selectedTag === 'all' || (key.tags && key.tags.includes(selectedTag));

      return matchesSearch && matchesService && matchesEmail && matchesCategory && matchesFolder && matchesTag;
    });
  }, [apiKeys, searchTerm, selectedService, selectedEmail, selectedCategory, selectedFolderId, selectedTag]);

  // Update parent component with filtered keys
  useEffect(() => {
    onFilteredKeysChange(filteredKeys);
  }, [filteredKeys, onFilteredKeysChange]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedService('all');
    setSelectedEmail('all');
    setSelectedCategory('all');
    setSelectedFolderId('all');
    setSelectedTag('all');
  };

  const hasActiveFilters = searchTerm !== '' || selectedService !== 'all' || selectedEmail !== 'all' || selectedCategory !== 'all' || selectedFolderId !== 'all' || selectedTag !== 'all';

  // Count active filters for badge display
  const activeFilterCount = [
    searchTerm !== '',
    selectedService !== 'all',
    selectedEmail !== 'all',
    selectedCategory !== 'all',
    selectedFolderId !== 'all',
    selectedTag !== 'all'
  ].filter(Boolean).length;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search API keys by label, service, email, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
              {isFiltersExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Collapsible Filters */}
          <div className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isFiltersExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="space-y-4 pt-2">
              {/* Filter Grid - Responsive Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Service Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Service</label>
                  <Select value={selectedService && selectedService.trim() !== '' ? selectedService : 'all'} onValueChange={setSelectedService}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All Services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {services.length > 0 && services
                        .map(service => {
                          if (!service || typeof service !== 'string' || service.trim() === '') return null;
                          return <SelectItem key={service} value={service}>{service}</SelectItem>;
                        })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Email Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Select value={selectedEmail && selectedEmail.trim() !== '' ? selectedEmail : 'all'} onValueChange={setSelectedEmail}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All Emails" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Emails</SelectItem>
                      {emails.length > 0 && emails
                        .map(email => {
                          if (!email || typeof email !== 'string' || email.trim() === '') return null;
                          return <SelectItem key={email} value={email}>{email}</SelectItem>;
                        })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter - Pro Feature */}
                {hasTagsAndCategories && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category</label>
                    <Select value={selectedCategory && selectedCategory.trim() !== '' ? selectedCategory : 'all'} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.length > 0 && categories
                          .map(category => {
                            if (!category || typeof category !== 'string' || category.trim() === '') return null;
                            return <SelectItem key={category} value={category}>{category}</SelectItem>;
                          })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Folder Filter - Pro Feature */}
                {hasFolderOrganization && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Folder</label>
                    <Select value={selectedFolderId && selectedFolderId.trim() !== '' ? selectedFolderId : 'all'} onValueChange={setSelectedFolderId}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Folders" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Folders</SelectItem>
                        {folders.length > 0 && folders
                          .map(folder => {
                            if (!folder || typeof folder.id !== 'string' || folder.id.trim() === '') return null;
                            return <SelectItem key={folder.id} value={folder.id}>{folder.name && folder.name.trim() !== '' ? folder.name : 'Unnamed Folder'}</SelectItem>;
                          })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Tag Filter - Pro Feature */}
                {hasTagsAndCategories && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tag</label>
                    <Select value={selectedTag && selectedTag.trim() !== '' ? selectedTag : 'all'} onValueChange={setSelectedTag}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Tags" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tags</SelectItem>
                        {tags.length > 0 && tags
                          .map(tag => {
                            if (!tag || typeof tag !== 'string' || tag.trim() === '') return null;
                            return <SelectItem key={tag} value={tag}>{tag}</SelectItem>;
                          })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredKeys.length} of {apiKeys.length} API keys
            </span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                Filtered
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 