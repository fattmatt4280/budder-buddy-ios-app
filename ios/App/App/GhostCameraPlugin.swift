import Foundation
import Capacitor
import UIKit
import AVFoundation

@objc(GhostCameraPlugin)
public class GhostCameraPlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier = "GhostCameraPlugin"
    public let jsName = "GhostCamera"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "open", returnType: CAPPluginReturnPromise),
    ]

    private var savedCall: CAPPluginCall?

    /// Open the native ghost camera.
    ///
    /// Options:
    ///   - ghostImageBase64: String (base64-encoded JPEG/PNG, no data: prefix)
    ///   - opacity: Float (0.0 - 1.0, default 0.3)
    @objc func open(_ call: CAPPluginCall) {
        call.keepAlive = true
        self.savedCall = call

        let opacity = call.getFloat("opacity") ?? 0.3
        let base64String = call.getString("ghostImageBase64")
        let imageUrl = call.getString("ghostImageUrl")

        print("[GhostCameraPlugin] open() — hasBase64: \(base64String != nil), hasUrl: \(imageUrl != nil), opacity: \(opacity)")

        // Ensure native camera permission before anything else
        // Always dispatch to main thread since Capacitor may call us from background
        ensureCameraPermission { [weak self] granted in
            guard let self = self else { return }
            guard granted else {
                call.reject("Camera permission not granted")
                self.savedCall = nil
                return
            }
            self.prepareAndPresentCamera(base64String: base64String, imageUrl: imageUrl, opacity: opacity)
        }
    }

    private func ensureCameraPermission(completion: @escaping (Bool) -> Void) {
        let status = AVCaptureDevice.authorizationStatus(for: .video)
        switch status {
        case .authorized:
            DispatchQueue.main.async {
                completion(true)
            }
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                DispatchQueue.main.async {
                    completion(granted)
                }
            }
        default:
            DispatchQueue.main.async {
                completion(false)
            }
        }
    }

    private func prepareAndPresentCamera(base64String: String?, imageUrl: String?, opacity: Float) {
        // Try to decode base64 synchronously first
        var decodedImage: UIImage?
        if let base64 = base64String, !base64.isEmpty {
            let clean = base64.contains(",") ? String(base64.split(separator: ",").last ?? "") : base64
            if let data = Data(base64Encoded: clean), let image = UIImage(data: data) {
                decodedImage = image
                print("[GhostCameraPlugin] Base64 decode OK: \(image.size)")
            }
        }

        // If we have the image already, present immediately
        if let image = decodedImage {
            presentCamera(ghostImage: image, ghostImageURL: nil, opacity: opacity)
            return
        }

        // Otherwise, download the image BEFORE presenting the camera
        if let urlString = imageUrl, !urlString.isEmpty, let url = URL(string: urlString) {
            print("[GhostCameraPlugin] Pre-downloading ghost image...")
            URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
                var downloadedImage: UIImage?
                if error == nil,
                   let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200,
                   let data = data, let image = UIImage(data: data) {
                    downloadedImage = image
                    print("[GhostCameraPlugin] Pre-download OK: \(image.size)")
                } else {
                    print("[GhostCameraPlugin] Pre-download failed, VC will retry")
                }
                DispatchQueue.main.async {
                    // Present with downloaded image if available, otherwise pass URL for VC to retry
                    self?.presentCamera(ghostImage: downloadedImage, ghostImageURL: downloadedImage == nil ? urlString : nil, opacity: opacity)
                }
            }.resume()
        } else {
            // No image data at all — present camera without ghost
            presentCamera(ghostImage: nil, ghostImageURL: nil, opacity: opacity)
        }
    }

    private func presentCamera(ghostImage: UIImage?, ghostImageURL: String?, opacity: Float) {
        guard Thread.isMainThread else {
            DispatchQueue.main.async { [weak self] in
                self?.presentCamera(ghostImage: ghostImage, ghostImageURL: ghostImageURL, opacity: opacity)
            }
            return
        }

        let ghostCameraVC = GhostCameraViewController()
        ghostCameraVC.delegate = self
        ghostCameraVC.modalPresentationStyle = .fullScreen
        ghostCameraVC.initialOpacity = CGFloat(opacity)
        ghostCameraVC.ghostImage = ghostImage
        ghostCameraVC.ghostImageURL = ghostImageURL

        guard let viewController = self.bridge?.viewController else {
            savedCall?.reject("Unable to present camera")
            return
        }

        // Find the topmost presented VC to avoid presenting on one that already has a presentation
        var presenter = viewController
        while let presented = presenter.presentedViewController {
            presenter = presented
        }

        presenter.present(ghostCameraVC, animated: true)
    }
}

// MARK: - GhostCameraDelegate

extension GhostCameraPlugin: GhostCameraDelegate {

    func ghostCameraDidCapture(base64Image: String) {
        guard let call = savedCall else { return }
        call.resolve(["base64Image": base64Image])
        savedCall = nil
    }

    func ghostCameraDidCancel() {
        guard let call = savedCall else { return }
        call.resolve(["cancelled": true])
        savedCall = nil
    }

    func ghostCameraDidFail(error: String) {
        guard let call = savedCall else { return }
        call.reject(error)
        savedCall = nil
    }
}
