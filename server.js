const express = require("express")
const app = express()
const path = require('path');
const userRouter = require("./routes/user")
const hbs = require("hbs")

// const adminRouter = require("./routes/admin")


const connectDB = require("./config/connection")
const {loginCheck} = require("./auth/passport");
const session = require('express-session');
const passport = require("passport");
loginCheck(passport)
connectDB()

app.use(session({
  secret:'oneboy',
  saveUninitialized: true,
  resave: true
}));
app.use(passport.initialize())
app.use(passport.session())
app.use(express.urlencoded({extended: false}));


app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.use("/", userRouter)
// app.use("/admin", adminRouter)

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })