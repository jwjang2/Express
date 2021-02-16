const express = require('express');
const app = express();
const port = 3000;

var fs = require('fs');
var path = require('path');
var qs = require('querystring');
var bodyParser = require('body-parser');
var sanitizeHtml = require('sanitize-html');
var compression = require('compression');

var template = require('.\\lib\\template.js');

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

app.get('/', (request, response) => {
  var title = 'Welcome';
  var description = 'Hello, Node.js';
  var list = template.List(request.list);
  var html = template.HTML(title, list, 
    `<h2>${title}</h2>${description}
    <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;"
    `,
    '<a href="/topic/create">create</a>'
  );
  response.send(html);
});


app.get('/topic/create', (request, response) => {
  var title = 'WEB - create';
  var list = template.List(request.list);
  var html = template.HTML(title, list, `
    <form action="/topic/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
        <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
        <input type="submit">
      </p>
    </form>
  `,` `);
  response.send(html);
});

app.post('/topic/create_process', (request, response) => {
  var post = request.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`,description,'utf8',function(err){
    response.redirect(`/topic/${title}`);
    response.send('sucess');
  });
});

app.get('/topic/update/:pageId', (request, response) => {
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
    var title = request.params.pageId;
    var list = template.List(request.list);
    var html = template.HTML(title, list, 
      `<form action="/topic/update_process" method="post">
        <input type="hidden" name="id" value=${title}>
        <p><input type="text" name="title" placeholder="title" value=${title}></p>
        <p>
          <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `,
      `<a href="/topic/create">create</a> <a href="/topic/update?id=${title}">update</a>`);
    response.send(html);
  });  
});

app.post('/topic/update_process', (request, response) => {
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  
  fs.rename(`data/${id}`,`data/${title}`,function(err) {
    console.log('Rename complete!');
    fs.writeFile(`data/${title}`,description,'utf8',function(err){
      response.redirect(`/topic/${title}`);
    });
  });
});

app.post('/topic/delete_process', (request, response) => {
  var post = request.body;
  var id = post.id;
  fs.unlink(`data/${id}`,function(err){
    response.redirect('/');
  });
});

app.get('/topic/:pageId', (request, response, next) => {
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
    if(err) {
      next(err);
    } else {
      var title = request.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, {
        allowedTags:['h1']
      });      
      var list = template.List(request.list);
      var html = template.HTML(title, list, `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        `<a href="/topic/create">create</a> 
         <a href="/topic/update/${sanitizedTitle}">update</a>
         <form action="/topic/delete_process" method="post">
          <input type="hidden" name="id" value="${sanitizedTitle}">
          <input type="submit" value="delete">
         </form>
         `
        );
      response.send(html);
    }
  });
});


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
