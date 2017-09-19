var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');


var bcryptHashTests = 10;

var User = db.Model.extend({
	tableName:'users',
	hasTimestamps:true,
	// defualts:{
	// 	name:'demo',
	// 	password:'demo'
	// },
	//user has many urls belong to many users
	links:function(){
		return this.hasMany(Link);
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