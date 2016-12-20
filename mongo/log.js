/**
 * Created by 최예찬 on 2016-12-20.
 */
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    time: {
        type: Date,
        default: Date.now
    },
    joosikNum: {
        type: Number,
        required:true
    },
    size: {
        type: Number,
        required:true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        require: true
    }
});

/**
 * @param {number} joosikNum
 * @param {number} size
 * @param {mongoose.Schema.Types.ObjectId} user
 */
schema.statics.newLog = function(joosikNum, size, user){
    var obj = {
        joosikNum: joosikNum,
        size: size,
        user: user
    };
    return new this(obj).save();
};

var model = mongoose.model('logs', schema);


module.exports = model;