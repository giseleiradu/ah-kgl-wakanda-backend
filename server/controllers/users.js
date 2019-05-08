import dotenv from 'dotenv';
import { User } from '../models/index';
import encrypt from '../helpers/encrypt';
import sendMail from '../helpers/sendVerificationEmail';
import errorHandler from '../helpers/errorHandler';

dotenv.config();

/**
 * The class handle everything about the user
 */
class Users {
  /**
   * The controller to create a user.
   * @param {req} req the request.
   * @param {res} res the response.
   * @returns {void}
  */
  static async signUp(req, res) {
    try {
      const hashedPassword = encrypt.hashPassword(req.body.password);
      const { username, email } = req.body;
      const newUser = await User.create({ username, email, password: hashedPassword });
      const token = await Users.generateToken(newUser.get());
      if (process.env.NODE_ENV !== 'test') await sendMail(email, username, token);
      return Users.send(res, newUser, token);
    } catch (error) {
      if (error.errors[0].message === 'email must be unique') {
        return res.status(400).json({
          status: 409,
          message: 'Email already exists',
        });
      }
      return res.status(400).json({
        status: 400,
        message: error.errors[0].message,
      });
    }
  }

  /**
   * The controller to create a user.
   * @param {req} req the request.
   * @param {res} res the response.
   * @returns {void}
  */
  static async logIn(req, res) {
    const { body } = req;
    const user = await User.findOne({ where: { email: body.email } });
    if (!user || !encrypt.comparePassword(user.get().password, body.password)) {
      return res.status(401).json({
        status: 401,
        message: 'The credentials you provided is incorrect',
      });
    }
    await User.update({ isLoggedIn: true }, { where: { id: user.id } });
    const token = await Users.generateToken(user.get());
    return Users.send(res, user, token);
  }

  /**
   * The controller to create a user.
   * @param {user} user the data user.
   * @returns {void}
  */
  static async generateToken(user) {
    const {
      id,
      username,
      email,
    } = user;
    return encrypt.generateToken({ id, username, email });
  }

  /**
   * The controller to create a user.
   * @param {res} res the data user.
   * @param {user} user the data user.
   * @param {token} token the data user.
   * @returns {void}
  */
  static async send(res, user, token) {
    return res.send(
      {
        user: {
          email: user.email,
          token,
          username: user.username,
          bio: user.bio,
          image: user.image,
        }
      }
    );
  }

  /**
   * The controller to create a user.
   * @param {req} req the request.
   * @param {res} res the response.
   * @returns {void}
  */
  static async socialLogin(req, res) {
    try {
      const {
        provider, displayName
      } = req.user;

      const user = {
        provider,
        username: displayName.replace(' ', '_').toLowerCase(),
        email: req.user.emails ? req.user.emails[0].value : null,
        image: req.user.photos[0].value,
      };
      const newUser = await User.findOrCreate({
        where: { username: user.username },
        defaults: { ...user }
      });
      const {
        id,
        username,
        email,
        image,
        bio
      } = newUser[0].get();

      const data = {
        id: newUser[0].get().id,
        username,
        email,
      };
      if (!newUser[1]) await User.update({ isLoggedIn: true }, { where: { id, } });
      const status = newUser[1] ? 201 : 200;

      return res.status(status).json({
        status,
        user: {
          username,
          email,
          token: await Users.generateToken(data),
          image,
          bio,
        },
      });
    } catch (e) {
      errorHandler.errorResponse(res, e);
    }
  }

  /**
   * The controller for signing out
   * @param {req} req the request
   * @param {res} res the response
   * @return {void}
   */
  static async signout(req, res) {
    try {
      const { id } = req.user;
      await User.update({ isLoggedIn: false }, { where: { id, } });
      return res.status(200).json({
        status: 200,
        message: 'Successfully signs out.',
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  }

  /**
   *
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @returns {object} response
   * @memberof User
   */
  static async update(req, res) {
    try {
      const { username } = req.params;
      const result = await User.update(
        {
          email: req.body.email,
          bio: req.body.bio,
          image: req.body.image,
        },
        {
          where: { username },
          returning: true
        }
      );
      return res.status(200).json({
        status: 200,
        user: result[1][0],
      });
    } catch (e) {
      return res.status(400).json({
        status: 400,
        error: e
      });
    }
  }

  /**
   *
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @returns {object} response
   * @memberof User
   */
  static async listUsers(req, res) {
    try {
      const result = await User.findAll({
        attributes: {
          exclude: ['password', 'provider', 'isLoggedIn', 'createdAt', 'updatedAt']
        }
      });
      return res.status(200).json({
        status: 200,
        users: result,
      });
    } catch (e) {
      errorHandler.errorResponse(res, e);
    }
  }
}

export default Users;
