import express from 'express';

import { RESOURCE__OUTDATED, USER__NOT_FOUND } from '../dictionary/errors';
import Book from '../models/Book';
import User from '../models/User';
import { updateCacheProps } from '../util/cache';
import { selectNonSensitiveUserFields } from '../util/user';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/user')

  /**
   * Gets all of the users.
   */
  .get((req, res) => new Promise((resolve) => {
    User.find((error, users) => {
      if (error) {
        resolve(res.status(500).send({ error }));

        return;
      }

      resolve(res.json(users.map((user) => selectNonSensitiveUserFields(user))));
    });
  }))

  /**
   * Updates the authenticated user.
   */
  .put((req, res) => {
    if (!req.user) {
      return Promise.resolve(res.status(401).send({ error: USER__NOT_FOUND }));
    }

    const { body } = req;
    const { _id: userId } = req.user as typeof User;

    return new Promise((resolve) => {
      User.findById(userId, (error, user) => {
        if (error) {
          resolve(res.status(500).send({ error }));

          return;
        }

        if (body.eTag !== user.eTag) {
          resolve(res.status(412).send({ error: RESOURCE__OUTDATED, resource: selectNonSensitiveUserFields(user) }));

          return;
        }

        const updatedUser = updateCacheProps(Object.assign(user, selectNonSensitiveUserFields(body)));

        updatedUser.save((e) => {
          if (e) {
            resolve(res.status(500).send({ error: e }));

            return;
          }

          resolve(res.json(selectNonSensitiveUserFields(updatedUser)));
        });
      });
    });
  })

  /**
   * Deletes the authenticated user.
   */
  .delete((req, res) => {
    if (!req.user) {
      return Promise.resolve(res.status(401).send({ error: USER__NOT_FOUND }));
    }

    const { _id: userId } = req.user as typeof User;

    req.logout();

    return new Promise((resolve, reject) => User.findByIdAndRemove(userId, (error) => (error ? reject(error) : resolve())))
      .then(() => new Promise((resolve, reject) => Book.deleteMany(
        { owner: userId },
        (error) => (error ? reject(error) : resolve()),
      )))
      .then(() => new Promise((resolve, reject) => Book.find(
        { rentRequests: { $in: [ userId ] } },
        (error, books) => (error ? reject(error) : resolve(books)),
      ))
        .then((books: typeof Book[]) => Promise.all(books.map((book) => new Promise((resolve, reject) => {
          const rentRequests = book.rentRequests.filter((id) => id !== userId);

          const updatedBook = updateCacheProps(Object.assign(book, { rentRequests }));

          updatedBook.save((e) => (e ? reject(e) : resolve()));
        })))))
      .then(() => new Promise((resolve, reject) => Book.find(
        { renter: userId },
        (error, books) => (error ? reject(error) : resolve(books)),
      ))
        .then((books: typeof Book[]) => Promise.all(books.map((book) => new Promise((resolve, reject) => {
          const { rentRequests } = book;

          if (!rentRequests.length) {
            const updatedBook = updateCacheProps(Object.assign(book, { renter: null }));

            updatedBook.save((e) => (e ? reject(e) : resolve()));

            return;
          }

          const renter = rentRequests.shift();

          const updatedBook = updateCacheProps(Object.assign(book, { renter, rentRequests }));

          updatedBook.save((e) => (e ? reject(e) : resolve()));
        })))))
      .then(() => res.send(userId))
      .catch((error) => res.status(500).send({ error }));
  });

export default router;
