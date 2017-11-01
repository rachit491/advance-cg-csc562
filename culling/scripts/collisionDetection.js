function CollisionDetection() {
	this.box = [];
	this.keyCode = "";
	this.prevPt = 0;
}

CollisionDetection.prototype.getBox = function() {
	return this.box;
};

CollisionDetection.prototype.addBox = function(val) {
	this.box.push(val);
};

CollisionDetection.prototype.setKeyValue = function(val) {
	this.keyCode = val;
};

CollisionDetection.prototype.checkCollision = function(pt) {

	var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector

	for(var i=0; i<this.box.length; i++) {
		if(pt[0] >= this.box[i].min[0] && pt[0] <= this.box[i].max[0]) {
			if(pt[1] >= this.box[i].min[1] && pt[1] <= this.box[i].max[1]) {
		    	if(pt[2] >= this.box[i].min[2] && pt[2] <= this.box[i].max[2]) {
		    		bump.play();
		    		switch(this.keyCode) {
		    			case "KeyA" : 
		    							Eye = vec3.add(Eye,Eye,vec3.scale(temp,viewRight,-2*viewDelta));
                						Center = vec3.add(Center,Center,vec3.scale(temp,viewRight,-2*viewDelta));
                						break;
		    			case "KeyD" : 
		    							Eye = vec3.add(Eye,Eye,vec3.scale(temp,viewRight,2*viewDelta));
                						Center = vec3.add(Center,Center,vec3.scale(temp,viewRight,2*viewDelta));
                						break;
						case "KeyW" : 
		    							Eye = vec3.add(Eye,Eye,vec3.scale(temp,lookAt,-2*viewDelta));
                						Center = vec3.add(Center,Center,vec3.scale(temp,lookAt,-2*viewDelta));
		    							break;
		    			case "KeyS" : 
		    							Eye = vec3.add(Eye,Eye,vec3.scale(temp,lookAt,2*viewDelta));
                						Center = vec3.add(Center,Center,vec3.scale(temp,lookAt,2*viewDelta));
		    							break;		    			
		    		}

					console.log("collided");
				}
			}
		}
	}

	if(pt[1]<=0 || pt[1]>=1) {
		bump.play();
		switch(this.keyCode) {
			case "KeyQ" : 
							Eye = vec3.add(Eye,Eye,vec3.scale(temp,Up,-2*viewDelta));
                			Center = vec3.add(Center,Center,vec3.scale(temp,Up,-2*viewDelta));
							break;
			case "KeyE" : 
							Eye = vec3.add(Eye,Eye,vec3.scale(temp,Up,2*viewDelta));
                			Center = vec3.add(Center,Center,vec3.scale(temp,Up,2*viewDelta));
							break;
		}
	}
};