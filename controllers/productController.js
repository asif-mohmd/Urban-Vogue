const CategoryModel = require("../models/Category")
const ProductModel = require("../models/Product")
const fileHandler = require("../utils/file")

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

const editProductDetails = async (req,res) =>{
    console.log(req.query.id,"oneeeeeeeeeee");
  
    const editProduct = await ProductModel.findOne({_id:req.query.id})

    console.log(editProduct,"proooooooooooooooooo")
    res.render("admin/edit-product-details",{editProduct})
}

const productDetailsEdit = async  (req,res) =>{
    console.log(req.body.id,"iduuuuuuuu")
    const {name,price,size,category} = req.body

    const update = await ProductModel.updateOne(
        { _id: req.body.id },
        { $set: { name: name, price: price, size: size, category: category } }
      );
      
    if(update){
       res.redirect("/admin/editProductView")
    }else{
        msg = true
        res.render("user/edit-product-details",{msg})
    }
    console.log(price)
    console.log("ooyyyoooooooooooo")
}

const editProductView = async (req, res) => {
 
        const products = await ProductModel.find()

    res.render("admin/edit-product",{products})
}

const deleteProduct = async (req,res)=>{

    const productId = req.query.id
    
    console.log("kkkkkkkkkkkkkkkkkkkkkkkkkk")
    const product = await ProductModel.findById(productId)
    .then(product =>{
        fileHandler.deleteFile(product.imageUrl)
        return ProductModel.deleteOne({_id:productId})
    })
    .then(result =>{
        console.log("Product Deleted")
        res.status(200).json({
            message:"Product deleted successfully"
        })
    })
    .catch(err =>{
        console.log(err)
        res.status(500).json({
            message:"Deleting Product failed"
        })
    })
}

const addCategory = (req,res) =>{
    res.render("admin/add-category")
}

const showCategory =async (req,res)=>{
    console.log("hertee")
    const showCategory = await CategoryModel.find({})
    console.log(showCategory)
    res.render("admin/show-category",{showCategory})
}


module.exports = { 
    addProduct,
    addProductView,
    editProductDetails,
    productDetailsEdit,
    editProductView,
    deleteProduct,
    addCategory,
    showCategory,
    
  
}