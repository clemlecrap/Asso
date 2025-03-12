import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { News } from '../../types';
import { Plus } from 'lucide-react-native';

export default function NewsScreen() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
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

  async function fetchNews() {
    try {
      const { data } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

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
        <Text style={styles.title}>Actualités</Text>
        {userRole === 'founder' && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/news/create')}
          >
            <Plus color="#fff" size={24} />
            <Text style={styles.createButtonText}>Publier</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={news}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.newsCard}
            onPress={() => router.push(`/news/${item.id}`)}
          >
            {item.image_url && (
              <Image
                source={{ uri: item.image_url }}
                style={styles.newsImage}
              />
            )}
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
              <Text style={styles.newsExcerpt} numberOfLines={3}>
                {item.content}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Aucune actualité disponible
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
  newsCard: {
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
  newsImage: {
    width: '100%',
    height: 200,
  },
  newsContent: {
    padding: 15,
  },
  newsTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 5,
    color: '#1a1a1a',
  },
  newsDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Inter_400Regular',
  },
  newsExcerpt: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
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