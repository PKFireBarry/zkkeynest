'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { ApiKey, Folder } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FolderPlus, Search, X, ChevronDown, ChevronUp, Filter, FolderOpen } from 'lucide-react';
import { getFolders, getApiKeys, updateApiKeyFolder, updateFolder, createFolder, deleteFolder, deleteApiKey } from '@/lib/database';
import DroppableFolder from './DroppableFolder';
import NoFolderDropZone from './NoFolderDropZone';
import DraggableApiKeyCard from './DraggableApiKeyCard';
import MobileApiKeyCard from './MobileApiKeyCard';
import { useToast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';
import ConfirmationModal from './ConfirmationModal';

interface FolderDragAndDropProps {
    onRefresh?: () => void;
}

export default function FolderDragAndDrop({ onRefresh }: FolderDragAndDropProps) {
    const { user } = useUser();
    const { toast } = useToast();

    const [folders, setFolders] = useState<Folder[]>([]);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editingFolderName, setEditingFolderName] = useState('');
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [draggingApiKey, setDraggingApiKey] = useState<ApiKey | null>(null);
    const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
    const [openDialogId, setOpenDialogId] = useState<string | null>(null);
    const [decryptedKeys, setDecryptedKeys] = useState<Record<string, string>>({});
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<ApiKey[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
    const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
    const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    // Detect mobile view
    useEffect(() => {
        const checkMobile = () => {
            const isMobile = window.innerWidth < 768;
            setIsMobileView(isMobile);
            // Auto-collapse filters on mobile by default
            if (isMobile && !isFiltersCollapsed) {
                setIsFiltersCollapsed(true);
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [isFiltersCollapsed]);

    // Load folders and API keys
    const loadData = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            const [userFolders, userApiKeys] = await Promise.all([
                getFolders(user.id),
                getApiKeys(user.id)
            ]);

            setFolders(userFolders);
            setApiKeys(userApiKeys);
        } catch (error) {
            console.error('Error loading data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load folders and API keys',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    // Folder management handlers
    const handleCreateFolder = async () => {
        if (!user || !newFolderName.trim()) return;

        try {
            const folderId = await createFolder({ userId: user.id, name: newFolderName.trim() });
            const now = new Date();
            setFolders([
                ...folders,
                {
                    id: folderId,
                    userId: user.id,
                    name: newFolderName.trim(),
                    createdAt: now as any,
                    updatedAt: now as any,
                },
            ]);
            setNewFolderName('');
            setShowNewFolderInput(false);

            toast({
                title: 'Folder created',
                description: `Folder "${newFolderName.trim()}" has been created successfully.`
            });

            onRefresh?.();
        } catch (error) {
            console.error('Error creating folder:', error);
            toast({
                title: 'Error',
                description: 'Failed to create folder',
                variant: 'destructive'
            });
        }
    };

    const handleEditFolder = (folder: Folder) => {
        setEditingFolderId(folder.id);
        setEditingFolderName(folder.name);
    };

    const handleUpdateFolder = async () => {
        if (!editingFolderId || !editingFolderName.trim()) return;

        try {
            await updateFolder(editingFolderId, { name: editingFolderName.trim() });
            setFolders(folders.map(f =>
                f.id === editingFolderId ? { ...f, name: editingFolderName.trim() } : f
            ));

            toast({
                title: 'Folder updated',
                description: `Folder has been renamed to "${editingFolderName.trim()}".`
            });

            onRefresh?.();
        } catch (error) {
            console.error('Error updating folder:', error);
            toast({
                title: 'Error',
                description: 'Failed to update folder',
                variant: 'destructive'
            });
        } finally {
            setEditingFolderId(null);
            setEditingFolderName('');
        }
    };

    const handleDeleteFolder = (folderId: string) => {
        const folder = folders.find(f => f.id === folderId);
        if (folder) {
            setFolderToDelete(folder);
            setShowDeleteFolderModal(true);
        }
    };

    const handleConfirmDeleteFolder = async () => {
        if (!folderToDelete) return;

        try {
            await deleteFolder(folderToDelete.id);
            setFolders(folders.filter(f => f.id !== folderToDelete.id));
            // Update local API keys state to reflect the change
            setApiKeys(apiKeys.map(key =>
                key.folderId === folderToDelete.id ? { ...key, folderId: undefined } : key
            ));

            toast({
                title: 'Folder deleted',
                description: 'Folder has been deleted and all API keys have been moved to "No Folder".'
            });

            onRefresh?.();
        } catch (error) {
            console.error('Error deleting folder:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete folder',
                variant: 'destructive'
            });
        } finally {
            setShowDeleteFolderModal(false);
            setFolderToDelete(null);
        }
    };

    // Drag and drop handlers - disabled on mobile
    const handleDragStart = (apiKey: ApiKey) => {
        if (isMobileView) return; // Disable drag on mobile
        setDraggingApiKey(apiKey);
    };

    const handleDragEnd = () => {
        setDraggingApiKey(null);
        setDragOverFolderId(null);
    };

    const handleDrop = async (folderId: string | null) => {
        if (!draggingApiKey || isMobileView) return; // Disable drop on mobile

        try {
            // Update the API key's folder
            await updateApiKeyFolder(draggingApiKey.id, folderId);

            // Update local state - fix TypeScript error by ensuring the type is correct
            setApiKeys(apiKeys.map(key => {
                if (key.id === draggingApiKey.id) {
                    return {
                        ...key,
                        folderId: folderId as string | undefined // Convert null to undefined if needed
                    };
                }
                return key;
            }));

            toast({
                title: 'API key moved',
                description: `API key "${draggingApiKey.label}" has been moved to ${folderId ? `"${folders.find(f => f.id === folderId)?.name}"` : '"No Folder"'}.`
            });

            onRefresh?.();
        } catch (error) {
            console.error('Error moving API key:', error);
            toast({
                title: 'Error',
                description: 'Failed to move API key',
                variant: 'destructive'
            });
        }
    };

    // Handle touch drop events - disabled on mobile
    useEffect(() => {
        if (isMobileView) return; // Disable touch drop on mobile
        
        const handleTouchDrop = (e: CustomEvent) => {
            const { apiKey, folderId } = e.detail;
            if (apiKey && draggingApiKey && apiKey.id === draggingApiKey.id) {
                handleDrop(folderId);
            }
        };

        window.addEventListener('touch-drop', handleTouchDrop as EventListener);
        return () => window.removeEventListener('touch-drop', handleTouchDrop as EventListener);
    }, [draggingApiKey, handleDrop, isMobileView]);

    // View API key handler
    const handleViewApiKey = (apiKey: ApiKey) => {
        // We'll just open the dialog for now - actual decryption would be handled by the dialog content
        setOpenDialogId(apiKey.id);
    };

    const handleShareApiKey = () => {
        // Share functionality would be implemented here
    };

    const handleDeleteApiKey = (id: string) => {
        const apiKey = apiKeys.find(k => k.id === id);
        if (apiKey) {
            setKeyToDelete(apiKey);
            setShowDeleteModal(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (!keyToDelete) return;

        try {
            await deleteApiKey(keyToDelete.id);
            setApiKeys(apiKeys.filter(k => k.id !== keyToDelete.id));

            toast({
                title: 'API key deleted',
                description: 'API key has been deleted successfully.'
            });

            onRefresh?.();
        } catch (error) {
            console.error('Error deleting API key:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete API key',
                variant: 'destructive'
            });
        } finally {
            setShowDeleteModal(false);
            setKeyToDelete(null);
        }
    };

    // Helper functions
    const getApiKeyCountByFolder = (folderId: string | null) => {
        return apiKeys.filter(key => key.folderId === folderId).length;
    };

    const getApiKeysInFolder = (folderId: string | null) => {
        return apiKeys.filter(key => key.folderId === folderId);
    };

    // Handle folder click to open/close
    const handleFolderClick = (folderId: string | null) => {
        if (selectedFolderId === folderId) {
            // If clicking the already selected folder, deselect it
            setSelectedFolderId(null);
        } else {
            // Otherwise select the clicked folder
            setSelectedFolderId(folderId);
        }
        
        // On mobile, auto-collapse the filters after selecting a folder
        if (isMobileView && !isFiltersCollapsed) {
            setIsFiltersCollapsed(true);
        }
    };
    
    // Search functionality
    const filteredApiKeys = useMemo(() => {
        if (!searchTerm.trim()) {
            setIsSearching(false);
            return [];
        }
        
        setIsSearching(true);
        const searchLower = searchTerm.toLowerCase();
        
        return apiKeys.filter(key => 
            key.label.toLowerCase().includes(searchLower) ||
            key.service.toLowerCase().includes(searchLower) ||
            key.email?.toLowerCase().includes(searchLower) ||
            key.notes?.toLowerCase().includes(searchLower)
        );
    }, [apiKeys, searchTerm]);
    
    // Get folder name for an API key
    const getFolderName = (apiKey: ApiKey) => {
        if (!apiKey.folderId) return "Unsorted";
        const folder = folders.find(f => f.id === apiKey.folderId);
        return folder ? folder.name : "Unknown Folder";
    };

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading folders and API keys...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full min-w-0">
            <Card className="w-full overflow-hidden">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Folder Management
                            </CardTitle>
                            <CardDescription>
                                {isMobileView ? 'Organize your API keys by selecting folders' : 'Organize your API keys by dragging and dropping them into folders'}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                
                {/* Mobile Summary - Always visible on mobile */}
                {isMobileView && (
                    <CardContent className="pt-0">
                        <div className="flex items-center justify-between bg-muted/30 rounded-md p-3">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                <span>{folders.length} folders</span>
                                <span>•</span>
                                <span>{apiKeys.length} API keys</span>
                                {selectedFolderId && (
                                    <>
                                        <span>•</span>
                                        <span className="text-primary font-medium truncate max-w-[100px]">
                                            {selectedFolderId === 'no-folder' ? 'Unsorted' : folders.find(f => f.id === selectedFolderId)?.name} selected
                                        </span>
                                    </>
                                )}
                            </div>
                            {selectedFolderId && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedFolderId(null)}
                                    className="h-6 w-6 p-0 text-xs"
                                    title="Clear selection"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                )}
                
                {/* Mobile Folder Selection - Always visible on mobile */}
                {isMobileView && (
                    <CardContent>
                        <div className="mb-4">
                            <h3 className="text-sm font-medium mb-2">Select Folder:</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {/* All Keys Option */}
                                <Button
                                    variant={selectedFolderId === null ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleFolderClick(null)}
                                    className="justify-start h-10 text-xs"
                                >
                                    <FolderOpen className="h-3 w-3 mr-1" />
                                    All ({apiKeys.length})
                                </Button>
                                
                                {/* Unsorted Keys Option */}
                                <Button
                                    variant={selectedFolderId === 'no-folder' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleFolderClick('no-folder')}
                                    className="justify-start h-10 text-xs"
                                >
                                    <FolderOpen className="h-3 w-3 mr-1" />
                                    Unsorted ({getApiKeyCountByFolder(null)})
                                </Button>
                                
                                {/* Individual Folders */}
                                {folders.map(folder => (
                                    <Button
                                        key={folder.id}
                                        variant={selectedFolderId === folder.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleFolderClick(folder.id)}
                                        className="justify-start h-10 text-xs"
                                    >
                                        <FolderOpen className="h-3 w-3 mr-1" />
                                        {folder.name} ({getApiKeyCountByFolder(folder.id)})
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                )}
                
                <div className={`transition-all duration-300 ease-in-out ${isMobileView && isFiltersCollapsed ? 'h-0 overflow-hidden' : 'h-auto'}`}>
                    {(!isMobileView || !isFiltersCollapsed) && (
                        <CardContent>
                    {/* Search Bar */}
                    <div className="relative mb-4 sm:mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search API keys..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 text-sm sm:text-base"
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

                    {/* Create new folder */}
                    {showNewFolderInput ? (
                        <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
                            <Input
                                placeholder="New folder name"
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                className="flex-1 text-sm sm:text-base"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleCreateFolder}
                                    disabled={!newFolderName.trim()}
                                    size="sm"
                                    className="flex-1 sm:flex-none"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowNewFolderInput(false)}
                                    size="sm"
                                    className="flex-1 sm:flex-none"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => setShowNewFolderInput(true)}
                            className="mb-4 sm:mb-6 w-full sm:w-auto"
                            size="sm"
                        >
                            <FolderPlus className="h-4 w-4 mr-2" />
                            New Folder
                        </Button>
                    )}

                    {/* Desktop Folders grid */}
                    {!isMobileView && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                            {/* No Folder drop zone */}
                            <div
                                onClick={() => handleFolderClick('no-folder')}
                                className={`cursor-pointer transition-all ${selectedFolderId === 'no-folder' ? 'ring-2 ring-primary shadow-lg' : ''}`}
                                title="Click to view unfiled API keys"
                            >
                                <NoFolderDropZone
                                    apiKeyCount={getApiKeyCountByFolder(null)}
                                    isOver={dragOverFolderId === 'no-folder'}
                                    onDrop={() => handleDrop(null)}
                                />
                                {selectedFolderId === 'no-folder' && (
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
                                )}
                            </div>

                            {/* Folders */}
                            {folders.map(folder => (
                                <div
                                    key={folder.id}
                                    onClick={() => !editingFolderId && handleFolderClick(folder.id)}
                                    className={`cursor-pointer transition-all relative ${selectedFolderId === folder.id ? 'ring-2 ring-primary shadow-lg' : ''}`}
                                    title="Click to view folder contents"
                                >
                                    <DroppableFolder
                                        folder={folder}
                                        apiKeyCount={getApiKeyCountByFolder(folder.id)}
                                        isOver={dragOverFolderId === folder.id}
                                        onEdit={handleEditFolder}
                                        onDelete={handleDeleteFolder}
                                        onDrop={() => handleDrop(folder.id)}
                                        isEditing={editingFolderId === folder.id}
                                        editName={editingFolderName}
                                        onEditNameChange={setEditingFolderName}
                                        onSaveEdit={handleUpdateFolder}
                                        onCancelEdit={() => setEditingFolderId(null)}
                                    />
                                    {selectedFolderId === folder.id && (
                                        <div className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Search Results */}
                    {searchTerm.trim() !== '' && (
                        <div className="mb-6 sm:mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                                <div>
                                    <h3 className="text-base sm:text-lg font-medium">Search Results</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        {filteredApiKeys.length} API keys found
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                                    Clear Search
                                </Button>
                            </div>

                            <div className="space-y-2 border rounded-md p-3 sm:p-4 bg-muted/20">
                                {filteredApiKeys.length > 0 ? (
                                    filteredApiKeys.map(apiKey => (
                                        <div key={apiKey.id} className="relative">
                                            {/* Folder badge */}
                                            <div className="absolute -top-2 -right-2 z-10">
                                                <Badge 
                                                    className="bg-primary text-primary-foreground hover:bg-primary/80"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFolderClick(apiKey.folderId || 'no-folder');
                                                    }}
                                                >
                                                    {getFolderName(apiKey)}
                                                </Badge>
                                            </div>
                                            {isMobileView ? (
                                                <MobileApiKeyCard
                                                    apiKey={apiKey}
                                                    folders={folders}
                                                    onView={handleViewApiKey}
                                                    onShare={handleShareApiKey}
                                                    onDelete={handleDeleteApiKey}
                                                    openDialogId={openDialogId}
                                                    setOpenDialogId={setOpenDialogId}
                                                    onRefresh={onRefresh}
                                                />
                                            ) : (
                                                <DraggableApiKeyCard
                                                    apiKey={apiKey}
                                                    folders={folders}
                                                    isDragging={draggingApiKey?.id === apiKey.id}
                                                    onView={handleViewApiKey}
                                                    onShare={handleShareApiKey}
                                                    onDelete={handleDeleteApiKey}
                                                    onDragStart={handleDragStart}
                                                    onDragEnd={handleDragEnd}
                                                    openDialogId={openDialogId}
                                                    setOpenDialogId={setOpenDialogId}
                                                    onRefresh={onRefresh}
                                                    isMobileView={isMobileView}
                                                />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No API keys match your search
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Selected Folder Content - only shown when not searching */}
                    {searchTerm.trim() === '' && selectedFolderId !== null && (
                        <div className="mb-6 sm:mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                                <div>
                                    <h3 className="text-base sm:text-lg font-medium">
                                        {selectedFolderId === 'no-folder'
                                            ? 'Unsorted API Keys'
                                            : `Folder: ${folders.find(f => f.id === selectedFolderId)?.name}`}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        {getApiKeysInFolder(selectedFolderId === 'no-folder' ? null : selectedFolderId).length} API keys
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setSelectedFolderId(null)}>
                                    Close Folder
                                </Button>
                            </div>

                            <div className="space-y-2 border rounded-md p-3 sm:p-4 bg-muted/20">
                                {getApiKeysInFolder(selectedFolderId === 'no-folder' ? null : selectedFolderId).length > 0 ? (
                                    getApiKeysInFolder(selectedFolderId === 'no-folder' ? null : selectedFolderId).map(apiKey => (
                                        isMobileView ? (
                                            <MobileApiKeyCard
                                                key={apiKey.id}
                                                apiKey={apiKey}
                                                folders={folders}
                                                onView={handleViewApiKey}
                                                onShare={handleShareApiKey}
                                                onDelete={handleDeleteApiKey}
                                                openDialogId={openDialogId}
                                                setOpenDialogId={setOpenDialogId}
                                                onRefresh={onRefresh}
                                            />
                                        ) : (
                                            <DraggableApiKeyCard
                                                key={apiKey.id}
                                                apiKey={apiKey}
                                                folders={folders}
                                                isDragging={draggingApiKey?.id === apiKey.id}
                                                onView={handleViewApiKey}
                                                onShare={handleShareApiKey}
                                                onDelete={handleDeleteApiKey}
                                                onDragStart={handleDragStart}
                                                onDragEnd={handleDragEnd}
                                                openDialogId={openDialogId}
                                                setOpenDialogId={setOpenDialogId}
                                                onRefresh={onRefresh}
                                                isMobileView={isMobileView}
                                            />
                                        )
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No API keys in this folder
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* All API Keys section - only shown when no folder is selected and not searching */}
                    {searchTerm.trim() === '' && selectedFolderId === null && (
                        <div className="space-y-2">
                            <h3 className="text-base sm:text-lg font-medium">All API Keys</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                                {isMobileView ? 'Select a folder above to view specific keys' : 'Drag and drop these API keys into folders to organize them'}
                            </p>

                            <div className="space-y-2">
                                {apiKeys.length > 0 ? (
                                    apiKeys.map(apiKey => (
                                        isMobileView ? (
                                            <MobileApiKeyCard
                                                key={apiKey.id}
                                                apiKey={apiKey}
                                                folders={folders}
                                                onView={handleViewApiKey}
                                                onShare={handleShareApiKey}
                                                onDelete={handleDeleteApiKey}
                                                openDialogId={openDialogId}
                                                setOpenDialogId={setOpenDialogId}
                                                onRefresh={onRefresh}
                                            />
                                        ) : (
                                            <DraggableApiKeyCard
                                                key={apiKey.id}
                                                apiKey={apiKey}
                                                folders={folders}
                                                isDragging={draggingApiKey?.id === apiKey.id}
                                                onView={handleViewApiKey}
                                                onShare={handleShareApiKey}
                                                onDelete={handleDeleteApiKey}
                                                onDragStart={handleDragStart}
                                                onDragEnd={handleDragEnd}
                                                openDialogId={openDialogId}
                                                setOpenDialogId={setOpenDialogId}
                                                onRefresh={onRefresh}
                                                isMobileView={isMobileView}
                                            />
                                        )
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground border rounded-md">
                                        No API keys found. Add your first API key to get started.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    </CardContent>
                    )}
                </div>
                
                {/* Mobile API Key Content - Always visible on mobile */}
                {isMobileView && (
                    <CardContent>
                        {/* Search Results */}
                        {searchTerm.trim() !== '' && (
                            <div className="mb-6 sm:mb-8">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                                    <div>
                                        <h3 className="text-base sm:text-lg font-medium">Search Results</h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            {filteredApiKeys.length} API keys found
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                                        Clear Search
                                    </Button>
                                </div>

                                <div className="space-y-2 border rounded-md p-3 sm:p-4 bg-muted/20">
                                    {filteredApiKeys.length > 0 ? (
                                        filteredApiKeys.map(apiKey => (
                                            <div key={apiKey.id} className="relative">
                                                {/* Folder badge */}
                                                <div className="absolute -top-2 -right-2 z-10">
                                                    <Badge 
                                                        className="bg-primary text-primary-foreground hover:bg-primary/80"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFolderClick(apiKey.folderId || 'no-folder');
                                                        }}
                                                    >
                                                        {getFolderName(apiKey)}
                                                    </Badge>
                                                </div>
                                                <MobileApiKeyCard
                                                    apiKey={apiKey}
                                                    folders={folders}
                                                    onView={handleViewApiKey}
                                                    onShare={handleShareApiKey}
                                                    onDelete={handleDeleteApiKey}
                                                    openDialogId={openDialogId}
                                                    setOpenDialogId={setOpenDialogId}
                                                    onRefresh={onRefresh}
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No API keys match your search
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Selected Folder Content - only shown when not searching */}
                        {searchTerm.trim() === '' && selectedFolderId !== null && (
                            <div className="mb-6 sm:mb-8">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                                    <div>
                                        <h3 className="text-base sm:text-lg font-medium">
                                            {selectedFolderId === 'no-folder'
                                                ? 'Unsorted API Keys'
                                                : `Folder: ${folders.find(f => f.id === selectedFolderId)?.name}`}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            {getApiKeysInFolder(selectedFolderId === 'no-folder' ? null : selectedFolderId).length} API keys
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setSelectedFolderId(null)}>
                                        Close Folder
                                    </Button>
                                </div>

                                <div className="space-y-2 border rounded-md p-3 sm:p-4 bg-muted/20">
                                    {getApiKeysInFolder(selectedFolderId === 'no-folder' ? null : selectedFolderId).length > 0 ? (
                                        getApiKeysInFolder(selectedFolderId === 'no-folder' ? null : selectedFolderId).map(apiKey => (
                                            <MobileApiKeyCard
                                                key={apiKey.id}
                                                apiKey={apiKey}
                                                folders={folders}
                                                onView={handleViewApiKey}
                                                onShare={handleShareApiKey}
                                                onDelete={handleDeleteApiKey}
                                                openDialogId={openDialogId}
                                                setOpenDialogId={setOpenDialogId}
                                                onRefresh={onRefresh}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No API keys in this folder
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* All API Keys section - only shown when no folder is selected and not searching */}
                        {searchTerm.trim() === '' && selectedFolderId === null && (
                            <div className="space-y-2">
                                <h3 className="text-base sm:text-lg font-medium">All API Keys</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                                    Select a folder above to view specific keys
                                </p>

                                <div className="space-y-2">
                                    {apiKeys.length > 0 ? (
                                        apiKeys.map(apiKey => (
                                            <MobileApiKeyCard
                                                key={apiKey.id}
                                                apiKey={apiKey}
                                                folders={folders}
                                                onView={handleViewApiKey}
                                                onShare={handleShareApiKey}
                                                onDelete={handleDeleteApiKey}
                                                openDialogId={openDialogId}
                                                setOpenDialogId={setOpenDialogId}
                                                onRefresh={onRefresh}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground border rounded-md">
                                            No API keys found. Add your first API key to get started.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Delete API Key"
                description={`Are you sure you want to delete "${keyToDelete?.label}"? This action cannot be undone.`}
            />

            <ConfirmationModal
                isOpen={showDeleteFolderModal}
                onClose={() => setShowDeleteFolderModal(false)}
                onConfirm={handleConfirmDeleteFolder}
                title="Delete Folder"
                description={`Are you sure you want to delete "${folderToDelete?.name}"? All API keys in this folder will be moved to "No Folder".`}
            />
        </div>
    );
}