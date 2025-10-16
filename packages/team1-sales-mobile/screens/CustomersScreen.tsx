import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
}

const CustomersScreen: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    // Mock customer data
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+62812345678',
        company: 'ABC Corp',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+62987654321',
        company: 'XYZ Ltd',
      },
    ];
    setCustomers(mockCustomers);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity style={styles.customerCard}>
      <Text style={styles.customerName}>{item.name}</Text>
      <Text style={styles.customerInfo}>{item.company}</Text>
      <Text style={styles.customerInfo}>{item.email}</Text>
      <Text style={styles.customerInfo}>{item.phone}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search customers..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
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
  searchInput: {
    backgroundColor: 'white',
    margin: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  customerCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  customerInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default CustomersScreen;