import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UserStats {
  points: number;
  maxPoints: number;
  recycled: string;
  co2Saved: string;
  treesEquivalent: number;
}

interface Activity {
  id: number;
  points: number;
  description: string;
  time: string;
}

export default function HomeScreen() {
  const userStats: UserStats = {
    points: 450,
    maxPoints: 1000,
    recycled: '12.5',
    co2Saved: '8.2',
    treesEquivalent: 3,
  };

  const recentActivities: Activity[] = [
    { id: 1, points: 25, description: 'Plastic bottles recycled', time: '2 hours ago' },
    { id: 2, points: 15, description: 'Paper waste sorted', time: 'Yesterday' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back, John!</Text>
        <Text style={styles.subtitle}>Ready to make a difference today?</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.points}</Text>
          <Text style={styles.statLabel}>/ {userStats.maxPoints} pts</Text>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.smallStat}>
            <Text style={styles.smallStatNumber}>{userStats.recycled}</Text>
            <Text style={styles.smallStatLabel}>kg Recycled</Text>
          </View>
          <View style={styles.smallStat}>
            <Text style={styles.smallStatNumber}>{userStats.co2Saved}</Text>
            <Text style={styles.smallStatLabel}>CO₂ Saved</Text>
          </View>
          <View style={styles.smallStat}>
            <Text style={styles.smallStatNumber}>{userStats.treesEquivalent}</Text>
            <Text style={styles.smallStatLabel}>Trees Equity.</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Link href="./map" asChild>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Find Centers</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="../waste-recognition/categories" asChild>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Check Waste</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Rewards</Text>
        <Link href="./rewards" asChild>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analytics</Text>
        <TouchableOpacity onPress={() => alert('Detailed analytics will show your recycling trends over the last 30 days. Feature coming soon!')}>
          <Text style={styles.seeAll}>View →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentActivities.map(activity => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityInfo}>
              <Text style={styles.activityPoints}>+{activity.points} points</Text>
              <Text style={styles.activityDescription}>{activity.description}</Text>
            </View>
            <Text style={styles.activityTime}>{activity.time}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  smallStat: {
    alignItems: 'center',
  },
  smallStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  smallStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2E8B57',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#2E8B57',
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
});