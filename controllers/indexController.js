

const dashboardView = (req, res) => {
    res.render("user/index", {
      user: req.user
    });
  };
  module.exports = {
    dashboardView,
  };