const CategoryModel = require("../models/Category")
const ProductModel = require("../models/Product")
const fileHandler = require("../utils/file")


const addProductView = async (req, res) => {
    res.render("admin/add-product")
}


const addProduct = async (req, res) => {
    const { name, price, description, category, size } = req.body
    const image = req.file
    let images = req.files.map((file) => {
        return file.filename
    })
    data = {
        "name": name,
        "price": price,
        "description": description,
        "category": category,
        "size": size,
        "imageUrl": images[0]
    }
    const product = await ProductModel.create(data)
    if (product) {
        res.redirect("/admin/addProduct")
    } else {
        msg = true
        res.render("admin/addProduct",{msg})
    }
}


const productDetails = async (req, res) => {
    const singleProduct = await ProductModel.findOne({ _id: req.query.id })
    res.render("user/product-details", { singleProduct })
  }


const editProductDetails = async (req, res) => {
    const editProduct = await ProductModel.findOne({ _id: req.query.id })
    res.render("admin/edit-product-details", { editProduct })
}


const productDetailsEdit = async (req, res) => {
    const { name, price, size, category } = req.body
    const update = await ProductModel.updateOne(
        { _id: req.body.id },
        { $set: { name: name, price: price, size: size, category: category } }
    );
    if (update) {
        res.redirect("/admin/editProductView")
    } else {
        msg = true
        res.render("user/edit-product-details", { msg })
    }
}


const editProductView = async (req, res) => {
    const products = await ProductModel.find()
    res.render("admin/edit-product", { products })
}


const deleteProduct = async (req, res) => {
    const productId = req.query.id;
    try {
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        await fileHandler.deleteFile(product.imageUrl);
        await ProductModel.deleteOne({ _id: productId });
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ message: "Deleting Product failed" });
    }
};


module.exports = {
    addProduct,
    addProductView,
    productDetails,
    editProductDetails,
    productDetailsEdit,
    editProductView,
    deleteProduct,
    

}