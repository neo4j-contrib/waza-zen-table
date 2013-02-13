var assert = require("assert")
var rewire = require("rewire")
var s=rewire('../helpers/sessions');
var Session=s.Session;

describe('Session', function() {
	var session;
	beforeEach(function(){
		session=new Session();
	})
	describe("#new_session()", function() {
		it('should return a new id and make it active', function() {
			var id=session.newSession();
			assert.ok(id.length>8);
			assert.equal(id,session.active());
		})
		it('should return true for existing sessions', function() {
			session.active('foo')
			assert.ok(session.hasSession('foo'));
		});
		it('should return false for non existing sessions', function() {
			assert.ok(!session.hasSession('foo'));
		});
		it('should return a new id not make it active', function() {
			session.active('foo')
			var id=session.newSession();
			assert.ok(id.length>8);
			assert.equal('foo',session.active());
		})
		it('should add data for active id', function() {
			session.active('foo')
			assert.deepEqual([],session.data('foo'));
			assert.deepEqual([1,2],session.addData('foo',[1,2]));
			assert.deepEqual([1,2],session.data('foo'));
			assert.deepEqual([1,2,3],session.addData('foo',[3]));
			assert.deepEqual([1,2,3],session.data('foo'));
		})
		it('should not add data for non-active id', function() {
			session.active('foo')
			assert.deepEqual([],session.addData('bar',[1,2]));
			assert.deepEqual([],session.data('bar'));
		})
		it('should expire after timeout', function(done) {
			s.__set__('TIMEOUT',0);
			session.active('foo')
			setTimeout(function() {
				assert.equal(null,session.active());
				done();
			},1);
		});
	})
})