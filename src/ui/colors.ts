// VIRALS Meme Editie - Color System
const colors = {
  // Sunburst Colors - Greens
  greenDark: '#016A2A',
  greenLight: '#22B331',

  // Sunburst Colors - Reds
  redDark: '#7E131C',
  redLight: '#EC001B',

  // Sunburst Colors - Yellows
  yellowDark: '#FF8C00',
  yellowLight: '#FFF200',

  // Sunburst Colors - Blues
  blueDark: '#1B5096',
  blueLight: '#00B1E0',

  // Sunburst Colors - Purples
  purpleDark: '#6D297F',
  purpleLight: '#B52D87',

  // Primary UI Colors
  primary: '#007AFF', // Blue button
  primaryGreen: '#4CD964', // Success green
  primaryYellow: '#FFD700', // Gold/Yellow accent

  // Backgrounds
  cardBg: '#FFFFFF',
  screen: '#FFFFFF',
  videoBg: '#000000',

  // Text
  text: '#000000',
  textLight: '#333333',
  textWhite: '#FFFFFF',

  // Interactive
  error: '#FF3B30',
  success: '#4CD964',

  // Borders
  border: '#000000',
  white: '#FFFFFF',
};

export type ColorName = keyof typeof colors;

export default colors;
