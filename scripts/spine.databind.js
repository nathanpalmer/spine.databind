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
    }
}

var Element = Spine.Controller.create({
    init: function() {
        this.mapAttributes();
    },

    mapAttributes: function() {
        var i;
        
        for(i=0;i<this.attributes.length;i++) {
            var attribute = this.attributes[i];

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
            }
        }
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
        this.item.bind("update", this.proxy(enable));
    },

    update: function(attribute) {
        var controller = this;
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