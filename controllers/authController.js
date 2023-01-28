const user = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt= require('bcrypt');
const {success, err}= require('../utils/responseWrapper');

const loginController= async (req, res)=>{
    const {email, password}= req.body;

    if(!email || !password)
        return res.send(err(400, "Email or Password not provided!"));

    const foundUser= await user.findOne({email});
    if(foundUser){
        const matched= await bcrypt.compare(password, foundUser.password);
        if(matched){
            const accesstoken= generateAccessToken(foundUser);
            const refreshtoken= generateRefreshToken(foundUser);
            res.cookie("refresh_token", refreshtoken, {
                httpOnly: true,
                secure: true
            });
            return res.send(success(200, {accesstoken}));
        }
            
        return res.send(err(403, "Incorrect Password!"));
    }   

    res.send(err(404, "User doesn't exist!"));
}

function generateAccessToken(data){
    const accesstoken= jwt.sign({_id: data._id}, process.env.ACCESS_TOKEN_SECRET_KEY, {
        expiresIn: '1d'
    });
    return accesstoken;
}

function generateRefreshToken(data){
    const refreshtoken= jwt.sign({_id: data._id}, process.env.REFRESH_TOKEN_SECRET_KEY, {
        expiresIn: '1y'
    });
    return refreshtoken;
}

const signupController= async (req, res)=>{
    const {name, email, password}= req.body;

    if(!email || !password)
        return res.send(err(400, "Email or Password not provided!"));

    const foundUser= await user.findOne({email});
    if(foundUser)
        return res.send(err(400, "User already exists!"));

    const hashedPwd= await bcrypt.hash(password, 10);    
    const newUser= await user.create({name, email, password: hashedPwd});
   
    res.send(success(201, newUser));
}


const refreshAccessTokenController= async (req, res)=>{
    const cookies= req.cookies;
    console.log(cookies);
    if(!cookies.refresh_token)
        return res.send(err(401, "Refresh token not present in cookies!"));

    const refreshtoken= cookies.refresh_token;

    try {
        const decoded= jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET_KEY);
        const accesstoken= generateAccessToken(decoded);
        res.send(success(200, {accesstoken}));

    } catch (error) {
        res.send(err(401, error.message));
    }
}

const logOutUser= async (req, res)=>{
    try {
      const userId= req._id;
      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: true,
      });
      res.send(success(200, "Logged Out!"))
    } catch (error) {
      res.send(err(500, error.message));
    } 
  }

module.exports= {
    loginController,
    signupController,
    refreshAccessTokenController,
    logOutUser
};
