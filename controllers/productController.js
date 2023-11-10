const ProductModel = require("../models/Product")
const fileHandler = require("../utils/file")
const path = require("path")
const fs = require("fs")
const { upload } = require('../utils/imageHandler')
const cartModel = require("../models/Cart")


const addProductView = async (req, res) => {

    try {
        res.render("admin/add-product")
    } catch (err) {
        res.status(404).render("user/error-handling");
    }
}

const addProduct = async (req, res) => {

    try {
        const { name, price, description, category, stockLarge, stockMedium, stockSmall } = req.body;


        const sizeStock = {
            sizeLarge: {
                large: "Large",
                stock: parseInt(stockLarge) || 0
            },
            sizeMedium: {
                medium: "Medium",
                stock: parseInt(stockMedium) || 0
            },
            sizeSmall: {
                small: "Small",
                stock: parseInt(stockSmall) || 0
            },
        }


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
                sizeStock: sizeStock,
                imageUrl: images,
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

    try {
        const singleProduct = await ProductModel.findOne({ _id: req.query.id })
        const cartCheck = await cartModel.findOne({ 'cart.productId': req.query.id })

        res.render("user/product-details", { singleProduct, cartCheck })
    } catch (err) {
        res.status(404).render("user/error-handling");
    }
}


const editProductDetails = async (req, res) => {

    try {
        const editProduct = await ProductModel.findOne({ _id: req.query.id })
        res.render("admin/edit-product-details", { editProduct })
    } catch (err) {
        res.status(404).render("user/error-handling");
    }
}


const productDetailsEdit = async (req, res) => {

    try {
        const { id, name, price, description, stockLarge, stockMedium, stockSmall, category } = req.body;


        const sizeStock = {
            sizeLarge: {
                stock: stockLarge
            },
            sizeMedium: {
                stock: stockMedium
            },
            sizeSmall: {
                stock: stockSmall
            },
        }
        // Fetch the existing product to get its image URLs
        const existingProduct = await ProductModel.findById(id);
        if (!existingProduct) {
            return res.status(404).send('Product not found.');
        }

        // Check if req.files is an empty array or not provided
        if (!req.files || req.files.length === 0) {

            const updateData = {
                name: name,
                price: price,
                description: description,
                sizeStock: sizeStock,
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

            // Delete existing images
            for (const imageUrl of existingProduct.imageUrl) {
                const imagePath = path.join(__dirname, "..", "public", "uploaded-images", imageUrl);
                fs.unlinkSync(imagePath);
            }

            const newImageUrls = req.files.map(file => file.filename);

            const updateData = {
                name: name,
                price: price,
                description: description,
                sizeStock: sizeStock,
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
    } catch (error) {
        console.error("Error updating product details:", error);
        res.status(404).send('Error updating product details.');
    }
}



const editProductView = async (req, res) => {

    try {
        const products = await ProductModel.find({ deleteStatus: false })
        res.render("admin/edit-product", { products })
    } catch (err) {
        res.status(404).render("user/error-handling");
    }

}


const deleteProduct = async (req, res) => {

    try {
        const productId = req.query.id;
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete each image associated with the product
        for (const imageUrl of product.imageUrl) {
            fileHandler.deleteFile(imageUrl);
        }

        // Delete the product
        await ProductModel.updateOne({ _id: productId }, { $set: { deleteStatus: true } });
        msgDelete = true
        // Redirect to the desired route
        res.redirect("/admin/editProductView");
    } catch (err) {
        res.status(404).json({ message: "Deleting Product failed" });
    }
};


const listUnlistProduct = async (req, res) => {

    try {
        const product = await ProductModel.findById({ _id: req.params.id })
        if (product) {
            const update = await ProductModel.updateOne({ _id: product.id }, { $set: { listStatus: !product.listStatus } })
            if (update) {
                res.redirect("/admin/editProductView")
            } else {
                msg = true
                res.render("admin/edit-product", { msg })
            }
        }
    }
    catch (err) {

        res.status(404).json({ message: "update Product listing failed" });
    }
}


const productListView = async (req, res) => {

    try {
        const pageNum = req.query.page;
        const perPage = 6
        let docCount
        let pages


        if (req.query.sort || req.query.category) {
            const sizes = req.query.size;
            const category = req.query.category; // Assuming you have the category in the request body

            const products = await ProductModel.find({
                $and: [
                    { category: category }, // Match the specified category
                    {
                        $or: [
                            { 'size.large': { $in: sizes } },  // Match large size
                            { 'size.medium': { $in: sizes } }, // Match medium size
                            { 'size.small': { $in: sizes } }   // Match small size
                        ]
                    }
                ]
            }).skip((pageNum - 1) * perPage).limit(perPage)

            const documents = await ProductModel.countDocuments({
                $and: [
                    { category: category }, // Match the specified category
                    {
                        $or: [
                            { 'size.large': { $in: sizes } },  // Match large size
                            { 'size.medium': { $in: sizes } }, // Match medium size
                            { 'size.small': { $in: sizes } }   // Match small size
                        ]
                    }
                ]
            });

            docCount = documents
            pages = Math.ceil(docCount / perPage)

            let countPages = []
            for (let i = 0; i < pages; i++) {

                countPages[i] = i + 1
            }

            let small = 0;
            let medium = 0;
            let large = 0;
            let mens = 0
            let womens = 0

            // sizes

            if (Array.isArray(sizes)) {
                for (let i = 0; i < sizes.length; i++) {
                    if (sizes[i] === "Small") {
                        small++;
                    } else if (sizes[i] === "Medium") {
                        medium++;
                    } else if (sizes[i] === "Large") {
                        large++;
                    }
                }
            } else if (sizes === "Small") {
                small++;
            } else if (sizes === "Medium") {
                medium++;
            } else if (sizes === "Large") {
                large++;
            }

            //category 
            if (Array.isArray(category)) {
                for (let i = 0; i < category.length; i++) {
                    if (category[i] === "mens") {
                        mens++;
                    } else if (category[i] === "womens") {
                        womens++;
                    }
                }
            } else if (category === "mens") {
                mens++;
            } else if (category === "womens") {
                womens++;
            }

            res.render("user/product-list", { products, countPages, mens, womens, small, medium, large })


        } else {

            const documents = await ProductModel.find({ listStatus: true, deleteStatus: false }).countDocuments()
            const products = await ProductModel.find({ listStatus: true, deleteStatus: false }).skip((pageNum - 1) * perPage).limit(perPage)

            docCount = documents
            pages = Math.ceil(docCount / perPage)

            let countPages = []
            for (let i = 0; i < pages; i++) {

                countPages[i] = i + 1
            }

            res.render("user/product-list", { products, countPages })
        }
    } catch (err) {
        res.status(404).render("user/error-handling");
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
    productListView,

}