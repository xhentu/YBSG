import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CalcDetail() {
  const { data } = useLocalSearchParams();
  const router = useRouter();
  const item = JSON.parse(data);

  const renderPath = (leg, idx) => {
    try {
      const geo = typeof leg.geometry === 'string' ? JSON.parse(leg.geometry) : leg.geometry;
      const coords = geo.geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
      return <Polyline key={idx} coordinates={coords} strokeColor={`#${leg.color}`} strokeWidth={4} />;
    } catch (e) { return null; }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} provider={PROVIDER_GOOGLE} initialRegion={{ latitude: item.startStop.lat, longitude: item.startStop.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }}>
        {item.legs.map((leg, i) => renderPath(leg, i))}
        <Marker coordinate={{ latitude: item.startStop.lat, longitude: item.startStop.lng }} title="Start" pinColor="green" />
        {item.midStop && <Marker coordinate={{ latitude: item.midStop.lat, longitude: item.midStop.lng }} title="Transfer" pinColor="orange" />}
        <Marker coordinate={{ latitude: item.endStop.lat, longitude: item.endStop.lng }} title="Destination" pinColor="red" />
      </MapView>

      <View style={styles.panel}>
        <Text style={styles.title}>{item.busNumbers.join(' → ')}</Text>
        <Text>{item.type === 'DIRECT' ? `Take Bus ${item.busNumbers[0]} straight to destination.` : `Take ${item.busNumbers[0]}, then switch to ${item.busNumbers[1]} at ${item.midStop.name}.`}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}><Text style={{color: '#FFF'}}>Back to Results</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  panel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  backBtn: { marginTop: 15, backgroundColor: '#333', padding: 12, borderRadius: 8, alignItems: 'center' }
});