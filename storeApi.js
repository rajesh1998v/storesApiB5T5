let express = require("express") ;
let passport = require("passport");
let jwt = require("jsonwebtoken");
let JWTStrategy = require("passport-jwt").Strategy;
let ExtractJWT = require("passport-jwt").ExtractJwt;

var app = express();
app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
  next();
});
var port = process.env.PORT || 2410;
app.listen(port,()=>console.log(`Listening on port ${port}!`));

app.use(passport.initialize());
const parama = {
    jwtFromRequest:ExtractJWT.fromAuthHeaderAsBearerToken(),secretOrKey:"jwtsecret23647832"
};
const jwtExpirySeconds = 300;

const { myStore,users,orders } = require("./storeData");

let strategyAll = new JWTStrategy(parama,function(token,done){
    console.log("In JWTStrategy-All", token);
    let user1 = users.find((u)=>u.id==token.id);
    console.log("user",user1);
    if(!user1)
    return done(null, false,{message: "Incorrect username or password"});
    else return done(null,user1);
});

let strategyAdmin = new JWTStrategy(parama,function(token,done){
    console.log("In JWTStrategy-All", token);
    let user1 = users.find((u)=>u.id==token.id);
    console.log("user",user1);
    if(!user1)
    return done(null, false,{message: "Incorrect username or password"});
    else if(user1.role!=="admin")
    return done(null, false,{message: "You do not have admin"});
    else return done(null,user1);
});

passport.use("roleAll",strategyAll);
passport.use("roleAdmin",strategyAdmin);

app.get("/products",async function(req, res){
    let category = req.query.category; 
    try{
        let arr = myStore;
        if(category){
            arr = myStore.filter(c1=>c1.category === category);
        }
        res.send(arr);
    }catch (error){
        if (error.response){
            let { status, statusText } = error.response;
            console.log(status, statusText) ;
            res.status(status).send(statusText);
        }else res.status(484).send(error);
    }
});


app.get("/products/:category",async function(req, res){
    let category = req.params.category;
    try{
        let prod = myStore.filter(c1=>c1.category===category);
        res.send(prod);
    }catch (error){
        if (error.response){
            let { status, statusText } = error.response;
            console.log(status, statusText) ;
            res.status(status).send(statusText);
        }else res.status(484).send(error);
    }
});

app.get("/product/:id",async function(req, res){
    let id = +req.params.id;
    try{
        let prod = myStore.filter(c1=>c1.id===id);
        res.send(prod);
    }catch (error){
        if (error.response){
            let { status, statusText } = error.response;
            console.log(status, statusText) ;
            res.status(status).send(statusText);
        }else res.status(484).send(error);
    }
});


app.get("/user",passport.authenticate("roleAll",{session: false}),function(req,res){
    console.log("In GET /user", req.user);
    res.send(req.user);
});

app.post("/orders",function (req, res){
    let body = req.body;
    console.log(body);
    let newOrder = {...body};
    orders.push(body);
    console.log(newOrder);
    res.send(newOrder);
    
});

app.get("/orders",async function(req, res){
    try{
        res.send(orders);
    }catch (error){
        if (error.response){
            let { status, statusText } = error.response;
            console.log(status, statusText) ;
            res.status(status).send(statusText);
        }else res.status(484).send(error);
    }
});

app.post("/products",function (req, res){
    let body = req.body;
    console.log(body);
    let maxid = myStore.reduce((acc,curr)=>acc.id>curr.id?acc.id:curr.id);
    let mid= maxid+1;
    let newProduct = {id:mid,...body};
    myStore.push(newProduct);
    console.log(newProduct);
    res.send(newProduct);
    
});

app.put("/products/:id",function (req, res){
    let id = +req.params.id;
    let body = req.body;
    let index = myStore.findIndex(s1=>s1.id===id);
    if(index>=0){
        let updateProd = {...myStore[index],...body}
        myStore[index] = updateProd;
        console.log(updateProd);
        res.send(updateProd);
    }
   
});


app.delete("/products/:id",function (req, res){
    let id = +req.params.id;
    let index = myStore.findIndex(s1=>s1.id===id);
    if(index>=0){
       let prod = myStore.splice(index,1);
        console.log(prod);
        res.send(prod);
    }
});

app.post("/login",function(req,res){
    let {email,password} = req.body;
    let user = users.find((u)=>u.email==email && u.password===password);
    if(user){
        let payload = {email:user.email};
        let token = jwt.sign(payload,parama.secretOrKey,{
            algorithm: "HS256",
            expiresIn:jwtExpirySeconds,
        });
        res.send(payload);
    }else res.sendStatus(401);
});

app.post("/register",function (req, res){
    let body = req.body;
    console.log(body);
    let newUser = {...body}
    users.push(newUser);
    console.log(newUser);
    res.send(newUser);
    
});