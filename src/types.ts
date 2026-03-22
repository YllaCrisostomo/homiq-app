/**
 * Homiq Application Types
 * 
 * Defines the core data structures for household management,
 * including inventory, tasks, groceries, and master data.
 */

export type MasterDataType = 'Category' | 'Location' | 'SourceStore' | 'HouseholdMember' | 'TaskCategory';

export interface MasterDataItem {
  id: string;
  name: string;
  type: MasterDataType;
  parentId?: string; // For hierarchical structure
  budget?: number;   // For categories
  currency?: string; // For household/settings
}

export interface User {
  id: string;
  displayName: string;
  role: string;
  avatar: string;
}

export interface Household {
  id: string;
  name: string;
  currencyCode: string;
  country: string;
}

export interface InventoryItem {
  id: string;
  sku: string; // Auto-generated 001, 002...
  name: string; // Unique
  description?: string;
  brand: string;
  size: string;
  color?: string;
  material?: string;
  categoryId: string;
  subCategoryId?: string;
  subSubCategoryId?: string;
  locationId: string;
  subLocationId?: string;
  subSubLocationId?: string;
  sourceStoreId?: string;
  subSourceStoreId?: string;
  subSubSourceStoreId?: string;
  stockAmount: number;
  stockUOM: string;
  actualAmount: number;
  actualUOM: string;
  minStockThreshold: number;
  costPrice: number;
  expiryDate?: string;
  alternativeItemId?: string; // Dropdown from list of stock items
  lastStockedAt: string;
  lastUpdated: string;
  status: 'Available' | 'Low Stock' | 'No Stock' | 'Near Expiry' | 'Expired' | 'Inactive';
}

export interface GroceryItem {
  id: string;
  inventoryItemId?: string; // Link to inventory item
  alternativeItemId?: string; // Link to alternative inventory item
  sku?: string;
  name: string;
  description?: string;
  categoryId: string;
  subCategoryId?: string;
  subSubCategoryId?: string;
  locationId?: string;
  subLocationId?: string;
  subSubLocationId?: string;
  brand?: string;
  size?: string;
  variant?: string;
  sourceStoreId?: string;
  subSourceStoreId?: string;
  subSubSourceStoreId?: string;
  quantity: number;
  estimatedPrice: number;
  actualPrice?: number;
  isPurchased: boolean;
  isNotAvailable: boolean;
  purchaseDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  subCategoryId?: string;
  subSubCategoryId?: string;
  assigneeId: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  dueDate: string;
  isRecurring: boolean;
  createdAt: string;
  timeFrame?: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
  recurrenceDaysWeek?: string[]; // ['Mon', 'Tue'...]
  recurrenceDaysMonth?: number[]; // [1, 2, 3...]
  recurrenceMonths?: string[]; // ['Jan', 'Feb'...]
  instructions?: string[];
  completedAt?: string;
  lastCompleted?: string;
}

export interface AppState {
  user: User | null;
  household: Household | null;
  isAuthenticated: boolean;
  inventory: InventoryItem[];
  groceryList: GroceryItem[];
  tasks: Task[];
  masterData: MasterDataItem[];
  purchaseHistory: GroceryItem[];
  notificationsEnabled: boolean;
}
