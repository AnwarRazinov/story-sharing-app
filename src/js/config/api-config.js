const API_CONFIG = {
  BASE_URL: 'https://story-api.dicoding.dev/v1',
  VAPID_PUBLIC_KEY: 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk',
  ENDPOINTS: {
    REGISTER: '/register',
    LOGIN: '/login',
    STORIES: '/stories',
    STORIES_GUEST: '/stories/guest',
    SUBSCRIBE: '/notifications/subscribe',
    UNSUBSCRIBE: '/notifications/subscribe'
  }
};

export { API_CONFIG };