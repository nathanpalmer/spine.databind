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
			@
		@

	update: (operators,model,el) ->
		el.each () ->
			e = $(@)
			for operator in operators
				value = DataBind.get(model,operator.property)
				switch @tagName
					when "INPUT", "TEXTAREA"
						e.val(value)
					when "SELECT"
						e.find("option[value=#{value}]").attr("selected","selected")
					else
						if typeof value is "object" and value.constructor is Array
							e.text(value.join(","))
						else if typeof value is "object"
							e.text(value.toString())
						else
							e.text(value)
			@
		@

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
		selectedOptions = if opsSelected.length is 1 then DataBind.get(model,opsSelected[0].property) else [] 
		selectedOptions = [selectedOptions] if not (selectedOptions instanceof Array)
			
		array = DataBind.get(model,ops.property)
		options = el.children('option')

		if array instanceof Array
			result = ({ text: item, value: item} for item in array)
		else
			result = ({ text: value, value: key } for own key, value of array)				

		for item,index in result
			option = if options.length > index then $(options[index]) else null
			selected = if selectedOptions.indexOf(item.value) >= 0 then "selected='selected'" else ""

			if option is null
				el.append "<option value='#{item.value}' #{selected}>#{item.text}</option>"
			else
				option.text(item.text) if option.text isnt item.text
				option.val(item.value) if option.value isnt item.value
				if option.attr("selected") is "selected" or option.attr("selected") is true
					option.removeAttr("selected") if selected.length is 0
				else
					option.attr("selected","selected") if selected.length > 0
					
		if options.length > array.length
			for index in [array.length..options.length]
				$(options[index]).remove()

	change: (operators,model,el) ->
		operator = operators.filter((e) -> e.name is "selectedOptions")[0]
		
		items = []
		el.find("option:selected").each(() ->
			items.push($(this).val())
		)

		if model[operator.property] instanceof Array or items.length > 1
			model[operator.property] = []
			model[operator.property] = model[operator.property].concat(items)
		else
			if items.length is 1
				model[operator.property] = items[0]

		model.save()

Click = 
	keys: [ "click" ]
	bind: (operators,model,el) ->
		el.bind("click", => @click(operators,model,el))

	unbind: (operators,model,el) ->
		el.unbind("click")

	click: (operators,model,el) ->
		for operator in operators
			DataBind.get(model,operator.property)

Enable = 
	keys: [ "enable" ]

	bind: (operators,model,el) ->
		model.bind("update", => @update(operators,model,el))
		@update(operators,model,el)

	unbind: (operators,model,el) ->
		model.unbind("update")

	update: (operators,model,el) ->
		operator = operators.filter((e) -> e.name is "enable")[0]
		result = DataBind.get(model,operator.property)

		if result
			el.removeAttr("disabled")
		else
			el.attr("disabled","disabled")

Visible = 
	keys: [ "visible" ]

	bind: (operators,model,el) ->
		model.bind("update", => @update(operators,model,el))
		@update(operators,model,el)

	unbind: (operators,model,el) ->
		model.unbind("update")

	update: (operators,model,el) ->
		operator = operators.filter((e) -> e.name is "visible")[0]
		result = DataBind.get(model,operator.property)

		if result
			el.show()
		else
			el.hide()

Attribute = 
	keys: [ "attr" ]
	bind: (operators,model,el) ->
		model.bind("update", => @update(operators,model,el))
		@update(operators,model,el)

	unbind: (operators,model,el) ->
		model.unbind("update")

	update: (operators,model,el) ->
		operator = operators.filter((e) -> e.name is "attr")[0]
		json = JSON.parse(operator.property)
		for own property of json
			value = DataBind.get(model,json[property])
			el.attr(property,value)
		@

Checked = 
	keys: [ "checked" ]

	bind: (operators,model,el) ->
		el.bind("change", => @change(operators,model,el))
		model.bind("change", => @update(operators,model,el))
		@update(operators,model,el)

	unbind: (operators,model,el) ->
		el.unbind("change")
		model.unbind("change")

	change: (operators,model,el) ->
		operator = operators.filter((e) -> e.name is "checked")[0]
		if el.attr("type") is "radio"
			model.updateAttribute(operator.property, el.val())
		else
			value = el.attr("checked") is "checked" or el.attr("checked") is true
			model.updateAttribute(operator.property, value)

	update: (operators,model,el) ->
		operator = operators.filter((e) -> e.name is "checked")[0]
		result = DataBind.get(model,operator.property)
		value = el.val()

		if el.attr("type") is "radio"
			if result is value
				el.attr("checked", "checked")
			else
				el.removeAttr("checked")
		else
			if not result
				el.removeAttr("checked")
			else
				el.attr("checked", "checked")
	
DataBind =
	binders: [ Update, Options, Click, Enable, Visible, Attribute, Checked ]

	refreshBindings: (model) ->
		@trigger "destroy-bindings"

		controller = this
		splitter = /(\w+)(\\[.*])? (.*)/

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
				element = matching[0]

			element.operators.push({
				name: info.name
				parameters: info.parameters
				property: property
			})

		parse = (key) ->
			match = key.match(splitter)
			
			if match isnt null
				name = match[1]
				parameters = match[2]
				selector = match[3]
			else
				name = key
				selector = ""

			if selector is ""
				selector = controller.el
			else
				selector = controller.el.find(selector)

			return {
				name: name
				parameters: parameters
				element: selector
			}

		init = (element) ->
			operators = element.operators
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
			if @bindings.hasOwnProperty(key)
				property = @bindings[key]
				info = parse(key)
				addElement(elements,info,property)
		
		@el.find("*[data-bind]").each () ->
			e = $(this)
			databind = e.data("bind").split(",")
			attributes = databind.map (item) ->
				fullString = trim(item)
				match = fullString.match(/(\w+):(.*)/)
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

	get: (item,value) ->
		if typeof item[value] is "function"
			result = item[value]()
		else
			result = item[value]
		result 

@Spine.DataBind = DataBind
