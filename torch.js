/**
 * =========================================================
 * TORCH & FLASHLIGHT CONTROLLER
 * Handles:
 *  - Hardware LED Flashlight activation via Web MediaStream API
 *  - High-intensity screen beam/strobe fallback for desktop & unsupported devices
 *  - High-priority safety auto-off on exit, page blur, or navigation
 *  - Emergency instant override
 *  - Zero camera stream recording or image storage
 * =========================================================
 */

class FlashlightController {
  constructor() {
    this.mediaStream = null;
    this.videoTrack = null;
    this.isHardwareTorchOn = false;
    this.isScreenStrobeOn = false;
    this.strobeElement = null;
    this.vibrationInterval = null;

    this.initElements();
    this.setupSafetyGuards();
  }

  initElements() {
    this.strobeElement = document.getElementById('strobe-overlay');
  }

  // Set up failsafes to guarantee the flashlight is NEVER stuck on!
  setupSafetyGuards() {
    window.addEventListener('beforeunload', () => this.turnOffAll());
    window.addEventListener('pagehide', () => this.turnOffAll());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.turnOffAll();
      }
    });
  }

  /**
   * Request camera permission and turn ON hardware LED flashlight (or screen fallback)
   * @returns {Promise<{success: boolean, hardware: boolean, message: string}>}
   */
  async activateTorch() {
    if (!this.strobeElement) {
      this.initElements();
    }

    // If mediaDevices is not supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('[Torch] MediaDevices API unavailable. Activating visual strobe fallback.');
      this.startScreenStrobe();
      return { success: true, hardware: false, message: 'Screen strobe activated' };
    }

    try {
      // Request environment (back/rear) camera with torch constraint
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }
        },
        audio: false
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      const tracks = this.mediaStream.getVideoTracks();

      if (!tracks || tracks.length === 0) {
        throw new Error('No video tracks available');
      }

      this.videoTrack = tracks[0];

      // Check capabilities
      const capabilities = this.videoTrack.getCapabilities ? this.videoTrack.getCapabilities() : {};

      if (capabilities.torch) {
        await this.videoTrack.applyConstraints({
          advanced: [{ torch: true }]
        });
        this.isHardwareTorchOn = true;
        this.startVibrationPulse();
        console.log('[Torch] Hardware LED torch locked ON! 🔦');
        return { success: true, hardware: true, message: 'Hardware torch ON' };
      } else {
        console.log('[Torch] Hardware torch capability not exposed on this camera. Using screen strobe fallback.');
        this.startScreenStrobe();
        return { success: true, hardware: false, message: 'Screen strobe fallback ON' };
      }

    } catch (err) {
      console.warn('[Torch] Camera access denied or unsupported:', err.name, err.message);
      this.startScreenStrobe();
      return { success: true, hardware: false, message: 'Screen strobe fallback ON (Permission Denied)' };
    }
  }

  // Activate high-energy screen strobe simulation
  startScreenStrobe() {
    this.isScreenStrobeOn = true;
    if (this.strobeElement) {
      this.strobeElement.classList.remove('hidden');
      this.strobeElement.classList.add('active');
    }
    this.startVibrationPulse();
  }

  // Stop screen strobe simulation
  stopScreenStrobe() {
    this.isScreenStrobeOn = false;
    if (this.strobeElement) {
      this.strobeElement.classList.remove('active');
      this.strobeElement.classList.add('hidden');
    }
    this.stopVibrationPulse();
  }

  // Mobile haptic vibration feedback
  startVibrationPulse() {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100]);
        if (!this.vibrationInterval) {
          this.vibrationInterval = setInterval(() => {
            if (this.isHardwareTorchOn || this.isScreenStrobeOn) {
              navigator.vibrate([100, 250]);
            }
          }, 1500);
        }
      } catch (e) {}
    }
  }

  stopVibrationPulse() {
    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
    }
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch (e) {}
    }
  }

  // Safely turn off hardware flashlight and stop camera tracks
  async turnOffHardwareTorch() {
    if (this.videoTrack) {
      try {
        const capabilities = this.videoTrack.getCapabilities ? this.videoTrack.getCapabilities() : {};
        if (capabilities.torch) {
          await this.videoTrack.applyConstraints({
            advanced: [{ torch: false }]
          });
        }
      } catch (err) {
        console.warn('[Torch] Error resetting torch constraint:', err);
      }

      try {
        this.videoTrack.stop();
      } catch (err) {}
      this.videoTrack = null;
    }

    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach(t => t.stop());
      } catch (err) {}
      this.mediaStream = null;
    }

    this.isHardwareTorchOn = false;
    this.stopVibrationPulse();
    console.log('[Torch] Hardware LED torch safely turned OFF.');
  }

  // Master switch to shut down all flashlight operations immediately
  turnOffAll() {
    this.turnOffHardwareTorch();
    this.stopScreenStrobe();
  }

  // Emergency instant override
  emergencyTurnOff() {
    this.turnOffAll();
    console.log('[Torch] Emergency Flashlight Override Triggered.');
  }

  // Query if any illumination mode is active
  isFlashActive() {
    return this.isHardwareTorchOn || this.isScreenStrobeOn;
  }
}

// Global flashlight controller instance
window.flashlightCtrl = new FlashlightController();
