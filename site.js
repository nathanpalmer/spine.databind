var PersonCollection = Spine.Model.setup("Person", [ "firstName", "lastName" ]);
PersonCollection.extend(DataBind);

var Content = Spine.Controller.create({
    events: {
        "click input[type=button]": "click"
    },

    proxied: [ "click" ],

    init: function() {
        var that = this;
        PersonCollection.bind("create", this.proxy(this.add));
        PersonCollection.bind("change", this.view);
    },

    click: function() {
        var m = PersonCollection.create({firstName: "Nathan"});
    },

    add: function(item) {
        var p = Person.init();
        PersonCollection.dataBind(item, p.render().el);
        this.el.append(p.el);
    },

    view: function(item) {
        console.log(JSON.stringify(PersonCollection.toJSON()));
    }
});

var Person = Spine.Controller.create({
    tag: "div",

    template: function() {
        return [
            "<label for='firstName'>First Name:</label>",
            "<input type='text' name='firstName' data-bind='value: firstName' />",
            "<label for='lastName'>Last Name:</label>",
            "<input type='text' name='lastName' data-bind='value: lastName' />"
        ].join("");
    },

    render: function() {
        this.el.html(this.template);
        return this;
    }
});