import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { wasteAPI } from '../../services/api';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';

// Mapping MobileNet classes to waste categories
const WASTE_CATEGORIES_MAP = {
  paper: ['paper', 'envelope', 'carton', 'cardboard', 'book', 'notebook', 'tissue', 'comic book', 'menu', 'receipt', 'packet'],
  glass: ['glass', 'bottle', 'jar', 'wine bottle', 'beer', 'goblet', 'pitcher', 'beaker'],
  chemical: ['chemical', 'battery', 'detergent', 'soap', 'pill', 'syringe', 'spray', 'lotion', 'perfume'],
  'e-waste': ['laptop', 'computer', 'mouse', 'keyboard', 'monitor', 'television', 'phone', 'ipod', 'printer', 'modem', 'remote', 'joystick', 'radio', 'disc', 'solar'],
  organic: ['food', 'fruit', 'banana', 'apple', 'orange', 'lemon', 'strawberry', 'vegetable', 'broccoli', 'mushroom', 'pizza', 'hotdog', 'hamburger', 'leaf', 'flower', 'plant', 'corn', 'pineapple', 'pepper', 'cucumber', 'cabbage', 'fig', 'acorn', 'squash', 'pretzel', 'bagel', 'potpie', 'guacamole', 'bread', 'meat', 'potato']
};

const mapPredictionToCategory = (predictions: any[]) => {
  for (let pred of predictions) {
    const className = pred.className.toLowerCase();
    for (let [category, keywords] of Object.entries(WASTE_CATEGORIES_MAP)) {
      if (keywords.some(k => className.includes(k))) {
        return { category, itemName: pred.className };
      }
    }
  }
  return { category: 'Unknown', itemName: predictions[0]?.className || 'Unknown Object' };
};
interface Category {
  id: number;
  name: string;
  icon: string;
  description?: string;
  points_per_kg?: number;
}

