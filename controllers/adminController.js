const ProductModel = require("../models/Product")
const userModel = require("../models/User")
const CategoryModel = require("../models/Category")


let adminEmail = "admin@gmail.com"
let adminPassword = "123"


const adminLoginCheck = (req, res, next) => {
    // if (req.session.admin) {
        next()
    // } else {
    //     return res.redirect("/admin/login")
    // }
}


const adminLoginVerify = (req, res, next) => {
    // if (req.session.admin) {
    //     return res.redirect("/admin")
    // } else {
        next()
    // }
}


const adminLoginView = (req, res) => {
    res.render("admin/login")
}


const adminLogin = (req, res) => {
    const { email, password } = req.body
    if (email === adminEmail && password == adminPassword) {
        req.session.admin = true
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
    console.log('+++', users, '<<<users')
    res.render("admin/user-list", { users })

}


const userBlockUnlock = async (req, res) => {
    const userData = await userModel.findOne({ _id: req.query.id })
    await userModel.updateOne({ _id: req.query.id }, { $set: { status: !userData.status } })
    const users = await userModel.find({})
    res.render("admin/user-list", { users })
  }
  const addCategory = (req, res) => {
    res.render("admin/add-category")
}


const showCategory = async (req, res) => {
    const showCategory = await CategoryModel.find({})
    res.render("admin/show-category", { showCategory })
}


const addNewCategory = async (req, res) => {
    const { categoryName } = req.body
    console.log(categoryName)
    const data = {
        "categoryName": categoryName
    }

    if(data){
       const exists = await CategoryModel.findOne({categoryName:categoryName})
       
       if (exists) {
           console.log("Categorya already exist")
           msgExists = true
           res.render("admin/add-category", { msgExists })
       } else {
        const success = await CategoryModel.create(data)
        if (success) {
            console.log("Category created")
            res.redirect("/admin/addCategory")
        } else {
            msg = true
            res.render("admin/add-category", { msg })
        }
       }

    }}


const categoryDelete = async (req, res) => {
    console.log(req.query.id)
    const deleted = await CategoryModel.deleteOne({ _id: req.query.id })
    if (deleted) {
        res.redirect("/admin/showCategory")
    } else {
        msg = true
        res.render("admin/show-category", { msg })
    }
}


module.exports = {
    adminDashboard,
    adminLogin,
    adminLoginCheck,
    adminLoginView,
    adminLoginVerify,
    userList,
    userBlockUnlock,
    addCategory,
    addNewCategory,
    categoryDelete,
    showCategory,

}