var formidable = require('formidable');
var http=require('http');
var fs=require('fs');
http.createServer(function(request, response) {
  var rm = request.method.toLowerCase();
  var callback="";
  var filename="";
  if(request.url === '/upload' && rm === 'post') {
    var form = new formidable.IncomingForm();
    form.uploadDir = process.cwd();
    var resp = "";
    form
    .on("file", function(field, File) {
      
      var date=new Date().getTime();
      var newName=process.cwd()+"/tmp/"+File.name;
      filename=newName;
      fs.renameSync(File.path,newName);

    })
    .on("field", function(field, value) {
       if(field=="callback"){
          callback=value;
       }
    })
    .on("end", function() {
      resp+='<meta http-equiv="refresh" content="0; url='
      resp+=callback;
      resp+="?filename=";
      resp+=filename;
      resp+='">"';
      response.writeHead(200, {'content-type': 'text/html'});
      response.end(resp);
    })
    .parse(request);
    return;
  }
}).listen(7999);

