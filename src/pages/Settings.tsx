import React, { useState, useMemo } from 'react';
import { useAppState } from '../hooks/useAppState';
import { Card, Button, Badge, Modal, ConfirmModal } from '../components/UI';
import { 
  Settings as SettingsIcon, 
  Users, 
  Tag, 
  MapPin, 
  Store, 
  Bell, 
  Shield, 
  ChevronRight, 
  ChevronDown,
  Plus, 
  Trash2, 
  Edit2,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  CheckSquare,
  Square,
  RefreshCw
} from 'lucide-react';
import { MasterDataItem, MasterDataType, AppState } from '../types';

interface TreeItemProps {
  item: MasterDataItem;
  childrenItems: MasterDataItem[];
  allData: MasterDataItem[];
  level: number;
  onEdit: (item: MasterDataItem) => void;
  onDelete: (item: MasterDataItem) => void;
}

const TreeItem: React.FC<TreeItemProps & { inventory: any[] }> = ({ item, childrenItems, allData, level, onEdit, onDelete, inventory }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = childrenItems.length > 0;

  const getCategoryIds = (catId: string): string[] => {
    const ids = [catId];
    const children = allData.filter(m => m.parentId === catId);
    children.forEach(child => {
      ids.push(...getCategoryIds(child.id));
    });
    return ids;
  };

  const calculateBudget = (currentItem: MasterDataItem): number => {
    const allCatIds = getCategoryIds(currentItem.id);
    return inventory
      .filter(i => (allCatIds.includes(i.categoryId) || allCatIds.includes(i.subCategoryId || '') || allCatIds.includes(i.subSubCategoryId || '')))
      .reduce((sum, i) => sum + (i.costPrice || 0), 0);
  };

  const displayBudget = item.type === 'Category' ? calculateBudget(item) : null;

  return (
    <div className="space-y-2">
      <Card 
        className={`p-4 bg-white border-none shadow-sm rounded-[24px] flex items-center justify-between group transition-all ${
          level > 0 ? 'ml-8 border-l-2 border-gray-100' : ''
        }`}
      >
        <div className="flex items-center gap-3 flex-1">
          {hasChildren ? (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-6" />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-[#0A192F] tracking-tight">{item.name}</h4>
              {displayBudget !== null && (
                <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                  Budget: {displayBudget.toLocaleString()}
                </span>
              )}
            </div>
            {level === 0 && (
              <p className="text-[10px] text-gray-300 uppercase font-black tracking-widest">Main Category</p>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(item)}
            className="p-2 hover:bg-gray-50 rounded-xl text-gray-300 hover:text-teal-600 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={() => onDelete(item)}
            className="p-2 hover:bg-red-50 rounded-xl text-gray-300 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </Card>
      
      {isExpanded && hasChildren && (
        <div className="space-y-2">
          {childrenItems.map(child => (
            <TreeItem 
              key={child.id}
              item={child}
              childrenItems={allData.filter(m => m.parentId === child.id)}
              allData={allData}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              inventory={inventory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ResetDataView: React.FC<{ state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }> = ({ state, setState }) => {
  const [selectedMasterDataIds, setSelectedMasterDataIds] = useState<string[]>([]);
  const [selectedMasterDataTypes, setSelectedMasterDataTypes] = useState<MasterDataType[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const masterDataTypes: { id: MasterDataType; label: string }[] = [
    { id: 'Category', label: 'Categories' },
    { id: 'Location', label: 'Locations' },
    { id: 'TaskCategory', label: 'Task Categories' },
    { id: 'SourceStore', label: 'Source Stores' },
    { id: 'HouseholdMember', label: 'Household Members' },
  ];

  const features = [
    { id: 'Stock', label: 'Stock Items' },
    { id: 'Shop', label: 'Shop Items' },
    { id: 'Task', label: 'Task Items' },
  ];

  const toggleMasterDataType = (type: MasterDataType) => {
    const isSelected = selectedMasterDataTypes.includes(type);
    const itemsOfType = state.masterData.filter(m => m.type === type).map(m => m.id);
    
    if (isSelected) {
      setSelectedMasterDataTypes(prev => prev.filter(t => t !== type));
      setSelectedMasterDataIds(prev => prev.filter(id => !itemsOfType.includes(id)));
    } else {
      setSelectedMasterDataTypes(prev => [...prev, type]);
      setSelectedMasterDataIds(prev => Array.from(new Set([...prev, ...itemsOfType])));
    }
  };

  const toggleMasterDataItem = (id: string) => {
    const getChildrenIds = (parentId: string): string[] => {
      const children = state.masterData.filter(m => m.parentId === parentId);
      return [parentId, ...children.flatMap(c => getChildrenIds(c.id))];
    };
    const allRelatedIds = getChildrenIds(id);
    const isSelected = selectedMasterDataIds.includes(id);

    if (isSelected) {
      setSelectedMasterDataIds(prev => prev.filter(i => !allRelatedIds.includes(i)));
    } else {
      setSelectedMasterDataIds(prev => Array.from(new Set([...prev, ...allRelatedIds])));
    }
  };

  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleAllMasterData = () => {
    if (selectedMasterDataTypes.length === masterDataTypes.length) {
      setSelectedMasterDataTypes([]);
      setSelectedMasterDataIds([]);
    } else {
      setSelectedMasterDataTypes(masterDataTypes.map(t => t.id));
      setSelectedMasterDataIds(state.masterData.map(m => m.id));
    }
  };

  const handleAllFeatures = () => {
    if (selectedFeatures.length === features.length) {
      setSelectedFeatures([]);
    } else {
      setSelectedFeatures(features.map(f => f.id));
    }
  };

  const handleReset = () => {
    setState(prev => {
      let next = { ...prev };

      const allSelectedIds = new Set(selectedMasterDataIds);
      selectedMasterDataTypes.forEach(type => {
        prev.masterData.filter(m => m.type === type).forEach(m => allSelectedIds.add(m.id));
      });

      if (selectedFeatures.includes('Stock')) {
        if (allSelectedIds.size > 0) {
          next.inventory = next.inventory.filter(item => 
            !allSelectedIds.has(item.categoryId) && 
            !allSelectedIds.has(item.subCategoryId || '') && 
            !allSelectedIds.has(item.subSubCategoryId || '') &&
            !allSelectedIds.has(item.locationId) &&
            !allSelectedIds.has(item.subLocationId || '') &&
            !allSelectedIds.has(item.subSubLocationId || '') &&
            !allSelectedIds.has(item.sourceStoreId || '') &&
            !allSelectedIds.has(item.subSourceStoreId || '') &&
            !allSelectedIds.has(item.subSubSourceStoreId || '')
          );
        } else {
          next.inventory = [];
        }
      }

      if (selectedFeatures.includes('Shop')) {
        if (allSelectedIds.size > 0) {
          next.groceryList = next.groceryList.filter(item => 
            !allSelectedIds.has(item.categoryId) &&
            !allSelectedIds.has(item.subCategoryId || '') &&
            !allSelectedIds.has(item.subSubCategoryId || '') &&
            !allSelectedIds.has(item.sourceStoreId || '') &&
            !allSelectedIds.has(item.subSourceStoreId || '') &&
            !allSelectedIds.has(item.subSubSourceStoreId || '')
          );
          next.purchaseHistory = next.purchaseHistory.filter(item => 
            !allSelectedIds.has(item.categoryId) &&
            !allSelectedIds.has(item.subCategoryId || '') &&
            !allSelectedIds.has(item.subSubCategoryId || '') &&
            !allSelectedIds.has(item.sourceStoreId || '') &&
            !allSelectedIds.has(item.subSourceStoreId || '') &&
            !allSelectedIds.has(item.subSubSourceStoreId || '')
          );
        } else {
          next.groceryList = [];
          next.purchaseHistory = [];
        }
      }

      if (selectedFeatures.includes('Task')) {
        if (allSelectedIds.size > 0) {
          next.tasks = next.tasks.filter(task => 
            !allSelectedIds.has(task.categoryId) &&
            !allSelectedIds.has(task.assigneeId || '')
          );
        } else {
          next.tasks = [];
        }
      }

      if (allSelectedIds.size > 0 && selectedFeatures.length === 0) {
        next.masterData = next.masterData.filter(m => !allSelectedIds.has(m.id));
      }

      return next;
    });

    setSelectedMasterDataIds([]);
    setSelectedMasterDataTypes([]);
    setSelectedFeatures([]);
    setIsConfirmOpen(false);
  };

  const renderMasterDataTree = (type: MasterDataType) => {
    const rootItems = state.masterData.filter(m => m.type === type && !m.parentId);
    
    const renderNode = (item: MasterDataItem, level: number) => {
      const children = state.masterData.filter(m => m.parentId === item.id);
      const isSelected = selectedMasterDataIds.includes(item.id);
      
      return (
        <div key={item.id} className="space-y-1">
          <div 
            className={`flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${level > 0 ? 'ml-6' : ''}`}
            onClick={() => toggleMasterDataItem(item.id)}
          >
            {isSelected ? <CheckSquare size={14} className="text-teal-600" /> : <Square size={14} className="text-gray-300" />}
            <span className={`text-xs font-bold ${isSelected ? 'text-[#0A192F]' : 'text-gray-400'}`}>{item.name}</span>
          </div>
          {children.map(child => renderNode(child, level + 1))}
        </div>
      );
    };

    return (
      <div className="space-y-2 mt-2 pl-4 border-l-2 border-gray-50">
        {rootItems.map(item => renderNode(item, 0))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <Card className="p-8 bg-white border-none shadow-sm rounded-[32px] space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <Trash2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#0A192F] uppercase tracking-widest">Reset Application Data</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selectively clear your household data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Master Data</h4>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div 
                className="flex items-center gap-2 p-3 bg-gray-100 rounded-2xl cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={handleAllMasterData}
              >
                {selectedMasterDataTypes.length === masterDataTypes.length ? <CheckSquare size={16} className="text-teal-600" /> : <Square size={16} className="text-gray-300" />}
                <span className="text-xs font-black text-[#0A192F] uppercase tracking-widest">All Master Data</span>
              </div>
              {masterDataTypes.map(type => (
                <div key={type.id} className="space-y-1">
                  <div 
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleMasterDataType(type.id)}
                  >
                    {selectedMasterDataTypes.includes(type.id) ? <CheckSquare size={16} className="text-teal-600" /> : <Square size={16} className="text-gray-300" />}
                    <span className="text-xs font-black text-[#0A192F] uppercase tracking-widest">{type.label}</span>
                  </div>
                  {renderMasterDataTree(type.id)}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Features</h4>
            </div>
            <div className="space-y-3">
              <div 
                className="flex items-center gap-3 p-4 bg-gray-100 rounded-2xl cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={handleAllFeatures}
              >
                {selectedFeatures.length === features.length ? <CheckSquare size={18} className="text-teal-600" /> : <Square size={18} className="text-gray-300" />}
                <span className="text-xs font-black text-[#0A192F] uppercase tracking-widest">All Features</span>
              </div>
              {features.map(feature => (
                <div 
                  key={feature.id}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleFeature(feature.id)}
                >
                  {selectedFeatures.includes(feature.id) ? <CheckSquare size={18} className="text-teal-600" /> : <Square size={18} className="text-gray-300" />}
                  <span className="text-xs font-black text-[#0A192F] uppercase tracking-widest">{feature.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-amber-50 rounded-[24px] border border-amber-100 space-y-3">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Smart Reset Logic</span>
              </div>
              <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-wider">
                If you select both a Master Data item (e.g., Category: Kitchen) and a Feature (e.g., Stock Items), 
                only the items within that category will be reset. If only a feature is selected, all its data will be cleared.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            variant="danger" 
            className="w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
            disabled={selectedMasterDataIds.length === 0 && selectedMasterDataTypes.length === 0 && selectedFeatures.length === 0}
            onClick={() => setIsConfirmOpen(true)}
          >
            <RefreshCw size={18} />
            Reset Selected Data
          </Button>
        </div>
      </Card>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleReset}
        title="Confirm Data Reset"
        message="This action cannot be undone. All selected data will be permanently removed from your household. Are you absolutely sure?"
      />
    </div>
  );
};

export default function Settings() {
  const { state, setState, updateMasterData, deleteMasterData } = useAppState();
  const [activeSection, setActiveSection] = useState<MasterDataType | 'AppPreferences' | 'ResetData'>('AppPreferences');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const sections = [
    { type: 'header', label: 'App Preferences' },
    { id: 'AppPreferences', label: 'Currency', icon: DollarSign },
    { id: 'ResetData', label: 'Reset Data', icon: Trash2 },
    { type: 'header', label: 'Master Data' },
    { id: 'Category', label: 'Categories', icon: Tag },
    { id: 'Location', label: 'Locations', icon: MapPin },
    { id: 'TaskCategory', label: 'Task Categories', icon: CheckCircle2 },
    { id: 'SourceStore', label: 'Source Stores', icon: Store },
    { id: 'HouseholdMember', label: 'Household Members', icon: Users },
  ];

  const currencies = [
    { code: 'PHP', name: 'Philippine Peso' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'SAR', name: 'Saudi Riyal' },
    { code: 'HKD', name: 'Hong Kong Dollar' },
    { code: 'KRW', name: 'South Korean Won' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'INR', name: 'Indian Rupee' },
  ];

  const rootMasterData = useMemo(() => {
    if (activeSection === 'AppPreferences') return [];
    return state.masterData.filter(m => m.type === activeSection && !m.parentId);
  }, [state.masterData, activeSection]);

  const allSectionData = useMemo(() => {
    if (activeSection === 'AppPreferences') return [];
    return state.masterData.filter(m => m.type === activeSection);
  }, [state.masterData, activeSection]);

  const handleSaveMasterData = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (activeSection === 'AppPreferences') return;

    const item: MasterDataItem = {
      id: editingItem?.id || `${activeSection.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`,
      name: formData.get('name') as string,
      type: activeSection as MasterDataType,
      parentId: formData.get('parentId') as string || undefined,
      budget: activeSection === 'Category' ? Number(formData.get('budget')) || 0 : undefined,
    };

    updateMasterData(item);
    setIsModalOpen(false);
  };

  const handleCurrencyChange = (code: string) => {
    setState(prev => ({
      ...prev,
      household: {
        ...prev.household!,
        currencyCode: code
      }
    }));
  };

  return (
    <div className="space-y-8 pt-4 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-3xl font-black text-[#0A192F] tracking-tight">Settings</h2>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Manage your household configuration</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation */}
        <aside className="lg:w-72 space-y-1">
          {sections.map((section, idx) => {
            if (section.type === 'header') {
              return (
                <p key={`header-${idx}`} className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-6 py-4 mt-4 first:mt-0">
                  {section.label}
                </p>
              );
            }

            const Icon = section.icon!;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center gap-3 w-full px-6 py-4 rounded-[24px] transition-all ${
                  isActive 
                    ? 'bg-[#0A192F] text-white shadow-xl shadow-navy-900/20' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-[#0A192F]'
                }`}
              >
                <Icon size={18} />
                <span className="text-xs font-black uppercase tracking-widest">{section.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </button>
            );
          })}
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeSection === 'AppPreferences' && (
            <div className="space-y-6">
              <Card className="p-8 bg-white border-none shadow-sm rounded-[32px]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                    <SettingsIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0A192F] uppercase tracking-widest">General Preferences</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manage your household identity</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-1">Household Name</label>
                    <input 
                      type="text" 
                      value={state.household?.name || ''} 
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        household: prev.household ? { ...prev.household, name: e.target.value } : prev.household
                      }))}
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm font-black text-[#0A192F] focus:ring-2 focus:ring-teal-500/20 transition-all" 
                      placeholder="Enter household name"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-1">Currency</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currencies.map(curr => (
                        <button
                          key={curr.code}
                          onClick={() => handleCurrencyChange(curr.code)}
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                            state.household?.currencyCode === curr.code
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-50 hover:border-gray-100'
                          }`}
                        >
                          <div className="text-left">
                            <p className="text-sm font-black text-[#0A192F]">{curr.code}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">{curr.name}</p>
                          </div>
                          {state.household?.currencyCode === curr.code && (
                            <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white">
                              <CheckCircle2 size={14} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'ResetData' && (
            <ResetDataView state={state} setState={setState} />
          )}

          {activeSection !== 'AppPreferences' && activeSection !== 'ResetData' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-[#0A192F] tracking-tight">{activeSection} Management</h3>
                <Button size="sm" className="rounded-xl px-6" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>

              <div className="space-y-4">
                {rootMasterData.length > 0 ? (
                  rootMasterData.map(item => (
                    <TreeItem 
                      key={item.id}
                      item={item}
                      childrenItems={allSectionData.filter(m => m.parentId === item.id)}
                      allData={allSectionData}
                      level={0}
                      onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }}
                      onDelete={(item) => { setEditingItem(item); setIsConfirmDeleteOpen(true); }}
                      inventory={state.inventory}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No items found in this section</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? `Update ${activeSection}` : `Add ${activeSection}`}
      >
        <form className="space-y-6" onSubmit={handleSaveMasterData}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Name *</label>
              <input 
                name="name" 
                type="text" 
                required 
                className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm font-black text-[#0A192F]" 
                defaultValue={editingItem?.name} 
              />
            </div>

            {activeSection === 'Category' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Budget ({state.household?.currencyCode || 'PHP'})</label>
                <div className="w-full p-4 bg-gray-100 rounded-2xl text-sm font-black text-gray-400 cursor-not-allowed">
                  {editingItem ? (
                    (() => {
                      const getCategoryIds = (id: string): string[] => {
                        const ids = [id];
                        const children = state.masterData.filter(m => m.parentId === id);
                        children.forEach(child => {
                          ids.push(...getCategoryIds(child.id));
                        });
                        return ids;
                      };
                      const allCatIds = getCategoryIds(editingItem.id);
                      return state.inventory
                        .filter(i => (allCatIds.includes(i.categoryId) || allCatIds.includes(i.subCategoryId || '') || allCatIds.includes(i.subSubCategoryId || '')))
                        .reduce((sum, i) => sum + (i.costPrice || 0), 0)
                        .toLocaleString();
                    })()
                  ) : '0'} (Calculated from Stock items)
                </div>
              </div>
            )}
            
            {activeSection !== 'HouseholdMember' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Parent {activeSection}</label>
                <select 
                  name="parentId" 
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none text-sm font-black text-[#0A192F]" 
                  defaultValue={editingItem?.parentId}
                >
                  <option value="">None (Top Level)</option>
                  {state.masterData
                    .filter(m => m.type === activeSection && m.id !== editingItem?.id)
                    .map(m => {
                      // Build full path for the option label
                      const getPath = (item: MasterDataItem): string => {
                        const parent = state.masterData.find(p => p.id === item.parentId);
                        if (parent) return `${getPath(parent)} > ${item.name}`;
                        return item.name;
                      };

                      const path = getPath(m);
                      const pathLevels = path.split(' > ').length;
                      
                      // Only allow selecting parents that are at most 2 levels deep
                      // to maintain a maximum of 3 levels (Grandparent > Parent > Current)
                      if (pathLevels > 2) return null;

                      return (
                        <option key={m.id} value={m.id}>{path}</option>
                      );
                    })
                  }
                </select>
                <p className="text-[10px] text-gray-400 font-bold mt-1">Select a parent to create a hierarchy (up to 3 levels supported)</p>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full py-4 rounded-2xl bg-[#0A192F] text-white hover:bg-[#1A293F] font-black uppercase tracking-widest">
            {editingItem ? 'Update' : 'Save'}
          </Button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={() => {
          if (editingItem) {
            deleteMasterData(editingItem.id);
            setEditingItem(null);
          }
        }}
        title={`Delete ${activeSection}`}
        message={`Are you sure you want to delete "${editingItem?.name}"? This will also remove all sub-items and clear references in inventory and tasks.`}
      />
    </div>
  );
}
