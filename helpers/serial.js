var serialport = require("serialport")

exports.connectPort = function(device,cb,err) {
    var port = new serialport.SerialPort(device,{ baudrate: 115200 });
    port.on("open", function () {
        console.log('open');
        var res="";
        port.on('data', function(data) {
            // console.log('data received: ',data,data.toString());
            res+=data.toString();
            var cr=res.indexOf("\r");
            if (cr!=-1) {
                var line=res.substring(0,cr);
                res=res.substring(cr+1);
                if (cb) cb(line);
            }
        });
        port.on('error', function(data) {
            console.log('error ' + data);
            if (err) err(data);
        });
        port.on('close', function(data) {
            console.log('close ' + data);
        });
    });
    return port;
}
