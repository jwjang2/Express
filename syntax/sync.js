var fs = require('fs');

// readFileSync
// console.log('befor read');
// var result = fs.readFileSync('../data/css', 'utf8');
// console.log(result);
// console.log('after read');


// readFile
console.log('befor read');
fs.readFile('../data/css', 'utf8', function(err,result) {
	console.log(result);
});
console.log('after read');


// readFile callback함수 분리
// callback 함수
// var readFun = function(err,result) {
// 	console.log(result);
// }
// // readFile
// console.log('befor read2');
// fs.readFile('../data/css', 'utf8', readFun);
// console.log('after read2');
