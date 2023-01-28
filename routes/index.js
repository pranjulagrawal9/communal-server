const authRouter = require('./auth');
const postsRouter = require('./posts');
const refreshRouter = require('./refresh');
const userRouter = require('./user');

const mainRouter= require('express').Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/post', postsRouter);
mainRouter.use('/refresh', refreshRouter);
mainRouter.use('/user', userRouter)

module.exports= mainRouter;