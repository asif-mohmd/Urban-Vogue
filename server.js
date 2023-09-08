const express = require("express")
const app = express()
const path = require('path');
const userRouter = require("./routes/user")
const hbs = require("hbs")
const session = require('express-session');
const adminRouter = require("./routes/admin")


const connectDB = require("./config/connection")

connectDB()

app.set('view engine', 'hbs');
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.use("/", userRouter)
app.use("/admin", adminRouter)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})