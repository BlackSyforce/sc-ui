
var engine = require('engine'),
    StackLayout = require('./layouts/StackLayout');

function PanelTest(game, layout, constraint) {
  engine.Group.call(this, game);

  this.layout = layout || new StackLayout();
  this.constraint = constraint;

  this.cachedHeight = 0;
  this.psWidth = this.psHeight = this.cachedWidth = -1;

  this.size = { width: 0, height: 0 };
  this.border = new engine.Circle(0,0,100);
  this.padding = new engine.Circle(0,0,100);

  this.views = [];
  this.panels = [];

  this.isValid = false;
  this.isLayoutValid = false;
}

PanelTest.prototype = Object.create(engine.Group.prototype);
PanelTest.prototype.constructor = PanelTest;

PanelTest.prototype.addPanel = function(constraint, panel) {
  if(panel.constraint !== null) {
    constr = panel.constraint;
  } else {
    panel.constraint = constraint;
  }

  this.panels.push(panel);
  this.addChild(panel);
  this.invalidate();
};

PanelTest.prototype.removePanel = function(panel) {
  this.panels.splice(this.panels.indexOf(panel), 1);
  this.removeChild(panel);
  this.invalidate();
};

PanelTest.prototype.addView = function(view) {
  this.views.push(view);
  this.addChild(view);
  this.invalidate();
};

PanelTest.prototype.invalidate = function() {
  this.isValid = false;
  this.isLayoutValid = false;
  this.cachedWidth = -1;

  if(this.parent && this.parent.invalidate) {
    this.parent.invalidate();
  } else if(this.parent && !this.parent.invalidate) {
    this.validate();
    this.repaint();
  }
};

PanelTest.prototype.validate = function() {
  this.validateMetric();

  if(this.size.width > 0 && this.size.height > 0 &&
      this.isLayoutValid === false &&
      this.visible === true) {

    this.layout.doLayout(this);

    for(var i=0; i<this.panels.length; i++) {
      this.panels[i].validate();
    }

    this.isLayoutValid = true;
  }
};

PanelTest.prototype.validateMetric = function() {
  if(this.isValid === false) {
    if(this.recalc) {
      this.recalc();
    }
    this.isValid = true;
  }
};

PanelTest.prototype.repaint = function() {
  if(this.visible === true) {
    for(var i=0; i<this.panels.length; i++) {
      this.panels[i].repaint();
    }
  }
  this.paint();
};

PanelTest.prototype.paint = function() {
  for(var i=0; i<this.views.length; i++) {
    this.views[i].paint(this.top, this.left, this.bottom, this.right);
  }
};

PanelTest.prototype.resize = function(width, height) {
  //.. resize
};

PanelTest.prototype.setBorder = function(top, left, bottom, right) {
  if(arguments.length == 1) {
    left = bottom = right = top;
  }

  if(arguments.length == 2) {
    bottom = top;
    right = left;
  }

  if(this.border.top != top ||
      this.border.left != left ||
      this.border.bottom != bottom ||
      this.border.right != right) {

    this.border.top = top;
    this.border.left = left;
    this.border.bottom = bottom;
    this.border.right = right;

    this.invalidate();
    this.repaint();
  }

  return this;
};

PanelTest.prototype.setPadding = function(top, left, bottom, right) {
  if(arguments.length == 1) {
    left = bottom = right = top;
  }

  if(arguments.length == 2) {
    bottom = top;
    right = left;
  }

  if(this.padding.top != top ||
      this.padding.left != left ||
      this.padding.bottom != bottom ||
      this.padding.right != right) {

    this.padding.top = top;
    this.padding.left = left;
    this.padding.bottom = bottom;
    this.padding.right = right;

    this.invalidate();
    this.repaint();
  }

  return this;
};

PanelTest.prototype.setSize = function(width, height) {
  if(width != this.size.width || height != this.size.height) {
    this.size.width = width;
    this.size.height = height;

    this.isLayoutValid = false;
    this.resize(width, height);
  }
  return this;
};

PanelTest.prototype.setLocation = function(xx, yy) {
  if(xx != this.x || this.y != yy) {
    this.position.x = xx;
    this.position.y = yy;

   // if(this.relocated !== null) {
   //   this.relocated(xx, yy);
   // }
  }
};

PanelTest.prototype.setPreferredSize = function(width, height) {
  if(width != this.psWidth || height != this.psHeight) {
    this.psWidth = width;
    this.psHeight = height;
    this.invalidate();
  }
};

PanelTest.prototype.getPreferredSize = function() {
  this.validateMetric();

  if(this.cachedWidth < 0) {
    var ps = (this.psWidth < 0 || this.psHeight < 0) ? this.layout.calcPreferredSize(this) : { width: 0, height: 0 };

    ps.width = this.psWidth >= 0 ? this.psWidth : ps.width + this.left + this.right;
    ps.height = this.psHeight >= 0 ? this.psHeight : ps.height + this.top  + this.bottom;

    this.cachedWidth  = ps.width;
    this.cachedHeight = ps.height;

    return ps;
  }

  return {
    width: this.cachedWidth,
    height: this.cachedHeight
  };
};

Object.defineProperty(PanelTest.prototype, 'top', {
  get: function() {
    return this.padding.top + this.border.top;
  }
});

Object.defineProperty(PanelTest.prototype, 'left', {
  get: function() {
    return this.padding.left + this.border.left;
  }
});

Object.defineProperty(PanelTest.prototype, 'bottom', {
  get: function() {
    return this.padding.bottom + this.border.bottom;
  }
});

Object.defineProperty(PanelTest.prototype, 'right', {
  get: function() {
    return this.padding.right + this.border.right;
  }
});

module.exports = PanelTest;