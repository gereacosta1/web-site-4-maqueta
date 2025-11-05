import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { logAffirmStatus } from './debug/affirmStatus';
import App from './App.tsx';
import './index.css';
logAffirmStatus();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    
    <App />
  </StrictMode>
);
