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
                databind = element.data("bind").split(":"),
                attribute = databind.length === 2 ? databind[0].trim() : null,
                value = databind.length === 2 ? databind[1].trim() : null;

            if (attribute === null) {
                return;
            }

            Element.init({item: item, name: value, attribute: attribute, el: element});
        });
    }
}

var Element = Spine.Controller.create({
    events: {
        "change": "change"
    },

    init: function() {
        this.update();
        this.item.bind("update", this.proxy(this.update));
    },

    change: function() {
        this.item.updateAttribute(this.name,this.el.val());
    },

    update: function() {
        var value = typeof this.item[this.name] === "function" ? this.item[this.name]() : this.item[this.name],
            tag = this.el[0].tagName;

        switch(this.attribute) {
            case "text":
                this.el.text(value);
                break;
            case "value":
                this.el.val(value);
                break;
        }
    }
});