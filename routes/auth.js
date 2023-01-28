const { loginController, signupController, logOutUser} = require('../controllers/authController');
const authRouter= require('express').Router();

authRouter.post('/login', loginController);
authRouter.post('/signup', signupController);
authRouter.get('/logout', logOutUser);

module.exports= authRouter;