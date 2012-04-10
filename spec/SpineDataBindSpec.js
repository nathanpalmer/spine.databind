describe("Spine.DataBind", function() {
	var PersonCollection, PersonController;

	beforeEach(function() {
		PersonCollection = Spine.Model.setup("Person", [ 
			"firstName", 
			"lastName", 
			"phoneNumbers", 
			"phoneNumbersSelected",
			"company",
			"companies",
			"person",
			"title",
			"homepage"
		]);

		PersonController = Spine.Controller.create({
			init: function() {
				this.refreshBindings(this.model);
			}
		});

		PersonController.include(Spine.DataBind);
	});
	
	describe("Update", function() {
		var Person, Controller;

		var Tests = function() {
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
		};

		describe("with bindings", function() {
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

			Tests();
		});

		describe("with data-bind", function() {
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

			Tests();
		});
	});
	
	describe("Options", function() {
		var Person, Controller;

		var Tests = function() {
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

			it("should bind hashes", function() {
				var companySelect = $('#company');
				var companyHtml = [
					'<option value="" selected="selected">Select...</option>',
					'<option value="1">Apple</option>',
					'<option value="0">Google</option>'
				].join("");
				expect(companySelect.html()).toBe(companyHtml);
			});

			it("should bind hashes and selectedOptions", function() {
				var companySelect = $('#company');
				companySelect.find('option[value="0"]').attr("selected", "selected");
				companySelect.trigger("change");
				expect(Person.company).toBe("0");
			});
		};

		describe("with bindings", function() {
			beforeEach(function() {
				setFixtures([
					"<select id='phoneNumbers'/>",
					"<select id='company'/>"
				].join(""));

				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: [ "555-555-1010", "555-101-9999" ],
					phoneNumbersSelected: [],
					company: "",
					companies: { "": "Select...", 0: "Google", 1: "Apple" }
				});

				PersonController.include({
					bindings: {
						"options #phoneNumbers":"phoneNumbers",
						"selectedOptions #phoneNumbers":"phoneNumbersSelected",
						"options #company":"companies",
						"selectedOptions #company":"company"
					}
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();			
		});

		describe("with data-bind", function() {
			beforeEach(function() {
				setFixtures([
					"<select id='phoneNumbers' data-bind='options: phoneNumbers, selectedOptions: phoneNumbersSelected'/>",
					"<select id='company' data-bind='options: companies, selectedOptions: company'/>"
				].join(""));

				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: [ "555-555-1010", "555-101-9999" ],
					phoneNumbersSelected: [],
					company: "",
					companies: { "": "Select...", 0: "Google", 1: "Apple" }
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});

		
	});
	
	describe("Click", function() {
		var Person, Controller;

		var Tests = function() {
			it("should reset name", function() {
				expect(Person.firstName).toBe("Nathan");

				$('#reset').click();

				expect(Person.firstName).toBe("Reset");
			});
		};

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

			Tests();
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

			Tests();
		});
	});

	describe("Enable", function() {
		var Person, Controller;

		var Tests = function() {
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
		};

		describe("with bindings", function() {
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

			Tests();
		});
		
		describe("with data-bind", function() {
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

			Tests();
		});	
	});
	
	describe("Visible", function() {
		var Person, Controller;

		var Tests = function() {
			it("should start out hidden", function() {
				var reset = $('#reset');
				expect(reset.css('display')).toBe('none');
			});

			it("should display when phone numbers present", function() {
				Person.phoneNumbers.push("555-555-9090");
				Person.save();

				var reset = $('#reset');
				expect(reset.css('display')).toNotBe('none');
			});	
		};

		describe("with bindings", function() {
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
						"visible input":"phoneNumberCount"
					}
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();			
		});

		describe("with data-bind", function() {
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

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});	
	});

	describe("Attr", function() {
		var Person, Controller;

		var Tests = function() {
			it("should bind to href", function() {
				var a = $('#homepage');
				expect(a.attr('href')).toBe('http://www.example.com');
			});
		};

		describe("with bindings", function() {
			beforeEach(function() {
				setFixtures("<a id='homepage'/>");
				
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					homepage: "http://www.example.com",
					phoneNumbers: []
				});

				PersonController.include({
					bindings: {
						"attr a":'{ "href": "homepage" }'
					}
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();			
		});

		describe("with data-bind", function() {
			beforeEach(function() {
				setFixtures("<a id='homepage' data-bind='attr: { \"href\": \"homepage\" }'/>");
				
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					homepage: "http://www.example.com",
					phoneNumbers: []
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
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

	describe("Checked", function() {
		var Person, Controller;

		var Tests = function() {
			it("should bind to person", function() {
				var person = $('#person');
				expect(person.attr('checked')).toBe('checked');
			});

			it("should change when model is updated", function() {
				Person.person = false;
				Person.save();

				var person = $('#person');
				expect(person.attr('checked')).toBe(undefined);
			});
		};

		describe("with bindings", function() {
			beforeEach(function() {
				setFixtures([
					"<form>",
						"<input type='checkbox' id='person'/>",
						"<input type='submit' id='submit'/>",
					"</form>"
				].join(""));

				PersonController.include({
					bindings: {
						"checked input[type=checkbox]": "person"
					}
				});

				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					person: true
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});

		describe("with data-bind", function() {
			beforeEach(function() {
				setFixtures([
					"<form>",
						"<input type='checkbox' data-bind='checked: person' id='person'/>",
						"<input type='submit' id='submit'/>",
					"</form>"
				].join(""));

				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					person: true
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});
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