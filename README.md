# 🔦 Flash ₹5000 - Mobile Prank App

**Flash ₹5000** is an ultra-realistic, harmless mobile prank web application built with **Vanilla HTML5, CSS3, and JavaScript**. 

Designed to look like a high-grade utility app called **"FLASH CONTROL"**, it tricks the victim into believing their phone's flashlight has been locked by a security protocol and demands **₹5,000** to turn it off. Only after interacting with the fake payment gateway does the app reveal the hilarious prank with celebratory fanfare and shut off the light!

---

## ⚡ Prank Experience Flow

```
[ STEP 1: HOME SCREEN ]
  "FLASH CONTROL"
  🔦 Flashlight Module
  [ START ] Button  (Zero prank hints)
      │
      ▼ (Requests camera torch / turns ON LED flash)
[ STEP 2: FLASHLIGHT LOCKED SCREEN ]
  ⚠️ FLASHLIGHT LOCKED
  Security restriction activated.
  To disable the flashlight, complete the required payment of ₹5,000.
  Large ₹5,000
  [ CONTINUE ] Button
  (Discreet Emergency "Turn Flashlight OFF" control)
      │
      ▼
[ STEP 3: FAKE PAYMENT SCREEN ]
  PAYMENT REQUIRED
  Amount: ₹5,000
  Fictional Device Service Billing Gateway
  [ PROCEED TO PAYMENT ]
      │
      ▼
  Simulated Processing View:
    1. "Processing payment..." + animated orbital spinner (3s)
    2. "Payment verification in progress..." + verification pulse (2s)
      │
      ▼
[ STEP 4: FINAL REVEAL ]
  Flashlight turns OFF immediately!
  # 😂 GOTCHA! 😂
  ## YOU JUST GOT PRANKED!
  "You don't actually have to pay ₹5,000."
  "It was only a flashlight prank! 🔦😂"
  Full confetti explosion & victory fanfare!
  [ PLAY AGAIN ]  [ EXIT ]
```

---

## 🛡️ Safety & Privacy Guarantees

This prank is engineered to be **100% safe, ethical, and transparent**:

| Safety Requirement | Implementation |
| :--- | :--- |
| **No Real Payment** | Fictional system billing interface only. Zero payment gateway or UPI SDKs. |
| **No Financial Info** | Zero collection of UPI PIN, card numbers, OTP, bank login, or personal information. |
| **No Video / Photo Storage** | Camera stream is used solely for the `{ advanced: [{ torch: true }] }` hardware constraint. No frames or pictures are recorded, stored, or transmitted. |
| **Discreet Emergency Control** | A discreet **"Turn Flashlight OFF"** control is accessible directly on prank screens so no one is ever trapped. |
| **Auto-Off Failsafes** | Flashlight automatically turns off on tab switch, window minimization, browser close, or page reload. |
| **Graceful Device Fallback** | Unsupported browsers/desktops smoothly trigger an animated screen strobe fallback. |

---

## 🚀 How to Run & Test

### Option 1: Start the Local Development Server
Open PowerShell in the `pay-5000-prank-app` directory:
```bash
node server.js
```
Then open `http://localhost:5173` in your browser.

### Option 2: Test on Your Android Mobile Phone (Hardware Flashlight)
1. Ensure your computer and phone are connected to the same Wi-Fi network.
2. Find your computer's local IP address (`ipconfig` in terminal, e.g. `192.168.1.15`).
3. Run `node server.js`.
4. On your Android phone, open Chrome and navigate to `http://<YOUR_IP>:5173`.
5. Tap **START**, allow camera access when prompted, and experience the hardware LED flashlight lock prank! 🔦😂

---

## 📂 Project Architecture

```text
pay-5000-prank-app/
├── index.html        # Semantic 4-step layout with mobile device mockup shell
├── styles.css        # Dark obsidian aesthetics, red hazard alerts, orbital spinners & party reveal
├── torch.js          # Hardware LED flashlight controller via MediaStream & screen strobe fallback
├── audio.js          # Built-in Web Audio API sound synthesizer (lock alerts, blips, fanfare, boing)
├── app.js            # Main 4-step state machine, simulated timers (3s + 2s), and confetti engine
├── server.js         # Zero-dependency local Node.js static server
└── README.md         # Documentation
```
