const express = require('express');
const businessController = require('../controllers/businessController');

const router = express.Router();

// router.param('id', tourController.checkID);

router.route('/top-5-cheap').get(businessController.aliasTopBusiness, businessController.getAllBusiness);
router.route('/business-stats').get(businessController.getBusinessStats);
router.route('/monthly-plan/:year').get(businessController.getMonthlyPlan); 

router
  .route('/')
  .get(businessController.getAllBusiness)
  .post(businessController.createBusiness);

router
  .route('/:id')
  .get(businessController.getBusiness)
  .patch(businessController.updateBusiness)
  .delete(businessController.deleteBusiness);

module.exports = router;
