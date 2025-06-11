'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FadeIn } from '@/components/animations/fade-in';
import { SlideIn } from '@/components/animations/slide-in';
import { 
  Plus, 
  Search, 
  Eye, 
  EyeOff, 
  Copy, 
  Edit, 
  Trash2, 
  Globe,
  Key,
  Calendar,
  Tag,
  Check,
  Shield,
  Download,
  Upload,
  Shuffle,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { 
  VaultItem, 
  getVault, 
  addVaultItem, 
  updateVaultItem, 
  deleteVaultItem, 
  generatePassword,
  PasswordGeneratorOptions,
  exportVault,
  importVault
} from '@/lib/vault';
import { isAuthenticated } from '@/lib/auth';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DashboardPage() {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<VaultItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedPasswords, setCopiedPasswords] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPasswordGeneratorOpen, setIsPasswordGeneratorOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStrategy, setImportStrategy] = useState<'merge' | 'replace'>('merge');
  const router = useRouter();

  // Form state for adding/editing items
  const [formData, setFormData] = useState({
    site: '',
    username: '',
    password: '',
    notes: '',
    tags: '',
  });

  // Password generator options
  const [passwordOptions, setPasswordOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    includeSpecialChars: true,
    includeNumbers: true,
    includeUppercase: true,
    includeLowercase: true,
  });

  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/signin');
      return;
    }
    loadVault();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, vaultItems]);

  const loadVault = async () => {
    try {
      setIsLoading(true);
      setError('');
      const items = await getVault();
      setVaultItems(items);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load vault';
      setError(errorMessage);
      console.error('Load vault error:', error);
      
      // If vault key is missing, redirect to signin
      if (errorMessage.includes('Vault key not available')) {
        toast.error('Session expired. Please sign in again.');
        router.push('/auth/signin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    if (!searchQuery) {
      setFilteredItems(vaultItems);
      return;
    }

    const filtered = vaultItems.filter(item =>
      item.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );
    setFilteredItems(filtered);
  };

  const togglePasswordVisibility = (id: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisiblePasswords(newVisible);
  };

  const copyPassword = async (password: string, id: string) => {
    try {
      await navigator.clipboard.writeText(password);
      const newCopied = new Set(copiedPasswords);
      newCopied.add(id);
      setCopiedPasswords(newCopied);
      toast.success('Password copied to clipboard');
      setTimeout(() => {
        setCopiedPasswords(prev => {
          const updated = new Set(prev);
          updated.delete(id);
          return updated;
        });
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy password');
    }
  };

  const handleAddItem = async () => {
  if (!formData.site || !formData.username || !formData.password) {
    toast.error('Please fill in all required fields');
    return;
  }

  setIsProcessing(true);

  const newItem: VaultItem = {
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    site: formData.site,
    username: formData.username,
    password: formData.password,
    notes: formData.notes,
    tags: formData.tags
      ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [],
    createdAt: new Date().toISOString(),
  };

  try {
    const updatedVault = await addVaultItem(newItem);

    setVaultItems(updatedVault);

    setIsAddModalOpen(false);
    resetForm();
    toast.success('Password saved successfully');
    
  } catch (error) {
    console.error('Add item error:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to save password');
    
    try {
      await loadVault();
    } catch (reloadError) {
      console.error('Failed to reload vault after error:', reloadError);
    }
  } finally {
    setIsProcessing(false);
  }
};

  const handleEditItem = async () => {
    if (!editingItem || !formData.site || !formData.username || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    const updatedItem: VaultItem = {
      ...editingItem,
      site: formData.site,
      username: formData.username,
      password: formData.password,
      notes: formData.notes,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
    };

    try {
      const updatedItems = await updateVaultItem(updatedItem);
      setVaultItems(updatedItems);
      setEditingItem(null);
      resetForm();
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Update item error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this password?')) {
      return;
    }

    setIsProcessing(true);
    try {
      const updatedItems = await deleteVaultItem(id);
      setVaultItems(updatedItems);
      toast.success('Password deleted successfully');
    } catch (error) {
      console.error('Delete item error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete password');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      site: '',
      username: '',
      password: '',
      notes: '',
      tags: '',
    });
    setGeneratedPassword('');
  };

  const openEditModal = (item: VaultItem) => {
    setEditingItem(item);
    setFormData({
      site: item.site,
      username: item.username,
      password: item.password,
      notes: item.notes || '',
      tags: item.tags?.join(', ') || '',
    });
  };

  const handleGeneratePassword = () => {
    try {
      const password = generatePassword(passwordOptions);
      setGeneratedPassword(password);
      setFormData(prev => ({ ...prev, password }));
      toast.success('Password generated successfully');
    } catch (error) {
      toast.error('Failed to generate password');
    }
  };

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      const exportData = await exportVault();
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `cryptlock-vault-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Vault exported successfully (decrypted for your use)');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export vault');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);
        
        // Check if it's a valid export format
        if (importData.data && Array.isArray(importData.data)) {
          // This is a decrypted export file
          const itemsToImport: VaultItem[] = importData.data;
          
          // Validate structure
          for (const item of itemsToImport) {
            if (!item.id || !item.site || !item.username || !item.password || !item.createdAt) {
              throw new Error('Invalid file format: missing required fields');
            }
          }
          
          await importVault(itemsToImport, importStrategy);
          
          const action = importStrategy === 'replace' ? 'replaced' : 'merged';
          toast.success(`Vault ${action} successfully! ${itemsToImport.length} items imported.`);
        } else {
          throw new Error('Invalid file format');
        }
        
        // Reload vault after import
        await loadVault();
        setIsImportModalOpen(false);
      } catch (error) {
        console.error('Import error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to import vault - please check file format');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    event.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <FadeIn>
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                Your Vault
              </h1>
              <p className="text-muted-foreground">
                Manage your passwords securely ({vaultItems.length} items)
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={isProcessing || vaultItems.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={isProcessing}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Vault</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Only import JSON files exported from CryptLock. This will decrypt and process your passwords locally.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <Label htmlFor="import-strategy">Import Strategy</Label>
                      <Select value={importStrategy} onValueChange={(value: 'merge' | 'replace') => setImportStrategy(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="merge">Merge with existing vault (recommended)</SelectItem>
                          <SelectItem value="replace">Replace entire vault</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {importStrategy === 'merge' 
                          ? 'New passwords will be added to your existing vault. Duplicates (same ID) will be skipped.'
                          : 'Your entire vault will be replaced with the imported data. This cannot be undone.'
                        }
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="import-file">Select File</Label>
                      <Input
                        id="import-file"
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        disabled={isProcessing}
                      />
                    </div>
                    
                    {isProcessing && (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm">Processing import...</span>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button disabled={isProcessing}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Password</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="site">Website/Service *</Label>
                      <Input
                        id="site"
                        placeholder="e.g., gmail.com"
                        value={formData.site}
                        onChange={(e) => setFormData({...formData, site: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username/Email *</Label>
                      <Input
                        id="username"
                        placeholder="e.g., user@example.com"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password *</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsPasswordGeneratorOpen(true)}
                        >
                          <Shuffle className="h-4 w-4 mr-1" />
                          Generate
                        </Button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Optional notes..."
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        placeholder="e.g., work, personal, social (comma-separated)"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddModalOpen(false);
                          resetForm();
                        }}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddItem}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          'Save Password'
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search passwords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Vault Items */}
        <div className="space-y-4">
          {filteredItems.length === 0 && !isLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No passwords found' : 'Your vault is empty'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Add your first password to get started'
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Password
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {filteredItems.map((item, index) => (
            <SlideIn key={item.id} delay={index *1}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                        <h3 className="font-semibold truncate">{item.site}</h3>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Key className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Username:</span>
                          <span className="font-mono">{item.username}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Key className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Password:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">
                              {visiblePasswords.has(item.id) ? item.password : '••••••••'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePasswordVisibility(item.id)}
                              className="h-6 w-6 p-0"
                            >
                              {visiblePasswords.has(item.id) ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyPassword(item.password, item.id)}
                              className="h-6 w-6 p-0"
                            >
                              {copiedPasswords.has(item.id) ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {item.notes && (
                          <div className="flex items-start gap-2">
                            <Tag className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <span className="text-muted-foreground">Notes:</span>
                            <span className="break-words">{item.notes}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Created: {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(item)}
                        disabled={isProcessing}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={isProcessing}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          ))}
        </div>

        {/* Edit Modal */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-site">Website/Service *</Label>
                <Input
                  id="edit-site"
                  placeholder="e.g., gmail.com"
                  value={formData.site}
                  onChange={(e) => setFormData({...formData, site: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username/Email *</Label>
                <Input
                  id="edit-username"
                  placeholder="e.g., user@example.com"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-password">Password *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPasswordGeneratorOpen(true)}
                  >
                    <Shuffle className="h-4 w-4 mr-1" />
                    Generate
                  </Button>
                </div>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Optional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags</Label>
                <Input
                  id="edit-tags"
                  placeholder="e.g., work, personal, social (comma-separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingItem(null);
                    resetForm();
                  }}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditItem}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Password Generator Modal */}
        <Dialog open={isPasswordGeneratorOpen} onOpenChange={setIsPasswordGeneratorOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Password Generator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Length: {passwordOptions.length}</Label>
                <Slider
                  value={[passwordOptions.length]}
                  onValueChange={(value) => setPasswordOptions({...passwordOptions, length: value[0]})}
                  min={8}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={passwordOptions.includeUppercase}
                    onCheckedChange={(checked) => 
                      setPasswordOptions({...passwordOptions, includeUppercase: !!checked})
                    }
                  />
                  <Label htmlFor="uppercase">Include uppercase letters (A-Z)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={passwordOptions.includeLowercase}
                    onCheckedChange={(checked) => 
                      setPasswordOptions({...passwordOptions, includeLowercase: !!checked})
                    }
                  />
                  <Label htmlFor="lowercase">Include lowercase letters (a-z)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbers"
                    checked={passwordOptions.includeNumbers}
                    onCheckedChange={(checked) => 
                      setPasswordOptions({...passwordOptions, includeNumbers: !!checked})
                    }
                  />
                  <Label htmlFor="numbers">Include numbers (0-9)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="special"
                    checked={passwordOptions.includeSpecialChars}
                    onCheckedChange={(checked) => 
                      setPasswordOptions({...passwordOptions, includeSpecialChars: !!checked})
                    }
                  />
                  <Label htmlFor="special">Include special characters (!@#$%^&*)</Label>
                </div>
              </div>
              
              {generatedPassword && (
                <div className="space-y-2">
                  <Label>Generated Password</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedPassword}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPassword(generatedPassword, 'generated')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsPasswordGeneratorOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGeneratePassword}
                  className="flex-1"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Generate Password
                </Button>
                {generatedPassword && (
                  <Button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, password: generatedPassword }));
                      setIsPasswordGeneratorOpen(false);
                      toast.success('Password applied to form');
                    }}
                    className="flex-1"
                  >
                    Use Password
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </FadeIn>
    </div>
  );
}