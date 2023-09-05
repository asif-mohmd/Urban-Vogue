const registerView = (req, res) => {
    res.render("index", {
    } );
}
// For View 
const loginView = (req, res) => {

    res.render("login", {
    } );
}
module.exports =  {
    registerView,
    loginView
};