const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination:function(req,file,callback){
        callback(null, path.join(__dirname,'../Public/uploaded-images'));  
    },
    filename:function(req,file,callback){ 
        const name = Date.now()+'-'+file.originalname;
        callback(null,name);
    }
  })
  
  const fileFilter = (req,file,callback) =>{
    console.log(file.mimetype)
    if(file.mimetype === "image/png" || file.mimetype === "image/jpeg"){
        callback(null,true)
        console.log("paasseedddd>>>>>>>>>")
    }else{
        callback(null, false)
        console.log("Not passed")
    }
  }
  const upload = multer({storage:storage,fileFilter:fileFilter});


module.exports = {upload} 