var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');


var User = db.Model.extend({
	tableName:'users',
	hasTimestamps:true,
	initialize: function(){
		this.on("creating",this.hashPassword);
	},
	comparePassword: function(attemptedPassword, callback){
		bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch){
			callback(isMatch)
		})
	},
	hashPassword: function(){
		var cipher = Promise.Promisify(bcrypt.hash);
		return cipher(this.get("password"), null, null).bind(this)
			.then(function(hash){
				this.set('password', hash)
			})
	}

});

module.exports = User;


//


// console.time('bcrypt2-sync-gen');
// for(var i=1 ; i <= bcryptHashTests ; i++) {
//  var hash = bcrypt.hashSync('password');
// }
// console.timeEnd('bcrypt-sync-gen');

// var bcryptHashCounter = 0;
// console.time('bcrypt-async-gen');
// for(var i=1 ; i <= bcryptHashTests ; i++) {
//  bcrypt.hash('bacon', null, null, function(err, hash) {
//    bcryptHashCounter++;
//    if(bcryptHashCounter == bcryptHashTests) {
//      console.timeEnd('bcrypt-async-gen');
//    }
//  });
// }