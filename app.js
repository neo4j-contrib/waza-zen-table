
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes/routes')
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

var ZEN_TABLE_TYPE=process.env.ZEN_TABLE_TYPE||"desktop"

var BAMBUSER_API_KEY=process.env.BAMBUSER_API_KEY

app.locals.bambuser_video=null;

var TABLES={ desktop: { width:270, height:206 }, coffee: { width:1063, height:629 }}
app.locals.table_size=TABLES[ZEN_TABLE_TYPE];

console.log("Using table type",ZEN_TABLE_TYPE,"size",app.locals.table_size)

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

app.put("/session",routes.new_session);
app.put('/session/:session', routes.make_active)
app.post('/session/:session', routes.add_data)
app.get('/session/:session', routes.get_data)
app.get('/session', routes.get_active_data)

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
