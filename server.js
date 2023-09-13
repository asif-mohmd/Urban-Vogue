const express = require("express")

const path = require('path');
const userRouter = require("./routes/user")
const hbs = require("hbs")
const session = require('express-session');
const adminRouter = require("./routes/admin")
const nocache = require('nocache')
const {verifyLogin} = require("./controllers/userController")
const multer = require("multer")
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
    maxAge: 60000 // 1 min
  } 
}))


app.use(express.static(path.join(__dirname, 'public')));



app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use(nocache())

connectDB()

app.use("/", userRouter)
app.use("/admin", adminRouter)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})