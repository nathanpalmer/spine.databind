describe("Spine.DataBind", function() {
	var PersonCollection;

	beforeEach(function() {
		PersonCollection = Spine.Model.setup("Person", [ "firstName", "lastName", "phoneNumbers", "phoneNumbersSelected" ]);
		PersonCollection.extend(DataBind);
		
	});

	describe("Update", function() {
		var Person;

		beforeEach(function() {
			setFixtures([
				"<span id='firstNameSpan' data-bind='text: firstName'/>",
				"<div id='firstNameDiv' data-bind='text: firstName'/>",
				"<input type='text' id='firstName' data-bind='value: firstName'/>",
				"<input type='textarea' id='firstNameTextArea' data-bind='value: firstName'/>",
				"<select id='firstNameSelect' data-bind='value: firstName'><option value='Other'/><option value='Nathan'/><option value='Eric'/></select>"
			].join(""));
			Person = PersonCollection.create({ firstName: "Nathan", lastName: "Palmer" });
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

	describe("Options", function() {
		var Person;

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