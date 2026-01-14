import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f8e96625555b4f769c477869ccd21511',
  appName: 'Budder Buddy',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    backgroundColor: '#1a1a2e',
    preferredContentMode: 'mobile',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
    },
  },
};

export default config;
