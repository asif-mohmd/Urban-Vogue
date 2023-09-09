const productModel = require("../models/Product")
const userModel = require("../models/User")


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


const addProductView = async (req, res) => {
    res.render("admin/add-product")
}


const addProduct = async (req, res) => {
    const { name, price, description, category, size } = req.body

    data = {
        "name": name,
        "price": price,
        "description": description,
        "category": category,
        "size": size
    }

    // console.log(name, price , description , category , size )
    const product = await productModel.create(data)
    if (product) {
        console.log("Product added succesfully")
        res.redirect("/admin")
    } else {
        console.log("Product not added")
        res.render("admin/add-product")
    }
}


const userList = async(req,res) =>{

    const users = await userModel.find()
    res.render("admin/user-list",{users})

}

module.exports = {
    adminDashboard,
    addProduct,
    adminLogin,
    adminLoginCheck,
    adminLoginView,
    addProductView,
    adminLoginVerify,
    userList
}