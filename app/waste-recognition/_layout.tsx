import { Stack } from 'expo-router';

export default function WasteRecognitionLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ title: 'Waste Recognition', headerShown: false }} 
      />
      <Stack.Screen 
        name="categories" 
        options={{ title: 'Categories', headerShown: true }} 
      />
      <Stack.Screen 
        name="plastic-bottle" 
        options={{ title: 'Plastic Bottle', headerShown: true }} 
      />
    </Stack>
  );
}