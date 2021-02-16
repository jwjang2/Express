const express = require('express');
const app = express();
const port = 3000;

var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');

var indexRouter = require('.\\routes\\index');
var topicRouter = require('.\\routes\\topic');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(express.static('public'));

//middleware 사용
app.get('*',function(request,response, next) {
  fs.readdir('./data', function(error, filelist){
    request.list = filelist;
    next();
  });
});

app.use('/',indexRouter);
app.use('/topic',topicRouter);

app.use(function(req,res,next) {
  res.status(404).send('sorry cant find that!');
});

app.use(function(err,req,res,next) {
  console.error(err.stack);
  res.status(500).send('something broke!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
