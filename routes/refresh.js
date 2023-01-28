const { refreshAccessTokenController } = require('../controllers/authController');

const refreshRouter= require('express').Router();

refreshRouter.get('/', refreshAccessTokenController);

module.exports= refreshRouter;