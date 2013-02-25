var assert = require("assert")
var rewire = require("rewire")
var table=rewire('../helpers/table');

describe('Table', function() {
	beforeEach(function(){
	})
	describe("#actionToCommands()", function() {
        function actionToCommands(action) {
            var res = table.actionToCommands(action);
            console.log(action,res);
            return res.commands
        }
		it('should return nothing for invalid command', function() {
            assert.deepEqual([],actionToCommands({action:"foo"}));
            assert.deepEqual([],actionToCommands({action:"line"}));
            assert.deepEqual([],actionToCommands({action:"line",x:10}));
            assert.deepEqual([],actionToCommands({action:"line",y:10}));
            assert.deepEqual([],actionToCommands({action:"move",x:10}));
            assert.deepEqual([],actionToCommands({action:"move",y:10}));
		})
		it('should return commands for valid actions', function() {
            assert.deepEqual(["Robot.Home"],actionToCommands({action:"home"}));
            assert.deepEqual(["Robot.LineTo(10,20)"],actionToCommands({action:"line",x:10,y:20}));
            assert.deepEqual(["Robot.LineTo(50,100)"],actionToCommands({action:"line",x:50,y:100}));
		})
		it('should return correct move commands', function() {
            assert.deepEqual(["Robot.LineTo(100,100)"],actionToCommands({action:"line",x:100,y:100}));
            assert.deepEqual(["Robot.MoveTo(50,80)"],
                actionToCommands({action:"move",x:50,y:80}));
		})
		it('should limit ranges for valid actions', function() {
            assert.deepEqual(["Robot.LineTo(0,0)"],actionToCommands({action:"line",x:-1,y:-100}));
            assert.deepEqual(["Robot.LineTo(270,206)"],actionToCommands({action:"line",x:5000,y:3000}));
		})
		it('should skip small movements', function() {
            assert.deepEqual(["Robot.LineTo(10,20)"],actionToCommands({action:"line",x:10,y:20}));
            assert.equal(true,table.actionToCommands({action:"line",x:11,y:21}).skip);
		})
	})
    describe("#update()", function() {
   		it('should add data for session', function() {
               table.update({active:'bar',data:[]});
               table.update({active:'bar',data:[{action:"home"}]},function(commands) {
                   assert.equal(1,commands.length)
                   assert.equal("home",commands[0].action)
               })
               assert.equal(1,table.__get__('lastCommandIndex'));
               assert.equal("home",table.__get__('commands')[0].action);

               table.update({active:'foo',data:[{action:"home"},{action:"line",x:100, y:100}]},function(commands) {
                   assert.equal(2,commands.length)
                   assert.equal("home",commands[0].action)
                   assert.equal("line",commands[1].action)
                   assert.equal(100,commands[1].x)
               })
               assert.equal(2,table.__get__('lastCommandIndex'));
               var commands=table.__get__('commands');
               assert.equal(2,commands.length)
               assert.equal("home",commands[0].action)
               assert.equal("line",commands[1].action)
               assert.equal(100,commands[1].x)
   		})
   		it('should clean for new session', function() {
               table.update({active:'xx',data:[]});
               table.update({active:'bar',data:[{action:"home"}]},function(commands) {
                   assert.equal("home",commands[0].action)
               })
               table.update({active:'foo',data:[]},function(commands) {
                   assert.deepEqual([],commands)
               })
   		})
   		})

//        describe("#writeActions()", function() {
//            it('should flatten data', function() {
//                var fun=table.writeToDeviceSynch
//                table.writeToDeviceSynch=function(device,commands) {
//                    assert.deepEqual(["Robot.Home","Robot.LineTo(10,10)"],commands)
//                }
//                table.writeActions(null,[{action:"home"},{action:"line",x:100, y:100}])
//                table.__set__("last",{x:100,y:100})
//                table.writeToDeviceSynch=function(device,commands) {
//                    assert.deepEqual(["Robot.MoveTo(100,0)","Robot.MoveTo(50,0)","Robot.MoveTo(50,80)"],commands)
//                }
//                table.writeActions(null,[{action:"move",x:500,y:800}])
//                table.writeToDeviceSynch=fun;
//            })
//        })
//    })
})