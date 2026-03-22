import { AppState } from '../types';

const STORAGE_KEY = 'homiq_state';

const INITIAL_STATE: AppState = {
  isAuthenticated: false,
  user: null,
  household: {
    id: 'HOUSE-1234',
    name: 'My Sweet Home',
    currencyCode: 'PHP',
    country: 'Philippines'
  },
  inventory: [],
  groceryList: [],
  tasks: [],
  masterData: [
    { id: 'cat-1', name: 'Food & Drinks', type: 'Category' },
    { id: 'cat-2', name: 'Cleaning Supplies', type: 'Category' },
    { id: 'loc-1', name: 'Kitchen', type: 'Location' },
    { id: 'loc-2', name: 'Pantry', type: 'Location' },
    { id: 'tcat-1', name: 'Daily Chores', type: 'TaskCategory' },
    { id: 'store-1', name: 'SM Supermarket', type: 'SourceStore' },
    { id: 'mem-1', name: 'Alice', type: 'HouseholdMember' },
    { id: 'mem-2', name: 'Bob', type: 'HouseholdMember' }
  ],
  purchaseHistory: [],
  notificationsEnabled: true
};

export const storageService = {
  getState: (): AppState => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    return INITIAL_STATE;
  },
  saveState: (state: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};
