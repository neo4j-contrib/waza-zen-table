
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Waza Zen-Table' });
};

exports.draw = function(req, res){
  res.render('draw', { title: 'Drawing Pad - Waza Zen-Table' });
};