import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { mockLesson } from '../data/mockData';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAppStore } from '../stores/useAppStore';
import { Card } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

export default function FavoritesScreen({ navigation }: Props) {
  const { userProgress, removeFavorite, currentLesson } = useAppStore();

  const allCards = currentLesson?.cards?.length ? currentLesson.cards : mockLesson.cards;
  const favoriteCards = allCards.filter((card) => userProgress.favorites.includes(card.data.id));

  const renderFavoriteCard = ({ item }: { item: Card }) => {
    const cardId = item.data.id;
    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardTitle}>{item.type === 'word' ? item.data.word : item.data.phrase}</Text>
            <Text style={styles.cardSubtitle}>{item.data.translation}</Text>
            {item.type === 'word' && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.data.partOfSpeech}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.favoriteButton} onPress={() => removeFavorite(cardId)}>
            <Ionicons name="star" size={24} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="star-outline" size={64} color={Colors.textGray} />
      <Text style={styles.emptyTitle}>No favorites yet</Text>
      <Text style={styles.emptyText}>Tap the star icon on any card to save it here</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={Colors.textOnDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favorites</Text>
          <View style={{ width: 28 }} />
        </View>

        {favoriteCards.length > 0 && (
          <View style={styles.countContainer}>
            <Text style={styles.countText}>
              {favoriteCards.length} {favoriteCards.length === 1 ? 'card' : 'cards'} saved
            </Text>
          </View>
        )}

        <FlatList
          data={favoriteCards}
          renderItem={renderFavoriteCard}
          keyExtractor={(item) => item.data.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.darkBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textOnDark,
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  countText: {
    fontSize: 14,
    color: Colors.textGray,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(74, 155, 142, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textOnDark,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textGray,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
