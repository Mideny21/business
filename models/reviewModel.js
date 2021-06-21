// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        review:{
            type:String,
            required:[true,'Review can not be empty!']
        },
        rating:{
            type:Number,
            min:1,
            max:5
        }, 
        createdAt:{
            type:Date,
            default:Date.now(),
        },
        business:{
            type: mongoose.Schema.ObjectId,
            ref:'Business',
            required:[true, 'Review must belong to a tour']
        },
        user:{
            type: mongoose.Schema.ObjectId,
            ref:'User',
            required:[true, 'Review must belong to a user']
        }

},
{
    // this we need to pass if we are using virtual properties
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
}
);


reviewSchema.pre(/^find/, function(next){
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

const Review = mongoose.model('Review', reviewSchema);


module.exports = Review;

// POST /tour/23233dse/reviews
// GET /tour/232fefd/reviews/998dsisc