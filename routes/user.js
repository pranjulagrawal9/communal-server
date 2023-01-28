const verifyToken = require('../middlewares/verifyToken');
const userController= require('../controllers/userController');

const userRouter= require('express').Router();

userRouter.post('/followUnfollow', verifyToken, userController.followOrUnfollow);
userRouter.delete('/', verifyToken, userController.deleteMyProfile);
userRouter.get('/myInfo', verifyToken, userController.getMyInfo);
userRouter.post('/userInfo', verifyToken, userController.getUserProfile);
userRouter.put('/', verifyToken, userController.updateMyProfile);
userRouter.get('/deleteAccount', verifyToken, userController.deleteMyProfile);

module.exports= userRouter;

