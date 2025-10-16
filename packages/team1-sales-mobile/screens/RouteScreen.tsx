import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

interface RouteStop {
  id: string;
  customerName: string;
  address: string;
  estimatedTime: string;
  status: 'pending' | 'completed' | 'skipped';
  priority: 'high' | 'medium' | 'low';
}

const RouteScreen: React.FC = () => {
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [currentLocation, setCurrentLocation] = useState('Jakarta Office');

  useEffect(() => {
    loadTodaysRoute();
  }, []);

  const loadTodaysRoute = () => {
    // Mock route data
    const mockRoute: RouteStop[] = [
      {
        id: 'RS001',
        customerName: 'ABC Corp',
        address: 'Jl. Sudirman No. 123, Jakarta',
        estimatedTime: '09:00 AM',
        status: 'completed',
        priority: 'high',
      },
      {
        id: 'RS002',
        customerName: 'XYZ Ltd',
        address: 'Jl. Thamrin No. 456, Jakarta',
        estimatedTime: '11:00 AM',
        status: 'pending',
        priority: 'medium',
      },
      {
        id: 'RS003',
        customerName: 'DEF Inc',
        address: 'Jl. Gatot Subroto No. 789, Jakarta',
        estimatedTime: '02:00 PM',
        status: 'pending',
        priority: 'low',
      },
    ];
    setRouteStops(mockRoute);
  };

  const updateStopStatus = (stopId: string, newStatus: RouteStop['status']) => {
    setRouteStops(prev =>
      prev.map(stop =>
        stop.id === stopId ? { ...stop, status: newStatus } : stop
      )
    );
  };

  const handleStopAction = (stop: RouteStop) => {
    if (stop.status === 'completed') {
      Alert.alert('Already Completed', 'This stop has already been completed.');
      return;
    }

    Alert.alert(
      'Update Stop Status',
      `What would you like to do with ${stop.customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Completed',
          onPress: () => updateStopStatus(stop.id, 'completed'),
        },
        {
          text: 'Skip for Now',
          style: 'destructive',
          onPress: () => updateStopStatus(stop.id, 'skipped'),
        },
      ]
    );
  };

  const getStatusColor = (status: RouteStop['status']) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'skipped': return '#FF6B6B';
      case 'pending': return '#FFA500';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: RouteStop['priority']) => {
    switch (priority) {
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const renderRouteStop = ({ item }: { item: RouteStop }) => (
    <TouchableOpacity
      style={[
        styles.stopCard,
        { borderLeftColor: getStatusColor(item.status) },
      ]}
      onPress={() => handleStopAction(item)}
    >
      <View style={styles.stopHeader}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <View style={styles.badges}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.badgeText}>{item.priority.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.address}>{item.address}</Text>
      <Text style={styles.estimatedTime}>Scheduled: {item.estimatedTime}</Text>
    </TouchableOpacity>
  );

  const completedStops = routeStops.filter(stop => stop.status === 'completed').length;
  const totalStops = routeStops.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Sales Route</Text>
        <Text style={styles.currentLocation}>Current: {currentLocation}</Text>
        <Text style={styles.progress}>
          Progress: {completedStops}/{totalStops} stops completed
        </Text>
      </View>

      <FlatList
        data={routeStops}
        renderItem={renderRouteStop}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  currentLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  progress: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 20,
  },
  stopCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    borderLeftWidth: 4,
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 5,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  estimatedTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default RouteScreen;