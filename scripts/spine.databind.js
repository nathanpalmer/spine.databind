String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g,"");
}

var DataBind = {
    create: function(atts,el) {
        var record = this.init(atts);
        var result = record.save();
        this.dataBind(record, el);
        return result;
    },

    dataBind: function(item, el) {
        if (!el) {
            el = 'body';
        }

        $(el).find("*[data-bind]").each(function(index) {
            var element = $(this),
                databind = element.data("bind").split(",");

            var attributes = databind.map(function(item) {
                var db = item.trim().split(":");
                
                return {
                    name: db[0].trim(),
                    value: db[1].trim()
                }
            });
    
            Element.init({item: item, attributes: attributes, el: element});
        });
    },

    Binders: {}
}

var Element = Spine.Controller.create({
    init: function() {
        this.mapAttributes();
    },

    mapAttributes: function() {
        var i;

        for(var prop in DataBind.Binders) {
            if (DataBind.Binders.hasOwnProperty(prop)) {
                var binder = DataBind.Binders[prop];
                var binderAttributes = { length: 0 };
                this.attributes.forEach(function(attribute) {
                    if (binder.keys.some(function(k) {
                        return k === attribute.name;
                    })) {
                        binderAttributes[attribute.name] = attribute.value;
                        binderAttributes.length++;
                    };
                });

                if (binderAttributes.length) {
                    binder.init({el: this.el, item: this.item, attributes: binderAttributes});
                }
            }
        }
        
        for(i=0;i<this.attributes.length;i++) {
            var attribute = this.attributes[i];

            

/*
            switch(attribute.name) {
                case "text":
                case "value":
                    this.update(attribute);
                    break;

                case "click":
                    this.click(attribute);
                    break;

                case "enable":
                    this.enable(attribute);
                    break;

                case "visible":
                    this.visible(attribute);
                    break;

                case "options":
                    this.option(attribute);
                    break;

                case "submit":
                    this.submit(attribute);
                    break;
            }
*/
        }
    },

    submit: function(attribute) {
        var controller = this;
        var submit = function(e) {
            e.preventDefault();
            controller.item[attribute.value]();
        };
        this.el.submit(this.proxy(submit));
    },

    option: function(attribute) {
        var controller = this;
        var options = function() {
            controller.el.html('');
            var array = controller.item[attribute.value];
            for(var i=0;i<array.length;i++) {
                var item = array[i];
                controller.el.append("<option value='" + item + "'>" + item + "</option>");
            }
        };
        options();
        this.item.bind("update", this.proxy(options));
    },

    enable: function(attribute) {
        var controller = this;
        var enable = function() {
            var result = false;

            with(controller.item) {
                result = eval(attribute.value);
            }

            if (result) {
                controller.el.removeAttr("disabled");
            } else {
                controller.el.attr("disabled", "disabled");
            }
        };
        enable();
        this.item.bind("update", this.proxy(enable));
    },

    update: function(attribute) {
        var controller = this;
        var valueUpdate = this.attributes.filter(function(item) { return item.name === "valueUpdate" });
        var update = function() {
            var value = typeof controller.item[attribute.value] === "function" ? controller.item[attribute.value]() : controller.item[attribute.value],
                tag = controller.el[0].tagName;

            switch(attribute.name) {
                case "text":
                    controller.el.text(value);
                    break;
                case "value":
                    controller.el.val(value);
                    break;
            }
        };
        update();
        this.item.bind("update", this.proxy(update));

        var change = function() {
            controller.item.updateAttribute(attribute.value,controller.el.val());
        }
        this.el.bind("change", change);

        if (valueUpdate.length === 1) {
            switch(valueUpdate[0].value) {
                case "\"afterkeydown\"":
                    this.el.bind("keyup", change);
                    break;
            }
        }
    },

    click: function(attribute) {
        var controller = this;
        var click = function() {
            switch(typeof this.item[attribute.value]) {
                case "function":
                    this.item[attribute.value]();
                    break;

                case "undefined":
                    with(this.item) {
                        eval(attribute.value);
                    }
            }
        };

        this.el.bind("click", this.proxy(click));
    },

    visible: function(attribute) {
        var controller = this;
        var visible = function() {
            var result = controller.item[attribute.value]();

            if (result) {
                controller.el.show();
            } else {
                controller.el.hide();
            }
        }

        visible();
        this.item.bind("update", this.proxy(visible));
    }
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
    },

    change: function() {
        switch(this.el[0].tagName) {
            case "INPUT":
                this.item.updateAttribute(this.attributes["value"],this.el.val());
                break;
        }
    },

    update: function() {
        var value;

        switch(this.el[0].tagName) {
            case "INPUT":
                value = typeof this.item[this.attributes["value"]] === "function"
                        ? this.item[this.attributes["value"]]()
                        : this.item[this.attributes["value"]];
                this.el.val(value);
                break;

            default:
                value = typeof this.item[this.attributes["text"]] === "function"
                        ? this.item[this.attributes["text"]]()
                        : this.item[this.attributes["text"]];
                this.el.text(value);
                break;
        }
    }
},{
    keys: [ "text", "value", "valueUpdate" ]
});