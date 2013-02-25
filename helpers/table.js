var serial = require('./serial')

var dimTable = { desktop: { width:270, height:206 }, coffee: { width:1063, height:629 }}["desktop"]; // desktop
var not_move_delta = 2;

var last = { x:0, y:0};
var session;
var commands;
var lastCommandIndex = 0;
var lastWrittenIndex = 0;
var device='/dev/ttyUSB0';

function flatten(arrays) {
    var merged = [];
    return merged.concat.apply(merged, arrays);
}

function isValidNumber(value) {
    return value != undefined && value != null && !isNaN(value);
}
function normalize(value, max) {
    if (!isValidNumber(value)) return null;
    return Math.max(0.0, Math.min(value, max));
}

function distance(p1,p2) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}
function routeViaBorder(target,current) {
    var borderY = (target.y < dimTable.height - target.y) ? 0 : dimTable.height;
    return [{x:current.x, y: borderY},
            {x: target.x, y: borderY},
            {x: target.x, y: target.y}];
}
function longDistance(target,current) {
    var route=routeViaBorder(target,current);
    return distance(current,route[0])+ distance(route[0],route[1])+distance(route[1],route[2]);
}

function inRange(p) {
    if (!isValidNumber(p.x) || !isValidNumber(p.y)) return false;
    return p.x>=0 && p.x <= dimTable.width && p.y>=0 && p.y <= dimTable.height;
}

// todo clear, other commands like wait?
exports.actionToCommands= function(action) {
    if (typeof action.commands != "undefined") return action;
    action.commands=[]
    var name = action['action'];
    if (name == "home") {
        action.x=0;action.y=0;
    }
    var x = normalize(parseInt(action["x"]), dimTable.width);
    var y = normalize(parseInt(action["y"]), dimTable.height);

    var target={x:x, y:y};
    if (!inRange(target)) return action;

    action.target=target;
    action.last={x:last.x, y:last.y};
    action.distance = distance(action.target,action.last);
    last.x = x;
    last.y = y;

    action.skip = action.distance < not_move_delta;

    if (name == "home") {
        action.distance = longDistance(action.target,action.last);
        action.commands=["Robot.Home"]
    } else
    if (name == "move") {
        action.distance = longDistance(action.target,action.last);
        action.commands = ["Robot.MoveTo(" + target.x + "," + target.y + ")"];
            // routeViaBorder(action.target,action.last).map(function(point) { return "Robot.MoveTo(" + point.x + "," + point.y + ")"; })
    } else
    if (name == "line") {
        action.commands=["Robot.LineTo(" + target.x + "," + target.y + ")"];
    }
    console.log(action)
    return action;
}

var nextActionTimeout;

exports.writeNextAction = function() {
    clearTimeout(nextActionTimeout);
    if (lastWrittenIndex>=commands.length) return;
    var action = commands[lastWrittenIndex];
    lastWrittenIndex++;
    var action = exports.actionToCommands(action);
    if (action.skip) return;
    action.commands.forEach(function(command) {
        writeToPort(command);
    });
    writeToPort("Robot.GetState");
}

var readPort=function(line) {
    console.log("line",line);
    if (line == "<ok>") return;
    if (line.trim()[0]=="{") {
        var state = JSON.parse(line.replace(/'/g,'"')); // queueSlotsFilled queueSlotsAvailable isMoving
        var timeout = state.queueSlotsAvailable>0 ? 0 : 1000;
        nextActionTimeout = setTimeout(exports.writeNextAction, timeout);
    }
};

var port;

exports.init=function(device) {
    port=serial.connectPort(device,readPort);
}

function writeToPort(command,next) {
    console.log("Writing",command);
    port.write(command+"\n",function(err,written) {
        if (err) {
            console.log("Error writing",command,err);
        }
        if (next) next();
    })
}

exports.update = function (data, fun) {
    if (data.active != session) {
        // clear
        session = data.active;
        lastCommandIndex = 0;
        lastWrittenIndex = 0;
    } else {
    }
    commands = data.data;
    var newCommands = commands.slice(lastCommandIndex);
    lastCommandIndex = commands.length;
    if (newCommands.length>0) {
        newCommands.forEach(exports.actionToCommands);
        if (fun) fun(newCommands);
    }
};
