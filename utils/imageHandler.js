const multer = require('multer')
const path = require('path')


let validImageCount = 0;

const storage = multer.diskStorage({
    destination:function(req,file,callback){
        callback(null, path.join(__dirname,'../Public/uploaded-images'));  
    },
    filename:function(req,file,callback){ 
        const name = Date.now()+'-'+file.originalname;
        callback(null,name);
    }
  })
  
  const validMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];

  const fileFilter = (req, file, callback) => {
      if (validMimeTypes.includes(file.mimetype)) {
          console.log('Accepted file:', file.originalname);
          callback(null, true);
      } else {
          console.log('Rejected file:', file.originalname);
          callback(null, false);
      }
  };
  
  const upload = multer({ storage: storage, fileFilter: fileFilter });
  
  module.exports = { upload };
  