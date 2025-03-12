import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Event, News } from '../types';
import { Calendar, MapPin } from 'lucide-react-native';

export default function HomeScreen() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  async function fetchHomeData() {
    try {
      // Fetch upcoming events
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(3);

      // Fetch latest news
      const { data: news } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);

      if (events) setUpcomingEvents(events);
      if (news) setLatestNews(news);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800' }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay}>
          <Text style={styles.headerTitle}>Bienvenue dans votre association</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prochains événements</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsScroll}>
          {upcomingEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.eventCard}>
              <Image
                source={{ uri: event.image_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400' }}
                style={styles.eventImage}
              />
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventInfo}>
                  <Calendar size={16} color="#666" />
                  <Text style={styles.eventInfoText}>
                    {new Date(event.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.eventInfo}>
                  <MapPin size={16} color="#666" />
                  <Text style={styles.eventInfoText}>{event.location}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dernières actualités</Text>
        {latestNews.map((news) => (
          <TouchableOpacity key={news.id} style={styles.newsCard}>
            {news.image_url && (
              <Image
                source={{ uri: news.image_url }}
                style={styles.newsImage}
              />
            )}
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>{news.title}</Text>
              <Text style={styles.newsDate}>
                {new Date(news.created_at).toLocaleDateString()}
              </Text>
              <Text style={styles.newsExcerpt} numberOfLines={2}>
                {news.content}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 15,
    color: '#1a1a1a',
  },
  eventsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  eventCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  eventContent: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  eventInfoText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
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
});