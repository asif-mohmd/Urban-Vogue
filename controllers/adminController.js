const UserModel = require("../models/User")
const CategoryModel = require("../models/Category")
const OrderModel = require("../models/Order")
const ProductModel = require("../models/Product")
const { response } = require("express")


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

    res.render("admin/index")
}

const adminChartLoad = async (req, res) => {
    console.log("Working tetchchhhhhhhhhhhhhhhhhh");
  
    try {
      const data = await OrderModel.find()  // Use lean() to get plain JavaScript objects
    //   const dataArray = Array.isArray(data) ? data : [data];  // Ensure data is an array
  
    //   const response = { status: true, data: dataArray };
    //   console.log(dataArray);
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

const pendingOrders = async(req,res) =>{
   const pendingOrders = await OrderModel.find({status:"pending"})

    res.render("admin/pending-orders",{pendingOrders})
}

const orderDelivered = async(req,res) =>{
    const orderId = req.query.id
 
    const success = await OrderModel.updateOne({_id:orderId},{$set:{status:"delivered"}})
    if(success) {
  
        res.redirect("/admin/delivered-orders")
    }else{
        console.log("not delivered")
        res.redirect("/admin/pending-orders")
    }
}

const delieveredOrders = async(req,res) =>{
    const deliveredOrders = await OrderModel.find({status:"delivered"})

     res.render("admin/delivered-orders",{deliveredOrders})
 }

 const orderCancelled = async(req,res) =>{
    const orderId = req.query.id
 
    const success = await OrderModel.updateOne({_id:orderId},{$set:{status:"cancelled"}})
    if(success) {
        
      
        res.redirect("/admin/cancelled-orders")
    }else{
        console.log("not cancelled")
        res.redirect("/admin/pending-orders")
    }
}
 const cancelledOrders = async(req,res) =>{
    const cancelledOrders = await OrderModel.find({status:"cancelled"})
     res.render("admin/cancelled-orders",{cancelledOrders})
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



  const returnAccept = async (req,res) =>{
    const orderObjId = req.query.id
    const status = req.query.status

    try{
      if(status=="returnNonDefective"){
        const returnAcceptNonDef = await OrderModel.updateOne({_id:orderObjId},{status:"returnAcceptNonDef"})
        if(returnAcceptNonDef){
            res.render("admin/return-pending")
        }else{
            res.render("admin/return-pending")
        }
      }else{
        const returnAcceptDef = await OrderModel.updateOne({_id:orderObjId},{status:"returnAcceptDef"})
        if(returnAcceptDef){
         
            res.render("admin/return-pending")
        }else{
     
            res.render("admin/return-pending")
        }
      }
      
    }catch(error){
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }


  }


 const returnDefective = async (req,res)=>{
    const returnDefective = await OrderModel.find({status:"returnAcceptDef"})
    if(returnDefective){
      res.render("admin/return-defective",{returnDefective})
        
    }
 }
  
 const returnNonDefective = async (req,res)=>{
    const returnAcceptNonDef = await OrderModel.find({status:"returnAcceptNonDef"})
    if(returnAcceptNonDef){
      res.render("admin/return-non-defective",{returnAcceptNonDef})
        
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
    adminChartLoad

}