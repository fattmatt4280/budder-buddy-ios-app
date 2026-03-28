import UIKit
import Capacitor

class BridgeViewController: CAPBridgeViewController {

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(GhostCameraPlugin())
        bridge?.registerPluginInstance(BiometricAuthPlugin())
        bridge?.registerPluginInstance(SocialAuthPlugin())
    }
}
