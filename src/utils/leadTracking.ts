export const getLeadTrackingFields = () => {
  const params = new URLSearchParams(window.location.search);
  const userAgent = navigator.userAgent.toLowerCase();
  const isSmartTv = /smart-tv|smarttv|googletv|appletv|hbbtv|netcast|tizen|webos|viera|aquos/.test(userAgent);
  const isTablet = /ipad|tablet|android(?!.*mobile)/.test(userAgent)
    || (navigator.maxTouchPoints > 1 && window.innerWidth >= 768);

  return {
    utmSource: params.get('utm_source') ?? '',
    utmMedium: params.get('utm_medium') ?? '',
    utmCampaign: params.get('utm_campaign') ?? '',
    utmContent: params.get('utm_content') ?? '',
    utmTerm: params.get('utm_term') ?? '',
    landingPage: window.location.pathname,
    referrer: document.referrer,
    deviceType: isSmartTv ? 'smart-tv' : isTablet ? 'tablet' : window.innerWidth < 768 ? 'mobile' : 'desktop'
  };
};
