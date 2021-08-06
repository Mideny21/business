const express = require('express');
const businessController = require('../controllers/businessController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
// const reviewController = require('./../controllers/reviewController');

const router = express.Router();

// router.param('id', tourController.checkID);

router.use('/:businessId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(businessController.aliasTopBusiness, businessController.getAllBusiness);
router.route('/business-stats').get(businessController.getBusinessStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    businessController.getMonthlyPlan
  );

router
  .route('/business-within/:distance/center/:latlng/unit/:unit')
  .get(businessController.getBusinessWithin);
//  /business-within/233/center/-40,45/unit/mi

router
  .route('/distances/:latlng/unit/:unit')
  .get(businessController.getDistances);

router
  .route('/')
  .get(businessController.getAllBusiness)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    businessController.createBusiness
  );

router
  .route('/:id')
  .get(businessController.getBusiness)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    businessController.uploadBusinessImages,
    businessController.resizeBusinessImages,
    businessController.updateBusiness
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    businessController.deleteBusiness
  );

// router.route('/:businessId/reviews').post(authController.protect, authController.restrictTo('user'), reviewController.createReview);

module.exports = router;
