module.exports = function(RED) { 
   function sTextNode(config) {
         var http=require('https');
         var fs=require('fs');
         this.context = {global:RED.settings.functionGlobalContext || {}};
         RED.nodes.createNode(this,config);
         var node = this;
         this.blackflag=config.blackflag;
         this.format=config.format;
         this.filename=config.filename;
         this.on('input', function(msg) {
             if(msg.payload.filename)
                this.filename=msg.payload.filename;
             if(msg.payload.format)
                this.format=msg.payload.format;
             console.log("here");
             console.log(this.filename);


             var headers={  'Accept': 'application/json'};
             headers["Content-Type"]="audio/"+this.format;

             headers.Authorization="Bearer "+this.context.global[this.blackflag];
             console.log(headers);
              var options = {
                 hostname: 'api.att.com',
                 port: 443,
                 path: '/speech/v3/speechToText',
                 method: 'POST'
              };

              options.headers=headers;
              var buf=fs.readFileSync(this.filename);
              var req=http.request(options,function(res){
              var i=0;
              var results="";
              res.on('data',function(chunk){
                    console.log("got a chunk" + chunk);
                    results=chunk.toString();
                    console.log(results);
                    msg.payload=results;
                    node.send(msg);
                    
                 });
              });
              req.on('error',function(e){
                 console.log('problem with request: ' +e.message);
              });
              req.write(buf);
              req.end();



        });
    }
    RED.nodes.registerType("S TEXT",sTextNode);
}
