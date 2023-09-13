const ProductModel = require("../models/Product")

const addProductView = async (req, res) => {
    res.render("admin/add-product")
}


const addProduct = async (req, res) => {
    const { name, price, description, category, size } = req.body
    const image = req.file
    console.log(req.file)
    console.log(image)
    console.log("imageeeeeeeeeeeeeeeeeeee")

    let images = req.files.map((file)=>{
        return file.filename
     })

    data = {
        "name": name,
        "price": price,
        "description": description,
        "category": category,
        "size": size,
        "imageUrl" : images[0]
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

const editProductView = async (req, res) => {
 
        const products = await ProductModel.find()

    res.render("admin/edit-product",{products})
}


module.exports = { 
    addProduct,
    addProductView,
    editProductView
  
}