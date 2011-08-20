(function() {
  var DataBind, Options, Update;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  Update = {
    keys: ["text", "value"],
    bind: function(operators, model, el) {
      el.bind("change", __bind(function() {
        return this.change(operators, model, el);
      }, this));
      model.bind("change", __bind(function() {
        return this.update(operators, model, el);
      }, this));
      return this.update(operators, model, el);
    },
    unbind: function(operators, model, el) {
      el.unbind("change");
      return model.unbind("change");
    },
    change: function(operators, model, el) {
      return el.each(function() {
        var e, operator, _i, _len, _results;
        e = $(this);
        _results = [];
        for (_i = 0, _len = operators.length; _i < _len; _i++) {
          operator = operators[_i];
          _results.push((function() {
            switch (this.tagName) {
              case "INPUT":
              case "SELECT":
              case "TEXTAREA":
                return model.updateAttribute(operator.property, e.val());
              default:
                return model.updateAttribute(operator.property, e.text());
            }
          }).call(this));
        }
        return _results;
      });
    },
    update: function(operators, model, el) {
      return el.each(function() {
        var e, operator, value, _i, _len, _results;
        e = $(this);
        _results = [];
        for (_i = 0, _len = operators.length; _i < _len; _i++) {
          operator = operators[_i];
          value = DataBind.eval(model, operator.property);
          console.log("Update " + e.tagName + " " + operator.property + " " + value);
          _results.push((function() {
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
          }).call(this));
        }
        return _results;
      });
    }
  };
  Options = {
    keys: ["options", "selectedOptions"],
    bind: function(operators, model, el) {
      model.bind("update", __bind(function() {
        return this.update(operators, model, el);
      }, this));
      this.update(operators, model, el);
      if (operators.some(function(e) {
        return e.name === "selectedOptions";
      })) {
        return el.bind("change", __bind(function() {
          return this.change(operators, model, el);
        }, this));
      }
    },
    unbind: function(operators, model, el) {
      return model.unbind("update");
    },
    update: function(operators, model, el) {
      var array, index, item, ops, opsSelected, option, options, selected, selectedOptions, _len, _ref, _ref2, _results;
      ops = operators.filter(function(e) {
        return e.name === "options";
      })[0];
      opsSelected = operators.filter(function(e) {
        return e.name === "selectedOptions";
      });
      selectedOptions = opsSelected.length === 1 ? DataBind.eval(model, opsSelected[0].property) : [];
      array = DataBind.eval(model, ops.property);
      options = el.children('options');
      for (index = 0, _len = array.length; index < _len; index++) {
        item = array[index];
        option = options.length > index ? options[index] : null;
        selected = selectedOptions.indexOf(item) >= 0 ? "selected='selected'" : "";
        if (option === null) {
          el.append("<option value='" + item + "' " + selected + ">" + item + "</option>");
        } else {
          if (option.text === !item) {
            option.text = item;
          }
        }
      }
      if (options.length > array.length) {
        _results = [];
        for (index = _ref = array.length, _ref2 = options.length; _ref <= _ref2 ? index <= _ref2 : index >= _ref2; _ref <= _ref2 ? index++ : index--) {
          _results.push($(options[index]).remove());
        }
        return _results;
      }
    },
    change: function(operators, model, el) {
      var operator;
      operator = operators.filter(function(e) {
        return e.name === "selectedOptions";
      })[0];
      model[operator.property] = [];
      el.find("option:selected").each(function() {
        return model[operator.property].push($(this).text());
      });
      return model.save();
    }
  };
  DataBind = {
    binders: [Update, Options],
    initializeBindings: function() {
      var addElement, args, controller, element, elements, findBinder, info, init, key, parse, property, splitter, trim, _i, _len;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.trigger("destroy-bindings");
      controller = this;
      splitter = /(\w+)(\[?.*]?) (.*)/;
      findBinder = function(key) {
        var binder, _i, _len, _ref;
        _ref = controller.binders;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          binder = _ref[_i];
          if (binder.keys.indexOf(key) >= 0) {
            return binder;
          }
        }
        return null;
      };
      addElement = function(elements, info, property) {
        var binder, element, matching;
        binder = findBinder(info.name);
        if (binder === null) {
          return;
        }
        matching = elements.filter(function(e) {
          return e.el[0] === info.element[0] && e.binder === binder;
        });
        if (matching.length === 0) {
          element = {
            el: info.element,
            binder: binder,
            operators: []
          };
          elements.push(element);
        } else {
          element = elements[0];
        }
        return element.operators.push({
          name: info.name,
          parameters: info.parameters,
          property: property
        });
      };
      parse = function(key) {
        var match, name, parameters, selector;
        match = key.match(splitter);
        name = match[1];
        parameters = match[2];
        selector = match[3];
        if (selector === "") {
          selector = $(controller.el.selector);
        } else {
          selector = $(controller.el.selector + " " + selector);
        }
        return {
          name: name,
          parameters: parameters,
          element: selector
        };
      };
      init = function(element) {
        var el, model, operators;
        operators = element.operators;
        model = controller.model;
        el = element.el;
        element.binder.bind(operators, model, el);
        controller.bind("destroy", function() {
          return element.binder.unbind(operators, model, el);
        });
        return controller.bind("destroy-bindings", function() {
          return element.binder.unbind(operators, model, el);
        });
      };
      elements = [];
      for (key in this.bindings) {
        property = this.bindings[key];
        info = parse(key);
        addElement(elements, info, property);
      }
      trim = function(s) {
        return s.replace(/^\s+|\s+$/g, "");
      };
      this.el.find("*[data-bind]").each(function() {
        var attributes, binder, databind, e, info, _i, _len, _results;
        e = $(this);
        databind = e.data("bind").split(",");
        attributes = databind.map(function(item) {
          var fullString, match, name, value;
          fullString = trim(item);
          match = fullString.match(/(.*):(.*)/);
          name = match[1];
          value = trim(match[2]);
          return {
            name: name,
            value: value,
            element: e
          };
        });
        _results = [];
        for (_i = 0, _len = attributes.length; _i < _len; _i++) {
          info = attributes[_i];
          binder = findBinder(info.name);
          _results.push(addElement(elements, info, info.value));
        }
        return _results;
      });
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        init(element);
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
