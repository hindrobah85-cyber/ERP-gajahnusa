import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    // Mock product data
    const mockProducts: Product[] = [
      {
        id: 'P001',
        name: 'Product A',
        description: 'High quality product A',
        price: 250000,
        stock: 150,
      },
      {
        id: 'P002',
        name: 'Product B',
        description: 'Premium product B',
        price: 350000,
        stock: 89,
      },
      {
        id: 'P003',
        name: 'Product C',
        description: 'Standard product C',
        price: 180000,
        stock: 200,
      },
    ];
    setProducts(mockProducts);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const getStockColor = (stock: number) => {
    if (stock < 50) return '#FF6B6B';
    if (stock < 100) return '#FFA500';
    return '#4CAF50';
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.productImageText}>{item.name.charAt(0)}</Text>
        </View>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
        
        <View style={styles.stockContainer}>
          <Text style={[styles.stockText, { color: getStockColor(item.stock) }]}>
            Stock: {item.stock} units
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
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
  productCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    flexDirection: 'row',
  },
  productImageContainer: {
    marginRight: 15,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 5,
  },
  stockContainer: {
    marginTop: 5,
  },
  stockText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ProductsScreen;