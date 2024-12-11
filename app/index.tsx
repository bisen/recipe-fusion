import { View, FlatList, Pressable, Dimensions } from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useRouter, Stack } from 'expo-router';
import Animated, { 
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  useDerivedValue,
  withTiming,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { Recipe } from '../types/recipe';
import { loadRecipes } from '../utils/recipeLoader';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { useThemeColor } from '../hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { syncRecipes } from '../utils/api';
import * as FileSystem from 'expo-file-system';
import { ensureRecipesDirectory } from '../utils/recipeLoader';
import { useNavigation } from 'expo-router';
import { initDatabase } from '../utils/database';
import { opacity } from 'react-native-reanimated/lib/typescript/Colors';

const BUTTON_HEIGHT = 64;
const PANEL_WIDTH = Dimensions.get('window').width;

export default function RecipeListScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [stackedRecipes, setStackedRecipes] = useState<Recipe[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  const textColor = useThemeColor({}, 'text');
  const scrollX = useSharedValue(PANEL_WIDTH);
  const { width } = Dimensions.get('window');
  const [isStackedView, setIsStackedView] = useState(false);
  const navigation = useNavigation();
  const mainButtonProgress = useSharedValue(1); // 1 = main button, 0 = selection mode
  const buttonLayoutProgress = useSharedValue(1); // 0 = full width cancel, 1 = split mode

  useEffect(() => {
    async function fetchRecipes() {
      const loadedRecipes = await loadRecipes();
      setRecipes(loadedRecipes.filter(r => r.titles.length === 1));
      setStackedRecipes(loadedRecipes.filter(r => r.titles.length > 1));
    }
    fetchRecipes();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (router.canGoBack() && stackedRecipes.length > 0) {
        setIsStackedView(true);
        if (scrollX.value !== width) {
          scrollRef.current?.scrollTo({ x: width, animated: true });
        }
      }
    });

    return unsubscribe;
  }, [navigation, stackedRecipes.length]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleRecipePress = (recipe: Recipe) => {
    if (isSelectionMode) {
      const newSelectedRecipes = new Set(selectedRecipes);
      if (selectedRecipes.has(recipe.id)) {
        newSelectedRecipes.delete(recipe.id);
      } else if (selectedRecipes.size < 2) {
        newSelectedRecipes.add(recipe.id);
      }
      setSelectedRecipes(newSelectedRecipes);
    } else {
      router.push(`/recipe/${recipe.id}`);
    }
  };

  const renderRecipe = ({ item }: { item: Recipe }) => {
    const isSelected = selectedRecipes.has(item.id);
    const cardStyle = {
      padding: 16, 
      borderRadius: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      ...(isSelectionMode && isSelected && {
        backgroundColor: '#93C57233',
        borderWidth: 2,
        borderColor: '#93C572',
      }),
    };

    return (
      <Pressable
        onPress={() => handleRecipePress(item)}
        style={{ 
          marginVertical: 8, 
          marginHorizontal: 16,
        }}
      >
        <ThemedView style={cardStyle}>
          <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>
            {item.titles[0]}
          </ThemedText>
          {item.description && (
            <ThemedText style={{ marginTop: 8, fontSize: 20 }}>
              {item.description}
            </ThemedText>
          )}
        </ThemedView>
      </Pressable>
    );
  };

  const renderStackedRecipe = ({ item }: { item: Recipe }) => {
    return (
      <Link 
        href={`/recipe/${encodeURIComponent(item.fileName)}`}
        style={{ 
          marginVertical: 8, 
          marginHorizontal: 16,
          width: width - 32,
          alignSelf: 'stretch',
        }}
      >
        <ThemedView 
          style={{ 
            padding: 16, 
            borderRadius: 8,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            backgroundColor: '#192e22',
            width: '100%',
          }}
        >
          {item.titles.map((title, index) => (
            <ThemedText 
              key={index} 
              style={{ 
                fontSize: 24, 
                fontWeight: 'bold', 
                color: '#fff',
                marginTop: index > 0 ? 8 : 0
              }}
            >
              {title}
            </ThemedText>
          ))}
          {item.description && (
            <ThemedText style={{ marginTop: 8, fontSize: 20, color: '#fff' }}>
              {item.description}
            </ThemedText>
          )}
        </ThemedView>
      </Link>
    );
  };

  const scrollRef = useRef<Animated.ScrollView>(null);

  const cancelButtonStyle = useAnimatedStyle(() => {
    const buttonWidth = interpolate(
      mainButtonProgress.value,
      [0, 1],
      [0, width - 40],
      'clamp'
    );
    const splitButtonWidth = interpolate(
      buttonLayoutProgress.value,
      [0, 1],
      [0, width * 0.35 - 32 ],
      'clamp'
    );

    const splitButtonOpacity = 1;
    const opacity = interpolate(
      buttonLayoutProgress.value,
      [0, 1],
      [1, 0],
      'clamp'
    );

    return {
      width: isSplitMode ? splitButtonWidth : buttonWidth,
      position: 'absolute',
      left: 20,
      opacity: isSplitMode ? splitButtonOpacity : opacity,
      display: isSelectionMode ? 'flex' : 'none',
    };
  });

  const stackButtonStyle = useAnimatedStyle(() => {
    const buttonWidth = width - 40;
    const splitButtonWidth = interpolate(
      buttonLayoutProgress.value,
      [0, 1],
      [width - 40, width * 0.65 - 32],
      'clamp'
    );


    const opacity = interpolate(
      buttonLayoutProgress.value,
      [1, 0],
      [0, 1],
      'clamp'
    );
    const splitButtonOpacity = 1;
    console.log('stackbuttonstyle', buttonLayoutProgress.value, isSplitMode, opacity, buttonWidth); 

    return {
      width: isSplitMode  ? splitButtonWidth : buttonWidth,
      position: 'absolute',
      right: 20,
      opacity: isSplitMode ? splitButtonOpacity : opacity,
    };
  });

  const handleStackPress = () => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      buttonLayoutProgress.value = withSpring(0, {
        duration: 300,
        dampingRatio: 1,
        stiffness: 100
      });
    } else if (selectedRecipes.size > 0) {
      handleStackRecipes();
    }
  };

  useEffect(() => {
    if (selectedRecipes.size > 0) {
      setIsSplitMode(true);
      buttonLayoutProgress.value = withSpring(1, {
        duration: 300,
        dampingRatio: 1,
        stiffness: 100
      });
    } else {

      buttonLayoutProgress.value = withSpring(0, {
        duration: 300,
        dampingRatio: 1,
        stiffness: 100
      }, (finished) => {
        if (finished) {
          console.log('finished');
          runOnJS(setIsSplitMode)(false);
        }
      });
      
    }
  }, [selectedRecipes.size]);

  const handleCancel = () => {
    console.log('cancel');
    setSelectedRecipes(new Set());
    buttonLayoutProgress.value = withSpring(1, {
      duration: 300,
      dampingRatio: 1,
      stiffness: 100
    }, (finished) => {
      if (finished) {
        console.log('finished');
        runOnJS(setIsSelectionMode)(false);
      }
    });
  };

  const handleStackRecipes = async () => {
    if (selectedRecipes.size !== 2) {
      alert('Please select exactly 2 recipes to stack');
      return;
    }

    try {
      const [recipe1Id, recipe2Id] = Array.from(selectedRecipes);
      const selectedRecipeObjects = recipes.filter(recipe => 
        recipe.id === recipe1Id || recipe.id === recipe2Id
      );

      const tempRecipe = {
        id: `temp-${Date.now()}`,
        titles: selectedRecipeObjects.map(r => r.titles[0]),
        description: 'Stacking recipes...',
        fileName: 'temp.md',
        tags: ['stacked'],
      };

      router.push({
        pathname: `/recipe/${encodeURIComponent(tempRecipe.fileName)}`,
        params: { isLoading: true, key: 'stacked' }
      });

      const syncedRecipe = await syncRecipes(
        selectedRecipeObjects[0],
        selectedRecipeObjects[1]
      );

      setStackedRecipes(prev => [...prev, syncedRecipe]);
      setIsSelectionMode(false);
      setSelectedRecipes(new Set());

      router.replace({
        pathname: `/recipe/${encodeURIComponent(syncedRecipe.fileName)}`,
        params: { key: 'stacked' }
      });
    } catch (error) {
      alert('Failed to stack recipes. Please try again.');
      console.error('Stack recipes error:', error);
      router.back();
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentOffset={{ x: PANEL_WIDTH, y: 0 }}
      >
        <View style={{ width: PANEL_WIDTH, height: '100%', backgroundColor: '#F5FFF5' }}>
          <View style={{ flex: 1, justifyContent: 'flex-end', padding: 20 }}>
            <Pressable
              style={{
                backgroundColor: '#87CEEB',
                borderRadius: 25,
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                alignItems: 'center',
                justifyContent: 'center',
                height: BUTTON_HEIGHT,
              }}
              onPress={() => router.push('/recipe/new')}
            >
              <ThemedText style={{ 
                color: '#000', 
                fontSize: 18, 
                fontWeight: '600'
              }}>
                Add New Recipe
              </ThemedText>
            </Pressable>
          </View>
        </View>
        <View style={{ width: PANEL_WIDTH, height: '100%' }}>
          <FlatList
            data={recipes}
            renderItem={renderRecipe}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingVertical: 16, paddingBottom: 80 }}
          />
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: BUTTON_HEIGHT + 40,
          }}>
            <Animated.View style={[cancelButtonStyle, { pointerEvents: 'box-none' }]}>
              <Pressable
                style={{
                  height: BUTTON_HEIGHT,
                  backgroundColor: '#FF6B6B',
                  borderRadius: 25,
                  elevation: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleCancel}
              >
                <ThemedText style={{ 
                  color: '#000', 
                  fontSize: 18, 
                  fontWeight: '600',
                  textAlign: 'center',
                  width: '100%',
                  numberOfLines: 1,
                  ellipsizeMode: 'tail'
                }}>
                  Cancel
                </ThemedText>
              </Pressable>
            </Animated.View>
            <Animated.View style={[stackButtonStyle, { pointerEvents: 'box-none' }]}>
              <Pressable
                style={{
                  height: BUTTON_HEIGHT,
                  backgroundColor: '#93C572',
                  borderRadius: 25,
                  elevation: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleStackPress}
              >
                <ThemedText 
                  numberOfLines={1} 
                  ellipsizeMode="tail"
                  style={{ 
                    color: '#000', 
                    fontSize: 18, 
                    fontWeight: '600',
                    textAlign: 'center',
                    width: '100%',
                  }}
                >
                  {!isSelectionMode ? 'Stack Recipes' : 
                    selectedRecipes.size > 0 ? 
                      `Stack ${selectedRecipes.size} Recipe${selectedRecipes.size !== 1 ? 's' : ''}` :
                      'Select Recipes'}
                </ThemedText>
              </Pressable>
            </Animated.View>
          </View>
        </View>
        <View style={{ width: PANEL_WIDTH, height: '100%', backgroundColor: '#F5FFF5' }}>
          <FlatList
            data={stackedRecipes}
            renderItem={renderStackedRecipe}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingVertical: 16 }}
          />
        </View>
      </Animated.ScrollView>
    </ThemedView>
  );
} 