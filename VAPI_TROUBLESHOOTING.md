# VAPI Troubleshooting Guide

This guide helps resolve common VAPI (Voice AI) integration issues in the AI Interview Platform.

## Common VAPI Errors and Solutions

### Error: "Failed to load VAPI SDK"

**Cause:** The VAPI JavaScript SDK couldn't be loaded from the CDN.

**Solutions:**

1. Check your internet connection
2. Verify the CDN URL is accessible
3. Clear browser cache and reload
4. Try using the installed npm package instead of CDN

### Error: "VAPI Web Token is not configured"

**Cause:** Missing or incorrect environment variable.

**Solution:**

1. Add `VITE_PUBLIC_VAPI_WEB_TOKEN` to your `.env` file
2. Get your token from https://vapi.ai/dashboard
3. Restart your development server

### Error: "start-method-error"

**Cause:** Failed to start the VAPI call due to configuration or authentication issues.

**Common Solutions:**

#### 1. Check Credentials

```bash
# In browser console
platformDebugger.debugVAPIConfiguration()
```

#### 2. Verify Token Format

- VAPI tokens should be 36-character UUIDs
- Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Check for extra spaces or characters

#### 3. Check VAPI Account Status

- Ensure your VAPI account has sufficient credits
- Verify your account is active
- Check dashboard for any service issues

#### 4. Microphone Permissions

- Grant microphone access when prompted
- Check browser settings for microphone permissions
- Test microphone access: `navigator.mediaDevices.getUserMedia({audio: true})`

## Environment Configuration

### Required Variables

```env
VITE_PUBLIC_VAPI_WEB_TOKEN=your_vapi_web_token_here
VITE_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id_here
```

### Getting VAPI Credentials

1. **Sign up at VAPI.ai**

   - Go to https://vapi.ai
   - Create an account

2. **Get Web Token**

   - Go to Dashboard → Settings → API Keys
   - Copy your Web Token

3. **Create Assistant/Workflow**
   - Go to Dashboard → Assistants
   - Create a new assistant or use existing
   - Copy the Assistant ID as your Workflow ID

## Testing VAPI Integration

### Browser Console Tests

```javascript
// 1. Check configuration
platformDebugger.debugVAPIConfiguration();

// 2. Test VAPI connection
platformDebugger.testVAPIConnection();

// 3. Check microphone access
navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then(() => console.log("Microphone access granted"))
  .catch((err) => console.error("Microphone access denied:", err));

// 4. Test VAPI initialization
import("@vapi-ai/web").then((VapiModule) => {
  const Vapi = VapiModule.default || VapiModule;
  const vapi = new Vapi("your_token_here");
  console.log("VAPI instance created:", vapi);
});
```

## Common Issues and Fixes

### Issue: "VAPI not working after setup"

**Checklist:**

- [ ] Environment variables are set correctly
- [ ] Browser has microphone permissions
- [ ] VAPI account has credits
- [ ] Token format is correct (UUID)
- [ ] Internet connection is stable
- [ ] Browser supports WebRTC

### Issue: "Call starts but no audio"

**Possible Causes:**

1. **Microphone not working**

   - Test with other applications
   - Check browser permissions
   - Try different browser

2. **VAPI configuration issues**

   - Verify assistant settings in VAPI dashboard
   - Check voice provider settings
   - Ensure transcriber is configured

3. **Network issues**
   - Check firewall settings
   - Verify WebRTC connectivity
   - Test on different network

### Issue: "Call connects but AI doesn't respond"

**Solutions:**

1. **Check Assistant Configuration**

   - Verify system prompt is set
   - Ensure model provider (OpenAI) is configured
   - Check if assistant has proper instructions

2. **Debug Message Flow**
   ```javascript
   // Listen for all VAPI events
   vapi.on("message", (msg) => console.log("VAPI Message:", msg));
   vapi.on("speech-start", () => console.log("Speech started"));
   vapi.on("speech-end", () => console.log("Speech ended"));
   ```

## Browser Compatibility

### Supported Browsers

- ✅ Chrome 80+
- ✅ Firefox 74+
- ✅ Safari 14+
- ✅ Edge 80+

### Required Features

- WebRTC support
- MediaDevices API
- Audio recording permissions
- Secure context (HTTPS in production)

## Development vs Production

### Development (localhost)

- Works over HTTP
- Microphone permissions required
- Console debugging available

### Production (HTTPS required)

- Must use HTTPS for microphone access
- Check SSL certificate validity
- Verify domain is whitelisted in VAPI dashboard

## Fallback Options

If VAPI continues to fail, the platform provides fallback options:

1. **Regular AI Interview** - Text-based interaction without voice
2. **Alternative Voice Providers** - Can be configured in the codebase
3. **Manual Interview** - Traditional video call setup

## Getting Help

### Debug Information to Collect

1. **Browser Console Logs**

   ```javascript
   platformDebugger.runFullDiagnostic();
   ```

2. **VAPI Dashboard Logs**

   - Check call logs in VAPI dashboard
   - Look for error messages or failed attempts

3. **Browser Information**
   - Browser version
   - Operating system
   - Network type (WiFi, cellular, etc.)

### Support Channels

1. **VAPI Support**

   - Discord: https://discord.gg/vapi
   - Email: support@vapi.ai
   - Documentation: https://docs.vapi.ai

2. **Platform Issues**
   - Check browser console for specific errors
   - Use the debugging tools provided
   - Test with different browsers/devices

## Quick Fixes

### Reset VAPI State

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Test Microphone

```javascript
navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => {
    console.log("Microphone working");
    stream.getTracks().forEach((track) => track.stop());
  })
  .catch((err) => console.error("Microphone error:", err));
```

### Verify Environment Variables

```javascript
console.log({
  webToken: import.meta.env.VITE_PUBLIC_VAPI_WEB_TOKEN ? "Present" : "Missing",
  workflowId: import.meta.env.VITE_PUBLIC_VAPI_WORKFLOW_ID
    ? "Present"
    : "Missing",
});
```
