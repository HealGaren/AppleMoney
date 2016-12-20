var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ShareData');

var db = mongoose.connection;
db.once('open', function(){
    console.log('mongoose connect done');
});

module.exports = {
    User: require('./user'),
};