
const adminLoginCheck = (req, res, next) => {
    if (req.session.admin) {
        next()
    } else {
        return res.redirect("/admin/login")
    }
}


const adminLoginVerify = (req, res, next) => {
    if (req.session.admin) {
        return res.redirect("/admin")
    } else {
        next()
    }
}


const verifyLogin = (req, res, next) => {
    if (req.session.user) {
      next()
    } else {
      return res.redirect("/login")
    }
  }
  
  
  const loginChecker = (req, res, next) => {
    if (req.session.user) {
      return res.redirect("/")
    } else {
      next()
    }
  }


  module.exports = {
    adminLoginCheck,
    adminLoginVerify,
    verifyLogin,
    loginChecker

  }

