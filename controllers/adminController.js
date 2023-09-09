const productModel = require("../models/Product")



let adminEmail = "admin@gmail.com"
let adminPassword = "123"

const adminLoginCheck = (req,res) =>{
    if(req.session.admin){
       next()
    }else{
        console.log("kkkkkkkkkkk")
        res.redirect("/admin/adminLoginView")
    }
    
}

const adminLoginView = (req,res) =>{
        res.render("admin/login")
    }

const adminLogin = (req,res) => {
    const {email , password} = req.body
    if(email===adminEmail&&password==adminPassword){
        req.session.admin = true
        res.redirect("/")
    }else{
        res.redirect("/adminLoginView")
    }
}




const adminDashboard = (req, res) => {
    res.render("admin/index")

}

const addProduct = async (req, res) => {
    const {name, price , description , category , size } = req.body
      
    data = {
        "name": name,
        "price": price,
        "description": description, 
        "category": category,
        "size": size
    }
    

    console.log(name, price , description , category , size )
    const product = await productModel.create(data)

    if(product){
        console.log("Product added succesfully")
        res.redirect("/admin")
    }else{
        console.log("Product not added")
        res.render("admin/add-product")

    }


}

module.exports = {
    adminDashboard,
    addProduct,
    adminLogin,
    adminLoginCheck,
    adminLoginView
}