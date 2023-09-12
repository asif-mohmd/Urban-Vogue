// const multer = require("multer")

// const imageStorage = multer.diskStorage({
    
//     destination: function (req , file, cb){
//         console.log("in storage")
//       return cb(null, "./uploads");
//     },
//     filename: function(req,file, cb){
//       return cb(null, `${Date.now()}-${file.originalname}`)
//     }
//   })


//   const imageUpload = multer({
   
//     storage: imageStorage,
//     limits: {
//       fileSize: 1000000 // 1000000 Bytes = 1 MB
//     },
//     fileFilter(req, file, cb) {
//         console.log("file filter")
//       if (!file.originalname.match(/\.(png|jpg)$/)) { 
//          // upload only png and jpg format
//          return cb(new Error('Please upload a Image'))
//        }
//      cb(undefined, true)
//   }
//   }) 


//   module.exports = imageUpload