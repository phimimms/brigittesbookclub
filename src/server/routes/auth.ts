import bcrypt from 'bcrypt';
import express from 'express';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import formatString from 'string-template';

import { USER__CREDENTIALS, USER__DUPLICATE, USER__NOT_FOUND, USER__NOT_REGISTERED } from '../dictionary/errors';
import User from '../models/User';
import { updateCacheProps } from '../util/cache';
import { selectNonSensitiveUserFields } from '../util/user';

passport.use('login', new LocalStrategy({
  passwordField: 'password',
  usernameField: 'email',
}, (email, password, done) => {
  User.findOne({ email }, (error, user) => {
    if (error) {
      done(error);

      return;
    }

    if (!user) {
      done({ ...USER__NOT_REGISTERED, message: formatString(USER__NOT_REGISTERED.message, { email }) });

      return;
    }

    bcrypt.compare(password, user.password, (e, match) => {
      if (e || !match) {
        done(e || { ...USER__CREDENTIALS, message: formatString(USER__CREDENTIALS.message, { userId: user._id }) });

        return;
      }

      done(null, user);
    });
  });
}));

passport.use('signup', new LocalStrategy({
  passReqToCallback: true,
  passwordField: 'password',
  usernameField: 'email',
}, (req, email, password, done) => {
  process.nextTick(() => {
    User.findOne({ email }, (error, user) => {
      if (error) {
        done(error);

        return;
      }

      if (user) {
        done({ ...USER__DUPLICATE, message: formatString(USER__DUPLICATE.message, { email }) });

        return;
      }

      bcrypt.genSalt(10, (saltError, salt) => {
        if (saltError) {
          done(saltError);

          return;
        }

        bcrypt.hash(password, salt, (hashError, hash) => {
          if (hashError) {
            done(hashError);

            return;
          }

          const {
            firstName,
            lastName,
          } = req.query;

          const newUser = new User(updateCacheProps({
            created: new Date(),
            email,
            firstName,
            lastName,
            password: hash,
          }));

          newUser.save((e) => {
            if (e) {
              done(e);

              return;
            }

            done(null, newUser);
          });
        });
      });
    });
  });
}));

const router = express.Router(); // eslint-disable-line new-cap

/**
 * Gets the authenticated user.
 */
router.get('/auth/check', (req, res) => {
  if (!req.user) {
    res.status(401).send({ error: USER__NOT_FOUND });

    return;
  }

  res.json(selectNonSensitiveUserFields(req.user));
});

/**
 * Authenticates a user.
 */
router.post('/auth/login', (req, res) => {
  passport.authenticate('login', (error, user) => {
    if (error) {
      res.status(500).send({ error });

      return;
    }

    if (!user) {
      res.status(401).send({ error: USER__NOT_FOUND });

      return;
    }

    req.login(user, (e) => {
      if (e) {
        res.status(500).send({ error: e });

        return;
      }

      res.json(selectNonSensitiveUserFields(user));
    });
  })(req, res);
});

/**
 * Unauthenticates a user.
 */
router.post('/auth/logout', (req, res) => {
  req.logout();

  res.json(null);
});

/**
 * Creates a user.
 */
router.post('/auth/signup', (req, res) => {
  passport.authenticate('signup', (error, user) => {
    if (error) {
      res.status(500).send({ error });

      return;
    }

    if (!user) {
      res.status(401).send({ error: USER__NOT_FOUND });

      return;
    }

    req.login(user, (e) => {
      if (e) {
        res.status(500).send({ error: e });

        return;
      }

      res.json(selectNonSensitiveUserFields(user));
    });
  })(req, res);
});

export default router;
