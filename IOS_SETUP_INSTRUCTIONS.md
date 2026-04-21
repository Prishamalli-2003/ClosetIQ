# 📱 Running ClosetIQ on iOS - Step by Step Guide

## Prerequisites
- iPhone with iOS 12+ 
- WiFi connection
- Computer with Node.js installed

## Step 1: Start the Development Server

### On Your Computer:

1. **Open Terminal/Command Prompt**
   ```bash
   cd path/to/closetiq
   ```

2. **Install Dependencies** (if not already done)
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm start
   ```

4. **Wait for Server to Start**
   - You'll see: `Local: http://localhost:3000`
   - You'll also see: `On Your Network: http://[IP-ADDRESS]:3000`
   - **Important**: Note down the network IP address (e.g., `http://192.168.1.100:3000`)

## Step 2: Connect Your iPhone

### Find Your Computer's IP Address:

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter

**Mac:**
```bash
ifconfig | grep inet
```
Look for an address like `192.168.x.x`

**Linux:**
```bash
ip addr show
```

### Ensure Same Network:
- Your iPhone and computer must be on the same WiFi network
- Check WiFi settings on both devices

## Step 3: Access ClosetIQ on iPhone

### Method 1: Direct Browser Access

1. **Open Safari on iPhone**
2. **Type the Network URL**
   - Example: `http://192.168.1.100:3000`
   - Replace with your actual IP address from Step 1
3. **Press Go**

### Method 2: QR Code (Optional)
1. Generate QR code for the network URL using any QR generator
2. Scan with iPhone camera
3. Tap the notification to open in Safari

## Step 4: Add to Home Screen (PWA)

1. **In Safari, tap the Share button** (square with arrow up)
2. **Scroll down and tap "Add to Home Screen"**
3. **Name it "ClosetIQ"**
4. **Tap "Add"**
5. **ClosetIQ icon will appear on your home screen**

## Step 5: Enable Camera Permissions

1. **When prompted, tap "Allow" for camera access**
2. **If missed, go to Settings > Safari > Camera**
3. **Set to "Allow"**

## Step 6: Test Key Features

### Camera Integration:
1. **Go to "My Wardrobe"**
2. **Tap "Add Clothing Item"**
3. **Tap "📷 Open Camera & Select Photo"**
4. **Should open rear camera for clothing photos**

### Form Functionality:
1. **Test color dropdown with preview**
2. **Test custom mood/occasion additions**
3. **Verify form submission works**

### Offline Capability:
1. **Add to home screen enables offline browsing**
2. **Some features work without internet**

## Troubleshooting

### Can't Access the App:

**Check Network Connection:**
```bash
# On computer, verify server is running
npm start
```

**Firewall Issues:**
- Windows: Allow Node.js through Windows Firewall
- Mac: System Preferences > Security & Privacy > Firewall > Options
- Add Node.js to allowed apps

**IP Address Changed:**
- Restart development server
- Check for new IP address
- Update iPhone bookmark

### Camera Not Working:

1. **Safari Settings:**
   - Settings > Safari > Camera > Allow
   
2. **Website Permissions:**
   - Safari > Website Settings > Camera > Allow

3. **Try Different Browsers:**
   - Chrome for iOS
   - Firefox for iOS

### Performance Issues:

1. **Close Other Apps:**
   - Double-tap home button
   - Swipe up on unused apps

2. **Restart Safari:**
   - Close Safari completely
   - Reopen and navigate to app

3. **Clear Safari Cache:**
   - Settings > Safari > Clear History and Website Data

## Advanced Setup (Optional)

### Using ngrok for External Access:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **In new terminal:**
   ```bash
   ngrok http 3000
   ```

3. **Use the https URL provided by ngrok**
   - Example: `https://abc123.ngrok.io`
   - This works from anywhere with internet

### HTTPS Setup for Better PWA:

1. **Install mkcert:**
   ```bash
   # Mac
   brew install mkcert
   
   # Windows (with Chocolatey)
   choco install mkcert
   ```

2. **Create certificates:**
   ```bash
   mkcert -install
   mkcert localhost 192.168.1.100
   ```

3. **Start with HTTPS:**
   ```bash
   HTTPS=true npm start
   ```

## Features Optimized for iOS

### 📱 **Mobile-First Design**
- Touch-friendly buttons and forms
- Responsive layout for all screen sizes
- Swipe gestures where appropriate

### 📷 **Camera Integration**
- `capture="environment"` uses rear camera
- Automatic image compression
- Photo preview before upload

### 🎨 **iOS-Friendly UI**
- Rounded corners and smooth animations
- iOS-style form controls
- Native-feeling interactions

### 💾 **Offline Capabilities**
- PWA manifest for home screen installation
- Service worker for offline functionality
- Local storage for temporary data

### 🔒 **Privacy & Security**
- All data stored in Firebase (secure)
- No tracking or analytics
- Camera access only when needed

## Performance Tips

1. **Use WiFi for best performance**
2. **Close unused browser tabs**
3. **Restart app if it becomes slow**
4. **Update iOS regularly for best compatibility**
5. **Use latest Safari version**

## Supported iOS Features

✅ **Camera access and photo capture**  
✅ **File upload and image processing**  
✅ **Touch gestures and interactions**  
✅ **Responsive design for all iPhone sizes**  
✅ **PWA installation (Add to Home Screen)**  
✅ **Offline browsing capabilities**  
✅ **Form validation and submission**  
✅ **Real-time data sync with Firebase**  

## Need Help?

### Common URLs to Bookmark:
- **Main App**: `http://[YOUR-IP]:3000`
- **Wardrobe**: `http://[YOUR-IP]:3000/wardrobe`
- **Log Outfit**: `http://[YOUR-IP]:3000/log-outfit`
- **Analytics**: `http://[YOUR-IP]:3000/analytics`

### Quick Access:
1. Add main URL to iPhone favorites
2. Create home screen shortcut
3. Use Siri shortcuts for quick access

Your ClosetIQ app is now ready to use on iOS with full camera integration and mobile-optimized experience! 📱✨