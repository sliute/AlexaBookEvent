var fs = require('fs');


fs.readFile('test.js', 'utf8', function(err, data){
  if (err) {
    console.log(err);
  } else {
    obj = JSON.parse(data);
    obj.table.push({"name":"Ben"});
    json = JSON.stringify(obj);
    fs.writeFile('test.js', json, 'utf8');
  }
})
