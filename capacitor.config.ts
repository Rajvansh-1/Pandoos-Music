import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pandoos.music',
  appName: 'Pandoos',
  webDir: 'dist',
  server: {
    // Use HTTPS scheme on Android (required for modern web APIs)
    androidScheme: 'https',
    // Allow navigation back to the Vite dev server during development:
    // url: 'http://192.168.x.x:5173',
    // cleartext: true,
  },
  android: {
    // Allows mixed HTTP content (needed if you fetch from HTTP APIs)
    allowMixedContent: false,
    // Keep screen on while music is playing
    captureInput: false,
    // Target Android API 34+
    minWebViewVersion: 60,
  },
  ios: {
    // Required for background audio playback on iOS
    backgroundColor: '#040406',
    contentInset: 'always',
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#040406',
      // Custom splash logo (add assets/splash.png later)
      androidSplashResourceName: 'splash',
      showSpinner: false,
      iosSpinnerStyle: 'large',
      spinnerColor: '#4ADE80',
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#040406',
      overlaysWebView: false,
    },
    // Keyboard — prevent layout shift when keyboard opens
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
