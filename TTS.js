function TextToSpeechNode(config){
   var http=require('https');
   var fs=require('fs');
   this.context = {global:RED.settings.functionGlobalContext || {}};
   RED.nodes.createNode(this,config);
   var node = this;
   this.name=config.name;
   this.text=config.text;
   this.tmp_dir=config.tmp_dir;
   this.blackflag=config.blackflag;
   var wav=new Buffer(100000);


    this.on('input', function(msg) {
          if(msg.payload.text)
             this.text=msg.payload.text;
          if(msg.tmp_dir)
             this.tmp_dir=msg.tmp_dir;
          console.log("tmp_dir  "+this.tmp_dir);
          console.log("msg.text "+msg.text);
          console.log("this.text "+this.text);

          var headers={ 'Content-Type': 'text/plain', 'Accept': 'audio/x-wav','Content-Length':this.text.length };
          headers.Authorization="Bearer "+this.context.global[this.blackflag];
          console.log(headers);
           var options = {
              hostname: 'api.att.com',
              port: 443,
              path: '/speech/v3/textToSpeech',
              method: 'POST'
           };

              var file_name="";
              file_name+=this.tmp_dir;
              var date=new Date().getTime();
              var short_name="";
              short_name+=date.toString()+".wav";
              file_name+="/"+short_name;
             
           options.headers=headers;
           var req=http.request(options,function(res){
           var i=0;
           res.on('data',function(chunk){
                 fs.appendFileSync(file_name,chunk);
                 console.log("got a chunk");
                 if(i==0){ 
                    msg.payload.audio_file=short_name;
                    node.send(msg);
                    i=1;
                 }
              });
           });
           req.on('error',function(e){
              console.log('problem with request: ' +e.message);
           });
           console.log(this.text);
           req.write(this.text);
           req.end();


                  // do something with 'msg' 
          });
}
RED.nodes.registerType("T SPEECH",TextToSpeechNode);
