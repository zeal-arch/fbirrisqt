import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BotShowcase from './pages/BotShowcase';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BotShowcase />
  </StrictMode>,
);
