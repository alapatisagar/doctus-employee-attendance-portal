/**
 * DOCTUS ATTENDANCE PORTAL - PRODUCTION SECURITY CONFIGURATION
 * 
 * HARD PRODUCTION SECURITY BOUNDARY:
 * Demo login, evaluator credentials, and 1-click role switching are STRICTLY DISABLED 
 * whenever import.meta.env.PROD is true.
 * Production builds ALWAYS override demo mode, regardless of VITE_ENABLE_DEMO_MODE settings.
 */
export const IS_DEMO_MODE_ENABLED: boolean = 
  !import.meta.env.PROD && 
  (import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_MODE === 'true');
