import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Recipe } from '../types/recipe';
import { Platform } from 'react-native';
import { initDatabase, saveRecipe, loadRecipeMetadata } from './database';

const recipeCache: Record<string, string> = {};
const RECIPES_DIR = FileSystem.documentDirectory + 'recipes/';

// Import all recipes at once using require.context
const recipes = require.context('../assets/recipes', false, /\.md$/);
const recipeFiles = recipes.keys();

export async function ensureRecipesDirectory() {
  // Skip filesystem operations on web
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const dirInfo = await FileSystem.getInfoAsync(RECIPES_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(RECIPES_DIR, { intermediates: true });
    }

    for (const key of recipeFiles) {
      const moduleId = recipes(key);
      const asset = Asset.fromModule(moduleId);
      await asset.downloadAsync();
      const fileName = key.replace('./', '');
      const content = await FileSystem.readAsStringAsync(asset.localUri!);
      await FileSystem.writeAsStringAsync(RECIPES_DIR + fileName, content);
    }
  } catch (error) {
    console.error('Error setting up recipes directory:', error);
  }
}

export async function loadRecipeContent(fileName: string): Promise<string> {
  if (recipeCache[fileName]) {
    return recipeCache[fileName];
  }

  try {
    if (Platform.OS === 'web') {
      // On web, load directly from the assets
      const key = './' + fileName.replace('stacked/', '');
      const content = await recipes(key);
      recipeCache[fileName] = content;
      return content;
    }

    // Handle stacked recipes path correctly
    const isStacked = fileName.startsWith('stacked/');
    const recipePath = isStacked 
      ? `${FileSystem.documentDirectory}recipes/${fileName}`
      : `${FileSystem.documentDirectory}recipes/${fileName}`;

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(recipePath);
    if (!fileInfo.exists) {
      console.error(`File not found: ${recipePath}`);
      return `# ${fileName}\n> Recipe not found`;
    }

    const content = await FileSystem.readAsStringAsync(recipePath);
    recipeCache[fileName] = content;
    return content;
  } catch (error) {
    console.error(`Error loading recipe ${fileName}:`, error);
    return `# ${fileName}\n> Recipe not found`;
  }
}

function parseRecipeMetadata(content: string, fileName: string): Recipe {
  const lines = content.split('\n');
  const title = lines.find(line => line.startsWith('# '))?.replace('# ', '') || fileName;
  const description = lines.find(line => line.startsWith('> '))?.replace('> ', '') || '';
  return {
    id: fileName.replace('.md', ''),
    titles: [title],
    description,
    fileName
  };
}

export async function loadRecipes(): Promise<Recipe[]> {
  try {
    await initDatabase();
    
    // First, try to load from database
    const savedRecipes = await loadRecipeMetadata();
    if (savedRecipes.length > 0) {
      return savedRecipes;
    }

    // If no saved recipes, load from files
    const recipesDir = `${FileSystem.documentDirectory}recipes/`;
    const stackedRecipesDir = `${FileSystem.documentDirectory}recipes/stacked/`;
    
    await FileSystem.makeDirectoryAsync(recipesDir, { intermediates: true });
    await FileSystem.makeDirectoryAsync(stackedRecipesDir, { intermediates: true });

    const regularFiles = await FileSystem.readDirectoryAsync(recipesDir);
    const stackedFiles = await FileSystem.readDirectoryAsync(stackedRecipesDir);

    const regularRecipes = await Promise.all(
      regularFiles
        .filter(file => file.endsWith('.md') && !file.startsWith('.'))
        .map(async fileName => {
          try {
            const content = await loadRecipeContent(fileName);
            const recipe = parseRecipeMetadata(content, fileName);
            await saveRecipe(recipe); // Save to database
            return recipe;
          } catch (error) {
            console.error(`Error loading recipe ${fileName}:`, error);
            return null;
          }
        })
    );

    const stackedRecipes = await Promise.all(
      stackedFiles
        .filter(file => file.endsWith('.md') && !file.startsWith('.'))
        .map(async fileName => {
          try {
            const content = await loadRecipeContent(`stacked/${fileName}`);
            const recipe = parseRecipeMetadata(content, `stacked/${fileName}`);
            await saveRecipe(recipe); // Save to database
            return recipe;
          } catch (error) {
            console.error(`Error loading stacked recipe ${fileName}:`, error);
            return null;
          }
        })
    );

    const allRecipes = [...regularRecipes, ...stackedRecipes].filter((recipe): recipe is Recipe => recipe !== null);
    return allRecipes;
  } catch (error) {
    console.error('Error loading recipes:', error);
    return [];
  }
}

export async function loadRecipe(id: string): Promise<string> {
  await ensureRecipesDirectory();
  
  try {
    // If the id already contains .md, use it as is
    const fileName = id.endsWith('.md') ? id : `${id}.md`;
    
    const content = await loadRecipeContent(fileName);
    if (content.includes('Recipe not found')) {
      console.error(`Recipe not found: ${fileName}`);
      return '# Recipe not found';
    }
    
    const parts = content.split(/\n---+\n/);
    return parts[parts.length - 1].trim();
  } catch (error) {
    console.error(`Error loading recipe ${id}:`, error);
    return '# Recipe not found';
  }
}