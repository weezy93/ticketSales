var queries = require('../routes/queries/queries.js');
var bcrypt = require('bcrypt');

function ensureAuthenticated(req, res, next) {
  if (req.user && req.user.events.indexOf(Number(req.params.eventId))  !== -1) {
    return next();
  }
  res.redirect('/login');
}
function ensureAdmin(req, res, next) {
  if (req.user) {
    if (req.params.eventId) {
      if (req.user.events.indexOf(Number(req.params.eventId)) === -1) {
        return res.redirect('/login');
      }
    }
    if (req.params.schoolId) {
      if (!req.user.is_admin || req.user.school_id != req.params.schoolId) {
        req.flash('message', {
          status: 'danger',
          value: 'Please use an admin account to continue',
        });
        return res.redirect('/login');
      }
    }
    return next();
  }
  return res.redirect('/login');
}

function loginRedirect(req, res, next) {
  if (req.user) {
    res.redirect('/');
  } else {
    return next();
  }
}

function comparePassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}



module.exports = {
  ensureAuthenticated: ensureAuthenticated,
  loginRedirect: loginRedirect,
  ensureAdmin: ensureAdmin,
  comparePassword: comparePassword,
};
