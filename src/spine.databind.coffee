class Template
	keys: [ ]

	bind: (operators,model,controller,el,options) ->
	unbind: (operators,model,controller,el,options) ->

	init: (operators,model,controller,el,options,event) ->
		model.constructor.bind(event, binder = () => @update(operators,model,controller,el,options))
		controller.bind("destroy-bindings", unbinder = (record) =>
			#if record && model.eql(record)
			model.constructor.unbind(event,binder)
			controller.unbind("destroy-bindings", unbinder)
		)

	get: (item,value) ->
		if typeof item[value] is "function"
			result = item[value]()
		else
			result = Object.getPrototypeOf(item)[value]
		result

	set: (model,property,value,options) ->
		if !options or options.save
			model.updateAttribute(property,value)
		else
			model[property] = value

class Update extends Template
	keys: [ "text", "value" ]

	bind: (operators,model,controller,el,options) ->
		el.bind("change", => @change(operators,model,controller,el,options))

		if options.watch
			@init([operator],model,controller,el,options,"update["+operator.property+"]") for operator in operators
		else
			@init(operators,model,controller,el,options,"change")

		@update(operators,model,controller,el,options)
 
	change: (operators,model,controller,el,options) ->
		binder = @
		el.each () ->
			e = $(@)
			for operator in operators
				switch @tagName
					when "INPUT", "SELECT", "TEXTAREA"
						binder.set(model,operator.property,e.val(), options)
					else
						binder.set(model,operator.property,e.text(), options)
			@
		@

	update: (operators,model,controller,el,options) ->
		binder = @
		el.each () ->
			e = $(@)
			for operator in operators
				value = binder.get(model,operator.property)
				switch @tagName
					when "INPUT", "TEXTAREA"
						e.val(value)
					when "SELECT"
						# Deselect
						e.find("option[selected]").each((key,element) -> $(element).removeAttr("selected"))
						# Select
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

class Options extends Template
	keys: [ "options", "selectedOptions" ]

	bind: (operators,model,controller,el,options) ->
		if options.watch
			ops = operators.filter((e) -> e.name is "options")[0]
			opsSelected = operators.filter((e) -> e.name is "selectedOptions")[0]
			
			# ops
			@init([ops,opsSelected],model,controller,el,options,"update["+ops.property+"]")
			@init([ops,opsSelected],model,controller,el,options,"update["+opsSelected.property+"]")
		else
			@init(operators,model,controller,el,options,"update")

		@update(operators,model,controller,el,options)

		if operators.some((e) -> e.name is "selectedOptions")
			el.bind("change", => @change(operators,model,controller,el,options))

	update: (operators,model,controller,el,options) ->
		ops = operators.filter((e) -> e.name is "options")[0]
		opsSelected = operators.filter((e) -> e.name is "selectedOptions")
		selectedOptions = if opsSelected.length is 1 then @get(model,opsSelected[0].property) else [] 
		selectedOptions = [selectedOptions] if not (selectedOptions instanceof Array)
			
		array = if ops then @get(model,ops.property) or [] else []
		options = el.children('option')

		if array instanceof Array
			result = ({ text: item, value: item} for item in array)
		else
		    result = Object.keys(array)
		                   .map((r) => { text: array[r], value: r })
		                   .sort((a,b) => 
		                   		if (b.value == "")
		                   			return 1
		                   		else if (a.value == "")
		                   			return -1
		                   		else
		                   			return a.text.localeCompare(b.text)
		                   	)

		for item,index in result
			option = if options.length > index then $(options[index]) else null
			selected = if selectedOptions.indexOf(item.value) >= 0 then "selected='selected'" else ""

			if option is null
				el.append "<option value='#{item.value}' #{selected}>#{item.text}</option>"
			else
				option.text(item.text) if option.text() isnt item.text
				option.val(item.value) if option.val?() isnt item.value
				if option.attr("selected") is "selected" or option.attr("selected") is true
					option.removeAttr("selected") if selected.length is 0
				else
					option.attr("selected","selected") if selected.length > 0
					
		if options.length > array.length
			for index in [array.length..options.length]
				$(options[index]).remove()

	change: (operators,model,controller,el,options) ->
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

		if !options || options.save
			model.save()

