import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f8e96625555b4f769c477869ccd21511',
  appName: 'Budder Buddy',
  webDir: 'dist',
    
  server: {
        iosScheme: 'capacitor'
  },
    
  ios: {
    contentInset: 'never',
    allowsLinkPreview: false,
    // Note: No backgroundColor set here - this allows the webview to be transparent
    // so the camera preview (which renders behind the webview) can show through.
    // The Ghost Overlay feature requires this transparency to work correctly.
    preferredContentMode: 'mobile',
    // Enable debugging for development - helps verify webview transparency
    webContentsDebuggingEnabled: true,
  },
  android: {
    // Transparent background allows camera preview to show through webview
    backgroundColor: '#00000000',
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
