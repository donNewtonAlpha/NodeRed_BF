module.exports = function(RED) {
   var http=require('https');

   function connect(node){ 

    
   }
    function AttSmsNode(config) {
        this.context = {global:RED.settings.functionGlobalContext || {}};
        RED.nodes.createNode(this,config);
        var node = this;
        this.name=config.name;
        this.numbers=config.numbers;
        this.message=config.message;
        this.blackflag=config.blackflag;
        this.on('input', function(msg) {
              if(msg.payload.numbers)
                 this.numbers=msg.payload.numbers;
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
              var headers={ 'content-type': 'application/json',
                            'accept': 'application/json' };
              headers.Authorization="Bearer "+this.context.global[this.blackflag];
              var options = {
                 hostname: 'api.att.com',
                 port: 443,
                 path: '/rest/sms/2/messaging/outbox',
                 method: 'POST'
              };
              options.headers=headers;
              var req=http.request(options,function(res){
                 res.setEncoding('utf8');
                 res.on('data',function(chunk){
                    console.log("Response: "+chunk);
                    msg.payload=chunk;
                    node.send(msg);
                 });
              });
              req.on('error',function(e){
                 console.log('problem with request: ' +e.message);
              });
              req.write(sms_message);
              req.end();
        });
    }
    RED.nodes.registerType("ATT SMS",AttSmsNode);
}
