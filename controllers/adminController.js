const UserModel = require("../models/User")
const CategoryModel = require("../models/Category")
const OrderModel = require("../models/Order")
const ProductModel = require("../models/Product")
const { response } = require("express")
const CouponModel = require("../models/Coupon")


let adminEmail = "admin@gmail.com"
let adminPassword = "123"


const adminLoginView = (req, res) => {
    try {
        res.render("admin/login")
    } catch (err) {
        consoel.log(err, "catched error")
    }
}

const adminLogin = (req, res) => {
    try {
        const { email, password } = req.body
        if (email === adminEmail && password == adminPassword) {
            req.session.admin = true
            res.redirect("/admin")
        } else {
            res.redirect("/admin/login")
        }
    } catch (err) {
        consoel.log(err, "catched error")
    }
}


const adminDashboard = async (req, res) => {
    try {
        let totalDeliveredAmount = 0;
        const recentOrders = await OrderModel.find({ status: 'delivered' })
        const countOfDeliveredOrders = await OrderModel.countDocuments({ status: 'delivered' });
        const countOfUsers = await UserModel.countDocuments();

        recentOrders.forEach(order => {
            totalDeliveredAmount += order.amount;
        });

        res.render("admin/index", { recentOrders, countOfDeliveredOrders, totalDeliveredAmount, countOfUsers })
    } catch (err) {
        consoel.log(err, "catched error")
    }
}

