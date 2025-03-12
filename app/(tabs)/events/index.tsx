import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { Event } from '../../types';
import { Calendar, MapPin, Plus } from 'lucide-react-native';

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    checkUserRole();
  }, []);

  async function checkUserRole() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.role);
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  }

  async function fetchEvents() {
    try {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (data) setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const canCreateEvents = userRole === 'organizer' || userRole === 'founder';

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Événements</Text>
        {canCreateEvents && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/events/create')}
          >
            <Plus color="#fff" size={24} />
            <Text style={styles.createButtonText}>Créer</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.eventCard}
            onPress={() => router.push(`/events/${item.id}`)}
          >
            <Image
              source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400' }}
              style={styles.eventImage}
            />
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.eventInfo}>
                <Calendar size={16} color="#666" />
                <Text style={styles.eventInfoText}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.eventInfo}>
                <MapPin size={16} color="#666" />
                <Text style={styles.eventInfoText}>{item.location}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Aucun événement à venir
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#1a1a1a',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  listContent: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventContent: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontFamily: 'Inter_400Regular',
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  eventInfoText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});