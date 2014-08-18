module.exports = function(RED) {
   var http=require('https');

   function getMimeType(filename){ 
      var pos=filename.lastIndexOf(".");
      var ext=filename.substring(pos+1);
      switch(ext){
         case "jpg":
         case "jpeg":
            return "image/jpeg";
         case "gif":
            return "image/gif";
         case "wav":
            return "audio/x-wav";
      }
   }
    function AttSmsNode(config) {
        this.context = {global:RED.settings.functionGlobalContext || {}};
        RED.nodes.createNode(this,config);
        var node = this;
        this.name=config.name;
        this.numbers=config.numbers;
        this.filename=config.filename;
        this.message=config.message;
        this.blackflag=config.blackflag;
        this.on('input', function(msg) {
              if(msg.numbers)
                 this.numbers=msg.numbers;
              if(msg.payload.filename)
                 this.filename=msg.payload.filename;
              if(msg.payload.message)
                 this.message=msg.payload.message;

              if(this.numbers.length==0){
                   msg.payload="No numbers to send to";
                   node.send(msg);
                   return;
              }
              var numbersArray=this.numbers.split(',');
              var numberString="";
              if(numbersArray.length==1){
                 numberString='"tel:'+numbersArray[0]+'"';
              }else{
                 numberString+="[";

                 for(var i=0;i<numbersArray.length;i++){
                    if(i>0)
                       numberString+=",";
                    numberString+='"tel:'+numbersArray[i]+'"';
                  }
                 numberString+="]";
              }
              var sms_message=' {"Message":"'+this.message+'","Address":'+numberString+'}';
              console.log(sms_message);
              var headers={ 'Content-Type': 'multipart/related;type="application/json";start="<startpart>"; boundary="foo"',
                            'accept': 'application/json' ,
                            'MIME-Version':'1.0'
                             };
              headers.Authorization="Bearer "+this.context.global[this.blackflag];
              var pos=this.filename.lastIndexOf("/");
              var shortName=this.filename.substring(pos+1);
              var mimeType=getMimeType(shortName);
              var buf=fs.readFileSync(this.filename);
              var options = {
                 hostname: 'api.att.com',
                 port: 443,
                 path: '/rest/mms/v3/messaging/outbox',
                 method: 'POST'
              };
              options.headers=headers;
              var req=http.request(options,function(res){
                 res.setEncoding('utf8');
                 res.on('data',function(chunk){
                    console.log("Response: "+chunk);
                    var msg=new Object(); 
                    msg.payload=chunk;
                    node.send(msg);
                 });
              });
              req.on('error',function(e){
                 console.log('problem with request: ' +e.message);
              });
              var pos=this.filename.lastIndexOf("/");
              var shortName=this.filename.substring(pos+1);
              var mimeType=getMimeType(shortName);
              var buf=fs.readFileSync(this.filename);
              


              req.end();
        });
    }
    RED.nodes.registerType("ATT MMS",AttSmsNode);
}
