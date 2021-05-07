const mongoose = require('mongoose');
const slugify = require('slugify');


const businessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A business must have a name'],
        unique: true,
        trim: true
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
        required: [true, 'A business must have a difficulty']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A business must have a price']
    },
    priceDiscount: Number,
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
    secretBusiness:{
        type:Boolean,
        default:false
    }
},
{
    // this we need to pass if we are using virtual properties
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
}
);

businessSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7; // this refers to the current model
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
businessSchema.pre('save', function(next){
    this.slug = slugify(this.name, { lower: true});
    next();
});

// businessSchema.pre('save', function(next){
//     console.log('will save document');
//     next();
// });

// businessSchema.post('save', function(doc, next){
//     console.log(doc);
//     next();
// });


//QUERY MIDDLEWARE
businessSchema.pre(/^find/, function(next){
    this.find({ secretBusiness: { $ne: true }});
    next();
});

const Business = mongoose.model('Business', businessSchema);

module.exports = Business;