module.exports = function(RED) {
   var request=require("request");
   var scope="";
   function connect(node){ 
      var level=0;
      var chunk;
      scope="";
      
      if(node.speech){
         scope+="SPEECH";
         level++;
      }
      if(node.tts){
         if(level>0)
            scope+=',';
         scope+="TTS";
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
         scope+="SMS";
      }
      if(node.mms){
         if(level>0)
            scope+=",";
         scope+="MMS";
      }
      if(node.billing){
         if(level>0)
            scope+=',';
         scope+="PAYMENT";
      }
      var headers={
         'User-Agent':'AT&T Breeze Agent',
         'Content-Type':'application/x-www-form-urlencoded'
      }
      var options = {
         url: 'https://api.att.com/oauth/v4/token',
         method: 'POST',
         headers: headers,
         form: {'client_id': node.key, 'client_secret': node.secret,'scope':scope,'grant_type':'client_credentials'}

      };
      request(options,function(error,response,body){
            var msg=new Object();
            if(!error&&response.statusCode==200){
               var token=JSON.parse(body).access_token;
               var token_name=node.name;
               
               node.context.global[token_name]=token;
               msg.payload=token_name+":"+token;

               node.status({fill:"green",shape:"dot",text:"connected"});
               node.send(msg);
            }else{
               msg.payload="ERROR:"+response.error +" Scope: "+scope;
               node.send(msg);
               return;
            }
      });
     
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
        this.tts  = config.tts;
        this.inapp   = config.inapp;
        this.sms     = config.sms;
        this.mms     = config.mms;
        this.billing = config.billing;
        setImmediate(connect,node);
        this.on('input', function(msg) {
            msg.payload = "";
            node.send(msg);
        });
    }
    RED.nodes.registerType("BlackFlag",BlackFlagNode);
}
