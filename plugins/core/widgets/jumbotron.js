var JSON = require("JSON"); 

exports.module = {
	name: "Editable Hero Widget",
	does: "Implements an editable jumbotron control that the user can edit.",
}; 

var Widget = function(x){
	this.server = x; 
	this.model = {
		id: "editable_hero",
		content: "Default hero widget content"
	}; 
}

exports.init = function(){}

exports.new = function(x){
	return new Widget(x); 
}

Widget.prototype.data = function(data){
	if(data){
		this.model = data; 
		return this; 
	}
	else return this.model; 
}

Widget.prototype.render = function(req){
	var wildcard = "/editable/hero_bg_"+this.model.id+"*";
	var public_image_path = "/editable/hero_bg_default.jpg";
	var widget = this; 
	var args = req.args; 
	var session = req.session; 
	var path = req.path; 
	var result = this.server.defer(); 
	function callback(x){result.resolve(x);}
	
	// retreive the widget text and render the widget
	this.server.db.objects.properties.find({
		where: {
			object_type: "editable_hero",
			object_id: "editable_hero"+widget.model.id,
			property_name: "content"
		}})
	.success(function(value){
		if(value){
			widget.model.content = value.property_value||"Edit me!"; 
			widget.model.editable = session.user.loggedin; 
		}
		
		widget.server.vfs.search(wildcard, function(error, files) {
			if(!error && files.length){
				public_image_path = files[0]; 
			}
			var html = session.render("editable_hero_widget", {
				model: widget.model,
				background: public_image_path,
			}); 
			callback(html); 
		}); 
	}); 
	return result.promise; 
}