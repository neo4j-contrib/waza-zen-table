
/**
 * Standalone Zen-Table webserver
 */

var express = require('express')
  , http = require('http')
  , fs = require('fs')


var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3001);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});


app.configure('development', function(){
  app.use(express.errorHandler());
});

var table = process.env.ZEN_TABLE||'/dev/tty.usbserial'

var last = { x: 0, y: 0};

function writeTable(command,fun) {
	console.log("writing",command);
	fs.writeFile(table, command, function(x) {
		console.log("write-result",x);
	})
	fs.readFile(table,fun);
}

function tableResponse(res) {
	return function(text) {
		console.log("read",text);
		res.send(200,text);
	}
}

var dim = { x : 2700, y:2060 }
function normalize(x,max) {
	return Math.max(10.0,Math.min(x, max)) / 10.0;
}
function distance (x,y) {
	return Math.sqrt((x-last.x)*(x-last.x)+(y-last.y)*(y-last.y));
}
app.post('/', function(req,res) {
	var action=req.param("action");
	if (action=="home") {
		return writeTable("Robot.Home",tableResponse(res));
	}
	var x=normalize(parseInt(req.param("x")),dim.x);
	var y=normalize(parseInt(req.param("y")),dim.y);
	if (distance(x,y)<5) {
		last.x=x;last.y=y;
		return res.send(200,"Not moved");
	}
	last.x=x;last.y=y;
	if (action=="move") {
		return writeTable("Robot.MoveTo("+x+","+y+")",tableResponse(res));
	}
	if (action=="line") {
		return writeTable("Robot.LineToSmooth("+x+","+y+")",tableResponse(res));
	}
	return res.send(404,"Unknown command "+res.url);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
