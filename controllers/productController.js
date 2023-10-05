const ProductModel = require("../models/Product")
const fileHandler = require("../utils/file")
const path = require("path")
const fs = require("fs")


const { upload } = require('../utils/imageHandler')
const cartModel = require("../models/Cart")


const addProductView = async (req, res) => {
    res.render("admin/add-product")
}

const addProduct = async (req, res) => {
    try {
        const { name, price, description, category, size, stock } = req.body;
        const images = req.files
            .filter((file) =>
                file.mimetype === "image/png" || file.mimetype === "image/webp" || file.mimetype === "image/jpeg")
            .map((file) => file.filename);

        if (images.length === 3) {
            const data = {
                name,
                price,
                description,
                category,
                size,
                imageUrl: images,
                stock:stock,
                listStatus: true,
                deleteStatus: false,
            };

            const product = await ProductModel.create(data);

            if (product) {
                res.redirect("/admin/addProduct");
            } else {
                throw new Error("Failed to create product");
            }
        } else {
            throw new Error("Incorrect number of images");
        }
    } catch (error) {
 

        let msg;
        if (error.message === "Failed to create product") {
            msg = true;
        } else {
            msgFilterErr = true;
        }

        res.render("admin/add-product", { msg, msgFilterErr });
    }
};


const productDetails = async (req, res) => {
    const singleProduct = await ProductModel.findOne({ _id: req.query.id })
    const cartCheck = await cartModel.findOne({'cart.productId': req.query.id  })
    console.log(singleProduct.stock,"00000000000000")
    res.render("user/product-details", { singleProduct , cartCheck })
}


const editProductDetails = async (req, res) => {
    const editProduct = await ProductModel.findOne({ _id: req.query.id })
  

    res.render("admin/edit-product-details", { editProduct })
}


const productDetailsEdit = async (req, res) => {
    const { id, name, price,stock,description, size, category } = req.body;
    console.log("00", req.files);

    try {
        // Fetch the existing product to get its image URLs
        const existingProduct = await ProductModel.findById(id);
        if (!existingProduct) {
            return res.status(404).send('Product not found.');
        }

        // Check if req.files is an empty array or not provided
        if (!req.files || req.files.length === 0) {
            console.log("No new images provided.");

            const updateData = {
                name: name,
                price: price,
                stock:stock,
                description: description,
                size: size,
                category: category,
            };

            const update = await ProductModel.updateOne({ _id: id }, { $set: updateData });

            if (update) {
                res.redirect("/admin/editProductView");
            } else {
                msg = true;
                res.render("user/edit-product-details", { msg });
            }
        } else {
            console.log("New images provided.");

            // Delete existing images
            for (const imageUrl of existingProduct.imageUrl) {
                const imagePath = path.join(__dirname, "..", "public", "uploaded-images", imageUrl);
                fs.unlinkSync(imagePath);
            }

            const newImageUrls = req.files.map(file => file.filename);

            const updateData = {
                name: name,
                price: price,
                stock:stock,
                description: description,
                size: size,
                category: category,
                imageUrl: newImageUrls
            };

            const update = await ProductModel.updateOne({ _id: id }, { $set: updateData });

            if (update) {
                res.redirect("/admin/editProductView");
            } else {
                msg = true;
                res.render("user/edit-product-details", { msg });
            }
        }
        console.log("Product details updated successfully.");
    } catch (error) {
        console.error("Error updating product details:", error);
        res.status(500).send('Error updating product details.');
    }
}



const editProductView = async (req, res) => {
    const products = await ProductModel.find({deleteStatus:false})
    res.render("admin/edit-product", { products })
}


const deleteProduct = async (req, res) => {
    const productId = req.query.id;
    try {
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete each image associated with the product
        // for (const imageUrl of product.imageUrl) {
        //     await fileHandler.deleteFile(imageUrl);
        // }

        // Delete the product
        await ProductModel.updateOne({ _id: productId },{$set:{deleteStatus:true}});
        msgDelete = true
        console.log("----------------------")
        // Redirect to the desired route
        res.render("admin/deleted-products",{msgDelete});
    } catch (err) {
      console.log("=============")
        res.status(500).json({ message: "Deleting Product failed" });
    }
};


const listUnlistProduct = async (req, res) => {
    try {
        const product = await ProductModel.findById({ _id: req.params.id })
        if (product) {
            const update = await ProductModel.updateOne({ _id: product.id }, { $set: { listStatus: !product.listStatus } })
            if (update) {
                console.log("updat elist")
                res.redirect("/admin/editProductView")
            } else {
                msg = true
                res.render("admin/edit-product", { msg })
            }
        }
    }
    catch (err) {
      
        res.status(500).json({ message: "update Product listing failed" });

    }
}




module.exports = {
    addProduct,
    addProductView,
    productDetails,
    editProductDetails,
    productDetailsEdit,
    editProductView,
    deleteProduct,
    listUnlistProduct,
    

}