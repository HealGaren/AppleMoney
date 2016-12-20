var express = require('express');
var mongo = require('../mongo');
var middleware = require('./middleware');
var router = express.Router();
var joosik = require('../joosik');

router.post('/buy', middleware.needLogin(), middleware.parseParam.body([
    ['joosikNum', 'number', true],
    ['size', 'number', true]
]), (req, res) => {
    //noinspection JSUnresolvedVariable
    console.log(req.user);
    mongo.User.buyJoosik(req.user._id, req.body.joosikNum, req.body.size).then(user => {
        res.status(200).send('성공적으로 구매했습니다.');
    }).catch(err => {
        console.log(err);
        if(!err.statusCode) {
            res.status(500).send(err.message);
            console.log('서버 오류입니다.');
        }
        else res.status(err.statusCode).send(err.message);
    });
});


router.get('/price', middleware.needLogin(), middleware.parseParam.query([
    ['joosikNum', 'number'],
]), (req, res) => {
    if (req.query.joosikNum !== undefined) {
        res.send(joosik.getPriceAndDelta(req.query.joosikNum));
    }
    else res.send(joosik.getAllPriceAndDelta());
});

router.get('/extra', middleware.needLogin(), middleware.parseParam.query([
    ['joosikNum', 'number'],
]), (req, res) => {

    if (req.query.joosikNum !== undefined) {
        res.send({result:joosik.getExtra(req.query.joosikNum)});
    }
    else res.send(joosik.getAllExtra());
});

module.exports = router;