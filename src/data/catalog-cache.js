const values = new Map();
const pending = new Map();

export const readCatalogCache = (key) => values.get(key);

export async function loadCatalogData(key, request, { force = false } = {}) {
  if (!force && values.has(key)) return values.get(key);
  if (!force && pending.has(key)) return pending.get(key);

  const promise = Promise.resolve().then(request).then((value) => {
    values.set(key, value);
    return value;
  }).finally(() => pending.delete(key));

  pending.set(key, promise);
  return promise;
}

export function invalidateCatalogCache(...keys) {
  keys.forEach((key) => values.delete(key));
}

export function invalidateCatalogPrefix(prefix) {
  [...values.keys()].forEach((key) => {
    if (key.startsWith(prefix)) values.delete(key);
  });
}
