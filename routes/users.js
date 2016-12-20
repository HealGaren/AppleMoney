var express = require('express');
var passport = require('passport');
var mongo = require('../mongo');
var middleware = require('./middleware');
var router = express.Router();

router.post('', middleware.parseParam.body([
    ['name', 'string', true],
    ['schoolNum', 'string', true],
    ['id', 'string', true],
    ['password', 'string', true],
    ['registerKey', 'string', true]
]), (req, res) => {

    //noinspection JSUnresolvedVariable
    mongo.User.register(req.body.name, req.body.schoolNum,
        req.body.id, req.body.password, req.body.registerKey
    )
        .then(user => {
            console.log(user);
            user = user.toObject();
            delete user.salt;
            delete user.hash;
            res.send(user);
        })
        .catch(err => {
            if(!err.statusCode) {
                res.status(500).send(err.message);
                console.log('서버 오류입니다.');
            }
            else res.status(err.statusCode).send(err.message);
        });

});

router.post('/login', middleware.parseParam.body([
    ['email', 'string', true],
    ['password', 'string', true]
]), (req, res, next)=> {
    //noinspection JSUnresolvedFunction
    passport.authenticate('local', {badRequestMessage: "잘못된 입력입니다."}, (err, user, info)=> {
        if (err) res.status(400).send(err.message);
        else if (!user) res.status(401).send(info.message);
        else req.login(user, err=> {
                if (err) res.status(500).send(err.message);
                else res.send("성공적으로 로그인되었습니다.");
            });
    })(req, res, next);
});

router.get('/me', middleware.needLogin(), (req, res) => {
    var user = req.user.toObject();
    delete user.salt;
    delete user.hash;
    res.send(user);
});

router.post('/logout', middleware.needLogin(), (req, res)=> {
    req.logout();
    res.send("성공적으로 로그아웃되었습니다.");
});

module.exports = router;