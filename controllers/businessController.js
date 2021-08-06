const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const Business = require('../models/businessModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadBusinessImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeBusinessImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  //Cover Image
  req.body.imageCover = `tours-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );
  next();
});

// upload.single('image')
// upload.array('images', 5)

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
