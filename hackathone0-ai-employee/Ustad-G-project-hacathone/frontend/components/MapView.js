import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors } from '../theme/colors';

export default function MapView({ providers, selectedId, onSelectProvider, center }) {
  // Generate Leaflet HTML with markers
  const markersJS = providers.map((p) => {
    const isSelected = p.id === selectedId;
    const color = isSelected ? '#000000' : '#C1FF72';
    const size = isSelected ? 14 : 10;
    return `
      L.circleMarker([${p.lat}, ${p.lng}], {
        radius: ${size},
        fillColor: '${color}',
        color: '#000000',
        weight: 2,
        fillOpacity: 0.9,
      })
      .addTo(map)
      .bindPopup('<b>${p.name}</b><br/>${p.service}<br/>⭐ ${p.rating}')
      .on('click', function() {
        window.parent.postMessage(JSON.stringify({ type: 'SELECT', id: '${p.id}' }), '*');
      });
    `;
  }).join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${center.lat}, ${center.lng}], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);

        // User location marker
        L.circleMarker([${center.lat}, ${center.lng}], {
          radius: 8,
          fillColor: '#4285F4',
          color: '#FFFFFF',
          weight: 3,
          fillOpacity: 1,
        }).addTo(map).bindPopup('<b>Your Location</b>');

        ${markersJS}
      </script>
    </body>
    </html>
  `;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          srcDoc={html}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Map"
        />
      </View>
    );
  }

  // Fallback for native (would use react-native-webview)
  return (
    <View style={[styles.container, styles.fallback]}>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.bgSecondary,
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
