import { Link } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
  image: string;
}

export default function CategoriesScreen() {
  const categories: Category[] = [
    { 
      id: 1, 
      name: 'Plastic', 
      icon: '♻️', 
      color: '#2196F3',
      description: 'Bottles, containers, packaging',
      image: 'https://images.unsplash.com/photo-1591193022659-1200beee0735?w=500'
    },
    { 
      id: 2, 
      name: 'Paper', 
      icon: '📄', 
      color: '#FF9800',
      description: 'Newspaper, cardboard, office paper',
      image: 'https://images.unsplash.com/photo-1603514282713-333e68340d0a?w=500'
    },
    { 
      id: 3, 
      name: 'Glass', 
      icon: '🍶', 
      color: '#4CAF50',
      description: 'Bottles, jars, containers',
      image: 'https://images.unsplash.com/photo-1595273670150-db0a3d39575f?w=500'
    },
    { 
      id: 4, 
      name: 'E-waste', 
      icon: '📱', 
      color: '#9C27B0',
      description: 'Electronics, batteries, devices',
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500'
    },
    { 
      id: 5, 
      name: 'Organic', 
      icon: '🌿', 
      color: '#795548',
      description: 'Food waste, garden waste',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'
    },
    { 
      id: 6, 
      name: 'Chemicals', 
      icon: '⚠️', 
      color: '#F44336',
      description: 'Cleaning products, paints',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500'
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Browse Categories</Text>
        <Text style={styles.subtitle}>Select a waste category for disposal guidance</Text>
      </View>

      <View style={styles.categoriesGrid}>
        {categories.map(category => (
          <Link 
            key={category.id} 
            href={category.name === 'Plastic' ? '/waste-recognition/plastic-bottle' : {
              pathname: '/(tabs)/scan',
              params: { categoryId: category.id, type: category.name }
            }} 
            asChild
          >
            <TouchableOpacity style={styles.categoryCard}>
              <Image source={{ uri: category.image }} style={styles.thumbnail} />
              <View style={styles.cardOverlay}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Text style={styles.icon}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription} numberOfLines={1}>{category.description}</Text>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      <View style={styles.scanSection}>
        <Ionicons name="camera-outline" size={48} color="#2E8B57" />
        <Text style={styles.scanTitle}>Quick Scan</Text>
        <Text style={styles.scanDescription}>
          Use your camera to instantly identify any waste item
        </Text>
        <Link href="/(tabs)/scan" asChild>
          <TouchableOpacity style={styles.scanButton}>
            <Text style={styles.scanButtonText}>Open Camera Scanner</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 80,
  },
  cardOverlay: {
    padding: 12,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    borderWidth: 3,
    borderColor: 'white',
  },
  icon: {
    fontSize: 18,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  categoryDescription: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  scanSection: {
    backgroundColor: '#F5F5F5',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  scanTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  scanDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  scanButton: {
    backgroundColor: '#2E8B57',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});