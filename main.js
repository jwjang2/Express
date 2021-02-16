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
    `<h2>${title}</h2>${description}`,
    '<a href="/create">create</a>'
  );
  response.send(html);
});

app.get('/page/:pageId', (request, response) => {
  console.log(request.list);

  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
    var title = request.params.pageId;
    var sanitizedTitle = sanitizeHtml(title);
    var sanitizedDescription = sanitizeHtml(description, {
      allowedTags:['h1']
    });      
    var list = template.List(request.list);
    var html = template.HTML(title, list, `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
      `<a href="/create">create</a> 
       <a href="/update/${sanitizedTitle}">update</a>
       <form action="/delete_process" method="post">
        <input type="hidden" name="id" value="${sanitizedTitle}">
        <input type="submit" value="delete">
       </form>
       `
      );
    response.send(html);
  });
});

app.get('/create', (request, response) => {
  var title = 'WEB - create';
  var list = template.List(request.list);
  var html = template.HTML(title, list, `
    <form action="/create_process" method="post">
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

app.post('/create_process', (request, response) => {

  var post = request.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`,description,'utf8',function(err){
    response.redirect(`/page/${title}`);
    response.send('sucess');
  });

});

app.get('/update/:pageId', (request, response) => {
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
    var title = request.params.pageId;
    var list = template.List(request.list);
    var html = template.HTML(title, list, 
      `<form action="/update_process" method="post">
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
      `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
    response.send(html);
  });  
});

app.post('/update_process', (request, response) => {
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  
  fs.rename(`data/${id}`,`data/${title}`,function(err) {
    console.log('Rename complete!');
    fs.writeFile(`data/${title}`,description,'utf8',function(err){
      response.redirect(`/page/${title}`);
    });
  });
});

app.post('/delete_process', (request, response) => {
  var post = request.body;
  var id = post.id;
  fs.unlink(`data/${id}`,function(err){
    response.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
