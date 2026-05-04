import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as mobilenet from '@tensorflow-models/mobilenet';

/**
 * Custom Hook: useClassifier
 * Handles the initialization of TensorFlow and the MobileNet model.
 */
export const useClassifier = () => {
  const [isReady, setIsReady] = useState(false);
  const [model, setModel] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await tf.ready();
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize AI Engine:", error);
      }
    };
    init();
  }, []);

  const classify = async (photo) => {
    if (!model) return null;

    try {
      // 1. Get image data
      const response = await fetch(photo.uri);
      const imageDataArrayBuffer = await response.arrayBuffer();
      const imageData = new Uint8Array(imageDataArrayBuffer);
      
      // 2. Decode into a tensor
      const imageTensor = decodeJpeg(imageData);

      // 3. Predict
      const predictions = await model.classify(imageTensor);
      
      // 4. Map to EcoCycle Categories
      const topResult = predictions[0].className.toLowerCase();
      
      if (topResult.includes('bottle') || topResult.includes('plastic')) return "Plastic";
      if (topResult.includes('paper') || topResult.includes('cardboard')) return "Paper";
      if (topResult.includes('glass') || topResult.includes('jar')) return "Glass";
      if (topResult.includes('food') || topResult.includes('fruit') || topResult.includes('veg')) return "Organic";
      if (topResult.includes('battery') || topResult.includes('chemical')) return "Chemical/Hazardous";
      
      return predictions[0].className; // Default if no specific match
    } catch (error) {
      console.error("Classification error:", error);
      return "Error Identifying";
    }
  };

  return { isReady, classify };
};