# OpenRouter API Troubleshooting Guide

This guide helps resolve OpenRouter API issues in the AI Interview Platform.

## Common OpenRouter Errors

### Error: "404 Not Found"

**Cause:** The model endpoint doesn't exist or the model name is incorrect.

**Solutions:**

1. **Check Available Models**: The platform now tries multiple models automatically
2. **Verify API Key**: Ensure your OpenRouter API key is valid
3. **Check Account Status**: Verify your OpenRouter account has credits

### Error: "401 Unauthorized"

**Cause:** Invalid or missing API key.

**Solutions:**

1. Check your `.env` file has `OPENROUTER_API_KEY`
2. Verify the API key is correct (starts with `sk-or-v1-`)
3. Check the API key hasn't expired

### Error: "403 Forbidden"

**Cause:** API key doesn't have sufficient permissions or account is limited.

**Solutions:**

1. Check your OpenRouter account status
2. Verify billing information is up to date
3. Ensure you have credits remaining

## Testing OpenRouter Integration

### Browser Console Commands

```javascript
// Test OpenRouter API specifically
platformDebugger.debugOpenRouterAPI();

// Test AI question generation
platformDebugger.debugAIQuestionGeneration({
  jobPosition: "Software Developer",
  jobDescription: "Test position",
  duration: "30 minutes",
  type: "Technical",
});

// Run full diagnostic
platformDebugger.runFullDiagnostic();
```

### Check OpenRouter Status

1. **Visit OpenRouter Dashboard**

   - Go to https://openrouter.ai/keys
   - Check your API key status
   - Verify account credits

2. **Check Model Availability**
   - Visit https://openrouter.ai/models
   - Verify which free models are available
   - Check model rate limits

## Current Model Fallback Strategy

The platform tries these models in order:

1. `meta-llama/llama-3.1-8b-instruct:free` (Free)
2. `mistralai/mistral-7b-instruct:free` (Free)
3. `google/gemma-7b-it:free` (Free)
4. `microsoft/wizardlm-2-8x22b:nitro` (Paid)
5. `openai/gpt-3.5-turbo` (Paid)

If all models fail, fallback questions are provided.

## Configuration Check

### Environment Variables

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Getting an OpenRouter API Key

1. **Sign up at OpenRouter**

   - Visit https://openrouter.ai
   - Create account and verify email

2. **Generate API Key**

   - Go to https://openrouter.ai/keys
   - Click "Create Key"
   - Copy the key (starts with `sk-or-v1-`)

3. **Add Credits (Optional)**
   - Many models are free
   - Add credits for premium models
   - Check pricing at https://openrouter.ai/models

## Troubleshooting Steps

### Step 1: Verify Configuration

```javascript
// Check if API key is configured
console.log(
  "OpenRouter API Key:",
  import.meta.env.OPENROUTER_API_KEY ? "Present" : "Missing"
);
```

### Step 2: Test API Connection

```javascript
// Test the API endpoint
platformDebugger.debugOpenRouterAPI();
```

### Step 3: Check Backend Logs

- Open browser DevTools
- Check Network tab for failed requests
- Look for 404, 401, or 403 errors

### Step 4: Verify Account Status

- Login to OpenRouter dashboard
- Check account status and credits
- Verify API key permissions

## Common Issues and Solutions

### Issue: Getting fallback questions instead of AI-generated ones

**Check:**

- OpenRouter API key is valid
- Account has credits (for paid models)
- Models are available and not rate-limited
- Network connectivity is stable

### Issue: "All models failed to generate questions"

**Solutions:**

1. Check OpenRouter service status
2. Verify API key permissions
3. Try again later (rate limiting)
4. Check account credits

### Issue: Questions are generic/not job-specific

**This happens when:**

- OpenRouter API fails
- Platform falls back to generic questions
- Check console for error details

## Fallback Behavior

When OpenRouter API fails, the platform:

1. **Logs the error** for debugging
2. **Provides fallback questions** based on job position
3. **Continues the interview process** seamlessly
4. **Marks the response** with `source: "fallback-error"`

This ensures users can always proceed with their interview even if the AI service is temporarily unavailable.

## Getting Help

### Debug Information to Collect

```javascript
// Run this in browser console to collect debug info
console.group("OpenRouter Debug Info");
console.log("API Key Present:", !!import.meta.env.OPENROUTER_API_KEY);
console.log("Backend URL:", import.meta.env.VITE_CONVEX_HTTP_URL);
platformDebugger.debugOpenRouterAPI();
console.groupEnd();
```

### Support Resources

1. **OpenRouter Documentation**: https://openrouter.ai/docs
2. **OpenRouter Discord**: https://discord.gg/openrouter
3. **Status Page**: Check OpenRouter status page for outages

## Quick Fixes

### Reset and Retry

```javascript
// Clear any cached errors
localStorage.clear();
location.reload();

// Or just retry the API call
platformDebugger.debugOpenRouterAPI();
```

### Test with Different Models

The platform automatically tries multiple models, but you can check which ones are working:

1. Visit https://openrouter.ai/models
2. Test individual models through the OpenRouter playground
3. Update the model list in the backend if needed

## Production Considerations

### Rate Limiting

- Free models have rate limits
- Consider upgrading for higher limits
- Implement retry logic with exponential backoff

### Error Monitoring

- Monitor OpenRouter API success rates
- Set up alerts for high failure rates
- Track fallback usage statistics

### Cost Management

- Monitor API usage and costs
- Set spending limits in OpenRouter dashboard
- Use free models primarily, paid as fallback
