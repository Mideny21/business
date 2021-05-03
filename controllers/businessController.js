const fs = require('fs');
const Business = require('../models/businessModel');

const APIFeatures = require('./../utils/apiFeatures');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopBusiness = async(req,res, next) =>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllBusiness = async (req, res) => {
    try {

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