interface ServiceError {
  code: number;
  message: string;
}

export const PARAMETER__MISSING: ServiceError = {
  code: 100,
  message: 'The \'{request}\' request is missing the parameter \'{parameter}\'',
};

export const RESOURCE__OUTDATED: ServiceError = {
  code: 200,
  message: 'The provided resource is outdated',
};

export const RENT_REQUEST__DUPLICATE: ServiceError = {
  code: 301,
  message: 'The user {userId} already has a rent request for book {bookId}',
};

export const RENT_RETURN__MISSING_USER: ServiceError = {
  code: 302,
  message: 'The user {userId} is not the current renter of book {bookId}',
};

export const RENT_CANCEL__MISSING_USER: ServiceError = {
  code: 303,
  message: 'The user {userId} has not requested to rent the book {bookId}',
};
