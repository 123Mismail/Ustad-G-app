import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import { WebView } from 'react-native-webview';

export default function MapView({ providers, selectedId, onSelectProvider, center }) {
  const webViewRef = useRef(null);
  const iframeRef = useRef(null);

  // Generate Leaflet HTML with markers
  // Note: We generate this independent of selectedId to prevent WebView/iframe from reloading on selection change.
  const markersJS = providers.map((p) => {
    return `
      markers['${p.id}'] = L.circleMarker([${p.lat}, ${p.lng}], {
        radius: 10,
        fillColor: '#C1FF72',
        color: '#000000',
        weight: 2,
        fillOpacity: 0.9,
      })
      .addTo(map)
      .bindPopup('<b>${p.name}</b><br/>${p.service}<br/>⭐ ${p.rating}')
      .on('click', function() {
        var msg = JSON.stringify({ type: 'SELECT', id: '${p.id}' });
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(msg);
        } else {
          window.parent.postMessage(msg, '*');
        }
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

        var markers = {};
        ${markersJS}

        window.selectMarker = function(selectedId) {
          if (!map || !markers) return;
          for (var id in markers) {
            var marker = markers[id];
            if (id == selectedId) {
              marker.setStyle({ fillColor: '#000000', radius: 14 });
              marker.openPopup();
              map.panTo(marker.getLatLng());
            } else {
              marker.setStyle({ fillColor: '#C1FF72', radius: 10 });
            }
          }
        };

        // Web Iframe postMessage receiver
        window.addEventListener('message', function(event) {
          try {
            var data = JSON.parse(event.data);
            if (data.type === 'SELECT_MARKER') {
              window.selectMarker(data.id);
            }
          } catch (e) {}
        });
      </script>
    </body>
    </html>
  `;

  // Dynamically update active marker when selection changes
  useEffect(() => {
    if (!selectedId) return;

    if (Platform.OS !== 'web' && webViewRef.current) {
      const js = `if (window.selectMarker) { window.selectMarker('${selectedId}'); } true;`;
      webViewRef.current.injectJavaScript(js);
    }

    if (Platform.OS === 'web' && iframeRef.current) {
      const msg = JSON.stringify({ type: 'SELECT_MARKER', id: selectedId });
      iframeRef.current.contentWindow.postMessage(msg, '*');
    }
  }, [selectedId]);

  // Initial selection triggers after load finishes
  const handleLoadEnd = () => {
    if (selectedId && webViewRef.current) {
      const js = `if (window.selectMarker) { window.selectMarker('${selectedId}'); } true;`;
      webViewRef.current.injectJavaScript(js);
    }
  };

  const handleIframeLoad = () => {
    if (selectedId && iframeRef.current) {
      const msg = JSON.stringify({ type: 'SELECT_MARKER', id: selectedId });
      iframeRef.current.contentWindow.postMessage(msg, '*');
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          ref={iframeRef}
          srcDoc={html}
          onLoad={handleIframeLoad}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Map"
        />
      </View>
    );
  }

  // Native WebView implementation for iOS/Android
  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        onLoadEnd={handleLoadEnd}
        style={styles.webView}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'SELECT') {
              const numericId = Number(data.id);
              onSelectProvider(isNaN(numericId) ? data.id : numericId);
            }
          } catch (e) {
            console.warn('[MapView WebView] Invalid message:', e);
          }
        }}
      />
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
  webView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});
