module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '7UWSWQsq8IjLNEYSUxAe5A=='),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'Rb+n83ESdV2fAqga4D+kuQ=='),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'PyUWXNDFWKmVJVAeZjX6Ew=='),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY', 'PqKjo/tC3dE3GlKdmXAH2Q=='),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    docLinks: env.bool('FLAG_DOC_LINKS', true),
  },
});
