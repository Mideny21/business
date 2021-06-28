const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A business must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A business must have less or equal than 40 characters'],
      minlength: [10, 'A business must have more or equal than 10 characters']
      // validate: [validator.isAlpha, 'Business name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A business must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A business must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A business must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10 // 4.66666, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A business must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // This only to current doc on new document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be  below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A business must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A business must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretBusiness: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    // this we need to pass if we are using virtual properties
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

businessSchema.index({ price: 1, ratingsAverage: -1 });
businessSchema.index({ slug: 1 });
businessSchema.index({ startLocation: '2dsphere' });

// VIRTUALS
businessSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7; // this refers to the current model
});

//VITRUAL POPULATE
businessSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
businessSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// businessSchema.pre('save', async function(next){
//  const  guidesPromises = this.guides.map(async id => await User.findById(id));
//  this.guides = await Promise.all(guidesPromises);
//  next();

// });

// businessSchema.pre('save', function(next){
//     console.log('will save document');
//     next();
// });

// businessSchema.post('save', function(doc, next){
//     console.log(doc);
//     next();
// });

//QUERY MIDDLEWARE
businessSchema.pre(/^find/, function(next) {
  this.find({ secretBusiness: { $ne: true } });
  next();
});

businessSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});
//AGGREGATION MIDDLEWARE
// businessSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretBusiness: { $ne: true } } });
// });

const Business = mongoose.model('Business', businessSchema);

module.exports = Business;
