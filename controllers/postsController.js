const Post = require("../models/Post");
const User = require("../models/User");
const { success, err } = require("../utils/responseWrapper");
const cloudinary = require("cloudinary").v2;
const ta= require('time-ago');

// const postsController= async (req, res)=>{
//     res.send(success(200, "These are all posts!"));
// }

const createPost = async (req, res) => {
  try {
    const userId = req._id;
    const { caption, postImgDataUrl } = req.body;
    //upload post Image on cloudinary
    try {
      const cloudinaryResult = await cloudinary.uploader.upload(
        postImgDataUrl,
        {
          folder: "postImages",
        }
      );
      const post = await Post.create({
        owner: userId,
        caption,
        image: {
          publicId: cloudinaryResult.public_id,
          url: cloudinaryResult.url,
        },
      });

      const user = await User.findById(userId);
      user.posts.push(post._id);
      await user.save();

      res.send(success(201, "Post created successfully!"));
    } catch (error) {
      return res.send(err(500, error));
    }
  } catch (error) {
    console.log(error);
    res.send(err(500, error.message));
  }
};

const getAllMyPosts = async (req, res) => {
  try {
    const userId = req._id;
    const myposts = await Post.find({
      owner: userId,
    }).populate("owner");

    const mappedOutput = myposts.map((post) => {
      return {
        _id: post._id,
        image: post.image,
        caption: post.caption,
        owner: {
          _id: post.owner._id,
          name: post.owner.name,
          userImg: post.owner.userImg,
        },
        likesCount: post.likes.length,
        isLiked: post.likes.includes(req._id),
        timeCreated: ta.ago(post.createdAt+2000, true)
      };
    });
    res.send(success(200, mappedOutput.reverse()));
  } catch (error) {
    res.send(err(500, error.message));
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.body;

    const userPosts = await Post.find({
      owner: userId,
    }).populate("owner");

    const mappedOutput = userPosts.map((post) => {
      return {
        _id: post._id,
        image: post.image,
        caption: post.caption,
        owner: {
          _id: post.owner._id,
          name: post.owner.name,
          userImg: post.owner.userImg,
        },
        likesCount: post.likes.length,
        isLiked: post.likes.includes(req._id),
        timeCreated: ta.ago(post.createdAt+2000, true)
      };
    });

    res.send(success(200, mappedOutput.reverse()));
  } catch (error) {
    res.send(err(500, error.message));
  }
};

const getPostsOfFollowing = async (req, res) => {
  try {
    const userId = req._id;
    const user = await User.findById(userId);
    const followingsArray = user.followings;

    const filteredPosts = await Post.find({
      owner: {
        $in: followingsArray,
      },
    }).populate("owner");

    const mappedOutput = filteredPosts.map((post) => {
      return {
        _id: post._id,
        image: post.image,
        caption: post.caption,
        owner: {
          _id: post.owner._id,
          name: post.owner.name,
          userImg: post.owner.userImg,
        },
        likesCount: post.likes.length,
        isLiked: post.likes.includes(userId),
        timeCreated: ta.ago(post.createdAt+2000, true)
      };
    });

    res.send(success(200, mappedOutput.reverse()));
  } catch (error) {
    res.send(err(500, error.message));
  }
};

const deletePost = async (req, res) => {
  try {
    const userId = req._id;
    const { postId } = req.body;
    const user = await User.findById(userId);
    const post = await Post.findById(postId);

    if (!post) return res.send(err(404, "Post not found!"));

    if (post.owner == userId) {
      const postPublicId = post.image.publicId;
      await cloudinary.uploader.destroy(postPublicId);

      const index = user.posts.indexOf(postId);
      user.posts.splice(index, 1);
      await user.save();
      await post.remove();
      return res.send(success(200, "Post deleted!"));
    }

    return res.send(err(403, "User cannot delete other's post!"));
  } catch (error) {
    res.send(err(500, error.message));
  }
};

const likeOrDislike = async (req, res) => {
  try {
    const userId = req._id;
    const { postId } = req.body;
    const post = await Post.findById(postId);
    if (!post) return res.send(err(404, "No post found with given Id"));

    //already liked
    if (post.likes.includes(userId)) {
      const userIdIndex = post.likes.indexOf(userId);
      post.likes.splice(userIdIndex, 1);
      await post.save();
      return res.send(success(200, "Disliked"));
    }

    //not already liked
    post.likes.push(userId);
    await post.save();
    res.send(success(200, "Liked"));
  } catch (error) {
    res.send(err(500, error.message));
  }
};

const updatePost = async (req, res) => {
  try {
    const userId = req._id;
    const { postId, postImgDataUrl, caption } = req.body;
    const post= await Post.findById(postId);

    if (post.owner.toString() !== userId)
      return res.send(err(403, "You cannot edit other user's post"));

    if (postImgDataUrl) {
       const cloudinaryResult= await cloudinary.uploader.upload(postImgDataUrl, {
        public_id: post.image.publicId,
      });
      post.image.url= cloudinaryResult.url;
    }

    if (caption) {
      post.caption = caption;
    }

    await post.save();
    res.send(success(200, "Post Updated"));
  } catch (error) {
    res.send(err(500, error.message));
  }
};

module.exports = {
  createPost,
  getAllMyPosts,
  getUserPosts,
  getPostsOfFollowing,
  deletePost,
  likeOrDislike,
  updatePost
};
