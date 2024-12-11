import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Image, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { loadRecipe } from '../../utils/recipeLoader';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useThemeColor } from '../../hooks/useThemeColor';
import Markdown, { RenderRules } from 'react-native-markdown-display';

export default function RecipeDetailScreen() {
  const { id, isLoading } = useLocalSearchParams();
  const [content, setContent] = useState('');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    async function fetchRecipe() {
      if (isLoading === 'true') {
        setContent('# Stacking Recipes...\n> Please wait while we combine the recipes');
        return;
      }
      const recipeContent = await loadRecipe(String(id));
      setContent(recipeContent);
    }
    fetchRecipe();
  }, [id, isLoading]);

  const markdownStyles = {
    body: { color: textColor, fontSize: 20 },
    heading1: { color: textColor, fontSize: 32, fontWeight: 'bold', marginVertical: 16 },
    heading2: { color: textColor, fontSize: 28, fontWeight: 'bold', marginVertical: 12 },
    heading3: { color: textColor, fontSize: 24, fontWeight: 'bold', marginVertical: 8 },
    paragraph: { color: textColor, fontSize: 20, lineHeight: 28, marginVertical: 8 },
    listItem: { color: textColor, fontSize: 20, lineHeight: 28 },
    blockquote: { 
      backgroundColor: 'rgba(128, 128, 128, 0.1)',
      borderLeftColor: 'rgba(128, 128, 128, 0.4)',
      borderLeftWidth: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginVertical: 8
    }
  };

  const rules: RenderRules = {
    image: (node, children, parent, styles) => (
      <Image
        key={node.key}
        source={{ uri: node.attributes.src }}
        style={{ width: '100%', height: 200, marginVertical: 8 }}
        resizeMode="cover"
      />
    )
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen 
        options={{
          headerTintColor: textColor,
        }}
      />
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      >
        <Markdown 
          style={markdownStyles}
          rules={rules}
        >
          {content}
        </Markdown>
      </ScrollView>
    </ThemedView>
  );
} 