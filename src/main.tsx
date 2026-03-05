import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PrivacyPage, TermsPage, AUPPage, DisclaimerPage } from './LegalPages.tsx'

const path = window.location.pathname;
const isBaseRoute = path === '/' || path.endsWith('/malluchat/') || path.endsWith('/malluchat');
let ComponentToRender = App;

if (path.includes('/privacy')) ComponentToRender = PrivacyPage;
if (path.includes('/terms')) ComponentToRender = TermsPage;
if (path.includes('/aup')) ComponentToRender = AUPPage;
if (path.includes('/disclaimer')) ComponentToRender = DisclaimerPage;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {!isBaseRoute ? (
      <div style={{ padding: '20px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <ComponentToRender />
      </div>
    ) : (
      <ComponentToRender />
    )}
  </StrictMode>,
)
