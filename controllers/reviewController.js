const Review = reqiuire('./../models/reviewModel');
const catchAsync = require('../utils/catchAsync');


exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.businessId) filter = { business: req.params.businessId};
    const reviews = await Review.find(filter);

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data:{
            reviews
        }
    });
});


exports.createReview = catchAsync(async (req, res, next) =>{
    // Allow nested routes
    if(!req.body.business) req.body.business = req.params.businessId;
    if(!req.body.user) req.body.user = req.user.id;
    const newReview = await Review.create(req.body);


    res.status(201).json({
        status: 'success',
        data:{
            review: newReview
        }  
    })
});