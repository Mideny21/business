const fs = require('fs');
const Business = require('../models/businessModel');



// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.getAllBusiness = async (req, res) => {
    try {
        const business = await Business.find();

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
            message: err
        })
    }
}