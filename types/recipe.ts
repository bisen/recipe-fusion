export interface Recipe {
  id: string;
  titles: string[];
  description: string;
  fileName: string;
  tags?: string[];
  combinedFrom?: {
    recipe1Id: string;
    recipe2Id: string;
  };
} 