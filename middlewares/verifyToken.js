const jwt= require('jsonwebtoken');
const { err } = require('../utils/responseWrapper');

const verifyToken= async (req, res, next)=>{
    if(!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith("Bearer"))
        return res.send(err(403, "No Valid Authorization header found!"));

    const accesstoken= req.headers.authorization.split(" ")[1];

    try {
        const decoded= jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET_KEY);
        req._id= decoded._id;
        next();
    } catch (error) {
        console.log(error);
        res.send(err(401, "Invalid Access Token!"));
    }
    
}

module.exports= verifyToken;