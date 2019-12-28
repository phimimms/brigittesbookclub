import mongoose from 'mongoose';

export default mongoose.model('User', new mongoose.Schema({

  /**
   * The time at which the resource was created.
   */
  created: { required: true, type: Date },

  /**
   * The email address of the user.
   */
  email: { required: true, type: String, unique: true },

  /**
   * The entity tag to represent the resource.
   */
  eTag: { required: true, type: String, unique: true },

  /**
   * The first-name of the user.
   */
  firstName: { required: true, type: String },

  /**
   * The most recent time at which the resource was modified.
   */
  lastModified: { required: true, type: Date },

  /**
   * The last-name of the user.
   */
  lastName: { required: true, type: String },

  /**
   * The password to authenticate the user.
   */
  password: { required: true, type: String },

}));
