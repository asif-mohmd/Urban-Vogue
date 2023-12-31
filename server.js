const express = require("express")

const path = require('path');
const userRouter = require("./routes/user")
const hbs = require("hbs")
const session = require('express-session');
const adminRouter = require("./routes/admin")
const nocache = require('nocache')
const {verifyLogin} = require("./controllers/userController")
const multer = require("multer")
const bodyParser = require('body-parser');
const connectDB = require("./config/connection")
const app = express()

app.set('trust proxy', 1) // trust first proxy
app.use(session({  
  name: `daffyduck`,
  secret: 'some-secret-example',  
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // This will only work if you have https enabled!
    maxAge: 60000000 // 1000 min
  } 
}))


app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});


app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

hbs.registerHelper('gt', function (a, b) {  //i am using a hbd > (greather than) on product detail for get the stock more than 0 . for that this is needed
  return a > b;
});
hbs.registerHelper('eq', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

// Register a custom "and" helper
hbs.registerHelper('and', function () {
  return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
});
hbs.registerHelper('lt', function (a, b) {  //i am using a hbd > (greather than) on product detail for get the stock more than 0 . for that this is needed
  return a < b;
});
hbs.registerHelper('eq', function (a, b) {  //using in orders page
  return a === b;
});
hbs.registerHelper('or', function (a, b) {  //using in orders page
  return a === b;
});

hbs.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});
hbs.registerHelper('increment', function(value) {
  return value + 1;
});



app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use(nocache())

connectDB()

app.use("/", userRouter)
app.use("/admin", adminRouter)


app.get('*', function(req, res){
  res.status(404).render("user/error-handling");
});


const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})