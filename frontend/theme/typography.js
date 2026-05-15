export const Typography = {
  header: { fontSize: 28, fontWeight: '800', fontFamily: 'Inter_800ExtraBold', lineHeight: 36 },
  subheader: { fontSize: 18, fontWeight: '600', fontFamily: 'Inter_600SemiBold', lineHeight: 24 },
  body: { fontSize: 14, fontWeight: '400', fontFamily: 'Inter_400Regular', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', fontFamily: 'Inter_400Regular', lineHeight: 16 },
  
  // High-End Urdu Nastaliq Optimization
  ur: {
    header: { fontSize: 26, fontFamily: 'NotoNastaliqUrdu_700Bold', lineHeight: 52 },
    subheader: { fontSize: 20, fontFamily: 'NotoNastaliqUrdu_700Bold', lineHeight: 40 },
    body: { fontSize: 18, fontFamily: 'NotoNastaliqUrdu_400Regular', lineHeight: 36 },
    caption: { fontSize: 15, fontFamily: 'NotoNastaliqUrdu_400Regular', lineHeight: 30 },
  }
};

export const getStyle = (type, language) => {
  if (language === 'ur' && Typography.ur[type]) return Typography.ur[type];
  return Typography[type];
};

export const BorderRadius = { card: 24, button: 16, input: 12 };
