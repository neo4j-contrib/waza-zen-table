var fs = require('fs');

var dim = { x:2700, y:2060 };
var dimTable = {x:normalize(dim.x, dim.x), y:normalize(dim.y, dim.y)};
var not_move_delta = 1;

var last = { x:0, y:0};
var session;
var commands;
var lastCommandIndex = 0;

// todo async functions, keep fd open for the whole lifetime?
exports.writeToDeviceSynch = function (device, commands) {
    console.log("Writing " + commands + " to " + device);
    if (!device || !commands || commands.length==0) return false;
    var fd = fs.openSync(device, 'w+');
    if (!fd) {
        console.log("An error occured while opening " + device);
        return false;
    }
    try {
        var bytesWritten = 0;
        for (var i = 0; i < commands.length; i++) {
            var buf = new Buffer("\n" + commands[i] + "\n", 'ascii');
            bytesWritten += fs.writeSync(fd, buf, 0, buf.length, -1);
        }
        fs.closeSync(fd);
        if (bytesWritten) {
            console.log("Wrote " + commands + " to " + device);
            return true;
        }
        else {
            console.log("An error occured writing to " + device);
            return false;
        }
    }
    catch (e) {
        try {
            fs.closeSync(fd);
        } catch(e2) {}
        console.log('Error Writing to file: ' + device, e);
        return false;
    }
};
exports.update = function (data, fun) {
    if (data.active != session) {
        // clear
        session = data.active;
        lastCommandIndex = 0;
    } else {
    }
    commands = data.data;
    if (fun) fun(commands.slice(lastCommandIndex));
    lastCommandIndex = commands.length;
};

exports.writeActions = function (device, actions) {
    var commands = flatten(actions.map(exports.actionToCommands));
    exports.writeToDeviceSynch(device, commands);
    return commands.length;
};

function flatten(arrays) {
    var merged = [];
    return merged.concat.apply(merged, arrays);
}

function normalize(value, max) {
    if (value==undefined || value==null) return null;
    return Math.max(10.0, Math.min(value, max)) / 10.0;
}

function distance(x, y) {
    return Math.sqrt((x - last.x) * (x - last.x) + (y - last.y) * (y - last.y));
}
// todo clear, other commands like wait?
exports.actionToCommands= function(action) {
    var name = action['action'];
    if (name == "home") {
        last = { x:0, y:0}; // todo here or in write to device?
        return ["Robot.Home"];
    }
    var x = normalize(parseInt(action["x"]), dim.x);
    var y = normalize(parseInt(action["y"]), dim.y);
    if (!x || !y) return [];
    var lastCopy = {x:last.x, y:last.y};
    if (distance(x, y) < not_move_delta) {
        last.x = x;
        last.y = y;
        return [];
    }
    last.x = x;
    last.y = y;
    if (name == "move") {
        var borderY = (y < dimTable.y - y) ? 0 : dimTable.y;
        return ["Robot.MoveTo(" + lastCopy.x + "," + borderY + ")",
            "Robot.MoveTo(" + x + "," + borderY + ")",
            "Robot.MoveTo(" + x + "," + y + ")"];
    }
    if (name == "line") {
        return ["Robot.LineToSmooth(" + x + "," + y + ")"];
    }
    return [];
}

