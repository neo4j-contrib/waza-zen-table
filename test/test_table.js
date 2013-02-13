var assert = require("assert")
var rewire = require("rewire")
var table=rewire('../helpers/table');

describe('Table', function() {
	beforeEach(function(){
	})
	describe("#actionToCommands()", function() {
		it('should return nothing for invalid command', function() {
            assert.deepEqual([],table.actionToCommands({action:"foo"}));
            assert.deepEqual([],table.actionToCommands({action:"line"}));
            assert.deepEqual([],table.actionToCommands({action:"line",x:10}));
            assert.deepEqual([],table.actionToCommands({action:"line",y:10}));
            assert.deepEqual([],table.actionToCommands({action:"move",x:10}));
            assert.deepEqual([],table.actionToCommands({action:"move",y:10}));
		})
		it('should return commands for valid actions', function() {
            assert.deepEqual(["Robot.Home"],table.actionToCommands({action:"home"}));
            assert.deepEqual(["Robot.LineToSmooth(1,2)"],table.actionToCommands({action:"line",x:10,y:20}));
            assert.deepEqual(["Robot.LineToSmooth(5,10)"],table.actionToCommands({action:"line",x:50,y:100}));
		})
		it('should return correct move commands', function() {
            assert.deepEqual(["Robot.LineToSmooth(100,100)"],table.actionToCommands({action:"line",x:1000,y:1000}));
            assert.deepEqual(["Robot.MoveTo(100,0)","Robot.MoveTo(50,0)","Robot.MoveTo(50,80)"],
                table.actionToCommands({action:"move",x:500,y:800}));
		})
		it('should limit ranges for valid actions', function() {
            assert.deepEqual(["Robot.LineToSmooth(1,1)"],table.actionToCommands({action:"line",x:-1,y:-100}));
            assert.deepEqual(["Robot.LineToSmooth(270,206)"],table.actionToCommands({action:"line",x:5000,y:3000}));
		})
		it('should skip small movements', function() {
            assert.deepEqual(["Robot.LineToSmooth(1,2)"],table.actionToCommands({action:"line",x:10,y:20}));
            assert.deepEqual([],table.actionToCommands({action:"line",x:15,y:23}));
		})
	})
    describe("#update()", function() {
   		it('should add data for session', function() {
               table.update({active:'bar',data:[{action:"home"}]},function(commands) {
                   assert.deepEqual([{action:"home"}],commands)
               })
               assert.equal(1,table.__get__('lastCommandIndex'));
               assert.deepEqual([{action:"home"}],table.__get__('commands'));

               table.update({active:'foo',data:[{action:"home"},{action:"line",x:100, y:100}]},function(commands) {
                   assert.deepEqual([{action:"line",x:100, y:100}],commands)
               })
               assert.equal(2,table.__get__('lastCommandIndex'));
               assert.deepEqual([{action:"home"},{action:"line",x:100, y:100}],table.__get__('commands'));
   		})
   		it('should clean for new session', function() {
               table.update({active:'xx',data:[]}); 
               table.update({active:'bar',data:[{action:"home"}]},function(commands) {
                   assert.deepEqual([{action:"home"}],commands)
               })
               table.update({active:'foo',data:[]},function(commands) {
                   assert.deepEqual([],commands)
               })
   		})
        
        describe("#writeActions()", function() {
            it('should flatten data', function() {
                var fun=table.writeToDeviceSynch
                table.writeToDeviceSynch=function(device,commands) {
                    assert.deepEqual(["Robot.Home","Robot.LineToSmooth(10,10)"],commands)
                }
                table.writeActions(null,[{action:"home"},{action:"line",x:100, y:100}])
                table.__set__("last",{x:100,y:100})
                table.writeToDeviceSynch=function(device,commands) {
                    assert.deepEqual(["Robot.MoveTo(100,0)","Robot.MoveTo(50,0)","Robot.MoveTo(50,80)"],commands)
                }
                table.writeActions(null,[{action:"move",x:500,y:800}])
                table.writeToDeviceSynch=fun;
            })
        })        
    })    
})