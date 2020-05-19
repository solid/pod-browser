const nextRuntimeDotenv = require('next-runtime-dotenv');

const withConfig = nextRuntimeDotenv({
  public: [
    'APP_NAME',
    'APP_HOST',
    'IDP_CLIENT_ID',
  ],
  server: [
    'IDP_CLIENT_SECRET',
    'IDP_CONFIGURATION_URL',
    'IDP_REGISTRATION_ACCESS_TOKEN',
  ],
});

module.exports = withConfig();
