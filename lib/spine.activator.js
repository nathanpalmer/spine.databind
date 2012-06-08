(function() {
  var Spine, construct, ctor, moduleKeywords;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  Spine = window.Spine;
  moduleKeywords = ['included', 'extended'];
  ctor = function() {
    var activator, _i, _len, _ref;
    _ref = this.activators;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      activator = _ref[_i];
      if (typeof this[activator] === "function") {
        this[activator]();
      }
    }
    return typeof this.init === "function" ? this.init.apply(this, arguments) : void 0;
  };
  construct = function(base, sub) {
    return sub.prototype.constructor = base;
  };
  construct(ctor, Spine.Module);
  Spine.Module.prototype.activators = [];
  Spine.Module.include = Spine.Model.include = Spine.Controller.include = function(obj) {
    var key, value, _ref;
    if (!obj) {
      throw 'include(obj) requires obj';
    }
    for (key in obj) {
      value = obj[key];
      if (__indexOf.call(moduleKeywords, key) < 0) {
        if (key === "activators") {
          if (typeof this.prototype[key] !== "undefined") {
            this.prototype[key] = this.prototype[key].concat(value);
          }
        } else {
          this.prototype[key] = value;
        }
      }
    }
    if ((_ref = obj.included) != null) {
      _ref.apply(this);
    }
    return this;
  };
  Spine.Activator = true;
}).call(this);
