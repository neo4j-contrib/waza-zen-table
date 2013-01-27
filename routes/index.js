
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Waza Zen-Table' });
};