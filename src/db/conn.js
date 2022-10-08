//database connect
const mongoose = require("mongoose");


//creating a database
mongoose.connect("mongodb://localhost:27017/Enrolled", {
    //useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() =>{
    console.log("connected");

}).catch((error)=>{
    console.log(error);
})