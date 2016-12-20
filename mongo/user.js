/**
 * Created by 최예찬 on 2016-12-20.
 */

"use strict";

var mongoose = require('mongoose');
var crypto = require('crypto');
var joosik = require('../joosik');

var jsonfile = require('jsonfile');
jsonfile.spaces = 4;

var registerKeys = jsonfile.readFileSync('./register-key.json');

var schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    schoolNum: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true,
    },
    hash: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required:true
    },
    coin: {
        type: Number,
        default: 10000
    },
    joosik0: {
        type: Number,
        default: 0
    },
    joosik1: {
        type: Number,
        default: 0
    },
    joosik2: {
        type: Number,
        default: 0
    },
    joosik3: {
        type: Number,
        default: 0
    },
    joosik4: {
        type: Number,
        default: 0
    }
});

/**
 * @param {string} password
 */
schema.methods.equalsPassword = function (password) {
    var hash = crypto.createHash('sha512').update(password + this.salt).digest('hex');
    return hash == this.hash;
};

/**
 * @param {string} name
 * @param {string} schoolNum
 * @param {string} id
 * @param {string} password
 * @param {string} registerKey
 */
schema.statics.register = function (name, schoolNum, id, password, registerKey) {

    return this.findOne({id: id}).exec()
        .then(user => {
            if (user) throw {
                message: "이미 존재하는 유저입니다.",
                statusCode: 409,
            };
            if (registerKeys.indexOf(registerKey) == -1) throw {
                message: "가입 키가 존재하지 않습니다.",
                statusCode: 409,
            };

            return this.findOne({key: registerKey}).exec();
        }, err => {
            throw {
                message: "오류가 발생했습니다: " + err.message,
                statusCode: 500
            };
        }).then(user => {

            if (user) throw {
                message: "이미 그 가입 키가 사용되었습니다.",
                statusCode: 409,
            };
            else {
                var salt = Math.round((new Date().valueOf() * Math.random())) + "";
                var hashedPass = crypto.createHash("sha512").update(password + salt).digest("hex");

                return new this({
                    name: name,
                    schoolNum: schoolNum,
                    id: id,
                    salt: salt,
                    hash: hashedPass,
                    key: registerKey
                }).save();
            }
        }, err => {
            throw {
                message: "오류가 발생했습니다: " + err.message,
                statusCode: 500
            };
        });
};

/**
 * @param {string} id
 * @param {string} password
 */
schema.statics.login = function (id, password) {

    return this.findOne({id: id}).exec()
        .then(user => {
            if (!user) throw {
                message: "아이디가 존재하지 않습니다.",
                statusCode: 401
            };
            else {
                if (user.equalsPassword(password)) {
                    return user;
                }
                else throw {
                    message: "비밀번호가 일치하지 않습니다.",
                    statusCode: 401
                };
            }
        }, err => {
            throw {
                message: "오류가 발생했습니다: " + err.message,
                statusCode: 500
            };
        });
};


schema.statics.removeUser = function (id) {
    return this.findByIdAndRemove(id).exec();
};


/**
 * @param {mongoose.Schema.Types.ObjectId} id
 * @param {number} joosikNum,
 * @param {number} size
 */
schema.statics.buyJoosik = function (id, joosikNum, size) {
    return this.findById(id).exec()
        .then(user => {
            if (!user) throw {
                message: "아이디가 존재하지 않습니다.",
                statusCode: 401
            };
            else {
                var obj = {};
                var joosikKey = "joosik" + joosikNum;
                obj[joosikKey] = size;
                obj.coin = -(joosik.getPriceAndDelta(joosikNum).price * size);

                if(user[joosikKey] + obj[joosikKey] < 0) throw {
                    message: "주식을 팔 수 없습니다. 소지 주식이 부족합니다.",
                    statusCode: 400
                };
                if(user[joosikKey] + obj[joosikKey] > 7) throw {
                    message: "주식을 살 수 없습니다. 소지 주식의 한도를 넘었습니다.",
                    statusCode: 400
                };
                if(user.coin + obj.coin < 0) throw {
                    message: "주식을 살 수 없습니다. 소지금이 부족합니다.",
                    statusCode: 400
                };

                if(joosik.getExtra(joosikNum) < obj[joosikKey]) throw {
                    message: "주식을 살 수 없습니다. 시장에 존재하는 주식의 양을 초과했습니다.",
                    statusCode: 400
                };

                joosik.addExtra(joosikNum, -obj[joosikKey]);
                return this.findByIdAndUpdate(id, {
                    $inc: obj
                });
            }
        }, err => {
            throw {
                message: "오류가 발생했습니다: " + err.message,
                statusCode: 500
            };
        });
};

var model = mongoose.model('users', schema);


module.exports = model;