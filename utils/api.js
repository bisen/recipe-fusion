// api.js
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { loadRecipeContent } from './recipeLoader';
import { saveRecipe, generateUniqueId } from './database';
// Get values from app.config.js/ts extra field
const { apiUrl, apiKey } = Constants.expoConfig?.extra || {};

// Store API key securely
async function storeApiKey() {
  if (!apiKey) {
    throw new Error('API key not configured in app.config');
  }
  await SecureStore.setItemAsync('api_key', apiKey);
}

// Get API key from secure storage
async function getApiKey() {
  const storedKey = await SecureStore.getItemAsync('api_key');
  if (!storedKey) {
    // Try to store it again if missing
    await storeApiKey();
    return apiKey;
  }
  return storedKey;
}

async function getUniqueFileName(baseFileName) {
  const stackedRecipesDir = `${FileSystem.documentDirectory}recipes/stacked/`;
  let counter = 0;
  let fileName = baseFileName;
  
  while (true) {
    const filePath = `${stackedRecipesDir}${fileName}`;
    const fileExists = await FileSystem.getInfoAsync(filePath);
    
    if (!fileExists.exists) {
      return fileName;
    }
    
    counter++;
    fileName = baseFileName.replace('.md', `-${counter}.md`);
  }
}

export async function syncRecipes(recipe1, recipe2) {
  try {
    const recipe1Content = await loadRecipeContent(recipe1.fileName);
    const recipe2Content = await loadRecipeContent(recipe2.fileName);

    const key = await getApiKey();
    if (!key) {
      throw new Error('API key not found');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': key
      },
      body: JSON.stringify({
        recipes: [recipe1Content, recipe2Content]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    const data = await response.json();
    
    // Generate unique ID for the new recipe
    const newId = await generateUniqueId();
    const fileName = `${newId}.md`;
    
    // Save the markdown content
    const recipePath = `${FileSystem.documentDirectory}recipes/${fileName}`;
    await FileSystem.writeAsStringAsync(recipePath, data["syncedRecipe"]);
    
    // Create the recipe object
    const recipe = {
      id: newId,
      titles: [...recipe1.titles, ...recipe2.titles],
      description: `A combination of ${recipe1.titles[0]} and ${recipe2.titles[0]}`,
      fileName,
      tags: ['stacked'],
      combinedFrom: {
        recipe1Id: recipe1.id,
        recipe2Id: recipe2.id
      }
    };

    // Save the new recipe to the database
    await saveRecipe(recipe);

    return recipe;
  } catch (error) {
    console.error('Error syncing recipes:', error);
    throw error;
  }
}

// Initialize API key in secure storage
export async function initializeApi() {
  await storeApiKey();
}