const mongoose=require("mongoose");
const bcrypt =require("bcryptjs");

const validator=require("validator");
const jwt=require("jsonwebtoken");

const userSchema=mongoose.Schema({
name:{
    type:String,
    required:true,
    minlength: 3

},

email:{
    type:String,
    required: true,
    validate(value){
        if(!validator.isEmail(value)){
            throw new Error("Invalid email id")
        }
    }
    

},
phone:{
    type:Number,
    required:true,
    minlength: 10

},
password:{
    type:String,
    required:true,
    validate(value){
        if(!validator.isStrongPassword(value)){
            throw new Error("Choose a strong password")
        }
    }
},

date:{
    type:Date,
    default:Date.now
},

isVerified: {
    type: Number,
    default: 0



},

tokens: [{
    token:{
        type:String,
        required: true
    }
}]
})

//preventing duplicate

userSchema.statics.isThisEmailInUSe= async function(email)
{
    try{
    const user = await this.findOne({email})
    if(user) return false
    return true;
}
catch(error){
    res.status(500).send(error);
}

}




//generating token
userSchema.methods.generateAuthToken = async function(){
    try{
        //console.log(this._id);

        const token =jwt.sign({_id: this._id.toString()}, process.env.SECRET_KEY);   //secret key
        this.tokens=this.tokens.concat({token:token})
        await this.save();
        //console.log(token);
        return token;

    } catch (error){
        res.send(error);
        console.log(error);
    }
}

// const updateUserProfile = asyncHandler(async(req,res)=>{
//         const user=await User.findById(req.user._id)
//         if(user){
//             user.name=req.body.name || user.name
//             user.email=req.body.email || user.email
//             user.password=req.body.password || user.password
//             user.phone=req.body.phone|| user.phone
//           if(req.body.password){
//             user.password=req.body.password
//           }
//           const UpdateUser= await user.save();
//           res.send('Profile is updated')

//         }
//         else{
//             res.status(404)
//             throw new Error('User not found')
//         }
// })




userSchema.pre("save",async function (next){

    if(!this.isModified("password")){
        next();
    }
   //const passwordhash = await bcrypt.hash(password,5);
   //console.log(this.password);
   this.password = await bcrypt.hash(this.password,5);
   
   //console.log(this.password);

   //this.confirmpassword=undefined;
});


//we need a  collection
const User = mongoose.model("User",userSchema);

module.exports=User;
