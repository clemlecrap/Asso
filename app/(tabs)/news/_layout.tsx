import { Stack } from 'expo-router';

export default function NewsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="create" 
        options={{ 
          presentation: 'modal',
          headerShown: true,
          title: 'Créer une actualité',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontFamily: 'Inter_600SemiBold',
          },
        }} 
      />
    </Stack>
  );
}