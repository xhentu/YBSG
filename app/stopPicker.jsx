import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function StopPicker() {
  const router = useRouter();
  const { target } = useLocalSearchParams(); // 'start' or 'end'
  
  // You should fetch all stops or just nearby ones here
  const [stops, setStops] = React.useState([]); 

  const handleSelect = (stop) => {
    // You can use a Global State (Zustand/Redux) or a callback to send this back
    // For now, let's assume you go back with params
    router.push({
      pathname: '/calc',
      params: { selectedId: stop.id, selectedName: stop.name_en, target }
    });
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{ latitude: 16.8409, longitude: 96.1735, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
      >
        {stops.map(stop => (
          <Marker 
            key={stop.id}
            coordinate={{ latitude: stop.lat, longitude: stop.lng }}
            title={stop.name_en}
            onPress={() => handleSelect(stop)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 }, map: { flex: 1 } });