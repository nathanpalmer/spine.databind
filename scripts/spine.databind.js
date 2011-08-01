var DataBind = {
    create: function(atts,el) {
        var record = this.init(atts);
        var result = record.save();
        this.dataBind(record, el);
        return result;
    },

    trim: function(string) {
        return string.replace(/^\s+|\s+$/g,"");
    },

    dataBind: function(item, el) {
        if (!el) {
            el = 'body';
        }

        $(el).find("*[data-bind]").each(function(index) {
            var element = $(this),
                databind = element.data("bind").split(",");

            var attributes = databind.map(function(item) {
                var fullString = DataBind.trim(item),
                    index = fullString.indexOf(":"),
                    name = DataBind.trim(fullString.substr(0,index)),
                    value = DataBind.trim(fullString.substr(index+1));
                
                return {
                    name: name,
                    value: value
                }
            });

            for(var prop in DataBind.Binders) {
                if (DataBind.Binders.hasOwnProperty(prop)) {
                    var binder = DataBind.Binders[prop];
                    var binderAttributes = { length: 0 };
                    attributes.forEach(function(attribute) {
                        if (binder.keys.some(function(k) {
                            return k === attribute.name;
                        })) {
                            binderAttributes[attribute.name] = attribute.value;
                            binderAttributes.length++;
                        };
                    });

                    if (binderAttributes.length) {
                        binder.init({el: element, item: item, attributes: binderAttributes});
                    }
                }
            }
        });
    },

    eval: function(item,value) {
        var result;

        switch(typeof item[value]) {
            case "function":
                result = item[value]();
                break;

            case "undefined":
                with(item) {
                    result = eval(value);
                }
                break;

            default:
                result = item[value];
                break;
        }

        return result;
    },

    Binders: {}
};

DataBind.Binders.Options = Spine.Controller.create({
    init: function() {
        this.item.bind("update", this.proxy(this.update));
        this.update();

        if (typeof this.attributes["selectedOptions"] !== "undefined") {
            this.el.bind("change", this.proxy(this.change));
        }
    },

    update: function() {
        var array = this.item[this.attributes["options"]],
            selectedOptions = typeof this.attributes["selectedOptions"] === "undefined" ? [] : DataBind.eval(this.item, this.attributes["selectedOptions"]),
            options = this.el.children('option'),
            value = this.item[this.attributes["value"]];

        for(var i=0;i<array.length;i++) {
            var item = array[i];
            var option = options.length > i ? options[i] : null;
            var selected = selectedOptions.indexOf(item) >= 0;

            if (option === null) {
                this.el.append("<option value='" + item + "'" + (selected ? "selected='selected'" : "") + ">" + item + "</option>");
            } else {
                if (option.text !== item) {
                    option.text = item;
                }
            }
        }
        if (options.length > array.length) {
            for(var j=array.length;j<options.length;j++) {
                $(options[j]).remove();
            }
        }
    },

    change: function(e) {
        var item = this.item,
            prop = this.attributes["selectedOptions"];

        item[prop] = [];
        this.el.find("option:selected").each(function() {
             item[prop].push($(this).text());
        });
        this.item.save();
    }

}, {
    keys: [ "options", "selectedOptions" ]
});


DataBind.Binders.Update = Spine.Controller.create({
    events: {
        "change": "change"
    },

    init: function(atts) {
        this.item.bind("update", this.proxy(this.update));
        if (this.attributes["valueUpdate"] === '"afterkeydown"') {
            this.el.bind("keyup", this.proxy(this.change));
        }
        this.update();
    },

    change: function() {
        switch(this.el[0].tagName) {
            case "INPUT":
            case "SELECT":
            case "TEXTAREA":
                this.item.updateAttribute(this.attributes["value"],this.el.val());
                break;
            default:
                this.item.updateAttribute(this.attributes["value"],this.el.text());
                break;
        }
    },

    update: function() {
        var value;

        switch(this.el[0].tagName) {
            case "INPUT":
            case "TEXTAREA":
                value = DataBind.eval(this.item, this.attributes["value"]);
                this.el.val(value);
                break;

            case "SELECT":
                value = DataBind.eval(this.item, this.attributes["value"]);
                this.el.find("option[value=" + value + "]").attr("selected", "selected");
                break;

            default:
                value = DataBind.eval(this.item, this.attributes["text"]);
                if (typeof value === "object" && value.constructor === Array) {
                    this.el.text(value.join(","));
                } else {
                    this.el.text(value);    
                } 
                break;
        }
    }
},{
    keys: [ "text", "value", "valueUpdate" ]
});

DataBind.Binders.Enable = Spine.Controller.create({
    init: function() {
        this.update();
        this.item.bind("update", this.proxy(this.update));
    },

    update: function() {
        var result = DataBind.eval(this.item, this.attributes["enable"]);

        if (result) {
            this.el.removeAttr("disabled");
        } else {
            this.el.attr("disabled", "disabled");
        }
    }
}, {
    keys: [ "enable" ]
});

DataBind.Binders.Submit = Spine.Controller.create({
   init: function() {
        this.el.submit(this.proxy(this.submit));
   },

   submit: function(e) {
        e.preventDefault();
        DataBind.eval(this.item, this.attributes["submit"]);
   }
}, {
    keys: [ "submit" ]
});

DataBind.Binders.Click = Spine.Controller.create({
    init: function() {
        this.el.bind("click", this.proxy(this.click));
    },

    click: function() {
        DataBind.eval(this.item, this.attributes["click"]);
    }
}, {
    keys: [ "click" ]
});

DataBind.Binders.Visible = Spine.Controller.create({
    init: function() {
        this.update();
        this.item.bind("update", this.proxy(this.update));
    },

    update: function() {
        var result = DataBind.eval(this.item, this.attributes["visible"]);

        if (result) {
            this.el.show();
        } else {
            this.el.hide();
        }
    }
}, {
    keys: [ "visible" ]
});

DataBind.Binders.Checked = Spine.Controller.create({
    events: {
        "change": "change"    
    },

    type: null,

    init: function() {
        this.type = this.el.attr("type");
        this.update();
        this.item.bind("update", this.proxy(this.update));
    },

    change: function() {
        if (this.type === "radio") {
            this.item.updateAttribute(this.attributes["checked"], this.el.val());
        } else {
            var value = this.el.attr("checked") === "checked";
            this.item.updateAttribute(this.attributes["checked"], value);
        }
    },

    update: function() {
        var result = DataBind.eval(this.item,this.attributes["checked"]),
            value = this.el.val();

        if (this.type === "radio") {
            if (result !== value) {
                this.el.removeAttr("checked");
            } else {
                this.el.attr("checked", "checked");
            }
        } else {
            if (!result) {
                this.el.removeAttr("checked");
            } else {
                this.el.attr("checked", "checked");
            }
        }
    }
}, {
    keys: [ "checked" ]
});