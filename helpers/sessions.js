var ShortId = require('shortid');

var TIMEOUT=3*60*1000;

exports.Session = function() {
    var sessions = {};
    var current = null;
    return {
        newSession : function() {
            var id=ShortId.generate();
            this.active(id);
            return id;
        },
        data : function(id) {
            return sessions[id]||[];
        },
        hasSession : function(id) {
            return sessions.hasOwnProperty(id);
        },
        addData : function(id,data) {
            if (id && data && data.length && this.active(id)==id) {
                sessions[id]=sessions[id].concat(data);
                return sessions[id];
            }
            return []; // todo exception?
        },
        active : function(id) {
            if (id && current==null && !sessions[id]) {
				current=id;
                sessions[id]=[];
                setTimeout(function() { current = null;},TIMEOUT);
			}
            return current;
        },
    }
}
