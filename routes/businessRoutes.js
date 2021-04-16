const express = require('express');
const businessController = require('../controllers/businessController');

const router = express.Router();

// router.param('id', tourController.checkID);

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