class Click extends Template
	keys: [ "click" ]

	bind: (operators,model,controller,el,options) ->
		el.bind("click", => @click(operators,model,controller,el,options))

	click: (operators,model,controller,el,options) ->
		binder = @
		for operator in operators
			binder.get(model,operator.property)

class Enable extends Template
	keys: [ "enable" ]

	bind: (operators,model,controller,el,options) ->
		if options.watch
			@init([operator],model,controller,el,options,"update["+operator.property+"]") for operator in operators
		else
			@init(operators,model,controller,el,options,"change")

		@update(operators,model,controller,el,options)

	update: (operators,model,controller,el,options) ->
		operator = operators.filter((e) -> e.name is "enable")[0]
		result = @get(model,operator.property)

		if result
			el.removeAttr("disabled")
		else
			el.attr("disabled","disabled")

class Visible extends Template
	keys: [ "visible" ]

	bind: (operators,model,controller,el,options) ->
		if options.watch
			@init([operator],model,controller,el,options,"update["+operator.property+"]") for operator in operators
		else
			@init(operators,model,controller,el,options,"update")

		@update(operators,model,controller,el,options)

	update: (operators,model,controller,el,options) ->
		operator = operators.filter((e) -> e.name is "visible")[0]
		result = @get(model,operator.property)

		if result
			el.show()
		else
			el.hide()

class Attribute extends Template
	keys: [ "attr" ]

	bind: (operators,model,controller,el,options) ->
		@init(operators,model,controller,el,options,"update")
		@update(operators,model,controller,el,options)

	update: (operators,model,controller,el,options) ->
		binder = @
		operator = operators.filter((e) -> e.name is "attr")[0]
		json = JSON.parse(operator.property)
		for own property of json
			value = binder.get(model,json[property])
			el.attr(property,value)
		@

class Checked extends Template
	keys: [ "checked" ]

	bind: (operators,model,controller,el,options) ->
		el.bind("change", => @change(operators,model,controller,el,options))

		if options.watch
			@init([operator],model,controller,el,options,"update["+operator.property+"]") for operator in operators
		else
			@init(operators,model,controller,el,options,"change")
		
		@update(operators,model,controller,el,options)

	change: (operators,model,controller,el,options) ->
		operator = operators.filter((e) -> e.name is "checked")[0]
		if el.attr("type") is "radio"
			@set(model,operator.property,el.val(),options)
		else
			value = el.is(":checked")
			@set(model,operator.property,value,options)

	update: (operators,model,controller,el,options) ->
		operator = operators.filter((e) -> e.name is "checked")[0]
		result = @get(model,operator.property)
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
	binders: [ 
		new Update()
		new Options()
		new Click()
		new Enable()
		new Visible()
		new Attribute()
		new Checked()
	]

	refreshBindings: (model) ->
		model = this.model if not model
		return if not model

		controller = this
		controller.trigger "destroy-bindings"

		splitter = /(\w+)(\\[.*])? (.*)/

		options = 
			save: if model.watchEnabled then false else true
			watch: if model.watchEnabled then true else false

		$.extend(options, controller.bindingOptions)

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

			element.binder.bind(operators,model,controller,el,options)
			controller.bind "destroy", ->
				element.binder.unbind(operators,model,controller,el,options)

		trim = (s) ->
			s.replace(/^\s+|\s+$/g,"")

		bindingElements = (elements) ->
			(property) ->
				elements.filter (element) ->
					element.operators.some (item) ->
						item.property is property
				.map (result) ->
					result.el[0]

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

		@bindingElements = bindingElements(elements)

		@

DataBind.activators = [ "refreshBindings" ] if Spine.Activator

@Spine.DataBind = DataBind
