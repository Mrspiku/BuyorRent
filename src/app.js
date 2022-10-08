

require('dotenv').config();
const express=require("express");
const { registerPartials } = require("hbs");
const path=require("path");
require("./db/conn");
const User = require("./models/userdetails");
const hbs =require("hbs");
const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken");
const  flash= require("connect-flash");
//const  flash= require("express-flash");
const session =require("express-session");
const passport=require("passport");
const cookieParser= require("cookie-parser");
const auth =require("./middleware/auth");
const localstrategy=require("passport-local").Strategy;
const { setEngine } = require("crypto");
const { request } = require("http");
const { Strategy } = require('passport-local');
const ObjectID = require("mongodb").ObjectId;


const app = express();
const port =process.env.PORT || 3000;

//using static website

//setting the paths
const staticpath = path.join(__dirname, "../public");
const templatepath = path.join(__dirname, "../templates/views");
const partialpath = path.join(__dirname, "../templates/partials");
// console.log(path.join(__dirname, "../public"));

//flash message middleware


passport.use(new Strategy(
    (email,password,done)=>{
        app.locals.users.findOne({email}, (err,User)=>{
            if(err){
                return done(err);
            }
            if(!User){
                return done(null,false);

            }
            if(User.password!=password){
                return done(null,false);       
                
        }
        
        return done(null,User);
    
    });
}

));

passport.serializeUser((User,done)=>{
    done(null,User._id);

});

passport.deserializeUser((id,done)=>{
    done(null,{id});
});




app.use(session({
    secret:'flashblog',
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use(function(req, res, next){
    res.locals.message = req.isAuthenticated();
    next();
});









//global variables

// app.use(session({
//     secret: 'webslesson',
//     cookie: {maxAge: 60000},
//     saveUninitialized: true,
//     resave: true
// }));









//   function isLoggedIn(req,res,next){
//     if(req.IsAuthenticated()) return next();
//     res.redirect('/login');
//   }


//   function isLoggedOut(req,res,next){
//     if(!req.IsAuthenticated()) return next();
//     res.redirect('/index');
//   }



//console.log(process.env.SECRET_KEY);

//to store in the backend 
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser());
//middleware
app.use(express.static("image"));
app.use('/css',express.static(path.join(__dirname,"../node_modules/bootstrap/dist/css")));
app.use('/js',express.static(path.join(__dirname,"../node_modules/bootstrap/dist/js")));
app.use('/jq',express.static(path.join(__dirname,"../node_modules/jquery/dist")));  //setting bootstrap css root


app.use(express.static(staticpath));

//set view engine
app.set("view engine", "hbs");
app.set("views", templatepath);
hbs.registerPartials(partialpath);



//routing
//app.get(path,callback)
//to render any page

app.get("/",(req,res)=>{
    res.render("index");
})



app.get("/contact",(req,res)=>{
    const message =req.flash();
    
    res.render("contact", {message});
})

app.get("/login",(req,res)=>{
    const message =req.flash();
    
    res.render("login", {message});
})



// app.get("/login", isLoggedOut,(req,res)=>{ 
//     let response={
//         title:"login",
//         error: req.query.error
//     }
//     res.render("/");
// })

// app.get("/logout", function(req,res){
//     req.logout();
//     res.redirect('/')
// })



app.get("/about",(req,res)=>{
    res.render("about");
})

app.get("/property",auth,(req,res)=>{
    //console.log(req.cookies.jwt)
    res.render("property");
})

app.get("/service",(req,res)=>{
    res.render("service");
})


app.get("/success",(req,res)=>{
    res.render("success");
})


app.get("/profile",(req,res)=>{
    res.render("profile");
})


 

app.get("/logout",auth, async(req,res)=>{
    try{
        
        //deleting from only one device
        req.user.tokens= req.user.tokens.filter((elem)=>{
         return elem.token !=req.token
        })
        res.clearCookie("jwt");
        //console.log("logout success");
        await req.user.save();
        res.render("index");
    }catch(error){
        res.status(500).send(error);
    }
    
   
})



app.post("/contact", async (req,res)=>{
    
    try{
        

        const user= new User({

            name : req.body.name,
            email : req.body.email,
            phone : req.body.phone,
            password : req.body.password
       
          })
           
       const token = await user.generateAuthToken();
        res.cookie("jwt",token, {
            expires : new Date(Date.now()+ 500000),
            httpOnly: true
        });

      await user.save();
      res.status(201).render("success");
    
    

    }catch(error){
        res.status(500).send(error);
   }

});

       
    

     
      //res.send(req.body);
     // 
     

    // if (password != password2) {
    //     errors.push({ message: 'The two passwords must match to proceed' });
    // }

   
        //Check if the user exists
       




      
//      password hash
//     middleware
// generating token
// console.log(userData);
//
//console.log(token);

     


//login check
app.post("/login",  async(req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;
        const useremail=await User.findOne({email: email});

        const isMatch = await bcrypt.compare(password, useremail.password);


        //cookie storing
        const token = await useremail.generateAuthToken();
        res.cookie("jwt",token, {
            expires : new Date(Date.now()+ 300000),
            httpOnly: true
        });


        
        if(isMatch){
            res.status(201).render("property");
        }else{
            //passport.authenticate('local',{failureRedirect: 'login', failureFlash: 'Wrong username or password'})
            //res.send("wrong credentials");
            req.flash('error', 'Invalid Credentials! forgot Your Password!');
            res.redirect("login");
        }
    }catch(error){
        req.flash('error', 'User do not exist! Kindly Resgister');
        res.redirect("login");
        
    }
})
      
   



    // try{
    //     const email=req.body.email;
    //     const password=req.body.password;
    //     const useremail= await  User.findOne({email:email});
    //     if(useremail.password === password){
    //         res.status(201).render("loggedIn");
    //     } else{
    //         req.session.message ={
    //             type: 'danger',
    //             intro: 'wrong details',
    //             message: 'Please Enter the valid details'
    //            }
    //            res.redirect('login');
    //     }




        // else if(req.body.password != req.body.confirm){
             
        //     req.session.message={
        //         type: 'danger',
        //         intro: 'Passwords do not match',
        //         message: 'Insert the same password'

        //     }
        //     res.redirect("login");
        // }

        

    // }
    // catch(error){
    //     req.flash("error", "invalid crendentails");
       
    // }





//server create
app.listen(port,()=>{
    console.log('chal rha hai at 3000');
 });


 //https://youtu.be/ngc9gnGgUdA