// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Business = require('./businessModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    business: {
      type: mongoose.Schema.ObjectId,
      ref: 'Business',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    // this we need to pass if we are using virtual properties
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// preventing duplication of review
reviewSchema.index({ business: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //     path: 'business',
  //     select: 'name'
  // }).populate({
  //     path: 'user',
  //     select: 'name photo'
  // });

  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function(businessId) {
  const stats = await this.aggregate([
    {
      $match: { business: businessId }
    },
    {
      $group: {
        _id: '$business',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Business.findByIdAndUpdate(businessId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Business.findByIdAndUpdate(businessId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  // this point to current review
  this.constructor.calcAverageRatings(this.business);
});

// findByIdAndUpdate
// findByIdAndDelete

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does Not work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.business);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

// POST /tour/23233dse/reviews
// GET /tour/232fefd/reviews/998dsisc
