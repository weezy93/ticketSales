var express = require('express');
var router = express.Router();
var helpers = require('../lib/helpers');
var passport = require('../lib/auth');
var queries = require('./queries/queries');


// Public facing
router.get('/:eventId', function(req, res, next) {
  var id = req.params.eventId;
  queries.getEventById(id).then(function(data) {
    res.render('event', {user: req.user, event: data[0]});
  });
});

// Public facing - search student
router.get('/:eventId/sale_start', helpers.ensureAuthenticated,
function(req, res, next) {
  res.render('saleStart', {
    title: 'Sell Page',
    eventId: req.params.eventId,
    event_max_tix: '?', // Query event.max_tix
    user: req.user,
  });
});

router.get('/:eventId/redeem', helpers.ensureAuthenticated,
function(req, res, next) {
  var params = {
    eventId: req.params.eventId,
    script: 'redeem.js',
    stylesheet: 'redeem.css',
    user: req.user,
  }
  res.render('redeem.html', params)
})
// Student info and maybe sale
// Public facing
router.get('/:eventId/sales/', helpers.ensureAuthenticated,
function(req, res, next) {
  var studentId = req.query.studentId;
  var eventId = req.params.eventId;

  queries.getStudentInfo(studentId).then(function(student) {
      res.render('saleEnd', {
        name: student[0].first_name + ' ' + student[0].last_name,
        eventId: eventId,
        studentId: student[0].id,
        script: 'saleEnd.js',
        stylesheet: 'saleEnd.css',
        count: 0,
        user: req.user,
      });
    });
});

// Public facing
router.get('/:eventId/edit', helpers.ensureAdmin,
function(req, res, next) {
  queries.getEventById(req.params.eventId).then(function(data) {
    var params = {
      eventId: req.params.eventId,
      script: 'editEvent.js',
      stylesheet: 'editEvent.css',
      event: data[0],
      user: req.user,
    };
    res.render('editevent', params);
  });
});

// Ajax route
router.post('/:eventId/sales/:studentId', helpers.ensureAuthenticated,
function(req, res, next) {
  var eventId = req.body.event_id;
  var studentId = req.body.student_id;

  queries.sellTicket(studentId, eventId).then(function() {
    res.send();
  });
});

// Ajax route
router.get('/:eventId/sales/:studentId/ticket_count',
helpers.ensureAuthenticated,
function(req, res, next) {
  var params = {
    student_id: req.params.studentId,
    event_id: req.params.eventId,
  };
  // Z queries.ticketCount(params).then(function(count) {
  //   res.send(count[0].count);
  // });
  queries.getTickets(params).then(function(tickets) {
    res.send(tickets);
  })
  .catch(function(err) {
    console.log(err);
  })
});

// Ajax route
router.post('/:eventId/sales/:studentId/addguest', helpers.ensureAuthenticated,
function(req, res, next) {
  queries.addGuest(req.body)
  .then(function(guestId) {
    res.json({success: 'Added guest #' + guestId});
  })
  .catch(function(err) {
    res.json({error: err});
  });
});

// Ajax route
router.get('/:eventId/sales/:studentId/getguests', helpers.ensureAuthenticated,
function(req, res, next) {
  var params = {
    student_id: req.params.studentId,
    event_id: req.params.eventId,
  };
  queries.getGuests(params)
  .then(function(guests) {
    res.json(guests);
  })
  .catch(function(err) {
    res.json({error: err});
  });
});

// Ajax route
router.get('/:eventId/getstudents',helpers.ensureAuthenticated,
function(req, res, next) {
  var searchFor = {
    eventId: req.params.eventId,
  };
  if (req.query.matcher) {
    searchFor['matcher'] = req.query.matcher;
  }
  queries.getStudentsByEvent(searchFor)
  .then(function(results) {
    res.json(results);
  });
});

// Ajax route
router.post('/:eventId/edit', helpers.ensureAdmin,
function(req, res, next) {
  queries.editEvent(req.body, req.params.eventId)
  .then(function(data) {
    res.redirect('/event/' + req.params.eventId + '/edit');
  });
});

// Ajax
router.post('/guest/:id/edit', helpers.ensureAdmin,
function(req, res, next) {
  var id = req.params.id;
  queries.editGuest(req.body, id).then(function(data) {
    console.log(data);
    res.send('success');
  });
});

// Ajax
router.get('/guest/:id', helpers.ensureAuthenticated,
function(req, res, next) {
  var id = req.params.id;
  queries.getGuests({id: id}).then(function(data) {
    res.json(data);
  });
});

router.put('/redeem/:ticketNumber/', helpers.ensureAuthenticated,
function(req, res, next) {
  queries.redeemTicket(req.params.ticketNumber)
  .then(function() {
    res.json({success: 'yay!'})
  })
  .catch(function(err) {
    res.json({error: err});
  })
})

module.exports = router;
