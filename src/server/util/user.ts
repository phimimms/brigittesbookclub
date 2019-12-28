import User from '../models/User';

/**
 * Maps a user to exclude its sensitive fields.
 * @param user  The user resource.
 */
export function selectNonSensitiveUserFields(user: typeof User): Omit<typeof User, 'password'> {
  const { created, email, eTag, firstName, lastModified, lastName } = user;

  return {
    created,
    email,
    eTag,
    firstName,
    lastModified,
    lastName,
  };
}