const adminChartLoad = async (req, res) => {
    try {
        const data = await OrderModel.find()
        res.json(data);
    } catch (error) {
        console.error('Error in adminChartLoad:', error);
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
};

const userList = async (req, res) => {
    try {
        const users = await UserModel.find()
        res.render("admin/user-list", { users })
    } catch (err) {
        consoel.log(err, "catched error")
    }
}


const userBlockUnblock = async (req, res) => {
    try {
        const userData = await UserModel.findOne({ _id: req.query.id })
        await UserModel.updateOne({ _id: req.query.id }, { $set: { status: !userData.status } })
        const users = await UserModel.find({})
        res.render("admin/user-list", { users })
    } catch (err) {
        consoel.log(err, "catched error")
    }
}

const addCategory = (req, res) => {
    try {
        res.render("admin/add-category")
    } catch (err) {
        consoel.log(err, "catched error")
    }
}

const showCategory = async (req, res) => {
    try {
        const showCategory = await CategoryModel.find({})
        res.render("admin/show-category", { showCategory })
    } catch (err) {
        consoel.log(err, "catched error")
    }
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
    try {
        const deleted = await CategoryModel.deleteOne({ _id: req.query.id })
        if (deleted) {
            res.redirect("/admin/showCategory")
        } else {
            msg = true
            res.render("admin/show-category", { msg })
        }
    } catch (err) {
        consoel.log(err, "catched error")
    }
}

const listUnlistCategory = async (req, res) => {
    try {
        const categoryData = await CategoryModel.findById({ _id: req.params.id })
        const updated = await CategoryModel.updateOne({ _id: req.params.id }, { $set: { listStatus: !categoryData.listStatus } })
        if (updated) {
            res.redirect("/admin/showCategory")
        } else {
            msgUnlist = true
            res.render("admin/show-category", { msgUnlist })
        }
    } catch (err) {
        consoel.log(err, "catched error")
    }
}

const listedCategory = async (req, res) => {
    try {
        const listedCategory = await CategoryModel.find({ listStatus: true })
        res.render("admin/listed-category", { listedCategory })
    } catch (err) {
        consoel.log(err, "catched error")
    }
}

const deletedProducts = async (req, res) => {
    try {
        const deletedProducts = await ProductModel.find({ deletedProducts: true })
        res.render("admin/deleted-products", { deletedProducts })
    } catch (err) {
        consoel.log(err, "catched error")
    }
}

const unListedCategory = async (req, res) => {
    try {
        const unListedCategory = await CategoryModel.find({ listStatus: !true })
        res.render("admin/unlisted-category", { unListedCategory })
    } catch (err) {
        consoel.log(err, "catched error")
    }
}

const pendingOrders = async (req, res) => {
    try {
        const pendingOrders = await OrderModel.find({ status: "pending" })
        res.render("admin/pending-orders", { pendingOrders })
    } catch (err) {
        consoel.log(err, "catched error")
    }
}

const orderDelivered = async (req, res) => {
    try {
        const orderId = req.query.id
        const success = await OrderModel.updateOne({ _id: orderId }, { $set: { status: "delivered" } })
        if (success) {
            res.redirect("/admin/delivered-orders")
        } else {
            res.redirect("/admin/pending-orders")
        }
    } catch (err) {
        consoel.log(err, "catched error")
    }
}

const delieveredOrders = async (req, res) => {
    try {
        const deliveredOrders = await OrderModel.find({ status: "delivered" })
        res.render("admin/delivered-orders", { deliveredOrders })
    } catch (err) {
        consoel.log(err, "catched error")
    }
}

const orderCancelled = async (req, res) => {
    try {
        const orderId = req.query.id

        const success = await OrderModel.updateOne({ _id: orderId }, { $set: { status: "cancelled" } })
        if (success) {
            res.redirect("/admin/cancelled-orders")
        } else {
            res.redirect("/admin/pending-orders")
        }
    } catch (err) {
        consoel.log(err, "catched error")
    }
}

const cancelledOrders = async (req, res) => {
    try {
        const cancelledOrders = await OrderModel.find({ status: "cancelled" })
        res.render("admin/cancelled-orders", { cancelledOrders })
    } catch (err) {
        consoel.log(err, "catched error")
    }

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
    try {

    } catch (err) {
        consoel.log(err, "catched error")
    }
    const orderObjId = req.query.id
    const status = req.query.status

    const orderDetails = await OrderModel.findOne({ _id: orderObjId })

    const walletUpdate = await UserModel.updateOne({ _id: orderDetails.userId }, { $inc: { wallet: orderDetails.amount } });
    console.log(walletUpdate, "ooooooooooooooooo")

    // Check the result of the update
    if (walletUpdate) {
        res.render("admin/return-pending")
        console.log("Wallet updated successfully. New wallet balance: ");
    } else {

        console.log(`Failed to update the wallet.`);
        res.render("admin/return-pending")
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
    try {
        const returnDefective = await OrderModel.find({ status: "returnAcceptDef" })
        if (returnDefective) {
            res.render("admin/return-defective", { returnDefective })

        }
    } catch (err) {
        consoel.log(err, "catched error")
    }
}

const returnNonDefective = async (req, res) => {
    try {
        const returnAcceptNonDef = await OrderModel.find({ status: "returnAcceptNonDef" })
        if (returnAcceptNonDef) {
            res.render("admin/return-non-defective", { returnAcceptNonDef })
        }
    } catch (err) {
        consoel.log(err, "catched error")
    }
}


const addCoupon = async (req, res) => {
    try {
        res.render("admin/add-coupon")
    } catch (err) {
        console.log(err, "catch error")
    }
}


const addNewCoupon = async (req, res) => {
    try {
        const { couponName, couponPercentage } = req.body

        const data = {
            couponName: couponName,
            couponPercentage: couponPercentage,
            listStatus: true
        }
        const exists = await CouponModel.findOne({ couponName: couponName });

        if (exists) {
            let msgExists = true
            res.render("admin/add-coupon", { msgExists })
        } else {
            const couponAdded = await CouponModel.create(data)
            if (couponAdded) {
                msgTrue = true
                res.render("admin/add-coupon", { msgTrue })

            } else {
                msgFalse = true
                res.render("admin/add-coupon", { msgFalse })
            }
        }
    } catch (err) {
        console.log(err, "catch error")
    }
}

const showCoupon = async (req, res) => {
    try {
        const showCoupon = await CouponModel.find()
        res.render("admin/show-coupons", { showCoupon })
    } catch (err) {
        consoel.log(err)
    }
}


const showListedCoupon = async (req, res) => {
    try {
        const listedCoupon = await CouponModel.find({ listStatus: true })
        res.render("admin/listed-coupon", { listedCoupon })
    } catch (err) {
        console.log(err)
    }
}

const showUnlistedCoupon = async (req, res) => {
    try {
        const unlistedCoupon = await CouponModel.find({ listStatus: false })
        res.render("admin/unlisted-coupon", { unlistedCoupon })
    } catch (err) {
        console.log(err)
    }
}

const listUnlistCoupon = async (req, res) => {
    try {
        const couponData = await CouponModel.findById({ _id: req.params.id })
        const updated = await CouponModel.updateOne({ _id: req.params.id }, { $set: { listStatus: !couponData.listStatus } })
        if (updated) {
            res.redirect("/admin/showCoupon")
        } else {
            msgUnlist = true
            res.render("admin/show-coupon", { msgUnlist })
        }
    } catch (err) {
        console.log(err)
    }
}

const couponDelete = async (req, res) => {
    try {
        const deleted = await CouponModel.deleteOne({ _id: req.query.id })
        if (deleted) {
            res.redirect("/admin/showCoupon")
        } else {
            msg = true
            res.render("admin/show-coupons", { msg })
        }

    } catch (err) {

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
    addCoupon,
    addNewCoupon,
    showCoupon,
    showListedCoupon,
    showUnlistedCoupon,
    listUnlistCoupon,
    couponDelete,
   

}