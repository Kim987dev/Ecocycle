import { Ionicons } from '@expo/vector-icons';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { router } from 'expo-router';

interface EnvironmentalImpact {
  label: string;
  value: string;
  icon: string;
}

interface RecyclingCenter {
  id: number;
  name: string;
  distance: string;
  accepts: string;
  rating: string;
}

export default function PlasticBottleScreen() {
  const disposalSteps = [
    'Remove cap and labels',
    'Rinse with clean water',
    'Place in plastic recycling bin',
    'Earn 5 points per bottle!'
  ];

  const environmentalImpact: EnvironmentalImpact[] = [
    { label: 'CO₂ Saved', value: '0.2 kg', icon: '🌿' },
    { label: 'Water Saved', value: '1.5L', icon: '💧' },
    { label: 'Points Earned', value: '5', icon: '⭐' },
  ];

  const acceptingCenters: RecyclingCenter[] = [
    {
      id: 1,
      name: 'Murang\'a Recycling Hub',
      distance: '0.8 km away',
      accepts: 'Accepts plastic bottles',
      rating: '4.5'
    },
    {
      id: 2,
      name: 'Green Point Center',
      distance: '1.2 km away',
      accepts: 'Accepts all plastics',
      rating: '4.2'
    },
    {
      id: 3,
      name: 'Eco Collection Point',
      distance: '2.1 km away',
      accepts: 'Plastic, Glass only',
      rating: '4.0'
    },
  ];
  const handleGetDirections = () => {
    Linking.openURL('https://www.google.com/maps/dir/?api=1&destination=Plastic+Recycling+Center');
  };

  const handleSaveGuide = () => {
    Alert.alert('Success', 'Guide saved to your favorites!');
  };

  const handleLogRecycling = () => {
    router.push({
      pathname: '/(tabs)/scan',
      params: { categoryId: 1, type: 'Plastic' }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1591193022659-1200beee0735?w=800' }} 
        style={styles.heroImage}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Plastic Bottle</Text>
        <View style={styles.recyclableBadge}>
          <Ionicons name="checkmark-circle" size={20} color="#2E8B57" />
          <Text style={styles.recyclableText}>Recyclable</Text>
        </View>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.description}>
          This plastic bottle can be recycled! Clean it and remove the cap before disposal.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Disposal Guidelines</Text>
        {disposalSteps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Environmental Impact</Text>
        <View style={styles.impactGrid}>
          {environmentalImpact.map((impact, index) => (
            <View key={index} style={styles.impactItem}>
              <Text style={styles.impactIcon}>{impact.icon}</Text>
              <Text style={styles.impactValue}>{impact.value}</Text>
              <Text style={styles.impactLabel}>{impact.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearest Accepting Centers</Text>
        {acceptingCenters.map(center => (
          <View key={center.id} style={styles.centerCard}>
            <View style={styles.centerInfo}>
              <Text style={styles.centerName}>{center.name}</Text>
              <Text style={styles.centerDetails}>
                {center.distance} • ⭐ {center.rating}
              </Text>
              <Text style={styles.centerAccepts}>{center.accepts}</Text>
            </View>
            <TouchableOpacity 
              style={styles.directionsButton}
              onPress={handleGetDirections}
            >
              <Text style={styles.directionsText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleLogRecycling}>
          <Ionicons name="checkmark-circle-outline" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Log Recycling</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSaveGuide}>
          <Ionicons name="bookmark-outline" size={20} color="#2E8B57" />
          <Text style={styles.secondaryButtonText}>Save Guide</Text>
        </TouchableOpacity>
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
    backgroundColor: 'white',
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  recyclableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recyclableText: {
    color: '#2E8B57',
    fontWeight: '600',
    marginLeft: 4,
  },
  contentSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2E8B57',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactItem: {
    alignItems: 'center',
  },
  impactIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  impactValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
    color: '#666',
  },
  centerCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerInfo: {
    flex: 1,
  },
  centerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  centerDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  centerAccepts: {
    fontSize: 12,
    color: '#2E8B57',
  },
  directionsButton: {
    backgroundColor: '#2E8B57',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  directionsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsSection: {
    padding: 20,
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#2E8B57',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2E8B57',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#2E8B57',
    fontSize: 16,
    fontWeight: '600',
  },
});