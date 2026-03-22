import { MasterDataItem } from '../types';

export const getMasterDataPath = (id: string, masterData: MasterDataItem[]): string => {
  const item = masterData.find(m => m.id === id);
  if (!item) return 'Unknown';
  
  if (item.parentId) {
    return `${getMasterDataPath(item.parentId, masterData)} > ${item.name}`;
  }
  
  return item.name;
};
