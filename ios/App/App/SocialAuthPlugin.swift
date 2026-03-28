import Foundation
import Capacitor
import AuthenticationServices
import CryptoKit
import GoogleSignIn

@objc(SocialAuthPlugin)
public class SocialAuthPlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "SocialAuthPlugin"
    public let jsName = "SocialAuth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signInWithApple", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "signInWithGoogle", returnType: CAPPluginReturnPromise),
    ]

    // Retain the authorization controller so it isn't deallocated mid-request
    private var currentAuthController: ASAuthorizationController?
    private var currentAppleDelegate: AppleSignInDelegate?

    // MARK: - Apple Sign-In

    @objc func signInWithApple(_ call: CAPPluginCall) {
        let rawNonce = randomNonceString()
        let hashedNonce = sha256(rawNonce)

        let provider = ASAuthorizationAppleIDProvider()
        let request = provider.createRequest()
        request.requestedScopes = [.fullName, .email]
        request.nonce = hashedNonce

        let delegate = AppleSignInDelegate(call: call, rawNonce: rawNonce) { [weak self] in
            // Clean up retained references after completion
            self?.currentAuthController = nil
            self?.currentAppleDelegate = nil
        }

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = delegate

        // Retain both controller and delegate as instance properties
        self.currentAuthController = controller
        self.currentAppleDelegate = delegate

        DispatchQueue.main.async {
            if let window = self.bridge?.viewController?.view.window {
                let contextProvider = AppleSignInPresentationContext(window: window)
                objc_setAssociatedObject(controller, "contextProvider", contextProvider, .OBJC_ASSOCIATION_RETAIN)
                controller.presentationContextProvider = contextProvider
            }
            controller.performRequests()
        }
    }

    // MARK: - Google Sign-In

    @objc func signInWithGoogle(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let viewController = self.bridge?.viewController else {
                call.reject("Unable to get presenting view controller")
                return
            }

            // GIDClientID is read from Info.plist automatically by the SDK.
            // If a clientId is passed from JS, use it to override.
            if let clientId = call.getString("clientId"), !clientId.isEmpty {
                GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientId)
            }

            GIDSignIn.sharedInstance.signIn(withPresenting: viewController) { result, error in
                if let error = error {
                    let nsError = error as NSError
                    if nsError.domain == GIDSignInError.errorDomain,
                       nsError.code == GIDSignInError.canceled.rawValue {
                        call.resolve(["cancelled": true])
                    } else {
                        call.reject("Google Sign-In failed: \(error.localizedDescription)")
                    }
                    return
                }

                guard let user = result?.user,
                      let idToken = user.idToken?.tokenString else {
                    call.reject("Failed to get Google ID token")
                    return
                }

                let accessToken = user.accessToken.tokenString

                call.resolve([
                    "idToken": idToken,
                    "accessToken": accessToken,
                    "email": user.profile?.email ?? "",
                    "displayName": user.profile?.name ?? "",
                    "givenName": user.profile?.givenName ?? "",
                    "familyName": user.profile?.familyName ?? "",
                ])
            }
        }
    }

    // MARK: - Helpers

    private func randomNonceString(length: Int = 32) -> String {
        precondition(length > 0)
        var randomBytes = [UInt8](repeating: 0, count: length)
        let errorCode = SecRandomCopyBytes(kSecRandomDefault, randomBytes.count, &randomBytes)
        if errorCode != errSecSuccess {
            fatalError("Unable to generate nonce. SecRandomCopyBytes failed with OSStatus \(errorCode)")
        }
        let charset: [Character] = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        return String(randomBytes.map { charset[Int($0) % charset.count] })
    }

    private func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashedData = SHA256.hash(data: inputData)
        return hashedData.compactMap { String(format: "%02x", $0) }.joined()
    }
}

// MARK: - Apple Sign-In Delegate

private class AppleSignInDelegate: NSObject, ASAuthorizationControllerDelegate {
    let call: CAPPluginCall
    let rawNonce: String
    let onComplete: () -> Void

    init(call: CAPPluginCall, rawNonce: String, onComplete: @escaping () -> Void) {
        self.call = call
        self.rawNonce = rawNonce
        self.onComplete = onComplete
    }

    func authorizationController(controller: ASAuthorizationController,
                                 didCompleteWithAuthorization authorization: ASAuthorization) {
        defer { onComplete() }

        guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let identityTokenData = appleIDCredential.identityToken,
              let identityToken = String(data: identityTokenData, encoding: .utf8) else {
            call.reject("Failed to get Apple ID token")
            return
        }

        var result: [String: Any] = [
            "idToken": identityToken,
            "nonce": rawNonce,
            "user": appleIDCredential.user,
        ]

        // Apple only provides name/email on the FIRST sign-in
        if let email = appleIDCredential.email {
            result["email"] = email
        }
        if let fullName = appleIDCredential.fullName {
            let givenName = fullName.givenName ?? ""
            let familyName = fullName.familyName ?? ""
            result["givenName"] = givenName
            result["familyName"] = familyName
            let displayName = [givenName, familyName]
                .filter { !$0.isEmpty }
                .joined(separator: " ")
            if !displayName.isEmpty {
                result["displayName"] = displayName
            }
        }

        call.resolve(result)
    }

    func authorizationController(controller: ASAuthorizationController,
                                 didCompleteWithError error: Error) {
        defer { onComplete() }

        let asError = error as? ASAuthorizationError
        if asError?.code == .canceled {
            call.resolve(["cancelled": true])
        } else {
            call.reject("Apple Sign-In failed: \(error.localizedDescription)")
        }
    }
}

// MARK: - Presentation Context

private class AppleSignInPresentationContext: NSObject, ASAuthorizationControllerPresentationContextProviding {
    let window: UIWindow

    init(window: UIWindow) {
        self.window = window
    }

    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return window
    }
}
