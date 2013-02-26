var sessions=require("../helpers/sessions").Session();

exports.index = function(req, res){
  res.render('index', { title: 'Waza Zen-Table' });
};

exports.draw = function(req, res){
  res.render('draw', { title: 'Drawing Pad - Waza Zen-Table' });
};

exports.new_session = function(req,res) {
    res.send(200, {id:sessions.newSession(), active:sessions.active()});
};

function checkActive(req,res,fun) {
    var current=sessions.active();
    var session=req.params["session"];
    if (!session) {
        return res.send(400,{error:"No session id",active:current});
    }
    if (sessions.active(session)!=session) {
        return res.send(400, {error:"Session not active "+session,active:current});
    }
    fun(session,current);
}
exports.get_data = function(req,res) {
    checkActive(req,res,function(session,current) {
        return res.send(200,{active:current,data:sessions.data(current)}); // perhaps a bit verbose
    })
}

exports.get_active_data = function(req,res) {
    var current=sessions.active();
    res.send(200,{active:current,data:sessions.data(current)});
}

exports.get_active = function(req,res) {
    var current=sessions.active();
    return res.send(200,{active:current,data:sessions.data(current)});
}

exports.make_active = function(req,res) {
    checkActive(req,res,function(session,current) {
        sessions.active(session);
        return res.send(200,{active:sessions.active()});
    })
}

exports.add_data = function(req,res) {
    checkActive(req,res, function(session,current) {
        var data=req.body;
        if (!data || !data.length) {
            return res.send(400, {error:"No array data for "+session,active:current,data:data});
        }
        var commands = data.map(function(command) { 
            var action=command['action']; 
            if (action=="home") return {action:"home"};
            if ((action=="line" || action=="move") && command['x'] && command['y'])
                return {action:action, x:parseInt(command['x']),y:parseInt(command['y'])};
            return null;
        }).filter(function(x) { return x !=null});
        var size=sessions.addData(session,commands).length;
		console.log("data",data,commands,size)
        return res.send(200,{active:current,size:size});
    })
};

