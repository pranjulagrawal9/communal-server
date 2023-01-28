const mongoose= require('mongoose');
mongoose.set('strictQuery', false);

module.exports= ()=>{
    const connection_string= `mongodb+srv://pranjulagrawal:${process.env.MONGODB_PASSWORD}@cluster0.6g3meva.mongodb.net/?retryWrites=true&w=majority`;

    const options= {
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    };

    const callback= (error)=>{
        if(error)
            console.log("Connection Failed", error);
        else
            console.log("MongoDB Connected...");
    }

    mongoose.connect(connection_string, options, callback);
}