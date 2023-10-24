const UserModel = require("../models/User")
const CategoryModel = require("../models/Category")
const OrderModel = require("../models/Order")
const ProductModel = require("../models/Product")
const { response } = require("express")
const CoupenModel = require("../models/Coupen")


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


const adminDashboard = async (req, res) => {

    let totalDeliveredAmount = 0;

    const recentOrders = await OrderModel.find({ status: 'delivered' })
    const countOfDeliveredOrders = await OrderModel.countDocuments({ status: 'delivered' });
    const countOfUsers = await UserModel.countDocuments();

    recentOrders.forEach(order => {
        totalDeliveredAmount += order.amount;
    });

    res.render("admin/index", { recentOrders, countOfDeliveredOrders, totalDeliveredAmount, countOfUsers })
}

const adminChartLoad = async (req, res) => {
    console.log("Working tetchchhhhhhhhhhhhhhhhhh");

    try {
        const data = await OrderModel.find()


        res.json(data);
    } catch (error) {
        console.error('Error in adminChartLoad:', error);
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
};



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
            listStatus: true
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

        let msg;
        if (error.message === 'Category already exists') {
            msgExists = true;
        } else {
            msg = true;
        }
        res.render('admin/add-category', { msg });
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
    const updated = await CategoryModel.updateOne({ _id: req.params.id }, { $set: { listStatus: !categoryData.listStatus } })
    if (updated) {
        res.redirect("/admin/showCategory")
    } else {
        msgUnlist = true
        res.render("admin/show-category", { msgUnlist })
    }
}

const listedCategory = async (req, res) => {
    const listedCategory = await CategoryModel.find({ listStatus: true })
    res.render("admin/listed-category", { listedCategory })
}

const deletedProducts = async (req, res) => {
    const deletedProducts = await ProductModel.find({ deletedProducts: true })
    res.render("admin/deleted-products", { deletedProducts })
}

const unListedCategory = async (req, res) => {
    const unListedCategory = await CategoryModel.find({ listStatus: !true })
    res.render("admin/unlisted-category", { unListedCategory })
}

const pendingOrders = async (req, res) => {
    const pendingOrders = await OrderModel.find({ status: "pending" })

    res.render("admin/pending-orders", { pendingOrders })
}

const orderDelivered = async (req, res) => {
    const orderId = req.query.id

    const success = await OrderModel.updateOne({ _id: orderId }, { $set: { status: "delivered" } })
    if (success) {

        res.redirect("/admin/delivered-orders")
    } else {
        console.log("not delivered")
        res.redirect("/admin/pending-orders")
    }
}

const delieveredOrders = async (req, res) => {
    const deliveredOrders = await OrderModel.find({ status: "delivered" })

    res.render("admin/delivered-orders", { deliveredOrders })
}

const orderCancelled = async (req, res) => {
    const orderId = req.query.id

    const success = await OrderModel.updateOne({ _id: orderId }, { $set: { status: "cancelled" } })
    if (success) {


        res.redirect("/admin/cancelled-orders")
    } else {
        console.log("not cancelled")
        res.redirect("/admin/pending-orders")
    }
}
const cancelledOrders = async (req, res) => {
    const cancelledOrders = await OrderModel.find({ status: "cancelled" })
    res.render("admin/cancelled-orders", { cancelledOrders })
}


