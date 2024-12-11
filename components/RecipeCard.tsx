import { Pressable } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

type Recipe = {
  id: string;
  titles: string[];
  description: string;
  fileName: string;
  tags?: string[];
  combinedFrom?: {
    recipe1Id: string;
    recipe2Id: string;
  };
};

type RecipeCardProps = {
  recipe: Recipe;
  isSelected?: boolean;
  onPress: () => void;
};

export default function RecipeCard({ recipe, isSelected, onPress }: RecipeCardProps) {
  return (
    <Pressable 
      onPress={onPress}
      className="mx-4 my-2"
    >
      <ThemedView 
        className={`p-4 rounded-lg shadow-sm ${
          isSelected ? 'bg-primary/20 border-2 border-primary' : ''
        }`}
      >
        <ThemedText className="text-2xl font-bold">
          {recipe.titles[0]}
        </ThemedText>
        {recipe.description && (
          <ThemedText className="mt-2 text-lg opacity-80">
            {recipe.description}
          </ThemedText>
        )}
      </ThemedView>
    </Pressable>
  );
}