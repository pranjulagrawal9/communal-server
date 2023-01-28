const mongoose= require('mongoose');

const userSchema= mongoose.Schema({
    name:{
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ],

    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],

    followings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],

    userImg: {
        publicId: String,
        url: String
    },

    bio: {
        type: String
    }
    
}, {
    timestamps: true
});

module.exports= mongoose.model('user', userSchema);
