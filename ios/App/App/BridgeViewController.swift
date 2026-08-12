import UIKit
import Capacitor

class BridgeViewController: CAPBridgeViewController {

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(GhostCameraPlugin())
        bridge?.registerPluginInstance(BiometricAuthPlugin())
        bridge?.registerPluginInstance(SocialAuthPlugin())

        // Lock the WKWebView's own scroll view. Without this, iOS pans the
        // ENTIRE rendered page — including CSS `position: fixed` elements
        // like the bottom nav bar — on any swipe, sideways included, any
        // time page content is even slightly wider than the viewport. All
        // real scrolling happens inside the app's own `overflow-y: auto`
        // containers instead, which behave correctly.
        webView?.scrollView.isScrollEnabled = false
        webView?.scrollView.bounces = false
    }
}
