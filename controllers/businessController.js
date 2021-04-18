const fs = require('fs');
const Business = require('../models/businessModel');



// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.getAllBusiness = async (req, res) => {
    try {
        // API FEATURES

        //BUILD QUERY
        // 1A) filtering
        // we are doing destructuring to copy the entire objcect first from the query object
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        //1B) Advance Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        let query = Business.find(JSON.parse(queryStr));


        // 2) Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // 3) Field limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // 4) pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const numTours = await Business.countDocuments();
            if (skip >= numTours) throw new Error('This page does not exist');
        }

        // EXECUTE QUERY
        const business = await query;


        // SEND RESPONSE
        res.status(200).json({
            status: 'sucess',
            results: business.length,
            data: {
                business
            }
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}


exports.createBusiness = async (req, res) => {
    try {
        const newBusiness = await Business.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                business: newBusiness
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail to create',
            message: error
        });
    }
}


exports.getBusiness = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                business
            }
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        })
    }
}

exports.updateBusiness = async (req, res) => {
    try {
        const business = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        res.status(200).json({
            status: 'success',
            data: {
                business
            }
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        })
    }
}

exports.deleteBusiness = async (req, res) => {
    try {
        await Business.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });

    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        })
    }
}