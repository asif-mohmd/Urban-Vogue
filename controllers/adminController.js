const ProductModel = require("../models/Product")
const userModel = require("../models/User")
const CategoryModel = require("../models/Category")



let adminEmail = "admin@gmail.com"
let adminPassword = "123"


const adminLoginCheck = (req, res, next) => {
    // if (req.session.admin) {
    //     console.log("Successssss")
    //     next()
    // } else {
    //    return res.redirect("/admin/login")
    // }
    next()

}

const adminLoginVerify = (req, res, next) => {
    // if (req.session.admin) {
    //    return res.redirect("/admin")
    // } else {
    //     console.log("kkkkkkkkkkk")
    //     next()
    // }
    next()
}

const adminLoginView = (req, res) => {
    res.render("admin/login")
}

const adminLogin = (req, res) => {
    const { email, password } = req.body
    // console.log(email,password)
    if (email === adminEmail && password == adminPassword) {
        req.session.admin = true
        console.log(req.session);
        res.redirect("/admin")
    } else {
        res.redirect("/admin/login")
    }
}


const adminDashboard = (req, res) => {
    res.render("admin/index")

}


const userList = async (req, res) => {

    const users = await userModel.find()
    console.log('+++',users,'<<<users')
    res.render("admin/user-list", { users })

}

const addNewCategory = async (req,res) =>{
    const {categoryName}  = req.body
    console.log(categoryName)
    const data = {
        "categoryName" : categoryName
    }
    const success = await CategoryModel.create(data)

    if(success){
        console.log("Category created")
    }else{
        console.log("category not")
    }

}

module.exports = {
    adminDashboard,
    adminLogin,
    adminLoginCheck,
    adminLoginView,
    adminLoginVerify,
    userList,
    addNewCategory
}