(function() {
  var DataBind, Update;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  Update = {
    bind: function(model, el, property) {
      el.bind("change", __bind(function() {
        return this.change(model, el, property);
      }, this));
      model.bind("change", __bind(function() {
        return this.update(model, el, property);
      }, this));
      return this.update(model, el, property);
    },
    unbind: function(model, el, property) {
      el.unbind("change");
      return model.unbind("change");
    },
    change: function(model, el, property) {
      return el.each(function() {
        var e;
        e = $(this);
        switch (this.tagName) {
          case "INPUT":
          case "SELECT":
          case "TEXTAREA":
            return model.updateAttribute(property, e.val());
          default:
            return model.updateAttribute(property, e.text());
        }
      });
    },
    update: function(model, el, property) {
      return el.each(function() {
        var e, value;
        e = $(this);
        value = DataBind.eval(model, property);
        console.log("Update " + e.tagName + " " + property + " " + value);
        switch (this.tagName) {
          case "INPUT":
          case "TEXTAREA":
            return e.val(value);
          case "SELECT":
            return e.find("option[value=" + value + "]").attr("selected", "selected");
          default:
            if (typeof value === "object" && value.constructor === Array) {
              return e.text(value.join(","));
            } else {
              return e.text(value);
            }
        }
      });
    }
  };
  DataBind = {
    bindingSplitter: /(\w+)(\[?.*]?) (.*)/,
    binders: {
      "text": Update,
      "value": Update
    },
    parseBinding: function(key) {
      var match, name, parameters, selector;
      match = key.match(this.bindingSplitter);
      name = match[1];
      parameters = match[2];
      selector = match[3];
      if (selector === "") {
        selector = $(this.el.selector);
      } else {
        selector = $(this.el.selector + " " + selector);
      }
      return {
        name: name,
        parameters: parameters,
        selector: selector
      };
    },
    initializeBinding: function(binder, selector, name) {
      binder.bind(this.model, selector, name);
      this.bind("destroy", function() {
        return binder.unbind(this.model, selector, name);
      });
      return this.bind("destroy-bindings", function() {
        return binder.unbind(this.model, selector, name);
      });
    },
    initializeBindings: function() {
      var args, binderKey, info, key, property;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.trigger("destroy-bindings");
      for (key in this.bindings) {
        property = this.bindings[key];
        info = this.parseBinding(key);
        for (binderKey in this.binders) {
          if (binderKey === info.name) {
            this.initializeBinding(this.binders[info.name], info.selector, property);
          }
        }
      }
      return this;
    },
    eval: function(item, value) {
      var result;
      switch (typeof item[value]) {
        case "function":
          result = item[value]();
          break;
        default:
          result = item[value];
      }
      return result;
    }
  };
  this.DataBind = DataBind;
}).call(this);