export default function scan() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();
  
  // Modal States
  const [isPickupModalVisible, setIsPickupModalVisible] = useState(false);
  const [isIdentifyModalVisible, setIsIdentifyModalVisible] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const [isTfReady, setIsTfReady] = useState(false);
  const [model, setModel] = useState<any>(null);
  
  const [pickupData, setPickupData] = useState({ type: '', weight: '', categoryId: 1 });
  const [identifyText, setIdentifyText] = useState('');
  const cameraRef = useRef<any>(null);

  const params = useLocalSearchParams();

  useEffect(() => {
    loadCategories();
    
    const initTF = async () => {
      try {
        await tf.ready();
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
        setIsTfReady(true);
      } catch (err) {
        console.error("TF Initialization Error:", err);
      }
    };
    initTF();
  }, []);

  useEffect(() => {
    if (params.type) {
      setPickupData({
        type: params.type as string,
        weight: '',
        categoryId: parseInt(params.categoryId as string) || 1
      });
      setIsPickupModalVisible(true);
    }
  }, [params.type]);

  const loadCategories = async () => {
    try {
      const response = await wasteAPI.getCategories();
      const rawCategories = response.categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon || '♻️',
        description: cat.description,
        points_per_kg: cat.points_per_kg
      }));
      
      const uniqueCategories = Array.from(new Map(rawCategories.map((c: any) => [c.id, c])).values()) as Category[];
      setCategories(uniqueCategories);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load waste categories');
      setCategories([
        { id: 1, name: 'Plastic', icon: '♻️' },
        { id: 2, name: 'Paper', icon: '📄' },
        { id: 3, name: 'Glass', icon: '🍶' },
        { id: 4, name: 'E-waste', icon: '📱' },
        { id: 5, name: 'Organic', icon: '🌿' },
        { id: 6, name: 'Chemicals', icon: '⚠️' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleIdentifyWaste = async () => {
    if (!identifyText) return;
    
    setIsScanning(true);
    try {
      const result = await wasteAPI.recognizeWaste(identifyText);
      if (result.recognized) {
        Alert.alert(
          'Waste Identified!',
          `Item: ${identifyText}\nCategory: ${result.category.name}\nConfidence: ${result.confidence}\n\nWould you like to schedule a pickup for this?`,
          [
            { text: 'No', style: 'cancel' },
            { 
              text: 'Yes, Schedule', 
              onPress: () => openPickupModal(result.category) 
            }
          ]
        );
      } else {
        Alert.alert('Recognition', `Search for: ${identifyText}\n\n${result.message}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to recognition service.');
    } finally {
      setIsScanning(false);
      setIsIdentifyModalVisible(false);
      setIdentifyText('');
    }
  };

  const handleOpenCamera = async () => {
    if (!permission) {
      // Permission is still loading
      return;
    }

    if (!permission.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to use the scanner.');
        return;
      }
    }
    setShowCamera(true);
  };

  const handleScan = async () => {
    if (!cameraRef.current) return;
    if (!model) {
      Alert.alert('Please Wait', 'AI Model is still loading...');
      return;
    }

    setIsScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      if (photo.base64) {
        const imgBuffer = tf.util.encodeString(photo.base64, 'base64').buffer;
        const raw = new Uint8Array(imgBuffer);
        const imageTensor = decodeJpeg(raw);
        const predictions = await model.classify(imageTensor);
        
        console.log("Raw Predictions:", predictions);
        const result = mapPredictionToCategory(predictions);
        tf.dispose(imageTensor); // Free memory

        setShowCamera(false);
        
        // Find category ID from our loaded categories, default to generic "1" if not found
        const matchedCategory = categories.find(c => c.name.toLowerCase() === result.category.toLowerCase());
        
        Alert.alert(
          'Waste Identified!',
          `Item: ${result.itemName}\nCategory: ${result.category}\n\nWould you like to schedule a pickup for this?`,
          [
            { text: 'No', style: 'cancel' },
            { 
              text: 'Yes, Schedule', 
              onPress: () => openPickupModal(matchedCategory || { name: result.category, id: 1 }) 
            }
          ]
        );
      }
    } catch (error) {
      console.error("Capture Error:", error);
      Alert.alert("Error", "Failed to capture or classify image");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSchedulePickupSubmit = async () => {
    if (!pickupData.type) {
      Alert.alert('Error', 'Please enter waste type');
      return;
    }
    try {
      const weight = parseInt(pickupData.weight) || 1;
      await wasteAPI.createRequest({
        wasteType: pickupData.type,
        quantityKg: weight,
        description: 'Scheduled via mobile scanner',
        categoryId: pickupData.categoryId
      });
      
      Alert.alert('Success', 'Your pickup request has been scheduled! A collector will contact you shortly.');
      setIsPickupModalVisible(false);
      setPickupData({ type: '', weight: '', categoryId: 1 });
    } catch (error) {
      console.error('Pickup request error:', error);
      Alert.alert('Error', 'Failed to schedule pickup. Please try again.');
    }
  };

  const openPickupModal = (category?: any) => {
    setPickupData({ 
      type: category?.name || '', 
      weight: '', 
      categoryId: category?.id || 1 
    });
    setIsPickupModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={{ marginTop: 10 }}>Loading waste categories...</Text>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView 
          style={styles.camera} 
          ref={cameraRef}
          facing="back"
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanPrompt}>Align item within the frame</Text>
            
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.closeCameraButton} onPress={() => setShowCamera(false)}>
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.scanButton} onPress={handleScan} disabled={isScanning}>
                {isScanning ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View style={styles.scanButtonInner} />
                )}
              </TouchableOpacity>
              
              <View style={{ width: 30 }} /> 
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>WASTE RECOGNITION</Text>
        </View>

        <View style={styles.checkWasteSection}>
          <Text style={styles.sectionTitle}>Check Your Waste</Text>

          <TouchableOpacity style={styles.searchItem} onPress={() => setIsIdentifyModalVisible(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="search-outline" size={20} color="#666" />
              <Text style={styles.searchItemText}>Tap to identify waste item</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.browseButton} onPress={() => openPickupModal()}>
            <Text style={styles.browseButtonText}>Schedule a Pickup Request</Text>
          </TouchableOpacity>

          <Link href="../waste-recognition/categories" asChild>
            <TouchableOpacity style={[styles.browseButton, { marginTop: 10, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#2E8B57' }]}>
              <Text style={[styles.browseButtonText, { color: '#2E8B57' }]}>Browse Detailed Guide</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.categoriesGrid}>
          {categories.map(category => (
            <TouchableOpacity 
              key={category.id} 
              style={styles.categoryItem}
              onPress={() => openPickupModal(category)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              {category.points_per_kg && (
                <Text style={styles.categoryPoints}>{category.points_per_kg} pts/kg</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.scanSection}>
          <Text style={styles.scanTitle}>Scan with Camera</Text>
          <Text style={styles.scanDescription}>
            Point your camera at the item for instant identification
          </Text>
          
          <TouchableOpacity style={styles.cameraButton} onPress={handleOpenCamera}>
            <Ionicons name="camera-outline" size={24} color="white" />
            <Text style={styles.cameraButtonText}>Open Camera</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Pickup Request Modal */}
      <Modal
        visible={isPickupModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPickupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Pickup</Text>
              <TouchableOpacity onPress={() => setIsPickupModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.inputLabel}>Waste Type</Text>
              <TextInput
                style={styles.input}
                value={pickupData.type}
                onChangeText={(text) => setPickupData({ ...pickupData, type: text })}
                placeholder="e.g. Plastic, Paper"
              />

              <Text style={styles.inputLabel}>Approximate Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={pickupData.weight}
                onChangeText={(text) => setPickupData({ ...pickupData, weight: text })}
                placeholder="e.g. 5"
                keyboardType="numeric"
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSchedulePickupSubmit}>
                <Text style={styles.saveButtonText}>Confirm Pickup Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Identify Waste Modal */}
      <Modal
        visible={isIdentifyModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsIdentifyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { marginBottom: '50%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Identify Waste</Text>
              <TouchableOpacity onPress={() => setIsIdentifyModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <TextInput
                style={styles.input}
                value={identifyText}
                onChangeText={setIdentifyText}
                placeholder="What item did you scan?"
                autoFocus={true}
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleIdentifyWaste}>
                {isScanning ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Classify & Continue</Text>
                )}
              </TouchableOpacity>
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
  checkWasteSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  searchItem: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchItemText: {
    fontSize: 16,
    color: '#666',
  },
  browseButton: {
    backgroundColor: '#2E8B57',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  categoryPoints: {
    fontSize: 12,
    color: '#2E8B57',
    marginTop: 4,
  },
  scanSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    margin: 20,
    borderRadius: 12,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  scanDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  cameraButton: {
    backgroundColor: '#1E90FF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 20,
    marginTop: 100,
  },
  scanPrompt: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
  },
  scanButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  scanButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'white',
  },
  closeCameraButton: {
    padding: 10,
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
});