Template = 
	keys: [ ]
	bind: (operators,model,el) ->
	unbind: (operators,model,el) ->

Update =
	keys: [ "text", "value" ]

	bind: (operators,model,el) ->
		el.bind("change", => @change(operators,model,el))
		model.bind("change", => @update(operators,model,el))
		@update(operators,model,el)

	unbind: (operators,model,el) ->
		el.unbind("change")
		model.unbind("change")

	change: (operators,model,el) ->
		el.each () ->
			e = $(@)
			for operator in operators
				switch @tagName
					when "INPUT", "SELECT", "TEXTAREA"
						model.updateAttribute(operator.property, e.val())
					else
						model.updateAttribute(operator.property, e.text())

	update: (operators,model,el) ->
		el.each () ->
			e = $(@)
			for operator in operators
				value = DataBind.eval(model,operator.property)
				console.log "Update #{e.tagName} #{operator.property} #{value}"
				switch @tagName
					when "INPUT", "TEXTAREA"
						e.val(value)
					when "SELECT"
						e.find("option[value=#{value}]").attr("selected","selected")
					else
						if typeof value is "object" and value.constructor is Array
							e.text(value.join(","))
						else
							e.text(value)

Options = 
	keys: [ "options", "selectedOptions" ]

	bind: (operators,model,el) ->
		model.bind("update", => @update(operators,model,el))
		@update(operators,model,el)

		if operators.some((e) -> e.name is "selectedOptions")
			el.bind("change", => @change(operators,model,el))

	unbind: (operators,model,el) ->
		model.unbind("update")

	update: (operators,model,el) ->
		ops = operators.filter((e) -> e.name is "options")[0]
		opsSelected = operators.filter((e) -> e.name is "selectedOptions")
		selectedOptions = if opsSelected.length is 1 then DataBind.eval(model,opsSelected[0].property) else [] 

		array = DataBind.eval(model,ops.property)
		options = el.children('options')

		for item,index in array
			option = if options.length > index then options[index] else null
			selected = if selectedOptions.indexOf(item) >= 0 then "selected='selected'" else ""

			if option is null
				el.append "<option value='#{item}' #{selected}>#{item}</option>"
			else
				option.text = item if option.text is not item

		if options.length > array.length
			for index in [array.length..options.length]
				$(options[index]).remove()

	change: (operators,model,el) ->
		operator = operators.filter((e) -> e.name is "selectedOptions")[0]
		
		model[operator.property] = [];
		el.find("option:selected").each(() ->
			model[operator.property].push($(this).text())
		)
		model.save()

Click = 
	keys: [ "click" ]
	bind: (operators,model,el) ->
		el.bind("click", => @click(operators,model,el))

	unbind: (operators,model,el) ->
		el.unbind("click")

	click: (operators,model,el) ->
		for operator in operators
			DataBind.eval(model,operator.property)

DataBind =
	binders: [ Update, Options, Click ]

	initializeBindings: (args...) ->
		@trigger "destroy-bindings"

		controller = this
		splitter = /(\w+)(\[?.*]?) (.*)/

		findBinder = (key) ->
			for binder in controller.binders
				if binder.keys.indexOf(key) >= 0
					return binder
			
			return null

		addElement = (elements,info,property) ->
			binder = findBinder(info.name)
			if binder is null then return

			matching = elements.filter((e)->e.el[0] is info.element[0] and e.binder is binder)
			if matching.length is 0
				element = 
					el: info.element
					binder: binder
					operators: []

				elements.push(element)
			else
				element = elements[0]

			element.operators.push({
				name: info.name
				parameters: info.parameters
				property: property
			})

		parse = (key) ->
			match = key.match(splitter)
			name = match[1]
			parameters = match[2]
			selector = match[3]

			if selector is ""
				selector = $(controller.el.selector)
			else
				selector = $(controller.el.selector + " " + selector)

			return {
				name: name
				parameters: parameters
				element: selector
			}

		init = (element) ->
			operators = element.operators
			model = controller.model
			el = element.el

			element.binder.bind(operators,model,el)
			controller.bind "destroy", ->
				element.binder.unbind(operators,model,el)
			controller.bind "destroy-bindings", ->
				element.binder.unbind(operators,model,el)

		trim = (s) ->
			s.replace(/^\s+|\s+$/g,"")

		elements = []

		for key of @bindings
			property = @bindings[key]
			info = parse(key)
			addElement(elements,info,property)
		
		@el.find("*[data-bind]").each () ->
			e = $(this)
			databind = e.data("bind").split(",")
			attributes = databind.map (item) ->
				fullString = trim(item)
				match = fullString.match(/(.*):(.*)/)
				name = match[1]
				value = trim(match[2])

				return {
					name: name
					value: value,
					element: e
				}
			
			for info in attributes
				binder = findBinder(info.name)
				addElement(elements,info,info.value)

		for element in elements
			init(element)

		@

	eval: (item,value) ->
		switch typeof item[value]
			when "function" then result = item[value]()
			else result = item[value]
		result 

@DataBind = DataBind
