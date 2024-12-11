import { Link } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Recipe } from '@/types/recipe';

type Props = {
  recipe: Recipe;
  width: number;
};

export default function StackedRecipeCard({ recipe, width }: Props) {
  return (
    <Link 
      href={`/recipe/${encodeURIComponent(recipe.fileName)}`}
      className="mx-4 my-2"
      style={{ width: width - 32 }}
    >
      <ThemedView className="p-4 rounded-lg bg-[#192e22] shadow-lg">
        {recipe.titles.map((title, index) => (
          <ThemedText 
            key={index} 
            className={`text-2xl font-bold text-white ${index > 0 ? 'mt-2' : ''}`}
          >
            {title}
          </ThemedText>
        ))}
        {recipe.description && (
          <ThemedText className="mt-2 text-lg text-white/80">
            {recipe.description}
          </ThemedText>
        )}
      </ThemedView>
    </Link>
  );
}