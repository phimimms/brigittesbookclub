import mongoose from 'mongoose';

export default mongoose.model('Book', new mongoose.Schema({

  /**
   * The name of the author.
   */
  author: { required: true, type: String },

  /**
   * The URL of the book's cover art.
   */
  coverArtURL: { type: String },

  /**
   * The time at which the resource was created.
   */
  created: { required: true, type: Date },

  /**
   * The entity tag to represent the resource.
   */
  eTag: { required: true, type: String, unique: true },

  /**
   * The most recent time at which the resource was modified.
   */
  lastModified: { required: true, type: Date },

  /**
   * The identifier of the book's owner.
   */
  owner: { required: true, type: String },

  /**
   * The identifier of the user who is currently renting the book.
   */
  renter: { type: String },

  /**
   * The list of users waiting to rent the book.
   */
  rentRequests: { type: [ String ] },

  /**
   * The title of the book.
   */
  title: { required: true, type: String, unique: true },

}));
