interface ServiceError {
  code: number;
  message: string;
}

export const PARAMETER__MISSING: ServiceError = {
  code: 100,
  message: 'The \'{request}\' request is missing the parameter \'{parameter}\'',
};

export const USER__CREDENTIALS: ServiceError = {
  code: 201,
  message: 'The wrong credentials were specified to authenticate as user {userId}',
};

export const USER__DUPLICATE: ServiceError = {
  code: 202,
  message: 'A user has already registered the email \'{email}\'',
};

export const USER__NOT_REGISTERED: ServiceError = {
  code: 203,
  message: 'A user has not registered the email \'{email}\'',
};

export const USER__NOT_FOUND: ServiceError = {
  code: 204,
  message: 'An authenticated user was not found',
};

export const RESOURCE__OUTDATED: ServiceError = {
  code: 300,
  message: 'The provided resource is outdated',
};

export const RENT_REQUEST__DUPLICATE: ServiceError = {
  code: 401,
  message: 'The user {userId} already has a rent request for book {bookId}',
};

export const RENT_RETURN__MISSING_USER: ServiceError = {
  code: 402,
  message: 'The user {userId} is not the current renter of book {bookId}',
};

export const RENT_CANCEL__MISSING_USER: ServiceError = {
  code: 403,
  message: 'The user {userId} has not requested to rent the book {bookId}',
};