const returnPending = async (req, res) => {
    try {
        const returnPending = await OrderModel.find({
            status: { $in: ['returnDefective', 'returnNonDefective'] }
        });

        res.render("admin/return-pending", { returnPending });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};



const returnAccept = async (req, res) => {
    const orderObjId = req.query.id
    const status = req.query.status

    const orderDetails = await OrderModel.findOne({ _id: orderObjId })

    const walletUpdate = await UserModel.updateOne({ _id: orderDetails.userId }, { $inc: { wallet: orderDetails.amount } });
    console.log(walletUpdate, "ooooooooooooooooo")

    // Check the result of the update
    if (walletUpdate) {
        console.log("Wallet updated successfully. New wallet balance: ");
    } else {
        console.log(`Failed to update the wallet.`);
    }

    // try{
    //   if(status=="returnNonDefective"){
    //     const returnAcceptNonDef = await OrderModel.updateOne({_id:orderObjId},{status:"returnAcceptNonDef"})
    //     if(returnAcceptNonDef){
    //         const walletUpdate = await UserModel.updateOne({_id})
    //         res.render("admin/return-pending")
    //     }else{
    //         res.render("admin/return-pending")
    //     }
    //   }else{
    //     const returnAcceptDef = await OrderModel.updateOne({_id:orderObjId},{status:"returnAcceptDef"})
    //     if(returnAcceptDef){

    //         res.render("admin/return-pending")
    //     }else{

    //         res.render("admin/return-pending")
    //     }
    //   }

    // }catch(error){
    //     console.error("Error:", error);
    //     res.status(500).send("Internal Server Error");
    // }


}


const returnDefective = async (req, res) => {
    const returnDefective = await OrderModel.find({ status: "returnAcceptDef" })
    if (returnDefective) {
        res.render("admin/return-defective", { returnDefective })

    }
}

const returnNonDefective = async (req, res) => {
    const returnAcceptNonDef = await OrderModel.find({ status: "returnAcceptNonDef" })
    if (returnAcceptNonDef) {
        res.render("admin/return-non-defective", { returnAcceptNonDef })

    }
}



const addCoupen = async (req, res) => {
    try {
        res.render("admin/add-coupen")
    } catch (err) {
        console.log(err, "catch error")
    }

}


const addNewCoupen = async (req, res) => {

    try {
        const { coupenName, coupenPercentage } = req.body

        const data = {
            coupenName: coupenName,
            coupenPercentage: coupenPercentage,
            listStatus: true
        }
        const coupenAdded = await CoupenModel.create(data)
        if (coupenAdded) {
            msgTrue = true
            res.render("admin/add-coupen", { msgTrue })

        } else {
            msgFalse = true
            res.render("admin/add-coupen", { msgFalse })
        }
    } catch (err) {
        console.log(err, "catch error")
    }
}

const showCoupen = async (req, res) => {
    try {
        const showCoupen = await CoupenModel.find()

        res.render("admin/show-coupens", { showCoupen })

    } catch (err) {
        consoel.log(err)
    }
}


const showListedCoupen = async (req, res) => {
    try {
        const listedCoupen = await CoupenModel.find({ listStatus: true })
        res.render("admin/listed-coupen", { listedCoupen })
    } catch (err) {
        console.log(err)
    }
}

const showUnlistedCoupen = async (req, res) => {
    try {
        const unlistedCoupen = await CoupenModel.find({ listStatus: false })
        res.render("admin/unlisted-coupen", { unlistedCoupen })
    } catch (err) {
        console.log(err)
    }
}


const listUnlistCoupen = async (req, res) => {
    try {
        const coupenData = await CoupenModel.findById({ _id: req.params.id })
        console.log("oooooooooooooooooooooooo",coupenData)
        const updated = await CoupenModel.updateOne({ _id: req.params.id }, { $set: { listStatus: !coupenData.listStatus } })
        if (updated) {
            res.redirect("/admin/showCoupen")
        } else {
            msgUnlist = true
            res.render("admin/show-coupen", { msgUnlist })
        }

    } catch (err) {
        console.log(err)
    }
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
    pendingOrders,
    orderDelivered,
    delieveredOrders,
    cancelledOrders,
    orderCancelled,
    deletedProducts,
    returnPending,
    returnAccept,
    returnDefective,
    returnNonDefective,
    adminChartLoad,
    addCoupen,
    addNewCoupen,
    showCoupen,
    showListedCoupen,
    showUnlistedCoupen,
    listUnlistCoupen

}