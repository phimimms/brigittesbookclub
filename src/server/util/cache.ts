import crypto from 'crypto';

/**
 * Updates the last modified date and entity tag properties of the provided resource.
 * @param resource  The resource entity.
 */
export function updateCacheProps(resource): typeof resource {
  resource.lastModified = new Date();
  resource.eTag = crypto.createHash('md5').update(JSON.stringify(resource)).digest('hex');

  return resource;
}
