const Post = require("../models/Post");
const User = require("../models/User");
const { success, err } = require("../utils/responseWrapper");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;

const followOrUnfollow = async (req, res) => {
  try {
    const currUserId = req._id;
    const { userToFollowId } = req.body;

    if (currUserId === userToFollowId)
      return res.send(err(409, "User can't follow himself!"));

    const currUser = await User.findById(currUserId);
    const userToFollow = await User.findById(userToFollowId);

    if (!userToFollow) {
      return res.send(err(404, "User to follow not found"));
    }

    //already following
    if (currUser.followings.includes(userToFollowId)) {
      const userToFollowIdx = currUser.followings.indexOf(userToFollowId);
      currUser.followings.splice(userToFollowIdx, 1);
      await currUser.save();

      const currUserIdx = userToFollow.followers.indexOf(currUserId);
      userToFollow.followers.splice(currUserIdx, 1);
      await userToFollow.save();

      return res.send(success(200, "Unfollowed"));
    }

    //not already following
    currUser.followings.push(userToFollowId);
    await currUser.save();

    userToFollow.followers.push(currUserId);
    await userToFollow.save();

    return res.send(success(200, "Followed"));
  } catch (error) {
    res.send(err(500, error.message));
  }
};

const deleteMyProfile = async (req, res) => {
  try {
    const userId = req._id;
    const user = await User.findById(userId);
    const posts= await Post.find({
      owner: userId
    });
    
    const public_ids= posts.map((post)=>{
      return post.image.publicId;
    });

    //delete user image from cloudinary
    if(user.userImg.publicId)
      await cloudinary.uploader.destroy(user.userImg.publicId);

    //delete posts images from cloudinary
    if(public_ids.length!==0)
      await cloudinary.api.delete_resources(public_ids);

    //delete all posts of user
    await Post.deleteMany({
      owner: userId,
    });

    //delete user from followings' followers
    user.followings.forEach(async (followingId) => {
      const following = await User.findById(followingId);
      const idx = following.followers.indexOf(userId);
      following.followers.splice(idx, 1);
      await following.save();
    });

    //delete user from followers' followings
    user.followers.forEach(async (followersId) => {
      const follower = await User.findById(followersId);
      const idx = follower.followings.indexOf(userId);
      follower.followings.splice(idx, 1);
      await follower.save();
    });

    //delete user from likes
    const allposts = await Post.find({});
    allposts.forEach(async (post) => {
      const index = post.likes.indexOf(userId);
      post.likes.splice(index, 1);
      await post.save();
    });

    //delete user
    await user.remove();

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: true,
    });

    res.send(success(200, "User Profile Deleted!"));
  } catch (error) {
    console.log(error);
    res.send(err(500, error.message));
  }
};

const getMyInfo = async (req, res) => {
  try {
    const userId = req._id;
    // const user = await User.findById(userId).populate('followings');
    // const suggestionsArray=[];
    // user.followings.forEach((following)=>{
    //   suggestionsArray.push(...following.followings);
    // });
    // let uniqueSuggestionsArray= [...new Set(suggestionsArray)];
    // const suggestions= await User.find({
    // $and: [{
    //   _id:{
    //     $in: uniqueSuggestionsArray
    //   }
    // }, {
    //   _id:{
    //     $nin: user.followings
    //   }
    // }]});

    const user = await User.findById(userId);
    const suggestions= await User.find({
      $and: [{
      _id: {
        $ne: userId
      }
     }, {
      _id: {
        $nin: user.followings
      }
    }]});

    res.send(success(200, {user, suggestions}));
  } 
  catch (error) {
    res.send(err(500, error.message));
  }
};

const getUserProfile= async (req, res)=>{
  try {
    const currUserId= req._id;
    const {userId}= req.body;
    let isFollowed= false;
    const user= await User.findById(userId).populate('posts');
    if(user.followers.includes(currUserId))
      isFollowed= true;

    const numPosts= user.posts.length;
    const numFollowers= user.followers.length;
    const numFollowings= user.followings.length;

    res.send(success(200, {user, isFollowed, numPosts, numPosts, numFollowers, numFollowings}));
  } catch (error) {
    res.send(err(500, error.message));
  }
  
}

const updateMyProfile = async (req, res) => {
  try {
    const userId = req._id;
    const user = await User.findById(userId);
    const { name, email, userImgDataUrl, bio } = req.body;

    if (name) {
      user.name = name;
      await user.save();
    }
    if (email) {
      user.email = email;
      await user.save();
    }
    if (userImgDataUrl) {
        if(!user.userImg){
          const cloudinaryResult = await cloudinary.uploader.upload(userImgDataUrl, {
            folder: 'userImages'
          });
          user.userImg.publicId = cloudinaryResult.public_id;
          user.userImg.url = cloudinaryResult.url;
        }
        else{
          const cloudinaryResult = await cloudinary.uploader.upload(userImgDataUrl, {
            public_id: user.userImg.publicId
          });
          user.userImg.url = cloudinaryResult.url;
        } 
        await user.save();
    }

    if(bio){
      user.bio= bio;
      await user.save();
    }

    res.send(success(200, {user}));
  } catch (error) {
    res.send(err(500, error.message));
  }
};

module.exports = {
  followOrUnfollow,
  deleteMyProfile,
  getMyInfo,
  updateMyProfile,
  getUserProfile,
};
