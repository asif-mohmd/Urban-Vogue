const productModel = require("../models/Product")




const addProductView = async (req, res) => {
    res.render("admin/add-product")
}


const addProduct = async (req, res) => {
    const { name, price, description, category, size } = req.body
    const image = req.file
    console.log(req.file)
    console.log(image)
    console.log("imageeeeeeeeeeeeeeeeeeee")

    data = {
        "name": name,
        "price": price,
        "description": description,
        "category": category,
        "size": size,
        "imageUrl" : image.path
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