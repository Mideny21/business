const fs = require('fs');
const Business = require('../models/businessModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');


const APIFeatures = require('./../utils/apiFeatures');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopBusiness = catchAsync(async(req,res, next) =>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
});

exports.getAllBusiness = catchAsync(async (req, res, next) => {

        // EXECUTE QUERY
        const features = new APIFeatures(Business.find(), req.query).filter().sorting().limitFields().paginate();
        const business = await features.query;


        // SEND RESPONSE
        res.status(200).json({
            status: 'sucess',
            results: business.length,
            data: {
                business
            }
        });
 
});




exports.createBusiness = catchAsync(async (req, res, next) => {
    
        const newBusiness = await Business.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                business: newBusiness
            }
        });
});


exports.getBusiness = catchAsync(async (req, res, next) => {
        const business = await Business.findById(req.params.id);

        if(!business){
           return next(new AppError('No business found with that ID', 404));
        }



        res.status(200).json({
            status: 'success',
            data: {
                business
            }
        });
});

exports.updateBusiness = catchAsync(async (req, res,next) => {
        const business = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        
        if(!business){
            return next(new AppError('No business found with that ID', 404));
         } 

        res.status(200).json({
            status: 'success',
            data: {
                business
            }
        });
});

exports.deleteBusiness = catchAsync(async (req, res, next) => {
    
      const business =  await Business.findByIdAndDelete(req.params.id);

        if(!business){
            return next(new AppError('No business found with that ID', 404));
         }

        res.status(204).json({
            status: 'success',
            data: null
        });
});


exports.getBusinessStats = catchAsync(async(req,res, next) =>{

        const stats = await Business.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group:{
                    // this id is just use to group items based on field we pass on it
                    _id: { $toUpper: '$difficulty' },
                    // we use 1 below to count its just a trick
                    numBusiness: { $sum: 1  },
                    numRatings: { $sum: '$ratingsQuantity'},
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },

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
        })

});

// id is what we want to use to group the documents

exports.getMonthlyPlan = catchAsync(async(req,res, next) =>{
    
        const year = req.params.year * 1; // * 1 its just a trick to transform it to a number and the year for this example is 2021
        
        const plan = await Business.aggregate([
            {
                $unwind: '$startDates' // unwind pull every single element in array to its own document
            },
            {
                // this is just a query
                $match:{
                    startDates:{
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    }
                }
            },
            {
                $group:{
                    _id: { $month: '$startDates' }, // we are grouping them by month
                    numBusinessStarts: { $sum: 1 }, // 1 its just a trcik to count business
                    business: { $push: '$name' } // we push business on an array
                }
            },
            {
                $addFields:{ month: '$_id' } // we called the id on the group stage
            },
            {
                $project:{
                    _id: 0 // we remove the id on the group stage
                }
            },
            {
                $sort:{ numBusinessStarts: -1 } // in desc 
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
        })
   
});