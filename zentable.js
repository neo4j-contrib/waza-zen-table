
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

function writeToDeviceSynch(device,command) {
    var buf = new Buffer("\n"+command+"\n", 'ascii');

    console.log ("Writing "+command+" to " + device);

    var fd = fs.openSync (device, 'r+');
    var bytesWritten = 0;
    if (fd) {
        try {
            bytesWritten = fs.writeSync (fd, buf, 0, buf.length, -1);

	        if (bytesWritten) {
	            console.log ("Wrote "+command+" to "+device);
			    var read=new Buffer(10,'ascii');
				var bytesRead=fs.readSync(fd,read,0,4,-1);
		        fs.closeSync (fd);
				console.log("Read "+read.toString()+" "+bytesRead);
			    return true;
	        }
	        else {
	            console.log ("An error occured writing to "+device);
				return false;
	        }
        }
        catch (e) {
            fs.closeSync (fd);
            console.log ('Error Writing to file: '+ device,e);
            return false;
        }
    }
    else {
        console.log ("An error occured while opening "+device);
		return false;
    }
}

function writeTable(command,fun) {
	var succ=writeToDeviceSynch(table,command);
	fun(succ);
}

function tableResponse(res) {
	return function(succ) {
		if (succ) {
			res.send(200,"Ok");
		} else {
			res.send(500,"Error writing "+command);
		}
	}
}

var dim = { x : 2700, y:2060 }
function normalize(x,max) {
	return Math.max(10.0,Math.min(x, max)) / 10.0;
}
function distance (x,y) {
	return Math.sqrt((x-last.x)*(x-last.x)+(y-last.y)*(y-last.y));
}
var not_move_delta=1;

app.post('/', function(req,res) {
	var action=req.param("action");
	if (action=="home") {
		return writeTable("Robot.Home",tableResponse(res));
	}
	var x=normalize(parseInt(req.param("x")),dim.x);
	var y=normalize(parseInt(req.param("y")),dim.y);
	if (distance(x,y)<not_move_delta) {
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
