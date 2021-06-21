const express = require('express');
const businessController = require('../controllers/businessController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
// const reviewController = require('./../controllers/reviewController');

   

const router = express.Router();

// router.param('id', tourController.checkID);

router.use('/:businessId/reviews', reviewRouter);

router.route('/top-5-cheap').get(businessController.aliasTopBusiness, businessController.getAllBusiness);
router.route('/business-stats').get(businessController.getBusinessStats);
router.route('/monthly-plan/:year').get(businessController.getMonthlyPlan); 

router
  .route('/')
  .get(authController.protect, businessController.getAllBusiness)
  .post(authController.protect, businessController.createBusiness);

router
  .route('/:id')
  .get(businessController.getBusiness)
  .patch(businessController.updateBusiness)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), businessController.deleteBusiness);



// router.route('/:businessId/reviews').post(authController.protect, authController.restrictTo('user'), reviewController.createReview);

module.exports = router;
