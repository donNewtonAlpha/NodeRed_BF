module.exports = function(RED) {
   var http=require('https');
   function parseResponse(response){
      var tmpResponse=response.replace(/<a href.*a>/,"content");
      var theResponse=JSON.parse(tmpResponse);
      if(theResponse.AdsResponse.Ads.Type=="image"){
         var content="<a href=\""+theResponse.AdsResponse.Ads.ClickUrl+"\"><img src=\""+theResponse.AdsResponse.Ads.ImageUrl.Image+"\"/></a>";
         theResponse.AdsResponse.Ads.Content=content;

      }else if(theResponse.AdsResponse.Ads.Type=="thirdparty"){
         //JSON.parse chokes on the format 
         var spot=response.search(/<a href/);
         var end=response.search(/a>/);
         var content=response.slice(spot,end+2).replace(/\\\//g,"/").replace(/\\\"/g,"\"") ;
         console.log("content:  "+content);
         theResponse.AdsResponse.Ads.Content=content;
      }else{
      }
   return theResponse;

}


    function AttAdsNode(config) {
        this.context = {global:RED.settings.functionGlobalContext || {}};
        RED.nodes.createNode(this,config);
        var node = this;
        this.name=config.name; 
        this.blackflag=config.blackflag;
        var fields=["Category","AgeGroup","Gender","ZipCode","City","AreaCode","Country","Latitude","Longitude","Keywords"];
        

        this.on('input', function(msg) {
           for(i=0;i<fields.length;i++){
              if(msg[fields[i]])
                 this[fields[i]]=msg[fields[i]];
              else
                 this[fields[i]]=config[fields[i]];
           }

           var QueryString="?";
           for(i=0;i<fields.length;i++){
              if(this[fields[i]].length>0){
                 if(i>0)
                    QueryString+="&";
                 QueryString+=fields[i]+"="+this[fields[i]];
              }
            }
            console.log(QueryString);
            var headers={ 'content-type': 'application/json',
                            "UDID":"donnewton111111111111111111111",
                            "Accept":"application/json",
                            "User-Agent": "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"};
            headers.Authorization="Bearer "+this.context.global[this.blackflag];
            var options = {
                 hostname: 'api.att.com',
                 port: 443,
                 path: '/rest/1/ads',
                 method: 'GET'
            };
            options.headers=headers;
            options.path+=QueryString;
            console.log(options);
            console.log(options.path);

            var req=http.get(options,function(res){
                 res.setEncoding('utf8');
                 res.on('data',function(chunk){
                    var response=parseResponse(chunk);
                    msg.AdResponse=response;
                    msg.payload=response.AdsResponse.Ads.Content;
                    console.log(msg.payload);
                   node.send(msg);
                 });
              });
              req.on('error',function(e){
                 console.log('problem with request: ' +e.message);
              });
         });
    }
    RED.nodes.registerType("ATT ADS",AttAdsNode);
}
