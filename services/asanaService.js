// Asana OAuth and API integration for admin
// Usage: import { ensureAsanaAuth, createAsanaTask } from './asanaService'

const CLIENT_ID = '1212587292791203';
const CLIENT_SECRET = 'ed09a23f125e1624407248b817e11074';
const REDIRECT_URI = 'https://elite-home-choice.netlify.app/auth/asana/callback';
const AUTH_URL = `https://app.asana.com/-/oauth_authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
const TOKEN_URL = 'https://app.asana.com/-/oauth_token';

// Store token in localStorage (for admin only)
function setToken(token) {
  localStorage.setItem('asana_token', JSON.stringify(token));
}
function getToken() {
  const t = localStorage.getItem('asana_token');
  return t ? JSON.parse(t) : null;
}

// Step 1: Ensure admin is authenticated with Asana
export function ensureAsanaAuth() {
  if (!localStorage.getItem('adminMode')) return;
  const token = getToken();
  if (!token) {
    // If no token, redirect to Asana OAuth
    window.location.href = AUTH_URL;
  }
}

// Step 2: Handle OAuth callback (should be called on /auth/asana/callback route)
export async function handleAsanaCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return;
  // Exchange code for token
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=authorization_code&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code=${code}`
  });
  const data = await res.json();
  if (data.access_token) {
    setToken(data);
    window.location.href = '/'; // Redirect to home after auth
  }
}

// Step 3: Use Asana API (example: create a task)
export async function createAsanaTask({ name, notes, due_on, workspace, projects }) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated with Asana');
  const res = await fetch('https://app.asana.com/api/1.0/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data: { name, notes, due_on, workspace, projects } })
  });
  return await res.json();
}
