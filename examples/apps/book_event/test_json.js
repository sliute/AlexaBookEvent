var fs = require('fs');

var obj = {};
obj.table = [];

obj.table.push({"name":"Edyta"});

var json = JSON.stringify(obj);

fs.writeFile('test.js', json, 'utf8');

fs.readFile('test.js', 'utf8', function(err, data){
  if (err) {
    console.log(err);
  } else {
    obj = JSON.parse(data);
    obj.table.push({"name":"Irene"});
    json = JSON.stringify(obj);
    fs.writeFile('test.js', json, 'utf8');
  }
})
