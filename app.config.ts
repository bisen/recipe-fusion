import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "RecipeStacker",
  slug: "recipe-stacker",
  extra: {
    apiUrl: process.env.API_URL,
    apiKey: process.env.CLIENT_API_KEY
  },
  plugins: [
    "expo-secure-store",
    "expo-sqlite"
  ],
}); 