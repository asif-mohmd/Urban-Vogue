const productModel = require("../models/Product")




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


module.exports = { 
    addProduct,
    addProductView,
  
}