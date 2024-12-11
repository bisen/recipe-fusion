import * as SQLite from 'expo-sqlite';
import { Recipe } from '../types/recipe';
import { Platform } from 'react-native';

interface SQLRow {
  id: string;
  titles: string;
  description: string;
  fileName: string;
  tags: string | null;
  combinedFrom: string | null;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function initDatabase() {
  const db = await SQLite.openDatabaseAsync('recipes.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      titles TEXT NOT NULL,
      description TEXT,
      fileName TEXT NOT NULL,
      tags TEXT,
      combinedFrom TEXT
    );
  `);

  return db;
}

export async function generateUniqueId(): Promise<string> {
  return generateUUID();
}

export async function saveRecipe(recipe: Recipe) {
  const db = await SQLite.openDatabaseAsync('recipes.db');

  await db.runAsync(
    `INSERT OR REPLACE INTO recipes (id, titles, description, fileName, tags, combinedFrom)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      recipe.id,
      JSON.stringify(recipe.titles),
      recipe.description,
      recipe.fileName,
      JSON.stringify(recipe.tags),
      JSON.stringify(recipe.combinedFrom)
    ]
  );
}

export async function loadRecipeMetadata(): Promise<Recipe[]> {
  const db = await SQLite.openDatabaseAsync('recipes.db');
  
  const rows = await db.getAllAsync<SQLRow>('SELECT * FROM recipes');
  
  return rows.map(row => ({
    id: row.id,
    titles: JSON.parse(row.titles),
    description: row.description,
    fileName: row.fileName,
    tags: row.tags ? JSON.parse(row.tags) : undefined,
    combinedFrom: row.combinedFrom ? JSON.parse(row.combinedFrom) : undefined
  }));
} 