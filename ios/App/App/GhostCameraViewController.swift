import UIKit
import AVFoundation

protocol GhostCameraDelegate: AnyObject {
    func ghostCameraDidCapture(base64Image: String)
    func ghostCameraDidCancel()
    func ghostCameraDidFail(error: String)
}

class GhostCameraViewController: UIViewController {

    // MARK: - Delegate

    weak var delegate: GhostCameraDelegate?

    // MARK: - AVFoundation

    private let captureSession = AVCaptureSession()
    private var previewLayer: AVCaptureVideoPreviewLayer!
    private let photoOutput = AVCapturePhotoOutput()
    private var currentCameraPosition: AVCaptureDevice.Position = .back

    // MARK: - Ghost Overlay

    private let ghostImageView = UIImageView()
    private var ghostOpacity: CGFloat = 0.3

    // MARK: - UI Controls

    private let opacitySlider = UISlider()
    private let captureButton = UIButton(type: .system)
    private let cancelButton = UIButton(type: .system)
    private let flipButton = UIButton(type: .system)
    private let toggleGhostButton = UIButton(type: .system)
    private let flashButton = UIButton(type: .system)
    private let opacityLabel = UILabel()

    // MARK: - Container Views

    private let cameraContainerView = UIView()
    private let controlsContainerView = UIView()

    // MARK: - State

    private var isGhostVisible = true
    private var isFlashOn = false

    // MARK: - Configuration

    /// Set the ghost image directly (used when base64 decode succeeds before presenting)
    var ghostImage: UIImage? {
        didSet {
            if isViewLoaded {
                applyGhostImage(ghostImage)
            }
        }
    }

    /// Set a remote URL to download the ghost image from (downloaded after camera appears)
    var ghostImageURL: String?

    /// Set initial opacity (0.0 - 1.0), default 0.3
    var initialOpacity: CGFloat = 0.3

    // MARK: - Lifecycle

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black

