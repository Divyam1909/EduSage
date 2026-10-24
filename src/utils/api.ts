//@ts-nocheck
import axios from 'axios';

// The backend is served from the same origin under /api: by a Vercel function in
// production and by the Vite dev proxy (to localhost:5000) in development
export const BACKEND_URL = '/api';

// Login token for the current area of the app: teacher pages use the teacher
// login, everything else the student login
export const getAuthToken = () => {
  const isTeacherPage = window.location.pathname.startsWith('/teacher');
  return localStorage.getItem(isTeacherPage ? 'teacherToken' : 'token');
};

// Create an axios instance with the backend URL
export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
});

// Add request interceptor to handle FormData requests properly
apiClient.interceptors.request.use(config => {
  if (config.data instanceof FormData) {
    // For FormData, let the browser set the Content-Type with boundary
    delete config.headers['Content-Type'];
  }
  // Send the login token unless the caller set one explicitly
  const token = getAuthToken();
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// For fetch API usage - ensure we return a complete URL
export const apiUrl = (path: string) => `${BACKEND_URL}${path.startsWith('/') ? path : `/${path}`}`;

// Helper function for API requests with fetch
export async function apiFetch(path: string, options: RequestInit = {}) {
  // Construct the complete URL to the backend
  const url = apiUrl(path);
  
  console.log("Making API request to:", url);
  
  try {
    // Create headers object
    const headers = { ...options.headers };

    // Send the login token unless the caller set one explicitly
    const token = getAuthToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // For FormData requests, don't set Content-Type to let browser handle it
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    } else if (!headers['Content-Type']) {
      // Default content type for non-FormData requests
      headers['Content-Type'] = 'application/json';
    }
    
    // Log request details (without sensitive data)
    console.log("Request method:", options.method || 'GET');
    console.log("Request headers:", headers);
    
    if (options.body && typeof options.body === 'string' && headers['Content-Type'] === 'application/json') {
      try {
        const bodyObj = JSON.parse(options.body);
        console.log("Request body (sanitized):", {
          ...bodyObj,
          password: bodyObj.password ? '[REDACTED]' : undefined,
          realPassword: bodyObj.realPassword ? '[REDACTED]' : undefined
        });
      } catch (e) {
        console.log("Could not parse request body for logging");
      }
    }
    
    // Use the complete URL, not relative to current domain
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Important for cookies/sessions
      headers
    });
    
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
        console.error(`API error (${response.status}):`, errorData);
      } catch (e) {
        errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
      }
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
    
    return response;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
} 