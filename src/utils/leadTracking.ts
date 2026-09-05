export const getLeadTrackingFields = () => {
  const params = new URLSearchParams(window.location.search);

  return {
    utmSource: params.get('utm_source') ?? '',
    utmMedium: params.get('utm_medium') ?? '',
    utmCampaign: params.get('utm_campaign') ?? '',
    utmContent: params.get('utm_content') ?? '',
    utmTerm: params.get('utm_term') ?? '',
    landingPage: window.location.pathname,
    referrer: document.referrer,
    deviceType: window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop'
  };
};
