// serviceProviderService.js
// Manages 3rd-party service providers (interior, loan, rental, resale, etc.)
// Commission model support

const SERVICE_PROVIDER_STORAGE_KEY = 'SERVICE_PROVIDERS_V1';

function getAllProviders() {
  const data = localStorage.getItem(SERVICE_PROVIDER_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function addProvider(provider) {
  const providers = getAllProviders();
  providers.push({
    ...provider,
    id: provider.id || `prov_${Date.now()}`,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(SERVICE_PROVIDER_STORAGE_KEY, JSON.stringify(providers));
  return { success: true };
}

function updateProvider(id, updates) {
  const providers = getAllProviders();
  const idx = providers.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Provider not found');
  providers[idx] = { ...providers[idx], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(SERVICE_PROVIDER_STORAGE_KEY, JSON.stringify(providers));
  return { success: true };
}

function removeProvider(id) {
  let providers = getAllProviders();
  providers = providers.filter(p => p.id !== id);
  localStorage.setItem(SERVICE_PROVIDER_STORAGE_KEY, JSON.stringify(providers));
  return { success: true };
}

export default {
  getAllProviders,
  addProvider,
  updateProvider,
  removeProvider,
};
