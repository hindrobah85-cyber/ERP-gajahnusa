// mobile/src/components/GajahNusaLogo.tsx
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

interface GajahNusaLogoProps {
  size?: number;
}

const GajahNusaLogo: React.FC<GajahNusaLogoProps> = ({ size = 120 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image 
        source={require('../../assets/gajah-nusa-logo.png')}
        style={[styles.logo, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  logo: {
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default GajahNusaLogo;
