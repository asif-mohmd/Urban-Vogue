const productModel = require("../models/Product")



const adminDashboard = (req, res) => {
    res.render("admin/add-product")

}

const addProduct = async (req, res) => {
    console.log(req.body)
    const product = await productModel.create()


}

module.exports = {
    adminDashboard,
    addProduct
}