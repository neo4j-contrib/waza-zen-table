
/**
 * Standalone Zen-Table webserver
 */

var express = require('express')
    , http = require('http')
    , request = require('request')
    , table = require('./helpers/table');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3001);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

var WEBAPP=process.env.WEBAPP||"http://zen-table.herokuapp.com";
var device = process.env.ZEN_TABLE || '/dev/ttyUSB0';

table.init(device);

function poll() {
    request(WEBAPP+"/session", { headers: { accept:"application/json"}},function(error, res, body) {
		if (error) {
			console.log(error);
			return;
		} 
        var data = JSON.parse(body);
        table.update(data,function(actions) {
            console.log("Writing actions",actions)
            table.writeNextAction()
        });
    })
}
poll();
setInterval(poll,10000);

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.post('/', function(req,res) {
    var count=table.writeActions(device,[{action:req.param("action"),x:req.param("x"),y:req.param("y")}]);
    if (!count) return res.send(200,"Not moved");
    return res.send(200,"Moved "+count+" commands");
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
