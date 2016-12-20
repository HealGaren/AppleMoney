/**
 * Created by 최예찬 on 2016-12-20.
 */
var mongoose = require('mongoose');
var crypto = require('crypto');
var joosik = require('../joosik');

var schema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    schoolNum: {
        type: String,
        required:true
    },
    id: {
        type: String,
        require: true
    },
    salt: {
        type: String,
        require: true,
    },
    hash: {
        type: String,
        require: true
    },
    token: {
        type: String
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

schema.methods.genToken = function () {
    return new Promise((resolved, reject)=> {
        crypto.randomBytes(48, (err, buffer) => {
            if (err) reject(err);
            this.token = this.id + buffer.toString('hex');
            resolved(this.save());
        });
    });
};

/**
 * @param {string} name
 * @param {string} schoolNum
 * @param {string} id
 * @param {string} password
 */
schema.statics.register = function (name, schoolNum, id, password) {

    return this.findOne({id: id}).exec()
        .then(user => {
            if (user) throw {
                message: "이미 존재하는 유저입니다.",
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
                    hash: hashedPass
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
 * @param {string} id
 * @param {number} joosikNum,
 * @param {number} size
 */
schema.statics.buyJoosik = function (id, joosikNum, size) {


        var obj = {};
        obj["joosik" + joosikNum] = size;
        obj.coin = joosik.
        return this.findByIdAndUpdate(id, {
            $set: obj,
            $inc: {
                money: -100
            }
        });
};

var model = mongoose.model('users', schema);


module.exports = model;