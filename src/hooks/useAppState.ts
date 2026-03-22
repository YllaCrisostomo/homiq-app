import { useState, useEffect, useCallback } from 'react';
import { AppState, InventoryItem, Task, GroceryItem, MasterDataItem } from '../types';
import { storageService } from '../services/storageService';
import { getTaskStatus } from '../utils/taskUtils';

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    const savedState = storageService.getState();
    // Ensure purchaseHistory exists
    if (!savedState.purchaseHistory) savedState.purchaseHistory = [];
    
    // Auto-authenticate if household exists
    if (savedState.household && !savedState.isAuthenticated && savedState.masterData.length > 0) {
      const firstMember = savedState.masterData.find(m => m.type === 'HouseholdMember');
      if (firstMember) {
        savedState.isAuthenticated = true;
        savedState.user = {
          id: firstMember.id,
          displayName: firstMember.name,
          role: 'Admin',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstMember.name}`
        };
      }
    }
    return savedState;
  });

  useEffect(() => {
    storageService.saveState(state);
  }, [state]);

  const getNextSKU = useCallback((inventory: InventoryItem[]) => {
    const maxSKU = inventory.reduce((max, item) => {
      const num = parseInt(item.sku, 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return (maxSKU + 1).toString().padStart(3, '0');
  }, []);

  const calculateItemStatus = useCallback((item: Partial<InventoryItem>): InventoryItem['status'] => {
    const today = new Date();
    const actualAmount = item.actualAmount || 0;
    const minThreshold = item.minStockThreshold || 0;
    const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
    const lastStockedAt = item.lastStockedAt ? new Date(item.lastStockedAt) : null;

    // Expired
    if (expiryDate && expiryDate <= today) return 'Expired';

    // Near Expiry (30 days)
    if (expiryDate) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      if (expiryDate <= thirtyDaysFromNow) return 'Near Expiry';
    }

    // No Stock
    if (actualAmount <= 0) {
      // Inactive (No stock for > 60 days)
      if (lastStockedAt) {
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(today.getDate() - 60);
        if (lastStockedAt <= sixtyDaysAgo) return 'Inactive';
      }
      return 'No Stock';
    }

    // Low Stock
    if (actualAmount <= minThreshold) return 'Low Stock';

    // Available
    return 'Available';
  }, []);

  const calculateCategoryBudget = useCallback((catId: string, masterData: MasterDataItem[], inventory: InventoryItem[]): number => {
    const getCategoryIds = (id: string): string[] => {
      const ids = [id];
      const children = masterData.filter(m => m.parentId === id);
      children.forEach(child => {
        ids.push(...getCategoryIds(child.id));
      });
      return ids;
    };

    const allCatIds = getCategoryIds(catId);
    return inventory
      .filter(item => (allCatIds.includes(item.categoryId) || allCatIds.includes(item.subCategoryId || '') || allCatIds.includes(item.subSubCategoryId || '')))
      .reduce((sum, item) => sum + (item.costPrice || 0), 0);
  }, []);

  const updateInventoryItem = useCallback((item: InventoryItem) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(i => i.id === item.id ? { ...item, status: calculateItemStatus(item) } : i)
    }));
  }, [calculateItemStatus]);

  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'sku' | 'status'>) => {
    setState(prev => {
      const sku = getNextSKU(prev.inventory);
      const newItem: InventoryItem = {
        ...item,
        sku,
        status: calculateItemStatus(item as InventoryItem)
      } as InventoryItem;
      return {
        ...prev,
        inventory: [...prev.inventory, newItem]
      };
    });
  }, [getNextSKU, calculateItemStatus]);

  const deleteInventoryItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.filter(i => i.id !== id),
      groceryList: prev.groceryList.filter(g => g.inventoryItemId !== id)
    }));
  }, []);

  const addGroceryItem = useCallback((item: GroceryItem) => {
    setState(prev => ({
      ...prev,
      groceryList: [...prev.groceryList, item]
    }));
  }, []);

  const updateGroceryItem = useCallback((item: GroceryItem) => {
    setState(prev => ({
      ...prev,
      groceryList: prev.groceryList.map(g => g.id === item.id ? item : g)
    }));
  }, []);

  const deleteGroceryItem = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      groceryList: prev.groceryList.filter(g => g.id !== id)
    }));
  }, []);

  const updateTask = useCallback((task: Task) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === task.id ? { ...task, status: getTaskStatus(task) } : t)
    }));
  }, []);

  const addTask = useCallback((task: Task) => {
    setState(prev => {
      const newTask = { ...task, createdAt: new Date().toISOString() };
      return {
        ...prev,
        tasks: [...prev.tasks, { ...newTask, status: getTaskStatus(newTask) }]
      };
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  }, []);

  const syncGroceryList = useCallback(() => {
    setState(prev => {
      const syncableItems = prev.inventory.filter(item => 
        (item.status === 'Low Stock' || item.status === 'No Stock' || item.status === 'Expired' || item.status === 'Near Expiry') &&
        !item.alternativeItemId
      );

      const newGroceryItems: GroceryItem[] = syncableItems
        .filter(item => !prev.groceryList.some(g => g.inventoryItemId === item.id))
        .map(item => ({
          id: `groc-${Math.random().toString(36).substr(2, 9)}`,
          inventoryItemId: item.id,
          sku: item.sku,
          name: item.name,
          categoryId: item.categoryId,
          subCategoryId: item.subCategoryId,
          subSubCategoryId: item.subSubCategoryId,
          locationId: item.locationId,
          subLocationId: item.subLocationId,
          subSubLocationId: item.subSubLocationId,
          brand: item.brand,
          size: item.size,
          quantity: 1,
          estimatedPrice: item.costPrice,
          isPurchased: false,
          isNotAvailable: false
        }));

      return {
        ...prev,
        groceryList: [...prev.groceryList, ...newGroceryItems]
      };
    });
  }, []);

  const updateMasterData = useCallback((item: MasterDataItem) => {
    setState(prev => {
      const exists = prev.masterData.some(m => m.id === item.id);
      return {
        ...prev,
        masterData: exists 
          ? prev.masterData.map(m => m.id === item.id ? item : m)
          : [...prev.masterData, item]
      };
    });
  }, []);

  const deleteMasterData = useCallback((id: string) => {
    setState(prev => {
      const itemToDelete = prev.masterData.find(m => m.id === id);
      if (!itemToDelete) return prev;

      // Recursive function to find all descendant IDs
      const getDescendantIds = (parentId: string, data: MasterDataItem[]): string[] => {
        const children = data.filter(m => m.parentId === parentId);
        let ids = children.map(c => c.id);
        children.forEach(c => {
          ids = [...ids, ...getDescendantIds(c.id, data)];
        });
        return ids;
      };

      const allDeletedIds = [id, ...getDescendantIds(id, prev.masterData)];

      const finalMasterData = prev.masterData.filter(m => !allDeletedIds.includes(m.id));

      // Update Inventory - Clear all possible references
      const newInventory = prev.inventory.map(item => {
        let updated = { ...item };
        if (allDeletedIds.includes(item.categoryId)) updated.categoryId = '';
        if (item.subCategoryId && allDeletedIds.includes(item.subCategoryId)) updated.subCategoryId = '';
        if (item.subSubCategoryId && allDeletedIds.includes(item.subSubCategoryId)) updated.subSubCategoryId = '';
        if (allDeletedIds.includes(item.locationId)) updated.locationId = '';
        if (item.subLocationId && allDeletedIds.includes(item.subLocationId)) updated.subLocationId = '';
        if (item.subSubLocationId && allDeletedIds.includes(item.subSubLocationId)) updated.subSubLocationId = '';
        return updated;
      });

      // Update Grocery List - Clear all possible references
      const newGroceryList = prev.groceryList.map(item => {
        let updated = { ...item };
        if (allDeletedIds.includes(item.categoryId)) updated.categoryId = '';
        if (item.subCategoryId && allDeletedIds.includes(item.subCategoryId)) updated.subCategoryId = '';
        if (item.subSubCategoryId && allDeletedIds.includes(item.subSubCategoryId)) updated.subSubCategoryId = '';
        if (item.locationId && allDeletedIds.includes(item.locationId)) updated.locationId = '';
        if (item.subLocationId && allDeletedIds.includes(item.subLocationId)) updated.subLocationId = '';
        if (item.subSubLocationId && allDeletedIds.includes(item.subSubLocationId)) updated.subSubLocationId = '';
        if (item.sourceStoreId && allDeletedIds.includes(item.sourceStoreId)) updated.sourceStoreId = '';
        if (item.subSourceStoreId && allDeletedIds.includes(item.subSourceStoreId)) updated.subSourceStoreId = '';
        if (item.subSubSourceStoreId && allDeletedIds.includes(item.subSubSourceStoreId)) updated.subSubSourceStoreId = '';
        return updated;
      });

      // Update Tasks - Clear all possible references
      const newTasks = prev.tasks.map(item => {
        let updated = { ...item };
        if (allDeletedIds.includes(item.categoryId)) updated.categoryId = '';
        if (item.subCategoryId && allDeletedIds.includes(item.subCategoryId)) updated.subCategoryId = '';
        if (item.subSubCategoryId && allDeletedIds.includes(item.subSubCategoryId)) updated.subSubCategoryId = '';
        if (allDeletedIds.includes(item.assigneeId)) updated.assigneeId = '';
        return updated;
      });

      return {
        ...prev,
        masterData: finalMasterData,
        inventory: newInventory,
        groceryList: newGroceryList,
        tasks: newTasks
      };
    });
  }, []);

  const checkoutItems = useCallback((ids: string[]) => {
    setState(prev => {
      let newInventory = [...prev.inventory];
      const itemsToCheckout = prev.groceryList
        .filter(g => ids.includes(g.id))
        .map(g => ({ ...g, purchaseDate: new Date().toISOString() }));
      const newPurchaseHistory = [...(prev.purchaseHistory || []), ...itemsToCheckout];
      
      const newGroceryList = prev.groceryList.filter(g => {
        if (ids.includes(g.id)) {
          // Update inventory if linked or alternative
          const targetItemId = (g.isNotAvailable && g.alternativeItemId) ? g.alternativeItemId : g.inventoryItemId;
          
          if (targetItemId) {
            const invItemIndex = newInventory.findIndex(i => i.id === targetItemId);
            if (invItemIndex !== -1) {
              const invItem = { ...newInventory[invItemIndex] };
              invItem.actualAmount += g.quantity;
              invItem.lastStockedAt = new Date().toISOString();
              invItem.lastUpdated = new Date().toISOString();
              // Update costPrice based on Actual Price from Shop
              if (g.actualPrice) {
                invItem.costPrice = g.actualPrice;
              }
              invItem.status = calculateItemStatus(invItem);
              newInventory[invItemIndex] = invItem;
            }
          }
          return false; // Remove from grocery list
        }
        return true;
      });

      return {
        ...prev,
        inventory: newInventory,
        groceryList: newGroceryList,
        purchaseHistory: newPurchaseHistory
      };
    });
  }, [calculateItemStatus]);

  const completeTask = useCallback((taskId: string) => {
    setState(prev => {
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task || task.status === 'Completed') return prev;

      const now = new Date();
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          const updated = { 
            ...t, 
            completedAt: now.toISOString(), 
            lastCompleted: now.toISOString() 
          };
          return { ...updated, status: getTaskStatus(updated) };
        }
        return t;
      });

      return { ...prev, tasks: updatedTasks };
    });
  }, []);

  const deleteCompletedTasks = useCallback(() => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.status !== 'Completed')
    }));
  }, []);

  const updateCurrency = useCallback((currencyCode: string) => {
    setState(prev => ({
      ...prev,
      household: prev.household ? { ...prev.household, currencyCode } : prev.household
    }));
  }, []);

  return {
    state,
    updateInventoryItem,
    addInventoryItem,
    deleteInventoryItem,
    addGroceryItem,
    updateGroceryItem,
    deleteGroceryItem,
    updateTask,
    addTask,
    deleteTask,
    deleteCompletedTasks,
    syncGroceryList,
    updateMasterData,
    deleteMasterData,
    calculateItemStatus,
    completeTask,
    checkoutItems,
    updateCurrency,
    setState
  };
}
