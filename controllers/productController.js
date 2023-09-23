const ProductModel = require("../models/Product")
const fileHandler = require("../utils/file")
const path = require("path")
const fs = require("fs")


const { upload } = require('../utils/imageHandler')


const addProductView = async (req, res) => {
    res.render("admin/add-product")
}

const addProduct = async (req, res) => {
    try {
        const { name, price, description, category, size } = req.body;
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
                status: true,
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
        console.error("An error occurred:", error.message);

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
    
    res.render("user/product-details", { singleProduct })
}


const editProductDetails = async (req, res) => {
    const editProduct = await ProductModel.findOne({ _id: req.query.id })
    console.log(editProduct)

    res.render("admin/edit-product-details", { editProduct })
}


const productDetailsEdit = async (req, res) => {
    const { id, name, price, description, size, category } = req.body;

    try {
        // Fetch the existing product to get its image URLs
        const existingProduct = await ProductModel.findById(id);
        if (!existingProduct) {
            console.error('Product not found with id:', id);
            return res.status(404).send('Product not found.');
        }
        // Delete the existing images
        for (const imageUrl of existingProduct.imageUrl) {
            const imagePath = path.join(__dirname, "..", "public", "uploaded-images", imageUrl);
            fs.unlinkSync(imagePath);
            console.log('Deleted image:', imageUrl);
        }
        // req.files now contains the uploaded images

        const updateData = {
            name: name,
            price: price,
            description: description,
            size: size,
            category: category,
            imageUrl: req.files.map(file => file.filename)
        };

        const update = await ProductModel.updateOne({ _id: id }, { $set: updateData });

        if (update) {
            res.redirect("/admin/editProductView");
        } else {
            msg = true;
            res.render("user/edit-product-details", { msg });
        }

    } catch (error) {
        console.error('Error updating product details:', error);
        res.status(500).send('Error updating product details.');
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

        // Delete each image associated with the product
        for (const imageUrl of product.imageUrl) {
            await fileHandler.deleteFile(imageUrl);
        }

        // Delete the product
        await ProductModel.deleteOne({ _id: productId });

        // Redirect to the desired route
        res.redirect("/admin/editProductView");
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ message: "Deleting Product failed" });
    }
};


const listUnlistProduct = async (req, res) => {
    try {
        const product = await ProductModel.findById({ _id: req.params.id })
        if (product) {
            const update = await ProductModel.updateOne({ _id: product.id }, { $set: { status: !product.status } })
            if (update) {
                res.redirect("/admin/editProductView")
            } else {
                msg = true
                res.render("admin/edit-product", { msg })
            }
        }
    }
    catch (err) {
        console.error("Error updating product list/unlist:", err);
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
    listUnlistProduct

}