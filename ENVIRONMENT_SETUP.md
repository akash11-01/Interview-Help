# Environment Configuration Guide

This document explains how to properly configure your environment variables for the AI Interview Platform.

## Required Environment Variables

These variables are essential for the platform to function:

### 1. Clerk Authentication

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

- Get this from your Clerk dashboard
- Required for user authentication

### 2. Convex Backend

```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_HTTP_URL=https://your-deployment.convex.site
```

- Get these from your Convex dashboard
- Required for backend functionality

### 3. Stream API

```
VITE_PUBLIC_STREAM_API_KEY=your_stream_api_key
VITE_STREAM_SECRET_KEY=your_stream_secret_key
```

- Get these from your GetStream.io dashboard
- Required for video calling features

## Optional Environment Variables

These enhance functionality but are not required for basic operation:

### 4. VAPI Integration (Voice AI)

```
VITE_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token
VITE_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id
```

- Get these from your VAPI dashboard
- Enables voice-powered AI interviews
- If not configured, standard AI interviews will still work

### 5. OpenRouter AI (Backend)

```
OPENROUTER_API_KEY=sk-or-v1-...
```

- Get this from OpenRouter.ai
- Used for AI question generation
- Has fallback questions if not configured

### 6. Code Execution (RapidAPI)

```
VITE_RAPID_API_URL=https://judge0-ce.p.rapidapi.com/submissions
VITE_RAPID_API_HOST=judge0-ce.p.rapidapi.com
VITE_RAPID_API_KEY=your_rapidapi_key
```

- Get these from RapidAPI Judge0 service
- Enables code execution in interviews
- Optional feature

## Backend Environment Variables (.env in convex folder)

```
WEBHOOK_SECRET=whsec_...
OPENROUTER_API_KEY=sk-or-v1-...
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

## Configuration Status

The application will log the configuration status in the browser console on startup:

- ✅ Green: Properly configured
- ⚠️ Yellow: Optional feature not configured
- ❌ Red: Required feature missing

## Troubleshooting

### AI Questions Not Generating

1. Check if `OPENROUTER_API_KEY` is set in backend environment
2. Verify the API key is valid and has credits
3. Check browser console for error messages

### VAPI Not Working

1. Verify `VITE_PUBLIC_VAPI_WEB_TOKEN` is set
2. Verify `VITE_PUBLIC_VAPI_WORKFLOW_ID` is set
3. Check VAPI dashboard for account status
4. Ensure microphone permissions are granted

### Video Calls Not Working

1. Verify Stream API credentials are correct
2. Check Stream dashboard for usage limits
3. Ensure camera/microphone permissions are granted

## Development vs Production

### Development (.env.local)

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CONVEX_DEPLOYMENT=dev:your-dev-deployment
```

### Production (.env)

```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
CONVEX_DEPLOYMENT=your-prod-deployment
```

## Security Notes

1. Never commit `.env` files to version control
2. Use different API keys for development and production
3. Regenerate keys if they are accidentally exposed
4. Use environment-specific Clerk applications

## Getting Help

If you're still having issues:

1. Check the browser console for detailed error messages
2. Verify all environment variables are spelled correctly
3. Ensure API keys are valid and have appropriate permissions
4. Check service dashboards for any outages or issues
