import { Stack } from 'expo-router';

export default function EventsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="create" 
        options={{ 
          presentation: 'modal',
          headerShown: true,
          title: 'Créer un événement',
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