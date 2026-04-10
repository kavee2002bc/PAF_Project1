import React, { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Custom hook for Google OAuth integration
 * Handles initialization, button rendering, and token verification
 */
export const useGoogleOAuth = (onSuccess, onError, clientId) => {
  const googleScriptLoaded = useRef(false);
  const buttonRendered = useRef(false);

  // Initialize Google OAuth
  useEffect(() => {
    const initializeGoogle = async () => {
      if (googleScriptLoaded.current) return;

      // Check if already loaded
      if (window.google && window.google.accounts) {
        googleScriptLoaded.current = true;
        return;
      }

      // Load Google SDK
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.google?.accounts) {
          googleScriptLoaded.current = true;
          
          // Initialize Google Accounts
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse,
            ux_mode: 'popup',
            auto_select: false,
          });
        }
      };

      script.onerror = () => {
        console.error('Failed to load Google OAuth script');
        onError?.(new Error('Failed to load Google OAuth'));
      };

      document.head.appendChild(script);
    };

    initializeGoogle();
  }, [clientId, onError]);

  const handleGoogleResponse = useCallback((response) => {
    if (response.credential) {
      onSuccess?.(response.credential);
    } else {
      onError?.(new Error('No credential received'));
    }
  }, [onSuccess, onError]);

  // Render Google sign-in button
  const renderGoogleButton = useCallback((elementId, options = {}) => {
    if (!window.google?.accounts || !googleScriptLoaded.current) {
      console.warn('Google OAuth not ready yet');
      return false;
    }

    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id "${elementId}" not found`);
      return false;
    }

    if (buttonRendered.current) return true;

    try {
      window.google.accounts.id.renderButton(element, {
        type: 'standard',
        size: 'large',
        text: 'signin_with',
        locale: 'en_US',
        logo_alignment: 'center',
        width: '100%',
        ...options,
      });
      buttonRendered.current = true;
      return true;
    } catch (err) {
      console.error('Failed to render Google button:', err);
      onError?.(err);
      return false;
    }
  }, [onError]);

  // Prompt for account selection
  const promptGoogleAuth = useCallback(() => {
    if (!window.google?.accounts) {
      onError?.(new Error('Google OAuth not initialized'));
      return;
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback to manual button click
        console.log('Google prompt not shown, using fallback');
      }
    });
  }, [onError]);

  return {
    isReady: googleScriptLoaded.current,
    renderGoogleButton,
    promptGoogleAuth,
  };
};

/**
 * Custom hook to manage authentication state and persist to localStorage
 */
export const useAuthPersist = () => {
  const getStoredAuth = useCallback(() => {
    try {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const provider = localStorage.getItem('oauthProvider');

      return {
        user: user ? JSON.parse(user) : null,
        token,
        provider,
        isAuthenticated: !!token,
      };
    } catch (err) {
      console.error('Failed to retrieve stored auth:', err);
      return { user: null, token: null, provider: null, isAuthenticated: false };
    }
  }, []);

  const saveAuth = useCallback((user, token, provider = null) => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      if (provider) {
        localStorage.setItem('oauthProvider', provider);
      }
    } catch (err) {
      console.error('Failed to save auth:', err);
    }
  }, []);

  const clearAuth = useCallback(() => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('oauthProvider');
    } catch (err) {
      console.error('Failed to clear auth:', err);
    }
  }, []);

  return { getStoredAuth, saveAuth, clearAuth };
};

/**
 * Custom hook for email validation with SLIIT pattern
 */
export const useEmailValidation = () => {
  const validateSLIITEmail = useCallback((email) => {
    const pattern = /^IT\d{8}@my\.sliit\.lk$/i;
    return {
      isValid: pattern.test(email),
      message: pattern.test(email)
        ? ''
        : 'Use your SLIIT email (e.g., IT12345678@my.sliit.lk)',
    };
  }, []);

  const validateAdminEmail = useCallback((email) => {
    const patterns = [
      /^admin\+[\w\.,]+@my\.sliit\.lk$/i,
      /^[\w\.]+@admin\.sliit\.lk$/i,
      /^[\w\.]+@sliit\.edu\.lk$/i,
      /^[\w\.]+@my\.sliit\.lk$/i,
    ];

    const isValid = patterns.some(p => p.test(email));
    return {
      isValid,
      message: isValid ? '' : 'Use your institutional email address',
    };
  }, []);

  const validatePassword = useCallback((password) => {
    const checks = {
      minLength: password.length >= 6,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    const strength = score <= 1 ? 'weak' : score <= 2 ? 'fair' : score <= 3 ? 'good' : 'strong';

    return {
      isValid: password.length >= 6,
      strength,
      checks,
    };
  }, []);

  return {
    validateSLIITEmail,
    validateAdminEmail,
    validatePassword,
  };
};

/**
 * Custom hook for form state management with validation
 */
export const useAuthForm = (initialValues = {}, onValidate = () => true) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      onValidate(name, value); // Validate on change if field was touched
    }
  }, [touched, onValidate]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    setValues,
    handleChange,
    handleBlur,
    setFieldError,
    reset,
  };
};

export default null;
