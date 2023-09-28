const UserModel = require("../models/User")
const CategoryModel = require("../models/Category")


let adminEmail = "admin@gmail.com"
let adminPassword = "123"


const adminLoginView = (req, res) => {
    res.render("admin/login")
}


const adminLogin = (req, res) => {
    const { email, password } = req.body
    if (email === adminEmail && password == adminPassword) {
        req.session.admin = true
        res.redirect("/admin")
    } else {
        res.redirect("/admin/login")
    }
}


const adminDashboard = (req, res) => {
    res.render("admin/index")
}


const userList = async (req, res) => {
    const users = await UserModel.find()
    res.render("admin/user-list", { users })

}


const userBlockUnblock = async (req, res) => {
    const userData = await UserModel.findOne({ _id: req.query.id })
    await UserModel.updateOne({ _id: req.query.id }, { $set: { status: !userData.status } })
    const users = await UserModel.find({})
    res.render("admin/user-list", { users })
}
const addCategory = (req, res) => {
    res.render("admin/add-category")
}


const showCategory = async (req, res) => {
    const showCategory = await CategoryModel.find({})
    res.render("admin/show-category", { showCategory })
}


const addNewCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;
        const data = {
            categoryName,
            status: true
        };

        if (data) {
            const exists = await CategoryModel.findOne({ categoryName });

            if (exists) {
                throw new Error('Category already exists');
            } else {
                const success = await CategoryModel.create(data);

                if (success) {
                    res.redirect('/admin/addCategory');
                } else {
                    throw new Error('Failed to create category');
                }
            }
        }
    } catch (error) {
        // Handle the error
        console.error('An error occurred:', error.message);
        let msg;
        if (error.message === 'Category already exists') {
            msgExists = true;
        } else {
            msg = true;
        }
        res.render('admin/add-category', { msg, msgExists });
    }
};


const categoryDelete = async (req, res) => {
    const deleted = await CategoryModel.deleteOne({ _id: req.query.id })
    if (deleted) {
        res.redirect("/admin/showCategory")
    } else {
        msg = true
        res.render("admin/show-category", { msg })
    }
}

const listUnlistCategory = async (req, res) => {
    const categoryData = await CategoryModel.findById({ _id: req.params.id })
    const updated = await CategoryModel.updateOne({ _id: req.params.id }, { $set: { status: !categoryData.status } })
    if (updated) {
        res.redirect("/admin/showCategory")
    } else {
        msgUnlist = true
        res.render("admin/show-category", { msgUnlist })
    }
}

const listedCategory = async (req, res) => {
    const listedCategory = await CategoryModel.find({ status: true })
    res.render("admin/listed-category", { listedCategory })
}

const unListedCategory = async (req, res) => {
    const unListedCategory = await CategoryModel.find({ status: !true })
    res.render("admin/unlisted-category", { unListedCategory })
}

const pendingOrders = (req,res) =>{
   
    res.render("admin/pending-orders")
}


module.exports = {
    adminDashboard,
    adminLogin,
    adminLoginView,
    userList,
    userBlockUnblock,
    addCategory,
    addNewCategory,
    categoryDelete,
    showCategory,
    listUnlistCategory,
    listedCategory,
    unListedCategory,
    pendingOrders
}