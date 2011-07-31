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
                var db = DataBind.trim(item).split(":");
                
                return {
                    name: DataBind.trim(db[0]),
                    value: DataBind.trim(db[1])
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

    Binders: {}
};

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

DataBind.Binders.Options = Spine.Controller.create({
    init: function() {
        this.item.bind("update", this.proxy(this.update));
        this.update();
    },

    update: function() {
        this.el.html('');
        var array = this.item[this.attributes["options"]];
        for(var i=0;i<array.length;i++) {
            var item = array[i];
            this.el.append("<option value='" + item + "'>" + item + "</option>");
        }
    }
}, {
    keys: [ "options" ]
});

DataBind.Binders.Enable = Spine.Controller.create({
    init: function() {
        this.update();
        this.item.bind("update", this.proxy(this.update));
    },

    update: function() {
        var result = false;

        with(this.item) {
            result = eval(this.attributes["enable"]);
        }

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
        this.item[this.attributes["submit"]]();
   }
}, {
    keys: [ "submit" ]
});

DataBind.Binders.Click = Spine.Controller.create({
    init: function() {
        this.el.bind("click", this.proxy(this.click));
    },

    click: function() {
        switch(typeof this.item[this.attributes["click"]]) {
            case "function":
                this.item[this.attributes["click"]]();
                break;

            case "undefined":
                with(this.item) {
                    eval(this.attributes["click"]);
                }
        }
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
        var result = this.item[this.attributes["visible"]]();

        if (result) {
            this.el.show();
        } else {
            this.el.hide();
        }
    }
}, {
    keys: [ "visible" ]
})