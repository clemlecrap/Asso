import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { News } from '../../types';
import { Calendar } from 'lucide-react-native';

export default function NewsDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [news, setNews] = useState<News | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchNewsAndCheckPermissions();
  }, [id]);

  async function fetchNewsAndCheckPermissions() {
    try {
      setLoading(true);
      setError(null);

      // Get current user and their role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
      }

      // Fetch news details
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (newsError) throw newsError;
      if (newsData) {
        setNews(newsData);
        // Initialize form state
        setTitle(newsData.title);
        setContent(newsData.content);
        setImageUrl(newsData.image_url || '');

        // Check if user can edit this news
        const canEditNews = profile?.role === 'founder' || 
          (newsData.created_by === user.id);
        setCanEdit(canEditNews);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('news')
        .update({
          title,
          content,
          image_url: imageUrl,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setIsEditing(false);
      fetchNewsAndCheckPermissions(); // Refresh data
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!news) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Article non trouvé</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {!isEditing ? (
        <View>
          {news.image_url && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: news.image_url }} style={styles.image} />
            </View>
          )}

          <View style={styles.content}>
            <Text style={styles.title}>{news.title}</Text>
            
            <View style={styles.infoContainer}>
              <Calendar size={20} color="#666" />
              <Text style={styles.infoText}>
                {new Date(news.created_at).toLocaleDateString()}
              </Text>
            </View>

            <Text style={styles.newsContent}>{news.content}</Text>

            {canEdit && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>Modifier</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Titre de l'article"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contenu</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Contenu de l'article"
              multiline
              numberOfLines={8}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="URL de l'image"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleUpdateNews}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  imageContainer: {
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#1a1a1a',
    marginBottom: 20,
    lineHeight: 34,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  newsContent: {
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    color: '#444',
    lineHeight: 28,
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  textArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  error: {
    color: '#ff3b30',
    textAlign: 'center',
    padding: 20,
    fontFamily: 'Inter_400Regular',
  },
});