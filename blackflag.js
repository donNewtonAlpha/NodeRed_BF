module.exports = function(RED) {
   var http=require('https');

   function connect(node){ 
      var scope="";
      var level=0;
      var chunk;
      
      if(node.speech){
         scope+="SPEECH,TTS";
         level++;
      }
      if(node.advert){
         if(level>0)
            scope+=',';
         scope+="ADS";
         level++;
      }
      if(node.inapp){
         if(level>0)
            scope+=",";
         scope+="IMMN";
      }
      if(node.sms){
         if(level>0)
            scope+=",";
         scope+="SMS,MMS";
      }
      if(node.billing){
         if(level>0)
            scope+=',';
         scope+="PAYMENT";
      }
      var options = {
        hostname: 'api.att.com',
        port: 443,
        path: '/oauth/token',
        method: 'POST'
      };
     
      var body="client_id="+node.key+"&client_secret="+node.secret+"&scope="+scope+"&grant_type=client_credentials";
      console.log("BODY"+body);
      var req=http.request(options,function(res){
            res.setEncoding('utf8');
            res.on('data',function(chunk){
               console.log("Response: "+chunk);
               var msg=new Object();
               
               var token=JSON.parse(chunk).access_token;
               var token_name=node.name;
               
               node.context.global[token_name]=token;
               msg.payload=token_name+":"+token;

               node.status({fill:"green",shape:"dot",text:"connected"});
               node.send(msg);
            });
      });
      req.on('error',function(e){
            console.log('problem with request: ' +e.message);
      });
      req.write(body);
      req.end();
   }
    function BlackFlagNode(config) {
        this.context = {global:RED.settings.functionGlobalContext || {}};
        RED.nodes.createNode(this,config);
        this.status({fill:"red",shape:"ring",text:"disconnected"});
        var node = this;
        this.name=config.name;
        this.key=config.key;
        this.secret=config.secret;
        this.advert  = config.advert;
        this.speech  = config.speech;
        this.inapp   = config.inapp;
        this.sms     = config.sms;
        this.billing = config.billing;
        setImmediate(connect,node);
        this.on('input', function(msg) {
            msg.payload = "";
            node.send(msg);
        });
    }
    RED.nodes.registerType("BlackFlag",BlackFlagNode);
}
