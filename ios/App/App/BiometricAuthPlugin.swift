import Foundation
import Capacitor
import LocalAuthentication

@objc(BiometricAuthPlugin)
public class BiometricAuthPlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "BiometricAuthPlugin"
    public let jsName = "BiometricAuth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "checkAvailability", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "authenticate", returnType: CAPPluginReturnPromise),
    ]

    /// Check if biometric authentication is available on this device.
    /// Returns { available: Bool, biometryType: "faceId" | "touchId" | "none" }
    @objc func checkAvailability(_ call: CAPPluginCall) {
        let context = LAContext()
        var error: NSError?
        let available = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)

        let biometryType: String
        switch context.biometryType {
        case .faceID:
            biometryType = "faceId"
        case .touchID:
            biometryType = "touchId"
        default:
            biometryType = "none"
        }

        call.resolve([
            "available": available,
            "biometryType": biometryType,
        ])
    }

    /// Trigger biometric authentication.
    /// Options:
    ///   - reason: String (the message shown in the Face ID / Touch ID dialog)
    /// Returns { success: Bool, error?: String }
    @objc func authenticate(_ call: CAPPluginCall) {
        let reason = call.getString("reason") ?? "Authenticate to continue"
        let context = LAContext()
        var error: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            call.resolve([
                "success": false,
                "error": error?.localizedDescription ?? "Biometric authentication not available",
            ])
            return
        }

        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, authError in
            DispatchQueue.main.async {
                if success {
                    call.resolve(["success": true])
                } else {
                    call.resolve([
                        "success": false,
                        "error": authError?.localizedDescription ?? "Authentication failed",
                    ])
                }
            }
        }
    }
}
