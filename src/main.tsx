import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PrivacyPage, TermsPage, AUPPage, DisclaimerPage } from './LegalPages.tsx'
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import type { BannerAdOptions } from '@capacitor-community/admob';

const setupAds = async () => {
  try {
    await AdMob.initialize({});
    const options: BannerAdOptions = {
      adId: 'ca-app-pub-3940256099942544/6300978111',
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: true
    };
    await AdMob.showBanner(options);
  } catch (err) {
    console.warn("AdMob initialization failed (probably running on web)", err);
  }
};
setupAds();

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
