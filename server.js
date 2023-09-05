const express = require("express")
const app = express()
const path = require('path');
const userRouter = require("./routes/user")
// const adminRouter = require("./routes/admin")


const port = process.env.PORT || 3000

app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));


app.use("/", userRouter)
// app.use("/admin", adminRouter)


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })