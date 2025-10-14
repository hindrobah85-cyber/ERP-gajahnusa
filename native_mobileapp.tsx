// mobile/App.js
/**
 * React Native Mobile App - ERP Anti-Fraud System
 * Mobile-first design untuk sales, driver, dan field workers
 * Terintegrasi dengan backend API
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Modal,
  RefreshControl
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 
import * as FaceDetector from 'expo-face-detector';
import { BarCodeScanner } from 'expo-barcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'http://localhost:8000/api';

// ============= API SERVICE =============
class ApiService {
  constructor() {
    this.token = null;
    this.isOnline = true;
    this.offlineQueue = [];
    
    // Monitor network status
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected;
      if (this.isOnline) {
        this.syncOfflineData();
      }
    });
  }

  async setToken(token) {
    this.token = token;
    await AsyncStorage.setItem('authToken', token);
  }

  async getToken() {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('authToken');
    }
    return this.token;
  }

  async request(method, endpoint, data = null, requiresAuth = true) {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {}
    };

    if (requiresAuth) {
      const token = await this.getToken();
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    // If offline, queue the request
    if (!this.isOnline && method !== 'GET') {
      this.offlineQueue.push({ method, endpoint, data, timestamp: Date.now() });
      await AsyncStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
      return { offline: true, queued: true };
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.detail || 'Request failed');
      }
      throw error;
    }
  }

  async syncOfflineData() {
    const queuedData = await AsyncStorage.getItem('offlineQueue');
    if (queuedData) {
      this.offlineQueue = JSON.parse(queuedData);
      
      for (const request of this.offlineQueue) {
        try {
          await this.request(request.method, request.endpoint, request.data);
        } catch (error) {
          console.error('Sync failed for:', request);
        }
      }
      
      this.offlineQueue = [];
      await AsyncStorage.removeItem('offlineQueue');
    }
  }
}

const api = new ApiService();

// ============= MAIN APP COMPONENT =============
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    requestPermissions();
  }, []);

  const checkAuthStatus = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const userData = await AsyncStorage.getItem('userData');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
      setCurrentScreen('dashboard');
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (cameraStatus !== 'granted' || locationStatus !== 'granted') {
      Alert.alert('Permissions Required', 'Please grant camera and location permissions');
    }
  };

  const handleLogin = async (loginData) => {
    setLoading(true);
    try {
      const response = await api.request('POST', '/auth/login', loginData, false);
      
      await api.setToken(response.access_token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
      
      setUser(response.user);
      setIsAuthenticated(true);
      setCurrentScreen('dashboard');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} onRegister={() => setCurrentScreen('register')} />;
      case 'register':
        return <RegisterScreen onBack={() => setCurrentScreen('login')} />;
      case 'dashboard':
        return <DashboardScreen user={user} onNavigate={setCurrentScreen} onLogout={handleLogout} />;
      case 'visit':
        return <VisitScreen user={user} onBack={() => setCurrentScreen('dashboard')} />;
      case 'payment':
        return <PaymentScreen user={user} onBack={() => setCurrentScreen('dashboard')} />;
      case 'order':
        return <OrderScreen user={user} onBack={() => setCurrentScreen('dashboard')} />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      {renderScreen()}
    </SafeAreaView>
  );
}

// ============= LOGIN SCREEN =============
const LoginScreen = ({ onLogin, onRegister }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showFaceLogin, setShowFaceLogin] = useState(false);
  const [faceImage, setFaceImage] = useState(null);
  const cameraRef = useRef(null);

  const handleStandardLogin = async () => {
    if (!employeeId || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    
    const loginData = {
      employee_id: employeeId,
      password,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      face_image: faceImage
    };

    onLogin(loginData);
  };

  const handleFaceCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ 
        quality: 0.5, 
        base64: true 
      });
      setFaceImage(photo.base64);
      setShowFaceLogin(false);
      Alert.alert('Success', 'Face captured successfully');
    }
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Icon name="shield-check" size={80} color="#0f9d58" />
          <Text style={styles.appTitle}>ERP Anti-Fraud</Text>
          <Text style={styles.appSubtitle}>Secure Business Management</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Icon name="badge-account" size={24} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Employee ID"
              placeholderTextColor="#666"
              value={employeeId}
              onChangeText={setEmployeeId}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={24} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.faceLoginButton}
            onPress={() => setShowFaceLogin(true)}
          >
            <Icon name="face-recognition" size={24} color="#0f9d58" />
            <Text style={styles.faceLoginText}>
              {faceImage ? 'Face Captured ✓' : 'Add Face Recognition'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleStandardLogin}>
            <LinearGradient 
              colors={['#0f9d58', '#0a7e46']} 
              style={styles.gradientButton}
            >
              <Text style={styles.loginButtonText}>LOGIN</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onRegister}>
            <Text style={styles.registerLink}>
              New user? Register here
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Face Capture Modal */}
      <Modal visible={showFaceLogin} animationType="slide">
        <View style={styles.cameraContainer}>
          <Camera 
            ref={cameraRef}
            style={styles.camera} 
            type={Camera.Constants.Type.front}
            onFacesDetected={({ faces }) => {
              if (faces.length > 0) {
                // Face detected
              }
            }}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.faceGuide} />
            </View>
          </Camera>
          
          <View style={styles.cameraControls}>
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={handleFaceCapture}
            >
              <Icon name="camera" size={40} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowFaceLogin(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

// ============= DASHBOARD SCREEN =============
const DashboardScreen = ({ user, onNavigate, onLogout }) => {
  const [stats, setStats] = useState({
    visits: 0,
    orders: 0,
    collections: 0,
    target: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await api.request('GET', '/dashboard/sales?period=daily');
      setStats({
        visits: response.visits.total,
        orders: response.sales.total_orders,
        collections: response.collections.total_amount,
        target: 100 // Placeholder
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const menuItems = [
    { id: 'visit', title: 'Sales Visit', icon: 'store', color: '#4CAF50' },
    { id: 'order', title: 'Create Order', icon: 'cart', color: '#2196F3' },
    { id: 'payment', title: 'Payment', icon: 'cash', color: '#FF9800' },
    { id: 'customer', title: 'Customers', icon: 'account-group', color: '#9C27B0' },
    { id: 'delivery', title: 'Delivery', icon: 'truck', color: '#00BCD4' },
    { id: 'report', title: 'Reports', icon: 'chart-bar', color: '#795548' }
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userRole}>{user?.role}</Text>
          </View>
          <TouchableOpacity onPress={onLogout}>
            <Icon name="logout" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.dashboardContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="walk" size={30} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.visits}</Text>
            <Text style={styles.statLabel}>Visits Today</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="cart-outline" size={30} color="#2196F3" />
            <Text style={styles.statValue}>{stats.orders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="cash-multiple" size={30} color="#FF9800" />
            <Text style={styles.statValue}>{stats.collections.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Collections</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="target" size={30} color="#9C27B0" />
            <Text style={styles.statValue}>{stats.target}%</Text>
            <Text style={styles.statLabel}>Target</Text>
          </View>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map(item => (
            <TouchableOpacity 
              key={item.id}
              style={styles.menuItem}
              onPress={() => onNavigate(item.id)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <Icon name={item.icon} size={32} color="#fff" />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// ============= VISIT SCREEN (WITH QR SCANNER) =============
const VisitScreen = ({ user, onBack }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [checkInData, setCheckInData] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setShowScanner(false);

    try {
      const location = await Location.getCurrentPositionAsync({});
      
      // Take selfie
      Alert.alert(
        'Take Selfie',
        'Please take a selfie with the customer',
        [
          {
            text: 'OK',
            onPress: async () => {
              // In production, implement actual selfie capture
              const response = await api.request('POST', '/visits/checkin', {
                customer_id: data.split('|')[0], // Extract customer ID from QR
                qr_code: data,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                visit_type: 'regular'
              });

              setCheckInData(response);
              Alert.alert('Success', `Checked in successfully. Distance: ${response.distance_from_store}m`);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCheckOut = async () => {
    if (!checkInData?.visit_id) {
      Alert.alert('Error', 'Please check in first');
      return;
    }

    try {
      const response = await api.request('POST', `/visits/${checkInData.visit_id}/checkout`, {
        notes: 'Visit completed successfully',
        competitor_info: 'No competitor activity'
      });

      Alert.alert('Success', `Visit completed. Duration: ${response.duration} minutes`);
      onBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={onBack}>
          <Icon name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Sales Visit</Text>
        <View style={{ width: 28 }} />
      </View>

      {showScanner ? (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        >
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerText}>Scan Customer QR Code</Text>
          </View>
        </BarCodeScanner>
      ) : (
        <ScrollView style={styles.visitContent}>
          {!checkInData ? (
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={() => {
                setShowScanner(true);
                setScanned(false);
              }}
            >
              <Icon name="qrcode-scan" size={60} color="#0f9d58" />
              <Text style={styles.scanButtonText}>Scan QR to Check In</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.visitInfo}>
              <View style={styles.infoCard}>
                <Icon name="check-circle" size={40} color="#4CAF50" />
                <Text style={styles.infoTitle}>Checked In Successfully</Text>
                <Text style={styles.infoText}>Visit ID: {checkInData.visit_id}</Text>
                <Text style={styles.infoText}>
                  Location Valid: {checkInData.location_valid ? '✓' : '✗'}
                </Text>
                <Text style={styles.infoText}>
                  Distance: {checkInData.distance_from_store}m
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={handleCheckOut}
              >
                <Text style={styles.checkoutButtonText}>Check Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

// ============= PAYMENT SCREEN (ANTI-FRAUD) =============
const PaymentScreen = ({ user, onBack }) => {
  const [notaNumber, setNotaNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receiptPhoto, setReceiptPhoto] = useState(null);
  const [otp, setOtp] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true
    });

    if (!result.cancelled) {
      setReceiptPhoto(result.base64);
      Alert.alert('Success', 'Receipt photo captured');
    }
  };

  const handleInitiatePayment = async () => {
    if (!notaNumber || !amount || !receiptPhoto) {
      Alert.alert('Error', 'Please fill all required fields and take receipt photo');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      
      const response = await api.request('POST', '/payment/initiate', {
        nota_number: notaNumber,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        receipt_photo: receiptPhoto,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      setPaymentId(response.payment_id);
      setShowOtpInput(true);
      Alert.alert('Success', 'OTP sent to customer');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter valid 6-digit OTP');
      return;
    }

    try {
      await api.request('POST', `/payment/${paymentId}/verify-otp`, { otp });
      
      Alert.alert(
        'Payment Confirmed',
        'Payment has been confirmed. Please deposit cash within 24 hours.',
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={onBack}>
          <Icon name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Payment Collection</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.paymentContent}>
        {!showOtpInput ? (
          <>
            <View style={styles.paymentForm}>
              <Text style={styles.formLabel}>Nota Number</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter nota number"
                value={notaNumber}
                onChangeText={setNotaNumber}
              />

              <Text style={styles.formLabel}>Amount</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />

              <Text style={styles.formLabel}>Payment Method</Text>
              <View style={styles.paymentMethods}>
                {['cash', 'transfer', 'giro'].map(method => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.methodButton,
                      paymentMethod === method && styles.methodButtonActive
                    ]}
                    onPress={() => setPaymentMethod(method)}
                  >
                    <Text style={[
                      styles.methodButtonText,
                      paymentMethod === method && styles.methodButtonTextActive
                    ]}>
                      {method.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.photoButton}
                onPress={handleTakePhoto}
              >
                <Icon name="camera" size={24} color="#fff" />
                <Text style={styles.photoButtonText}>
                  {receiptPhoto ? 'Receipt Photo Taken ✓' : 'Take Receipt Photo'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.warningText}>
                ⚠️ Photo must include: Cash + Nota + Your face
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleInitiatePayment}
            >
              <Text style={styles.submitButtonText}>Initiate Payment</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.otpContainer}>
            <Icon name="shield-lock" size={60} color="#0f9d58" />
            <Text style={styles.otpTitle}>Enter Customer OTP</Text>
            <Text style={styles.otpSubtitle}>
              Ask customer for the 6-digit code sent to their phone
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
            />

            <TouchableOpacity 
              style={styles.verifyButton}
              onPress={handleVerifyOtp}
            >
              <Text style={styles.verifyButtonText}>Verify Payment</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ============= ORDER SCREEN =============
const OrderScreen = ({ user, onBack }) => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load customers and products
      // In production, implement actual API calls
      setCustomers([
        { id: '1', name: 'Toko ABC', credit_limit: 5000000 },
        { id: '2', name: 'Toko XYZ', credit_limit: 3000000 }
      ]);
      
      setProducts([
        { id: '1', name: 'Product A', price: 50000 },
        { id: '2', name: 'Product B', price: 75000 }
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const addOrderItem = (product) => {
    const existingItem = orderItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      const updatedItems = orderItems.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setOrderItems(updatedItems);
    } else {
      setOrderItems([...orderItems, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price
      }]);
    }
    
    calculateTotal();
  };

  const calculateTotal = () => {
    const total = orderItems.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    );
    setTotalAmount(total);
  };

  const handleSubmitOrder = async () => {
    if (!selectedCustomer || orderItems.length === 0) {
      Alert.alert('Error', 'Please select customer and add items');
      return;
    }

    try {
      const response = await api.request('POST', '/orders/create', {
        customer_id: selectedCustomer.id,
        items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      });

      Alert.alert(
        'Order Created',
        `Order ${response.order_number} created successfully`,
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={onBack}>
          <Icon name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Create Order</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.orderContent}>
        {/* Customer Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Customer</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {customers.map(customer => (
              <TouchableOpacity
                key={customer.id}
                style={[
                  styles.customerCard,
                  selectedCustomer?.id === customer.id && styles.customerCardActive
                ]}
                onPress={() => setSelectedCustomer(customer)}
              >
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerLimit}>
                  Limit: {customer.credit_limit.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Products</Text>
          {products.map(product => (
            <TouchableOpacity
              key={product.id}
              style={styles.productItem}
              onPress={() => addOrderItem(product)}
            >
              <View>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>
                  Rp {product.price.toLocaleString()}
                </Text>
              </View>
              <Icon name="plus-circle" size={28} color="#0f9d58" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        {orderItems.length > 0 && (
          <View style={styles.orderSummary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            {orderItems.map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <Text>{item.product_name}</Text>
                <Text>{item.quantity} x {item.unit_price.toLocaleString()}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                Rp {totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.submitOrderButton}
          onPress={handleSubmitOrder}
        >
          <Text style={styles.submitOrderButtonText}>Submit Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ============= REGISTER SCREEN =============
const RegisterScreen = ({ onBack }) => {
  // Simplified for brevity - implement full registration with face capture
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.backButton}>← Back to Login</Text>
      </TouchableOpacity>
      <Text style={styles.registerTitle}>Registration</Text>
      <Text style={styles.registerSubtitle}>
        Please contact admin for registration
      </Text>
    </View>
  );
};

// ============= STYLES =============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  // Login Screen Styles
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 15,
    marginLeft: 10,
  },
  loginButton: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  faceLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },
  faceLoginText: {
    color: '#0f9d58',
    marginLeft: 10,
    fontSize: 16,
  },
  registerLink: {
    color: '#0f9d58',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  
  // Camera Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 250,
    height: 350,
    borderWidth: 3,
    borderColor: '#0f9d58',
    borderRadius: 150,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0f9d58',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 20,
    padding: 10,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
  },
  
  // Dashboard Styles
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#999',
    fontSize: 14,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userRole: {
    color: '#0f9d58',
    fontSize: 14,
    marginTop: 2,
  },
  dashboardContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    width: (width - 30) / 2,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  menuItem: {
    width: (width - 30) / 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  
  // Screen Header
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  screenTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  // Visit Screen
  visitContent: {
    flex: 1,
    padding: 20,
  },
  scanButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonText: {
    fontSize: 18,
    color: '#333',
    marginTop: 20,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#0f9d58',
    borderRadius: 10,
  },
  scannerText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 30,
  },
  visitInfo: {
    marginTop: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  checkoutButton: {
    backgroundColor: '#FF5722',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Payment Screen
  paymentContent: {
    flex: 1,
    padding: 20,
  },
  paymentForm: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  formLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: '600',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  methodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  methodButtonActive: {
    backgroundColor: '#0f9d58',
    borderColor: '#0f9d58',
  },
  methodButtonText: {
    color: '#666',
    fontSize: 14,
  },
  methodButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  photoButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  warningText: {
    color: '#FF5722',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#0f9d58',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  otpContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginTop: 50,
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  otpSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#0f9d58',
    borderRadius: 10,
    padding: 15,
    fontSize: 24,
    letterSpacing: 10,
    textAlign: 'center',
    width: 200,
  },
  verifyButton: {
    backgroundColor: '#0f9d58',
    borderRadius: 10,
    padding: 15,
    paddingHorizontal: 40,
    marginTop: 30,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Order Screen
  orderContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  customerCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    minWidth: 150,
  },
  customerCardActive: {
    borderColor: '#0f9d58',
    backgroundColor: '#e8f5e9',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  customerLimit: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  orderSummary: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#333',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f9d58',
  },
  submitOrderButton: {
    backgroundColor: '#0f9d58',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  submitOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Register Screen
  backButton: {
    color: '#0f9d58',
    fontSize: 16,
    marginBottom: 30,
  },
  registerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  registerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});