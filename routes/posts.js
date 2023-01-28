const postsController = require('../controllers/postsController');
const verifyToken = require('../middlewares/verifyToken');

const postsRouter= require('express').Router();

// postsRouter.get('/', verifyToken, postsController);

postsRouter.post('/', verifyToken, postsController.createPost);
postsRouter.get('/myPosts', verifyToken, postsController.getAllMyPosts);
postsRouter.post('/userPosts', verifyToken, postsController.getUserPosts);
postsRouter.post('/likeDislike', verifyToken, postsController.likeOrDislike);
postsRouter.get('/postsOfFollowings', verifyToken, postsController.getPostsOfFollowing);
postsRouter.delete('/', verifyToken, postsController.deletePost);
postsRouter.put('/update', verifyToken, postsController.updatePost);

module.exports= postsRouter;