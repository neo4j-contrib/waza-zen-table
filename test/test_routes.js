var assert = require("assert")
var rewire = require("rewire")

var s=rewire('../helpers/sessions');
var Session= s.Session;
var routes = rewire("../routes/routes");

describe('Routes', function() {
	var session;
	beforeEach(function(){
		session=new Session();
		routes.__set__("sessions", session);
	})
	describe("#new_session", function() {
		it('should return a new id and make it active', function() {
			var id=routes.new_session(null,{send:function(status,data) {
				assert.equal(200,status);
				assert.deepEqual({id:session.active(), active:session.active()},data)
			}});
		})
		it('should return a new id and not make it active if there is already an active one', function() {
			session.active('foo')
			var id=routes.new_session(null,{send:function(status,data) {
				assert.equal(200,status);
				assert.ok(data.id.length>8);
				assert.deepEqual({id:data.id, active:'foo'},data)
			}});
		})
	});
	describe("#get_active", function() {
		it('get the active id (null) and data []', function() {
			var id=routes.get_active(null,{send:function(status,data) {
				assert.equal(200,status);
				assert.deepEqual({active:null,data:[]},data)
			}});
		})
		it('get the active id and data', function() {
			session.addData('foo',[1,2,3]);
			var id=routes.get_active(null,{send:function(status,data) {
				assert.equal(200,status);
				assert.deepEqual({active:'foo',data:[1,2,3]},data)
			}});
		})
	});
	describe("#make_active", function() {
		it('should make the posted id active', function() {
			var id=routes.make_active({ params: { session:'bar'}},{send:function(status,data) {
				assert.equal(200,status);
				assert.deepEqual({active:'bar'},data)
			}});
		})
		it('should not make the posted id active', function() {
			session.active('foo')
			var id=routes.make_active({ params: { session:'bar'}},{send:function(status,data) {
				assert.equal(400,status);
				assert.deepEqual({"error":"Session not active bar","active":"foo"},data)
			}});
		})
		it('should not make the posted id active', function(done) {
			s.__set__('TIMEOUT',0);
			session.active('foo')
			setTimeout(function() {
				var id=routes.make_active({ params: { session:'bar'}},{send:function(status,data) {
					assert.equal(200,status);
					assert.deepEqual({active:'bar'},data)
				}});
				done();
			},1);
		})
	});
	describe("#add_data", function() {
		it('should not accept data for an undefined session', function() {
			session.active('foo')
			var id=routes.add_data({ params:{}},{send:function(status,data) {
				assert.equal(400,status);
				assert.deepEqual({"error":"No session id","active":"foo"},data)
			}});
		});
		it('should not accept data for an inactive session', function() {
			session.active('foo')
			var id=routes.add_data({ params: { session:'bar'}},{send:function(status,data) {
				assert.equal(400,status);
				assert.deepEqual({error:"Session not active bar",active:"foo"},data)
			}});
		})
		it('should not accept data for an wrong datatype', function() {
			session.active('foo')
			var id=routes.add_data({ params: { session:'foo'}, body:{}},{send:function(status,data) {
				assert.equal(400,status);
				assert.deepEqual({"error":"No array data for foo","active":"foo","data":{}},data)
			}});
		})
		it('should accept data', function() {
			session.active('foo')
			var id=routes.add_data({ params: { session:'foo'}, body:
			[
				{action:"line",x:10,y:"10"},{action:"move",x:20,y:"20"},
				{action:"home"},{action:"line",x:"30"},{action:"foobar"},{}
			]
			},{send:function(status,data) {
				assert.equal(200,status);
				assert.deepEqual({"active":"foo","size":3},data)
				assert.deepEqual([{action:"line",x:10,y:10},{action:"move",x:20,y:20},{action:"home"}],session.data('foo'));
			}});
		})
	})
	describe("#get_active_data", function() {
		it('should not accept data for an undefined session', function() {
			session.active('foo')
            session.addData('foo',[{action:"home"}]);
			var id=routes.get_active_data({ params: {}},{send:function(status,data) {
				assert.equal(200,status);
				assert.deepEqual({"active":"foo",data:[{action:"home"}]},data)
			}});
		});
    });
	describe("#get_data", function() {
		it('should not accept data for an undefined session', function() {
			session.active('foo')
			var id=routes.get_data({ params: {}},{send:function(status,data) {
				assert.equal(400,status);
				assert.deepEqual({"error":"No session id","active":"foo"},data)
			}});
		});
		it('should not accept data for an inactive session', function() {
			session.active('foo')
			var id=routes.get_data({ params: { session:'bar'}},{send:function(status,data) {
				assert.equal(400,status);
				assert.deepEqual({error:"Session not active bar",active:"foo"},data)
			}});
		})
		it('should return data', function() {
			session.active('foo')
			var commands=[{action:"line",x:10,y:10},{action:"move",x:20,y:20},{action:"home"}];
			session.addData('foo',commands);
			var id=routes.get_data({ params: { session:'foo'}},{send:function(status,data) {
				assert.equal(200,status);
				assert.deepEqual({"active":"foo","data":commands},data)
			}});
		})
	})
})