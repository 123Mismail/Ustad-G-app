import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = ['#C1FF72', '#FF5A5F', '#3B5998', '#00D1B2', '#FFD166', '#4F3FF0', '#06D6A0'];

const ConfettiParticle = ({ delay }) => {
  const animatedY = useRef(new Animated.Value(-20)).current;
  const animatedX = useRef(new Animated.Value(Math.random() * SCREEN_WIDTH)).current;
  const animatedRotate = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Left-to-right drift
    const randomXOffset = (Math.random() - 0.5) * 150;
    const finalX = Math.max(10, Math.min(SCREEN_WIDTH - 10, animatedX._value + randomXOffset));

    Animated.parallel([
      Animated.timing(animatedY, {
        toValue: SCREEN_HEIGHT + 20,
        duration: 2500 + Math.random() * 1500,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(animatedX, {
        toValue: finalX,
        duration: 2500 + Math.random() * 1500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(animatedRotate, {
        toValue: 1,
        duration: 1500 + Math.random() * 2000,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, animatedY, animatedX, animatedRotate]);

  const rotation = animatedRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const size = 6 + Math.random() * 8;
  const shapeStyle = Math.random() > 0.5 ? { borderRadius: size / 2 } : {}; // Circle or Square
  const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];

  return (
    <Animated.View
      style={[
        styles.particle,
        shapeStyle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          transform: [
            { translateY: animatedY },
            { translateX: animatedX },
            { rotate: rotation },
          ],
        },
      ]}
    />
  );
};

const Confetti = forwardRef((props, ref) => {
  const [active, setActive] = useState(false);
  const [particles, setParticles] = useState([]);

  useImperativeHandle(ref, () => ({
    burst: () => {
      setActive(true);
      // Generate 60 particles with random delays
      const newParticles = Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        delay: Math.random() * 1200,
      }));
      setParticles(newParticles);
      
      // Reset after animation completes
      setTimeout(() => {
        setActive(false);
        setParticles([]);
      }, 5000);
    },
  }));

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <ConfettiParticle key={p.id} delay={p.delay} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default Confetti;
