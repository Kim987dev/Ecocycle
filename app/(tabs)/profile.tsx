import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { userAPI, authAPI } from '../../services/api';

interface Achievement {
  id: number;
  name: string;
  icon: string;
  description: string;
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    phone: '',
    location: ''
  });
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    code: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userStats = {
    joinedDate: userData?.created_at ? new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2024',
    totalRecycled: '45.2 kg',
    co2Saved: '28.5 kg',
    treesSaved: 12,
    points: userData?.points || 0
  };

  const achievements: Achievement[] = [
    { id: 1, name: 'First Timer', icon: '🏆', description: 'First recycling session' },
    { id: 2, name: 'Eco Warrior', icon: '🌍', description: '10kg recycled' },
    { id: 3, name: 'Plastic Hero', icon: '♻️', description: '50 plastic items' },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setUserData(response.user);
      setEditFormData({
        fullName: response.user.full_name,
        phone: response.user.phone || '',
        location: response.user.location || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await userAPI.updateProfile(editFormData);
      setUserData(response.user);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.errors 
        ? error.response.data.errors.map((e: any) => e.msg).join('\n')
        : (error.response?.data?.error || 'Failed to update profile');
      Alert.alert('Error', errorMessage);
    }
  };

  const handlePasswordChangeRequest = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await authAPI.changePasswordRequest();
      setPasswordStep(2);
      Alert.alert('Verification Sent', 'Please check your email for the 6-digit verification code.');
    } catch (error: any) {
       console.error('Password request error:', error);
       Alert.alert('Error', error.response?.data?.error || 'Failed to request password change');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChangeConfirm = async () => {
    if (!passwordData.code || passwordData.code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    try {
      await authAPI.changePasswordConfirm({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        code: passwordData.code
      });
      setIsPasswordModalVisible(false);
      setPasswordStep(1);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '', code: '' });
      Alert.alert('Success', 'Password changed successfully!');
    } catch (error: any) {
      console.error('Password confirm error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('userData');
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }} 
              style={styles.profileImage}
              onError={() => console.log('Image failed to load')}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userData?.full_name || 'John Kamau'}</Text>
              <Text style={styles.joinDate}>Joined {userStats.joinedDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Environmental Impact</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.totalRecycled}</Text>
              <Text style={styles.statLabel}>Total Recycled</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.co2Saved}</Text>
              <Text style={styles.statLabel}>CO₂ Saved</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.treesSaved}</Text>
              <Text style={styles.statLabel}>Trees Saved</Text>
            </View>
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievement Badges</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map(achievement => (
              <View key={achievement.id} style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementDesc}>{achievement.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setIsEditModalVisible(true)}>
            <Ionicons name="settings-outline" size={24} color="#666" />
            <Text style={styles.menuText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {
            setPasswordStep(1);
            setIsPasswordModalVisible(true);
          }}>
            <Ionicons name="lock-closed-outline" size={24} color="#666" />
            <Text style={styles.menuText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Help', 'Support team is available at support@ecocycle.com')}>
            <Ionicons name="help-circle-outline" size={24} color="#666" />
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Invite', 'Share your referral code: ECO2024')}>
            <Ionicons name="people-outline" size={24} color="#666" />
            <Text style={styles.menuText}>Invite Friends</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Analytics', 'Detailed impact reports coming soon!')}>
            <Ionicons name="analytics-outline" size={24} color="#666" />
            <Text style={styles.menuText}>Detailed Analytics</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editFormData.fullName}
                onChangeText={(text) => setEditFormData({ ...editFormData, fullName: text })}
                placeholder="Full Name"
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={editFormData.phone}
                onChangeText={(text) => setEditFormData({ ...editFormData, phone: text })}
                placeholder="Phone Number"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={editFormData.location}
                onChangeText={(text) => setEditFormData({ ...editFormData, location: text })}
                placeholder="Location"
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isPasswordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setIsPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              {passwordStep === 1 ? (
                <>
                  <Text style={styles.inputLabel}>Current Password</Text>
                  <TextInput
                    style={styles.input}
                    value={passwordData.currentPassword}
                    onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                    placeholder="Enter current password"
                    secureTextEntry
                  />

                  <Text style={styles.inputLabel}>New Password</Text>
                  <TextInput
                    style={styles.input}
                    value={passwordData.newPassword}
                    onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                    placeholder="At least 6 characters"
                    secureTextEntry
                  />

                  <Text style={styles.inputLabel}>Confirm New Password</Text>
                  <TextInput
                    style={styles.input}
                    value={passwordData.confirmPassword}
                    onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                    placeholder="Confirm new password"
                    secureTextEntry
                  />

                  <TouchableOpacity 
                    style={[styles.saveButton, isSubmitting && styles.disabledButton]} 
                    onPress={handlePasswordChangeRequest}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.saveButtonText}>
                      {isSubmitting ? 'Requesting Code...' : 'Request Verification Code'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.infoBox}>
                    <Ionicons name="mail-unread-outline" size={20} color="#2E8B57" />
                    <Text style={styles.infoText}>
                      A 6-digit code has been sent to your email. Please enter it below.
                    </Text>
                  </View>

                  <Text style={styles.inputLabel}>Verification Code</Text>
                  <TextInput
                    style={styles.input}
                    value={passwordData.code}
                    onChangeText={(text) => setPasswordData({ ...passwordData, code: text })}
                    placeholder="6-digit code"
                    keyboardType="number-pad"
                    maxLength={6}
                  />

                  <TouchableOpacity 
                    style={[styles.saveButton, isSubmitting && styles.disabledButton]} 
                    onPress={handlePasswordChangeConfirm}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.saveButtonText}>
                      {isSubmitting ? 'Verifying...' : 'Verify & Change Password'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => setPasswordStep(1)}
                  >
                    <Text style={styles.backButtonText}>Back to password entry</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 16,
    color: '#666',
  },
  statsSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  achievementsSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#FF3B30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalForm: {
    gap: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  saveButton: {
    backgroundColor: '#2E8B57',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F9F4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2E8B57',
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  backButton: {
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});