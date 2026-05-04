import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { rewardsAPI } from '../../services/api';

interface Reward {
  id: number;
  name: string;
  points: number;
  description: string;
}

export default function RewardsScreen() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewardsAndBalance();
  }, []);

  const loadRewardsAndBalance = async () => {
    try {
      const [rewardsResponse, balanceResponse] = await Promise.all([
        rewardsAPI.getRewards(),
        rewardsAPI.getBalance()
      ]);

      setRewards(rewardsResponse.rewards.map((reward: any) => ({
        id: reward.id,
        name: reward.name,
        points: reward.points_required,
        description: reward.description
      })));

      setPointsBalance(balanceResponse.points);
    } catch (error: any) {
      console.error('Error loading rewards:', error);
      Alert.alert('Error', 'Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (pointsBalance < reward.points) {
      Alert.alert('Insufficient Points', 'You don\'t have enough points to redeem this reward.');
      return;
    }

    Alert.alert(
      'Confirm Redemption',
      `Redeem "${reward.name}" for ${reward.points} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            try {
              await rewardsAPI.redeemReward(reward.id);
              Alert.alert('Success', 'Reward redeemed successfully!');
              loadRewardsAndBalance(); // Refresh data
            } catch (error: any) {
              console.error('Redemption error:', error);
              Alert.alert('Error', error.response?.data?.error || 'Failed to redeem reward');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading rewards...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>REWARDS & GAMIFICATION</Text>
      </View>

      <View style={styles.pointsSection}>
        <Text style={styles.pointsBalance}>{pointsBalance}</Text>
        <Text style={styles.pointsLabel}>Available Points</Text>
        <Text style={styles.pointsToNext}>
          {pointsBalance < 200 ? `${200 - pointsBalance} points to next reward tier` : 'You can redeem rewards!'}
        </Text>
      </View>

      <View style={styles.rewardsSection}>
        <Text style={styles.sectionTitle}>Available Rewards</Text>
        {rewards.map(reward => (
          <View key={reward.id} style={styles.rewardCard}>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardName}>{reward.name}</Text>
              <Text style={styles.rewardDescription}>{reward.description}</Text>
              <Text style={styles.rewardPoints}>{reward.points} pts</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.redeemButton,
                reward.points > pointsBalance && styles.redeemButtonDisabled
              ]}
              onPress={() => handleRedeem(reward)}
              disabled={reward.points > pointsBalance}
            >
              <Text style={styles.redeemButtonText}>
                {reward.points > pointsBalance ? 'Not enough points' : 'Redeem'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  pointsSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  pointsBalance: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  pointsLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  pointsToNext: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  rewardsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  rewardCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  rewardPoints: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 5,
  },
  redeemButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  redeemButtonDisabled: {
    backgroundColor: '#CCC',
  },
  redeemButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});