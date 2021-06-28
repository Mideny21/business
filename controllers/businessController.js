const fs = require('fs');
const Business = require('../models/businessModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopBusiness = catchAsync(async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
});

exports.getAllBusiness = factory.getAll(Business);

exports.getBusiness = factory.getOne(Business, { path: 'reviews' });

exports.createBusiness = factory.createOne(Business);

exports.updateBusiness = factory.updateOne(Business);

exports.deleteBusiness = factory.deleteOne(Business);

exports.getBusinessStats = catchAsync(async (req, res, next) => {
  const stats = await Business.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        // this id is just use to group items based on field we pass on it
        _id: { $toUpper: '$difficulty' },
        // we use 1 below to count its just a trick
        numBusiness: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 } // we add 1 for ascending
    }
    // {
    //     $match: { _id: { $ne: 'EASY'} }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

// id is what we want to use to group the documents

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // * 1 its just a trick to transform it to a number and the year for this example is 2021

  const plan = await Business.aggregate([
    {
      $unwind: '$startDates' // unwind pull every single element in array to its own document
    },
    {
      // this is just a query
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // we are grouping them by month
        numBusinessStarts: { $sum: 1 }, // 1 its just a trcik to count business
        business: { $push: '$name' } // we push business on an array
      }
    },
    {
      $addFields: { month: '$_id' } // we called the id on the group stage
    },
    {
      $project: {
        _id: 0 // we remove the id on the group stage
      }
    },
    {
      $sort: { numBusinessStarts: -1 } // in desc
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});

//  /business-within/:distance/center/:latlng/unit/:unit
// /business-within/233/center/34.11175, -118.113491/unit/mi

exports.getBusinessWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lng',
        400
      )
    );
  }

  const businesses = await Business.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: businesses.length,
    data: {
      data: businesses
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lng',
        400
      )
    );
  }

  const distances = await Business.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
