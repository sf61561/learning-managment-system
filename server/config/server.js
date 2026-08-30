module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', ''),
  app: {
    keys: env.array('APP_KEYS', [
      'vSzOnFwA7jZdGBt9Dg2lBw==',
      'i4+pfm0QvF0zXLyMZraPTA==',
      'jnoJOemg0vZ950WneejSdw==',
      'DAMJQG/vxR1g9s8FCyZkqA=='
    ]),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
