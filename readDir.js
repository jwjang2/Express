var testFolder = './data';
var fs = require('fs');

fs.readdir(testFolder,'utf8',function(err,fileList) {
	console.log(fileList);
})
