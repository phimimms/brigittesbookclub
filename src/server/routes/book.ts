import express from 'express';
import formatString from 'string-template';

import {
  PARAMETER__MISSING,
  RENT_CANCEL__MISSING_USER,
  RENT_REQUEST__DUPLICATE,
  RENT_RETURN__MISSING_USER,
  RESOURCE__OUTDATED,
} from '../dictionary/errors';
import Book from '../models/Book';
import { updateCacheProps } from '../util/cache';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/book')

  /**
   * Gets all of the books.
   */
  .get((req, res) => new Promise((resolve) => {
    Book.find((error, books) => {
      if (error) {
        resolve(res.status(500).send({ error }));

        return;
      }

      resolve(res.json(books));
    });
  }))

  /**
   * Adds a new book.
   */
  .post((req, res) => new Promise((resolve) => {
    const { body: { author, coverArtURL, owner, renter = null, title } } = req;

    const book = new Book(updateCacheProps({
      author,
      coverArtURL,
      created: new Date(),
      owner,
      renter,
      rentRequests: [],
      title,
    }));

    book.save((error) => {
      if (error) {
        resolve(res.status(500).send({ error }));

        return;
      }

      resolve(res.set({ 'Content-Location': `/v1/book/${book._id}` }).json(book));
    });
  }));

router.route('/book/:bookId')

  /**
   * Gets the book by its identifier.
   */
  .get((req, res) => new Promise((resolve) => {
    const { params: { bookId } } = req;

    Book.findById(bookId, (error, book) => {
      if (error) {
        resolve(res.status(500).send({ error }));

        return;
      }

      resolve(res.json(book));
    });
  }))

  /**
   * Updates the book as specified by the body of the request.
   */
  .put((req, res) => {
    const {
      body,
      params: { bookId },
    } = req;

    return new Promise((resolve) => Book.findById(bookId, (error, book) => {
      if (error) {
        resolve(res.status(500).send({ error }));

        return;
      }

      if (body.eTag !== book.eTag) {
        resolve(res.status(412).send({ error: RESOURCE__OUTDATED, resource: book }));

        return;
      }

      const updatedBook = updateCacheProps(Object.assign(book, body));

      updatedBook.save((e) => {
        if (e) {
          resolve(res.status(500).send({ error: e }));

          return;
        }

        resolve(res.json(updatedBook));
      });
    }));
  })

  /**
   * Deletes the book by its identifier.
   */
  .delete((req, res) => new Promise((resolve) => {
    const { params: { bookId } } = req;

    Book.findByIdAndRemove(bookId, (error) => {
      if (error) {
        resolve(res.status(500).send({ error }));

        return;
      }

      resolve(res.send(bookId));
    });
  }));

router.route('/book/rent/cancel')

  /**
   * Removes the request for a book rental by a user.
   */
  .post((req, res) => new Promise((resolve) => {
    const { bookId, userId } = req.query;

    if (!bookId || !userId) {
      resolve(res.status(400).send({
        error: {
          ...PARAMETER__MISSING,
          message: formatString(PARAMETER__MISSING.message, {
            parameter: !bookId ? 'bookId' : 'userId',
            request: '/book/rent/cancel',
          }),
        },
      }));

      return;
    }

    Book.findById(bookId, (error, book) => {
      if (error) {
        resolve(res.status(500).send({ error }));

        return;
      }

      let { rentRequests } = book;

      if (book.renter === userId) {
        const renter = rentRequests.shift() || null;

        const updatedBook = updateCacheProps(Object.assign(book, { renter, rentRequests }));

        updatedBook.save((e) => {
          if (e) {
            resolve(res.status(500).send({ error: e }));

            return;
          }

          resolve(res.json(updatedBook));
        });

        return;
      }

      if (!rentRequests.includes(userId)) {
        resolve(res.status(409).send({
          error: {
            ...RENT_CANCEL__MISSING_USER,
            message: formatString(RENT_CANCEL__MISSING_USER.message, {
              bookId,
              userId,
            }),
          },
        }));

        return;
      }

      rentRequests = rentRequests.filter((u) => u !== userId);

      const updatedBook = updateCacheProps(Object.assign(book, { rentRequests }));

      updatedBook.save((e) => {
        if (e) {
          resolve(res.status(500).send({ error: e }));

          return;
        }

        resolve(res.json(updatedBook));
      });
    });
  }));

router.route('/book/rent/request')

  /**
   * Requests a book for rental by a user.
   */
  .post((req, res) => new Promise((resolve) => {
    const { bookId, userId } = req.query;

    if (!bookId || !userId) {
      resolve(res.status(400).send({
        error: {
          ...PARAMETER__MISSING,
          message: formatString(PARAMETER__MISSING.message, {
            parameter: !bookId ? 'bookId' : 'userId',
            request: '/book/rent/request',
          }),
        },
      }));

      return;
    }

    Book.findById(bookId, (error, book) => {
      if (error) {
        resolve(res.status(500).send({ error }));

        return;
      }

      if (!book.renter) {
        const updatedBook = updateCacheProps(Object.assign(book, { renter: userId }));

        updatedBook.save((e) => {
          if (e) {
            resolve(res.status(500).send({ error: e }));

            return;
          }

          resolve(res.json(updatedBook));
        });

        return;
      }

      if (book.renter === userId || book.rentRequests.includes(userId)) {
        resolve(res.status(409).send({
          error: {
            ...RENT_REQUEST__DUPLICATE,
            message: formatString(RENT_REQUEST__DUPLICATE.message, {
              bookId,
              userId,
            }),
          },
        }));

        return;
      }

      const updatedBook = updateCacheProps(Object.assign(book, { rentRequests: [ ...book.rentRequests, userId ] }));

      updatedBook.save((e) => {
        if (e) {
          resolve(res.status(500).send({ error: e }));

          return;
        }

        resolve(res.json(updatedBook));
      });
    });
  }));

router.route('/book/rent/return')

  /**
   * Transitions a book to its next renter.
   */
  .post((req, res) => new Promise((resolve) => {
    const { bookId, userId } = req.query;

    if (!bookId || !userId) {
      resolve(res.status(400).send({
        error: {
          ...PARAMETER__MISSING,
          message: formatString(PARAMETER__MISSING.message, {
            parameter: !bookId ? 'bookId' : 'userId',
            request: '/book/rent/return',
          }),
        },
      }));

      return;
    }

    Book.findById(bookId, (error, book) => {
      if (error) {
        resolve(res.status(500).send({ error }));

        return;
      }

      if (book.renter !== userId) {
        resolve(res.status(409).send({
          error: {
            ...RENT_RETURN__MISSING_USER,
            message: formatString(RENT_RETURN__MISSING_USER.message, {
              bookId,
              userId,
            }),
          },
        }));

        return;
      }

      const { rentRequests } = book;

      if (!rentRequests.length) {
        const updatedBook = updateCacheProps(Object.assign(book, { renter: null }));

        updatedBook.save((e) => {
          if (e) {
            resolve(res.status(500).send({ error: e }));

            return;
          }

          resolve(res.json(updatedBook));
        });

        return;
      }

      const renter = rentRequests.shift();

      const updatedBook = updateCacheProps(Object.assign(book, { renter, rentRequests }));

      updatedBook.save((e) => {
        if (e) {
          resolve(res.status(500).send({ error: e }));

          return;
        }

        resolve(res.json(updatedBook));
      });
    });
  }));

export default router;
