var express = require('express');
var mongo = require('../mongo');
var middleware = require('./middleware');
var router = express.Router();

router.post('', middleware.parseParam.body([
  ['name', 'string', true],
  ['schoolNum', 'string', true],
  ['id', 'string', true],
  ['password', 'string', true]
]), (req, res) => {

  //noinspection JSUnresolvedVariable
  mongo.User.register(req.body.name, req.body.schoolNum,
      req.body.id, req.body.password
  )
      .then(user => {
        user = user.toObject();
        delete user.salt;
        delete user.hash;
        res.send(user);
      })
      .catch(err => {
        res.status(err.statusCode).send(err.message);
      });

});


router.post('/login', middleware.parseParam.body([
  ['id', 'string'],
  ['password', 'string']
]), (req, res) => {

  //noinspection JSUnresolvedVariable
  mongo.User.login(req.body.id, req.body.password)
      .then(user => {
        user = user.toObject();
        delete user.salt;
        delete user.hash;
        res.send(user);
      })
      .catch(err => {
        res.status(err.statusCode).send(err.message);
      });
});

module.exports = router;