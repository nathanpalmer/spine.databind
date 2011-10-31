(function() {
  var Attribute, Checked, Click, DataBind, Enable, Options, Template, Update, Visible;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty;
  Template = {
    keys: [],
    bind: function(operators, model, el) {},
    unbind: function(operators, model, el) {}
  };
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
      el.each(function() {
        var e, operator, _i, _len;
        e = $(this);
        for (_i = 0, _len = operators.length; _i < _len; _i++) {
          operator = operators[_i];
          switch (this.tagName) {
            case "INPUT":
            case "SELECT":
            case "TEXTAREA":
              model.updateAttribute(operator.property, e.val());
              break;
            default:
              model.updateAttribute(operator.property, e.text());
          }
        }
        return this;
      });
      return this;
    },
    update: function(operators, model, el) {
      el.each(function() {
        var e, operator, value, _i, _len;
        e = $(this);
        for (_i = 0, _len = operators.length; _i < _len; _i++) {
          operator = operators[_i];
          value = DataBind.get(model, operator.property);
          switch (this.tagName) {
            case "INPUT":
            case "TEXTAREA":
              e.val(value);
              break;
            case "SELECT":
              e.find("option[value=" + value + "]").attr("selected", "selected");
              break;
            default:
              if (typeof value === "object" && value.constructor === Array) {
                e.text(value.join(","));
              } else if (typeof value === "object") {
                e.text(value.toString());
              } else {
                e.text(value);
              }
          }
        }
        return this;
      });
      return this;
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
      var array, index, item, key, ops, opsSelected, option, options, result, selected, selectedOptions, value, _len, _ref, _ref2, _results;
      ops = operators.filter(function(e) {
        return e.name === "options";
      })[0];
      opsSelected = operators.filter(function(e) {
        return e.name === "selectedOptions";
      });
      selectedOptions = opsSelected.length === 1 ? DataBind.get(model, opsSelected[0].property) : [];
      if (!(selectedOptions instanceof Array)) {
        selectedOptions = [selectedOptions];
      }
      array = DataBind.get(model, ops.property);
      options = el.children('option');
      if (array instanceof Array) {
        result = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = array.length; _i < _len; _i++) {
            item = array[_i];
            _results.push({
              text: item,
              value: item
            });
          }
          return _results;
        })();
      } else {
        result = (function() {
          var _results;
          _results = [];
          for (key in array) {
            if (!__hasProp.call(array, key)) continue;
            value = array[key];
            _results.push({
              text: value,
              value: key
            });
          }
          return _results;
        })();
      }
      for (index = 0, _len = result.length; index < _len; index++) {
        item = result[index];
        option = options.length > index ? $(options[index]) : null;
        selected = selectedOptions.indexOf(item.value) >= 0 ? "selected='selected'" : "";
        if (option === null) {
          el.append("<option value='" + item.value + "' " + selected + ">" + item.text + "</option>");
        } else {
          if (option.text !== item.text) {
            option.text(item.text);
          }
          if (option.value !== item.value) {
            option.val(item.value);
          }
          if (option.attr("selected") === "selected" || option.attr("selected") === true) {
            if (selected.length === 0) {
              option.removeAttr("selected");
            }
          } else {
            if (selected.length > 0) {
              option.attr("selected", "selected");
            }
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
      var items, operator;
      operator = operators.filter(function(e) {
        return e.name === "selectedOptions";
      })[0];
      items = [];
      el.find("option:selected").each(function() {
        return items.push($(this).val());
      });
      if (model[operator.property] instanceof Array || items.length > 1) {
        model[operator.property] = [];
        model[operator.property] = model[operator.property].concat(items);
      } else {
        if (items.length === 1) {
          model[operator.property] = items[0];
        }
      }
      return model.save();
    }
  };
  Click = {
    keys: ["click"],
    bind: function(operators, model, el) {
      return el.bind("click", __bind(function() {
        return this.click(operators, model, el);
      }, this));
    },
    unbind: function(operators, model, el) {
      return el.unbind("click");
    },
    click: function(operators, model, el) {
      var operator, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = operators.length; _i < _len; _i++) {
        operator = operators[_i];
        _results.push(DataBind.get(model, operator.property));
      }
      return _results;
    }
  };
  Enable = {
    keys: ["enable"],
    bind: function(operators, model, el) {
      model.bind("update", __bind(function() {
        return this.update(operators, model, el);
      }, this));
      return this.update(operators, model, el);
    },
    unbind: function(operators, model, el) {
      return model.unbind("update");
    },
    update: function(operators, model, el) {
      var operator, result;
      operator = operators.filter(function(e) {
        return e.name === "enable";
      })[0];
      result = DataBind.get(model, operator.property);
      if (result) {
        return el.removeAttr("disabled");
      } else {
        return el.attr("disabled", "disabled");
      }
    }
  };
  Visible = {
    keys: ["visible"],
    bind: function(operators, model, el) {
      model.bind("update", __bind(function() {
        return this.update(operators, model, el);
      }, this));
      return this.update(operators, model, el);
    },
    unbind: function(operators, model, el) {
      return model.unbind("update");
    },
    update: function(operators, model, el) {
      var operator, result;
      operator = operators.filter(function(e) {
        return e.name === "visible";
      })[0];
      result = DataBind.get(model, operator.property);
      if (result) {
        return el.show();
      } else {
        return el.hide();
      }
    }
  };
  Attribute = {
    keys: ["attr"],
    bind: function(operators, model, el) {
      model.bind("update", __bind(function() {
        return this.update(operators, model, el);
      }, this));
      return this.update(operators, model, el);
    },
    unbind: function(operators, model, el) {
      return model.unbind("update");
    },
    update: function(operators, model, el) {
      var json, operator, property, value;
      operator = operators.filter(function(e) {
        return e.name === "attr";
      })[0];
      json = JSON.parse(operator.property);
      for (property in json) {
        if (!__hasProp.call(json, property)) continue;
        value = DataBind.get(model, json[property]);
        el.attr(property, value);
      }
      return this;
    }
  };
  Checked = {
    keys: ["checked"],
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
      var operator, value;
      operator = operators.filter(function(e) {
        return e.name === "checked";
      })[0];
      if (el.attr("type") === "radio") {
        return model.updateAttribute(operator.property, el.val());
      } else {
        value = el.is(":checked");
        return model.updateAttribute(operator.property, value);
      }
    },
    update: function(operators, model, el) {
      var operator, result, value;
      operator = operators.filter(function(e) {
        return e.name === "checked";
      })[0];
      result = DataBind.get(model, operator.property);
      value = el.val();
      if (el.attr("type") === "radio") {
        if (result === value) {
          return el.attr("checked", "checked");
        } else {
          return el.removeAttr("checked");
        }
      } else {
        if (!result) {
          return el.removeAttr("checked");
        } else {
          return el.attr("checked", "checked");
        }
      }
    }
  };
  DataBind = {
    binders: [Update, Options, Click, Enable, Visible, Attribute, Checked],
    refreshBindings: function(model) {
      var addElement, controller, element, elements, findBinder, info, init, key, parse, property, splitter, trim, _i, _len;
      this.trigger("destroy-bindings");
      controller = this;
      splitter = /(\w+)(\\[.*])? (.*)/;
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
          element = matching[0];
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
        if (match !== null) {
          name = match[1];
          parameters = match[2];
          selector = match[3];
        } else {
          name = key;
          selector = "";
        }
        if (selector === "") {
          selector = controller.el;
        } else {
          selector = controller.el.find(selector);
        }
        return {
          name: name,
          parameters: parameters,
          element: selector
        };
      };
      init = function(element) {
        var el, operators;
        operators = element.operators;
        el = element.el;
        element.binder.bind(operators, model, el);
        controller.bind("destroy", function() {
          return element.binder.unbind(operators, model, el);
        });
        return controller.bind("destroy-bindings", function() {
          return element.binder.unbind(operators, model, el);
        });
      };
      trim = function(s) {
        return s.replace(/^\s+|\s+$/g, "");
      };
      elements = [];
      for (key in this.bindings) {
        if (this.bindings.hasOwnProperty(key)) {
          property = this.bindings[key];
          info = parse(key);
          addElement(elements, info, property);
        }
      }
      this.el.find("*[data-bind]").each(function() {
        var attributes, binder, databind, e, info, _i, _len, _results;
        e = $(this);
        databind = e.data("bind").split(",");
        attributes = databind.map(function(item) {
          var fullString, match, name, value;
          fullString = trim(item);
          match = fullString.match(/(\w+):(.*)/);
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
    get: function(item, value) {
      var result;
      if (typeof item[value] === "function") {
        result = item[value]();
      } else {
        result = item[value];
      }
      return result;
    }
  };
  this.Spine.DataBind = DataBind;
}).call(this);