        setupCameraContainer()
        setupCamera()
        setupGhostOverlay()
        setupControls()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer?.frame = cameraContainerView.bounds
        ghostImageView.frame = cameraContainerView.bounds
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)

        // Report any setup errors now that delegate is wired and VC is fully presented
        if let error = cameraSetupError {
            delegate?.ghostCameraDidFail(error: error)
            dismiss(animated: true)
            return
        }

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.captureSession.startRunning()
        }

        // If no ghost image was set directly but we have a URL, download it now
        if ghostImage == nil, let urlString = ghostImageURL {
            downloadAndApplyGhostImage(from: urlString)
        }
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        captureSession.stopRunning()

        // Turn off torch when leaving
        if let device = getCamera(for: .back), device.hasTorch, device.torchMode == .on {
            do {
                try device.lockForConfiguration()
                device.torchMode = .off
                device.unlockForConfiguration()
            } catch {}
        }
    }

    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        return .portrait
    }

    override var preferredInterfaceOrientationForPresentation: UIInterfaceOrientation {
        return .portrait
    }

    override var prefersStatusBarHidden: Bool {
        return true
    }

    // MARK: - Camera Setup

    private func setupCameraContainer() {
        cameraContainerView.translatesAutoresizingMaskIntoConstraints = false
        cameraContainerView.backgroundColor = .black
        cameraContainerView.clipsToBounds = true
        view.addSubview(cameraContainerView)

        NSLayoutConstraint.activate([
            cameraContainerView.topAnchor.constraint(equalTo: view.topAnchor),
            cameraContainerView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            cameraContainerView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            cameraContainerView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
    }

    private var cameraSetupError: String?

    private func setupCamera() {
        // Double-check native camera authorization
        let authStatus = AVCaptureDevice.authorizationStatus(for: .video)
        guard authStatus == .authorized else {
            cameraSetupError = "Camera access not authorized (status: \(authStatus.rawValue))"
            return
        }

        captureSession.sessionPreset = .photo

        guard let camera = getCamera(for: .back) ?? getCamera(for: .front) else {
            cameraSetupError = "No camera available"
            return
        }
        currentCameraPosition = camera.position

        do {
            let input = try AVCaptureDeviceInput(device: camera)
            if captureSession.canAddInput(input) {
                captureSession.addInput(input)
            }
        } catch {
            cameraSetupError = "Failed to access camera: \(error.localizedDescription)"
            return
        }

        guard captureSession.canAddOutput(photoOutput) else {
            cameraSetupError = "Failed to configure photo capture output"
            return
        }
        captureSession.addOutput(photoOutput)

        // Preview layer — bottom of the stack
        previewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
        previewLayer.videoGravity = .resizeAspectFill
        previewLayer.frame = cameraContainerView.bounds
        cameraContainerView.layer.addSublayer(previewLayer)
    }

    private func getCamera(for position: AVCaptureDevice.Position) -> AVCaptureDevice? {
        let discoverySession = AVCaptureDevice.DiscoverySession(
            deviceTypes: [.builtInWideAngleCamera],
            mediaType: .video,
            position: position
        )
        return discoverySession.devices.first
    }

    // MARK: - Ghost Overlay Setup

    private func setupGhostOverlay() {
        ghostImageView.contentMode = .scaleAspectFill
        ghostImageView.clipsToBounds = true
        ghostImageView.alpha = initialOpacity
        ghostImageView.isUserInteractionEnabled = false
        ghostImageView.frame = cameraContainerView.bounds

        // Ghost image view sits above preview layer, below controls
        cameraContainerView.addSubview(ghostImageView)

        ghostOpacity = initialOpacity

        // Apply already-set image
        if let image = ghostImage {
            applyGhostImage(image)
        }

        print("[GhostCamera] setupGhostOverlay done — frame: \(ghostImageView.frame), hasImage: \(ghostImage != nil), alpha: \(initialOpacity)")
    }

    /// Apply a UIImage to the ghost overlay
    private func applyGhostImage(_ image: UIImage?) {
        ghostImageView.image = image
        print("[GhostCamera] applyGhostImage: \(image?.size ?? .zero), alpha=\(ghostImageView.alpha)")
    }

    /// Download ghost image from URL and apply it, with retry logic
    private func downloadAndApplyGhostImage(from urlString: String, attempt: Int = 1) {
        let maxAttempts = 3
        guard let url = URL(string: urlString) else {
            print("[GhostCamera] Invalid ghost image URL")
            return
        }

        if attempt == 1 {
            showDownloadingIndicator()
        }

        print("[GhostCamera] Downloading ghost image (attempt \(attempt)/\(maxAttempts))...")
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            if let error = error {
                print("[GhostCamera] Ghost image download error: \(error.localizedDescription)")
                self?.retryOrGiveUp(urlString: urlString, attempt: attempt, maxAttempts: maxAttempts)
                return
            }
            if let httpResponse = response as? HTTPURLResponse {
                print("[GhostCamera] Ghost image download HTTP \(httpResponse.statusCode), bytes: \(data?.count ?? 0)")
                guard httpResponse.statusCode == 200 else {
                    self?.retryOrGiveUp(urlString: urlString, attempt: attempt, maxAttempts: maxAttempts)
                    return
                }
            }
            guard let data = data, let image = UIImage(data: data) else {
                print("[GhostCamera] Failed to create UIImage from download")
                self?.retryOrGiveUp(urlString: urlString, attempt: attempt, maxAttempts: maxAttempts)
                return
            }
            DispatchQueue.main.async {
                guard let self = self else { return }
                self.hideDownloadingIndicator()
                self.ghostImage = image
                print("[GhostCamera] Ghost image applied from URL download: \(image.size)")
            }
        }.resume()
    }

    private func retryOrGiveUp(urlString: String, attempt: Int, maxAttempts: Int) {
        if attempt < maxAttempts {
            // Retry after a short delay (1s, 2s)
            let delay = Double(attempt)
            print("[GhostCamera] Retrying in \(delay)s...")
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
                self?.downloadAndApplyGhostImage(from: urlString, attempt: attempt + 1)
            }
        } else {
            print("[GhostCamera] All \(maxAttempts) download attempts failed")
            DispatchQueue.main.async { [weak self] in
                self?.hideDownloadingIndicator()
            }
        }
    }

    private var downloadingSpinner: UIActivityIndicatorView?
    private var downloadingLabel: UILabel?

    private func showDownloadingIndicator() {
        let spinner = UIActivityIndicatorView(style: .large)
        spinner.color = .white
        spinner.translatesAutoresizingMaskIntoConstraints = false
        spinner.startAnimating()
        controlsContainerView.addSubview(spinner)

        let label = UILabel()
        label.text = "Loading overlay..."
        label.textColor = UIColor.white.withAlphaComponent(0.7)
        label.font = .systemFont(ofSize: 13, weight: .medium)
        label.translatesAutoresizingMaskIntoConstraints = false
        controlsContainerView.addSubview(label)

        NSLayoutConstraint.activate([
            spinner.centerXAnchor.constraint(equalTo: controlsContainerView.centerXAnchor),
            spinner.centerYAnchor.constraint(equalTo: controlsContainerView.centerYAnchor, constant: -12),
            label.centerXAnchor.constraint(equalTo: controlsContainerView.centerXAnchor),
            label.topAnchor.constraint(equalTo: spinner.bottomAnchor, constant: 8),
        ])

        downloadingSpinner = spinner
        downloadingLabel = label
    }

    private func hideDownloadingIndicator() {
        downloadingSpinner?.removeFromSuperview()
        downloadingLabel?.removeFromSuperview()
        downloadingSpinner = nil
        downloadingLabel = nil
    }

    // MARK: - Controls Setup

    private func setupControls() {
        controlsContainerView.translatesAutoresizingMaskIntoConstraints = false
        controlsContainerView.backgroundColor = .clear
        controlsContainerView.isUserInteractionEnabled = true
        view.addSubview(controlsContainerView)

        NSLayoutConstraint.activate([
            controlsContainerView.topAnchor.constraint(equalTo: view.topAnchor),
            controlsContainerView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            controlsContainerView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            controlsContainerView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])

        setupTopBar()
        setupBottomBar()
        setupOpacitySlider()
    }

    private func setupTopBar() {
        // Cancel button (top-left)
        cancelButton.translatesAutoresizingMaskIntoConstraints = false
        cancelButton.setTitle("Cancel", for: .normal)
        cancelButton.setTitleColor(.white, for: .normal)
        cancelButton.titleLabel?.font = .systemFont(ofSize: 17, weight: .regular)
        cancelButton.addTarget(self, action: #selector(cancelTapped), for: .touchUpInside)
        controlsContainerView.addSubview(cancelButton)

        // Flip camera button (top-right)
        flipButton.translatesAutoresizingMaskIntoConstraints = false
        let flipConfig = UIImage.SymbolConfiguration(pointSize: 22, weight: .medium)
        flipButton.setImage(UIImage(systemName: "camera.rotate", withConfiguration: flipConfig), for: .normal)
        flipButton.tintColor = .white
        flipButton.addTarget(self, action: #selector(flipTapped), for: .touchUpInside)
        controlsContainerView.addSubview(flipButton)

        // Flash button (top-right area)
        flashButton.translatesAutoresizingMaskIntoConstraints = false
        let flashConfig = UIImage.SymbolConfiguration(pointSize: 22, weight: .medium)
        flashButton.setImage(UIImage(systemName: "bolt.slash.fill", withConfiguration: flashConfig), for: .normal)
        flashButton.tintColor = UIColor.white.withAlphaComponent(0.5)
        flashButton.addTarget(self, action: #selector(flashTapped), for: .touchUpInside)
        controlsContainerView.addSubview(flashButton)

        // Toggle ghost button (top-center-right)
        toggleGhostButton.translatesAutoresizingMaskIntoConstraints = false
        let ghostConfig = UIImage.SymbolConfiguration(pointSize: 22, weight: .medium)
        toggleGhostButton.setImage(UIImage(systemName: "eye.fill", withConfiguration: ghostConfig), for: .normal)
        toggleGhostButton.tintColor = .white
        toggleGhostButton.addTarget(self, action: #selector(toggleGhostTapped), for: .touchUpInside)
        controlsContainerView.addSubview(toggleGhostButton)

        NSLayoutConstraint.activate([
            cancelButton.topAnchor.constraint(equalTo: controlsContainerView.safeAreaLayoutGuide.topAnchor, constant: 8),
            cancelButton.leadingAnchor.constraint(equalTo: controlsContainerView.leadingAnchor, constant: 16),

            flipButton.topAnchor.constraint(equalTo: controlsContainerView.safeAreaLayoutGuide.topAnchor, constant: 8),
            flipButton.trailingAnchor.constraint(equalTo: controlsContainerView.trailingAnchor, constant: -16),
            flipButton.widthAnchor.constraint(equalToConstant: 44),
            flipButton.heightAnchor.constraint(equalToConstant: 44),

            flashButton.topAnchor.constraint(equalTo: controlsContainerView.safeAreaLayoutGuide.topAnchor, constant: 8),
            flashButton.trailingAnchor.constraint(equalTo: flipButton.leadingAnchor, constant: -12),
            flashButton.widthAnchor.constraint(equalToConstant: 44),
            flashButton.heightAnchor.constraint(equalToConstant: 44),

            toggleGhostButton.topAnchor.constraint(equalTo: controlsContainerView.safeAreaLayoutGuide.topAnchor, constant: 8),
            toggleGhostButton.trailingAnchor.constraint(equalTo: flashButton.leadingAnchor, constant: -12),
            toggleGhostButton.widthAnchor.constraint(equalToConstant: 44),
            toggleGhostButton.heightAnchor.constraint(equalToConstant: 44),
        ])
    }

    private func setupBottomBar() {
        // Capture button (center bottom) — uses the Budder Buddy droplet mascot
        captureButton.translatesAutoresizingMaskIntoConstraints = false
        captureButton.backgroundColor = .clear
        captureButton.layer.cornerRadius = 40
        captureButton.layer.borderWidth = 3
        captureButton.layer.borderColor = UIColor.white.withAlphaComponent(0.6).cgColor
        captureButton.clipsToBounds = true
        captureButton.addTarget(self, action: #selector(captureTapped), for: .touchUpInside)
        controlsContainerView.addSubview(captureButton)

        // Mascot image inside capture button
        let mascotImageView = UIImageView()
        mascotImageView.translatesAutoresizingMaskIntoConstraints = false
        mascotImageView.image = UIImage(named: "CaptureButton")
        mascotImageView.contentMode = .scaleAspectFill
        mascotImageView.clipsToBounds = true
        mascotImageView.layer.cornerRadius = 37
        mascotImageView.isUserInteractionEnabled = false
        captureButton.addSubview(mascotImageView)

        NSLayoutConstraint.activate([
            captureButton.centerXAnchor.constraint(equalTo: controlsContainerView.centerXAnchor),
            captureButton.bottomAnchor.constraint(equalTo: controlsContainerView.safeAreaLayoutGuide.bottomAnchor, constant: -30),
            captureButton.widthAnchor.constraint(equalToConstant: 80),
            captureButton.heightAnchor.constraint(equalToConstant: 80),

            mascotImageView.centerXAnchor.constraint(equalTo: captureButton.centerXAnchor),
            mascotImageView.centerYAnchor.constraint(equalTo: captureButton.centerYAnchor),
            mascotImageView.widthAnchor.constraint(equalToConstant: 74),
            mascotImageView.heightAnchor.constraint(equalToConstant: 74),
        ])
    }

    private func setupOpacitySlider() {
        // Opacity label
        opacityLabel.translatesAutoresizingMaskIntoConstraints = false
        opacityLabel.text = "Ghost: \(Int(initialOpacity * 100))%"
        opacityLabel.textColor = .white
        opacityLabel.font = .systemFont(ofSize: 13, weight: .medium)
        opacityLabel.textAlignment = .center
        controlsContainerView.addSubview(opacityLabel)

        // Slider
        opacitySlider.translatesAutoresizingMaskIntoConstraints = false
        opacitySlider.minimumValue = 0.0
        opacitySlider.maximumValue = 1.0
        opacitySlider.value = Float(initialOpacity)
        opacitySlider.minimumTrackTintColor = .white
        opacitySlider.maximumTrackTintColor = UIColor.white.withAlphaComponent(0.3)
        opacitySlider.thumbTintColor = .white
        opacitySlider.addTarget(self, action: #selector(opacityChanged(_:)), for: .valueChanged)
        controlsContainerView.addSubview(opacitySlider)

        NSLayoutConstraint.activate([
            opacityLabel.bottomAnchor.constraint(equalTo: captureButton.topAnchor, constant: -50),
            opacityLabel.centerXAnchor.constraint(equalTo: controlsContainerView.centerXAnchor),

            opacitySlider.topAnchor.constraint(equalTo: opacityLabel.bottomAnchor, constant: 4),
            opacitySlider.leadingAnchor.constraint(equalTo: controlsContainerView.leadingAnchor, constant: 40),
            opacitySlider.trailingAnchor.constraint(equalTo: controlsContainerView.trailingAnchor, constant: -40),
        ])
    }

    // MARK: - Actions

    @objc private func cancelTapped() {
        captureSession.stopRunning()
        delegate?.ghostCameraDidCancel()
        dismiss(animated: true)
    }

    @objc private func captureTapped() {
        // Briefly animate the capture button
        UIView.animate(withDuration: 0.1, animations: {
            self.captureButton.transform = CGAffineTransform(scaleX: 0.9, y: 0.9)
        }) { _ in
            UIView.animate(withDuration: 0.1) {
                self.captureButton.transform = .identity
            }
        }

        // Temporarily hide ghost overlay for capture
        let previousAlpha = ghostImageView.alpha
        ghostImageView.alpha = 0

        let settings = AVCapturePhotoSettings()
        if #available(iOS 16.0, *) {
            // maxPhotoDimensions on the output handles high-res; setting isHighResolutionPhotoEnabled
            // on iOS 17+ throws NSInvalidArgumentException when maxPhotoDimensions isn't set.
        } else {
            settings.isHighResolutionPhotoEnabled = true
        }

        // Enable flash if the user toggled it on
        if isFlashOn {
            settings.flashMode = .on
        }

        photoOutput.capturePhoto(with: settings, delegate: self)

        // Restore ghost after short delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            if self.isGhostVisible {
                self.ghostImageView.alpha = previousAlpha
            }
        }
    }

    @objc private func flipTapped() {
        captureSession.beginConfiguration()

        // Remove existing input
        if let currentInput = captureSession.inputs.first as? AVCaptureDeviceInput {
            captureSession.removeInput(currentInput)
        }

        // Switch position
        let newPosition: AVCaptureDevice.Position = (currentCameraPosition == .back) ? .front : .back
        guard let newCamera = getCamera(for: newPosition) else {
            captureSession.commitConfiguration()
            return
        }

        do {
            let newInput = try AVCaptureDeviceInput(device: newCamera)
            if captureSession.canAddInput(newInput) {
                captureSession.addInput(newInput)
                currentCameraPosition = newPosition
            }
        } catch {
            print("[GhostCamera] Failed to flip camera: \(error)")
        }

        captureSession.commitConfiguration()

        // Mirror ghost image for front camera to match selfie view
        if currentCameraPosition == .front {
            ghostImageView.transform = CGAffineTransform(scaleX: -1, y: 1)
        } else {
            ghostImageView.transform = .identity
        }

        // Manage torch when switching cameras
        if isFlashOn {
            if currentCameraPosition == .back, let device = getCamera(for: .back), device.hasTorch {
                do {
                    try device.lockForConfiguration()
                    device.torchMode = .on
                    device.unlockForConfiguration()
                } catch {}
            }
        }

        // Hide flash button for front camera (no torch), show for back
        flashButton.isHidden = (currentCameraPosition == .front)
    }

    @objc private func toggleGhostTapped() {
        isGhostVisible.toggle()

        UIView.animate(withDuration: 0.2) {
            self.ghostImageView.alpha = self.isGhostVisible ? CGFloat(self.opacitySlider.value) : 0
        }

        let ghostConfig = UIImage.SymbolConfiguration(pointSize: 22, weight: .medium)
        let iconName = isGhostVisible ? "eye.fill" : "eye.slash.fill"
        toggleGhostButton.setImage(UIImage(systemName: iconName, withConfiguration: ghostConfig), for: .normal)
        toggleGhostButton.tintColor = isGhostVisible ? .white : UIColor.white.withAlphaComponent(0.5)

        // Show/hide slider
        UIView.animate(withDuration: 0.2) {
            self.opacitySlider.alpha = self.isGhostVisible ? 1.0 : 0.3
            self.opacityLabel.alpha = self.isGhostVisible ? 1.0 : 0.3
        }
    }

    @objc private func flashTapped() {
        isFlashOn.toggle()

        // Update button icon
        let flashConfig = UIImage.SymbolConfiguration(pointSize: 22, weight: .medium)
        let iconName = isFlashOn ? "bolt.fill" : "bolt.slash.fill"
        flashButton.setImage(UIImage(systemName: iconName, withConfiguration: flashConfig), for: .normal)
        flashButton.tintColor = isFlashOn ? .systemYellow : UIColor.white.withAlphaComponent(0.5)

        // Toggle torch (continuous light) so user can see the framing
        guard currentCameraPosition == .back,
              let device = getCamera(for: .back),
              device.hasTorch else { return }

        do {
            try device.lockForConfiguration()
            device.torchMode = isFlashOn ? .on : .off
            device.unlockForConfiguration()
        } catch {
            print("[GhostCamera] Failed to toggle torch: \(error)")
        }
    }

    @objc private func opacityChanged(_ slider: UISlider) {
        ghostOpacity = CGFloat(slider.value)
        ghostImageView.alpha = ghostOpacity
        opacityLabel.text = "Ghost: \(Int(ghostOpacity * 100))%"
    }
}

// MARK: - AVCapturePhotoCaptureDelegate

extension GhostCameraViewController: AVCapturePhotoCaptureDelegate {

    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        if let error = error {
            delegate?.ghostCameraDidFail(error: "Capture failed: \(error.localizedDescription)")
            DispatchQueue.main.async { self.dismiss(animated: true) }
            return
        }

        guard let imageData = photo.fileDataRepresentation() else {
            delegate?.ghostCameraDidFail(error: "Failed to get image data")
            DispatchQueue.main.async { self.dismiss(animated: true) }
            return
        }

        guard var image = UIImage(data: imageData) else {
            delegate?.ghostCameraDidFail(error: "Failed to create image from data")
            DispatchQueue.main.async { self.dismiss(animated: true) }
            return
        }

        // Mirror front camera image
        if currentCameraPosition == .front {
            if let cgImage = image.cgImage {
                image = UIImage(cgImage: cgImage, scale: image.scale, orientation: .leftMirrored)
            }
        }

        // Compress to JPEG
        guard let jpegData = image.jpegData(compressionQuality: 0.85) else {
            delegate?.ghostCameraDidFail(error: "Failed to compress image")
            DispatchQueue.main.async { self.dismiss(animated: true) }
            return
        }

        let base64String = jpegData.base64EncodedString()

        DispatchQueue.main.async { [weak self] in
            self?.captureSession.stopRunning()
            self?.delegate?.ghostCameraDidCapture(base64Image: base64String)
            self?.dismiss(animated: true)
        }
    }
}
