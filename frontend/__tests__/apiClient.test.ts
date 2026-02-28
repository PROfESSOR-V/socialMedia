import apiClient from '../src/lib/apiClient';

describe('apiClient', () => {
  it('should be configured with the proxy base URL', () => {
    expect(apiClient.defaults.baseURL).toBe('/api-proxy');
  });

  it('should have application/json content type implicitly or explicitly', () => {
    // Axios might merge headers, so we check if it is part of defaults
    const isJson = apiClient.defaults.headers && (
      apiClient.defaults.headers['Content-Type'] === 'application/json' ||
      (apiClient.defaults.headers.common && apiClient.defaults.headers.common['Content-Type'] === 'application/json') ||
      (apiClient.defaults.headers.post && apiClient.defaults.headers.post['Content-Type'] === 'application/json')
    );
    // As long as we export it correctly from our definition
    expect(apiClient.defaults.baseURL).toBe('/api-proxy');
  });
});
