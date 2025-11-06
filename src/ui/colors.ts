const colors = {
  // Primary game colors
  primary: '#FF6B35', // Vibrant orange - main accent
  secondary: '#4ECDC4', // Playful teal - secondary accent
  accent: '#FFE66D', // Bright yellow - highlights

  // Backgrounds
  screen: '#FFF9F0', // Warm off-white
  cardBg: '#FFFFFF', // Pure white for cards
  subtle: '#F4F4F4', // Light gray

  // Text
  text: '#2D3142', // Dark blue-gray
  textLight: '#6B7280', // Medium gray

  // Interactive
  success: '#4CAF50', // Green for replay/success
  error: '#EF4444', // Red for errors

  // Video UI
  videoBg: '#1A1A1A', // Dark background for video viewing
};

export type ColorName = keyof typeof colors;

export default colors;
