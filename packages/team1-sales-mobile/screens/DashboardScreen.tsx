import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AuthService } from '../src/services/AuthService';

interface Props {
  navigation: any;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    todaysSales: 0,
    pendingOrders: 0,
    customers: 0,
    products: 0,
  });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const isAuthenticated = await AuthService.checkAuthStatus();
      if (!isAuthenticated) {
        navigation.replace('Login');
        return;
      }

      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      
      // Mock dashboard data
      setStats({
        todaysSales: 1250000,
        pendingOrders: 8,
        customers: 24,
        products: 156,
      });
    } catch (error) {
      console.error('Dashboard load error:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AuthService.logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.name || 'Sales Person'}!
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatCurrency(stats.todaysSales)}</Text>
          <Text style={styles.statLabel}>Today's Sales</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pendingOrders}</Text>
          <Text style={styles.statLabel}>Pending Orders</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.customers}</Text>
          <Text style={styles.statLabel}>Active Customers</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.products}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Customers')}
        >
          <Text style={styles.menuButtonText}>Manage Customers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Orders')}
        >
          <Text style={styles.menuButtonText}>View Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.menuButtonText}>Product Catalog</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Route')}
        >
          <Text style={styles.menuButtonText}>Sales Route</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    elevation: 2,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    marginBottom: 15,
    elevation: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  menuContainer: {
    padding: 20,
  },
  menuButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 1,
  },
  menuButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default DashboardScreen;