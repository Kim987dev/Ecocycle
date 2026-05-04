import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';

// Mapping MobileNet classes to waste categories
const WASTE_CATEGORIES = {
  paper: ['paper', 'envelope', 'carton', 'cardboard', 'book', 'notebook', 'tissue', 'comic book', 'menu', 'receipt', 'packet'],
  glass: ['glass', 'bottle', 'jar', 'wine bottle', 'beer', 'goblet', 'pitcher', 'beaker'],
  chemical: ['chemical', 'battery', 'detergent', 'soap', 'pill', 'syringe', 'spray', 'lotion', 'perfume'],
  'e-waste': ['laptop', 'computer', 'mouse', 'keyboard', 'monitor', 'television', 'phone', 'ipod', 'printer', 'modem', 'remote', 'joystick', 'radio', 'disc', 'solar'],
  organic: ['food', 'fruit', 'banana', 'apple', 'orange', 'lemon', 'strawberry', 'vegetable', 'broccoli', 'mushroom', 'pizza', 'hotdog', 'hamburger', 'leaf', 'flower', 'plant', 'corn', 'pineapple', 'pepper', 'cucumber', 'cabbage', 'fig', 'acorn', 'squash', 'pretzel', 'bagel', 'potpie', 'guacamole', 'bread', 'meat', 'potato']
};

const mapPredictionToCategory = (predictions) => {
  for (let pred of predictions) {
    const className = pred.className.toLowerCase();
    for (let [category, keywords] of Object.entries(WASTE_CATEGORIES)) {
      if (keywords.some(k => className.includes(k))) {
        return category;
      }
    }
  }
  return 'Unknown Material';
};

export default function WasteScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  
  const [isTfReady, setIsTfReady] = useState(false);
  const [model, setModel] = useState(null);
  
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

  if (!permission) {
    // Camera permissions are still loading.
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.centered}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.doneBtn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        setLoading(true);
        const photo = await cameraRef.current.takePictureAsync({ base64: true });
        setImage(photo.uri);
        
        if (model && photo.base64) {
          const imgBuffer = tf.util.encodeString(photo.base64, 'base64').buffer;
          const raw = new Uint8Array(imgBuffer);
          const imageTensor = decodeJpeg(raw);
          const predictions = await model.classify(imageTensor);
          
          console.log("Raw Predictions:", predictions);
          const category = mapPredictionToCategory(predictions);
          setResult(category);
          tf.dispose(imageTensor); // Free memory
        } else {
          setResult("AI Model not ready");
        }
      } catch (error) {
        console.error("Capture Error:", error);
        Alert.alert("Error", "Failed to capture or classify image");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isTfReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={{ marginTop: 15, fontWeight: '600', color: '#374151' }}>Initialising EcoCycle AI...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!image ? (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} ref={cameraRef} facing="back">
            <View style={styles.overlay}>
               <View style={styles.scannerFrame} />
               <View style={styles.hintContainer}>
                 <Text style={styles.hintText}>Align waste within the frame</Text>
               </View>
            </View>
            <View style={styles.controls}>
              <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                 <View style={styles.captureInner} />
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: image }} style={styles.previewImage} />
          </View>
          
          <View style={styles.resultCard}>
            {loading ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <ActivityIndicator size="small" color="#059669" />
                <Text style={{ color: '#6b7280', marginTop: 10 }}>Analyzing Material...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.label}>DETECTED MATERIAL</Text>
                <Text style={styles.value}>{(result || '').toUpperCase()}</Text>
                <TouchableOpacity style={styles.doneBtn} onPress={() => {setImage(null); setResult(null);}}>
                   <Text style={styles.btnText}>Confirm & Add to Rewards</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          <TouchableOpacity style={styles.retakeBtn} onPress={() => {setImage(null); setResult(null);}}>
            <Text style={styles.retakeBtnText}>Discard & Retake</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff',
    padding: 20,
  },
  cameraContainer: { 
    flex: 1, 
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlay: { 
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%',
  },
  scannerFrame: { 
    width: 240, 
    height: 240, 
    borderWidth: 2,
    borderColor: '#10b981',
    borderStyle: 'dashed',
    borderRadius: 24 
  },
  hintContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  hintText: {
    color: 'white',
    fontSize: 14
  },
  controls: { 
    paddingBottom: 60,
    width: '100%',
    alignItems: 'center'
  },
  captureBtn: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  captureInner: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: 'white' 
  },
  previewContainer: { 
    flex: 1, 
    backgroundColor: '#f3f4f6', 
    padding: 24, 
    alignItems: 'center'
  },
  imageWrapper: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  previewImage: { 
    width: '100%', 
    height: '100%',
  },
  resultCard: { 
    width: '100%',
    backgroundColor: 'white', 
    padding: 24, 
    borderRadius: 24, 
    marginTop: 24, 
    alignItems: 'center', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  label: { color: '#6b7280', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  value: { color: '#059669', fontSize: 28, fontWeight: '800', marginBottom: 24, textTransform: 'capitalize' },
  doneBtn: { 
    backgroundColor: '#059669', 
    padding: 16, 
    borderRadius: 14, 
    width: '100%', 
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  retakeBtn: {
    marginTop: 20,
    padding: 10,
  },
  retakeBtnText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '500',
  }
});