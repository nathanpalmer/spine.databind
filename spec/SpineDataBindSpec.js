describe("Spine.DataBind", function() {
	var PersonCollection, PersonController;

	beforeEach(function() {
		PersonCollection = Spine.Model.setup("Person", [ 
			"firstName", 
			"lastName", 
			"phoneNumbers", 
			"phoneNumbersSelected",
			"person",
			"title"
		]);

		PersonController = Spine.Controller.create({
			init: function() {
				this.initializeBindings(this.model);
			}
		});

		PersonController.include(DataBind);
	});

	describe("Update", function() {

		describe("with bindings", function() {
			var Person, Controller;

			beforeEach(function() {
				setFixtures([
					"<span id='firstNameSpan'/>",
					"<div id='firstNameDiv'/>",
					"<input type='text' id='firstName'/>",
					"<input type='textarea' id='firstNameTextArea'/>",
					"<select id='firstNameSelect'><option value='Other'/><option value='Nathan'/><option value='Eric'/></select>"
				].join(""));
				
				PersonController.include({
					bindings: {
						"text #firstNameSpan":"firstName",
						"text #firstNameDiv":"firstName",
						"value #firstName":"firstName",
						"value #firstNameTextArea":"firstName",
						"value #firstNameSelect":"firstName"
					}
				});

				Person = PersonCollection.create({ firstName: "Nathan", lastName: "Palmer" });
				Controller = PersonController.init({ el: 'body', model:Person });
			});

			it("should bind span", function() {
				var firstNameSpan = $('#firstNameSpan');
				var firstNameSpanText = firstNameSpan.text();

				expect(firstNameSpanText).toBe("Nathan");
			});

			it("should bind div", function() {
				var firstNameDiv = $('#firstNameDiv');
				var firstNameDivText = firstNameDiv.text();

				expect(firstNameDivText).toBe("Nathan");
			});

			it("should bind on input", function() {
				var firstNameInput = $('#firstName');
				var firstNameInputText = firstNameInput.val();

				expect(firstNameInputText).toBe("Nathan");
			});

			it("should change model when changed on input", function() {
				var firstNameInput = $('#firstName');
				firstNameInput.val("Eric");
				firstNameInput.trigger("change");

				expect(Person.firstName).toBe("Eric");	
			});

			it("should bind on textarea", function() {
				var firstNameInput = $('#firstNameTextArea');
				var firstNameInputText = firstNameInput.val();

				expect(firstNameInputText).toBe("Nathan");
			});

			it("should change model when changed on textarea", function() {
				var firstNameInput = $('#firstNameTextArea');
				firstNameInput.val("Eric");
				firstNameInput.trigger("change");

				expect(Person.firstName).toBe("Eric");	
			});

			it("should bind on select", function() {
				var firstNameInput = $('#firstNameSelect');
				var firstNameInputText = firstNameInput.find("option:selected").val();

				expect(firstNameInputText).toBe("Nathan");
			});

			it("should change model when changed on select", function() {
				expect(Person.firstName).toBe("Nathan");

				var firstNameInput = $('#firstNameSelect');
				firstNameInput.find("option[value='Eric']").attr("selected", "selected");
				firstNameInput.trigger("change");

				expect(Person.firstName).toBe("Eric");
			});

		});

		describe("with data-bind", function() {
			var Person, Controller;

			beforeEach(function() {
				setFixtures([
					"<span id='firstNameSpan' data-bind='text: firstName'/>",
					"<div id='firstNameDiv' data-bind='text: firstName'/>",
					"<input type='text' id='firstName' data-bind='value: firstName'/>",
					"<input type='textarea' id='firstNameTextArea' data-bind='value: firstName'/>",
					"<select id='firstNameSelect' data-bind='value: firstName'><option value='Other'/><option value='Nathan'/><option value='Eric'/></select>"
				].join(""));
				
				Person = PersonCollection.create({ firstName: "Nathan", lastName: "Palmer" });
				Controller = PersonController.init({ el: 'body', model:Person });
			});

			it("should bind span", function() {
				var firstNameSpan = $('#firstNameSpan');
				var firstNameSpanText = firstNameSpan.text();

				expect(firstNameSpanText).toBe("Nathan");
			});

			it("should bind div", function() {
				var firstNameDiv = $('#firstNameDiv');
				var firstNameDivText = firstNameDiv.text();

				expect(firstNameDivText).toBe("Nathan");
			});

			it("should bind on input", function() {
				var firstNameInput = $('#firstName');
				var firstNameInputText = firstNameInput.val();

				expect(firstNameInputText).toBe("Nathan");
			});

			it("should change model when changed on input", function() {
				var firstNameInput = $('#firstName');
				firstNameInput.val("Eric");
				firstNameInput.trigger("change");

				expect(Person.firstName).toBe("Eric");	
			});

			it("should bind on textarea", function() {
				var firstNameInput = $('#firstNameTextArea');
				var firstNameInputText = firstNameInput.val();

				expect(firstNameInputText).toBe("Nathan");
			});

			it("should change model when changed on textarea", function() {
				var firstNameInput = $('#firstNameTextArea');
				firstNameInput.val("Eric");
				firstNameInput.trigger("change");

				expect(Person.firstName).toBe("Eric");	
			});

			it("should bind on select", function() {
				var firstNameInput = $('#firstNameSelect');
				var firstNameInputText = firstNameInput.find("option:selected").val();

				expect(firstNameInputText).toBe("Nathan");
			});

			it("should change model when changed on select", function() {
				expect(Person.firstName).toBe("Nathan");

				var firstNameInput = $('#firstNameSelect');
				firstNameInput.find("option[value='Eric']").attr("selected", "selected");
				firstNameInput.trigger("change");

				expect(Person.firstName).toBe("Eric");
			});

		});
	});

	describe("Options", function() {
		var Person;

		describe("with bindings", function() {
			beforeEach(function() {
				setFixtures([
					"<select id='phoneNumbers'/>"
				].join(""));

				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: [ "555-555-1010", "555-101-9999" ],
					phoneNumbersSelected: []
				});

				PersonController.include({
					bindings: {
						"options select":"phoneNumbers",
						"selectedOptions select":"phoneNumbersSelected"
					}
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			it("should create options", function() {
				var phoneNumberSelect = $('#phoneNumbers');
				var phoneNumberHtml = [
					'<option value="555-555-1010">555-555-1010</option>',
					'<option value="555-101-9999">555-101-9999</option>'
				].join("");
				expect(phoneNumberSelect.html()).toBe(phoneNumberHtml);
			});

			it("should bind selectedOptions", function() {
				var phoneNumberSelect = $('#phoneNumbers');
				phoneNumberSelect.find("option[value='555-101-9999']").attr("selected", "selected");
				phoneNumberSelect.trigger("change");
				expect(Person.phoneNumbersSelected.length).toBe(1);
				expect(Person.phoneNumbersSelected[0]).toBe(Person.phoneNumbers[1]);
			});
		});

		describe("with data-bind", function() {
			beforeEach(function() {
				setFixtures([
					"<select id='phoneNumbers' data-bind='options: phoneNumbers, selectedOptions: phoneNumbersSelected'/>"
				].join(""));

				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: [ "555-555-1010", "555-101-9999" ],
					phoneNumbersSelected: []
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			it("should create options", function() {
				var phoneNumberSelect = $('#phoneNumbers');
				var phoneNumberHtml = [
					'<option value="555-555-1010">555-555-1010</option>',
					'<option value="555-101-9999">555-101-9999</option>'
				].join("");
				expect(phoneNumberSelect.html()).toBe(phoneNumberHtml);
			});

			it("should bind selectedOptions", function() {
				var phoneNumberSelect = $('#phoneNumbers');
				phoneNumberSelect.find("option[value='555-101-9999']").attr("selected", "selected");
				phoneNumberSelect.trigger("change");
				expect(Person.phoneNumbersSelected.length).toBe(1);
				expect(Person.phoneNumbersSelected[0]).toBe(Person.phoneNumbers[1]);
			});
		});

		
	});

	describe("Click", function() {
		var Person;

		describe("with bindings", function() {
			beforeEach(function() {
				PersonCollection.include({
					resetName: function() {
						this.firstName = "Reset";
						this.save();
					}
				});

				setFixtures("<input id='reset' type='button' value='reset'/>");
				
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer"
				});

				PersonController.include({
					bindings: {
						"click input":"resetName"
					}
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			it("should reset name", function() {
				expect(Person.firstName).toBe("Nathan");

				$('#reset').click();

				expect(Person.firstName).toBe("Reset");
			});
		});

		describe("with data-bind", function() {
			beforeEach(function() {
				PersonCollection.include({
					resetName: function() {
						this.firstName = "Reset";
						this.save();
					}
				});

				setFixtures("<input id='reset' type='button' value='reset' data-bind='click: resetName'/>");
				
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer"
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			it("should reset name", function() {
				expect(Person.firstName).toBe("Nathan");

				$('#reset').click();

				expect(Person.firstName).toBe("Reset");
			});
		});
	});

	describe("Enable", function() {
		describe("with bindings", function() {
			var Person;

			beforeEach(function() {
				PersonCollection.include({
					phoneNumberCount: function() {
						return this.phoneNumbers.length;
					},
					reset: function() {
						this.phoneNumbers = [];
						this.save();
					}
				});

				setFixtures("<input id='reset' type='button' value='reset'/>");
				
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: []
				});

				PersonController.include({
					bindings: {
						"enable input":"phoneNumberCount"
					}
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			it("should start out disabled", function() {
				var reset = $('#reset');
				expect(reset.attr('disabled')).toBe('disabled');
			});

			it("should enable when phone numbers present", function() {
				Person.phoneNumbers.push("555-555-9090");
				Person.save();

				var reset = $('#reset');
				expect(reset.attr('disabled')).toBe(undefined);
			});
		});
		
		describe("with data-bind", function() {
			var Person;

			beforeEach(function() {
				PersonCollection.include({
					phoneNumberCount: function() {
						return this.phoneNumbers.length;
					},
					reset: function() {
						this.phoneNumbers = [];
						this.save();
					}
				});

				setFixtures("<input id='reset' type='button' value='reset' data-bind='enable: phoneNumberCount'/>");
				
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: []
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			it("should start out disabled", function() {
				var reset = $('#reset');
				expect(reset.attr('disabled')).toBe('disabled');
			});

			it("should enable when phone numbers present", function() {
				Person.phoneNumbers.push("555-555-9090");
				Person.save();

				var reset = $('#reset');
				expect(reset.attr('disabled')).toBe(undefined);
			});
		});	
	});
	

	xdescribe("Visible", function() {
		var Person;

		beforeEach(function() {
			PersonCollection.include({
				phoneNumberCount: function() {
					return this.phoneNumbers.length;
				},
				reset: function() {
					this.phoneNumbers = [];
					this.save();
				}
			});
			setFixtures("<input id='reset' type='button' value='reset' data-bind='visible: phoneNumberCount'/>");
			Person = PersonCollection.create({ 
				firstName: "Nathan", 
				lastName: "Palmer",
				phoneNumbers: []
			});
		});

		it("should start out hidden", function() {
			var reset = $('#reset');
			expect(reset.css('display')).toBe('none');
		});

		it("should display when phone numbers present", function() {
			Person.phoneNumbers.push("555-555-9090");
			Person.save();

			var reset = $('#reset');
			expect(reset.css('display')).toBe('inline-block');
		});
	});

	xdescribe("Submit", function() {
		var Person;

		beforeEach(function() {
			PersonCollection.include({
				currentNumber: "",

				addNumber: function() {
					this.phoneNumbers.push(this.currentNumber);	
				}
			});

			setFixtures([
				"<form data-bind='submit: addNumber'>",
					"<input type='text' data-bind='value: currentNumber, valueUpdate: \"afterkeydown\"'/>",
					"<input type='submit' id='submit'/>",
				"</form>"
			].join(""));

			Person = PersonCollection.create({ 
				firstName: "Nathan", 
				lastName: "Palmer",
				phoneNumbers: []
			});
		});

		it("should capture submit event", function() {
			Person.currentNumber = "555-555-9090";
			Person.save();

			$('#submit').click();

			expect(Person.phoneNumbers.length).toBe(1);
			expect(Person.phoneNumbers[0]).toBe("555-555-9090");
		});
	});

	xdescribe("Checked", function() {
		var Person;

		beforeEach(function() {
			setFixtures([
				"<form data-bind='submit: addNumber'>",
					"<input type='checkbox' data-bind='checked: person' id='person'/>",
					"<input type='submit' id='submit'/>",
				"</form>"
			].join(""));

			Person = PersonCollection.create({ 
				firstName: "Nathan", 
				lastName: "Palmer",
				person: true
			});
		});

		it("should bind to person", function() {
			var person = $('#person');
			expect(person.attr('checked')).toBe('checked');
		});

		it("should change when model is updated", function() {
			Person.person = false;
			Person.save();

			var person = $('#person');
			expect(person.attr('checked')).toBe(undefined);
		})
	});

	xdescribe("Radio", function() {
		var Person;

		beforeEach(function() {
			setFixtures([
				"<form data-bind='submit: addNumber'>",
					"<input type='radio' data-bind='checked: title' value='Mr' id='mr'/>",
					"<input type='radio' data-bind='checked: title' value='Mrs' id='mrs'/>",
					"<input type='submit' id='submit'/>",
				"</form>"
			].join(""));

			Person = PersonCollection.create({ 
				firstName: "Nathan", 
				lastName: "Palmer",
				title: "Mr"
			});
		});

		it("should bind to mr", function() {
			var mr = $('#mr');
			var mrs = $('#mrs');
			expect(mr.attr('checked')).toBe('checked');
			expect(mrs.attr('checked')).toBe(undefined);
		});

		it("should change when model is updated", function() {
			Person.title = "Mrs";
			Person.save();

			var mr = $('#mr');
			var mrs = $('#mrs');
			expect(mr.attr('checked')).toBe(undefined);
			expect(mrs.attr('checked')).toBe('checked');
		})
	});

});