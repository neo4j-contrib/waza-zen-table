
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')


var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});


app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/draw', routes.draw);

var current_session = null;
var ZEN_TABLE_HOST=process.env.ZEN_TABLE_HOST||"localhost";
var BAMBUSER_API_KEY=process.env.BAMBUSER_API_KEY

app.locals.bambuser_video=null;

http.get({host:"api.bambuser.com", path: "/broadcast.json?username=neo4j&type=live&limit=3&api_key="+BAMBUSER_API_KEY}, function(res) {
	if (res.statusCode==200) {
		res.setEncoding('utf-8');
		var content="";
		res.on('data',function(data) { content += data.toString(); })
		res.on('end',function() { 
			var data=JSON.parse(content)['result']; 
			if (data) {
			  data
			   .filter(function(vid) { return vid.title.match("[Zz]en") })
			   .sort(function(v1,v2) {return v2.created - v1.created })
			   .forEach(function(vid) { app.locals.bambuser_video=vid.vid; });
			   console.log(app.locals.bambuser_video)
			}
		})
	}
}).end();

// session id as key, array of commands as values, to replay and also for websocket push to all clients
var sessions = {}

app.post('/table', function(req,res) {
	// todo session handling, only one session active ever 5 mins or until it sent end !
	var session=req.param("session");
	var suffix = req.url.split(/\?/)[1];
	var opts = { host: ZEN_TABLE_HOST , port:3001, path : "/?" + suffix, method:"POST"}
	console.log("Sending",opts)
	var req2=http.request(opts,function(res2,err) {
		// todo consume body?, accept
		// res2.setEncoding('utf-8')
		console.log("Send  Status",res2.statusCode,err)
		var data=""
		res2.on('data',function(buf) {
			data += buf.toString();
		})
		res2.on('end',function() {
			console.log("Send  Data",res2.statusCode,data)
			res.send(res2.statusCode,data);
		})
	})
	req2.on('error',function(err) {
		console.log("req error",err)
		 res.send(500,err) 
	})
	req2.end();
})
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
