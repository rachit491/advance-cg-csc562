/**
 * Extracting planes from frustum and then check 
 * for all verties of triangle to be within these plane bounds
 * Source - http://www.lighthouse3d.com/tutorials/view-frustum-culling/clip-space-approach-extracting-the-planes/
 */

function Frustum() {
	this.mvpMatrix = mat4.create();
	this.planeLeft = new Plane();
	this.planeRight = new Plane();
	this.planeTop = new Plane();
	this.planeBottom = new Plane();
	this.planeFar = new Plane();
	this.planeNear = new Plane();

	this.portals = [];
}

Frustum.prototype.setMVP = function(mvpMatrix) {
	this.mvpMatrix = mvpMatrix;
	this.drawPlanes();
};

Frustum.prototype.drawPlanes = function() {
	var col1 = [];
	var col2 = [];
	var col3 = [];
	var col4 = [];

	for(var i=0; i<this.mvpMatrix.length; i++) {
		switch(i%4) {
			case 0: col1.push(this.mvpMatrix[i]); break;
			case 1: col2.push(this.mvpMatrix[i]); break;
			case 2: col3.push(this.mvpMatrix[i]); break;
			case 3: col4.push(this.mvpMatrix[i]); break;
		}
	}

	this.planeLeft.setPlaneData(col1, col4);
	this.planeRight.setPlaneData(this.negate(col1), col4);
	this.planeTop.setPlaneData(this.negate(col2), col4);
	this.planeBottom.setPlaneData(col2, col4);
	this.planeFar.setPlaneData(this.negate(col3), col4);
	this.planeNear.setPlaneData(col3, col4);
};

Frustum.prototype.negate = function(col) {
	var result = [];
	for(var i=0; i<col.length; i++) {
		result.push(-col[i]);
	}
	return result;
};

Frustum.prototype.triangleInFrustum = function(vertices) {
	var count = 0;
	
	for(var i=0; i<vertices.length; i++) {
		if(this.pointInFrustum(vertices[i])) {
			count++;
		}
	}

	if(count >= 1)
		return true;

	return false;
};

Frustum.prototype.pointInFrustum = function(point) {
	
	if((this.planeLeft.a*point[0] + this.planeLeft.b*point[1] + this.planeLeft.c*point[2] + this.planeLeft.d > 0) &&
		(this.planeRight.a*point[0] + this.planeRight.b*point[1] + this.planeRight.c*point[2] + this.planeRight.d > 0) &&
		(this.planeTop.a*point[0] + this.planeTop.b*point[1] + this.planeTop.c*point[2] + this.planeTop.d > 0) &&
		(this.planeBottom.a*point[0] + this.planeBottom.b*point[1] + this.planeBottom.c*point[2] + this.planeBottom.d > 0) &&
		(this.planeFar.a*point[0] + this.planeFar.b*point[1] + this.planeFar.c*point[2] + this.planeFar.d > 0) &&
		(this.planeNear.a*point[0] + this.planeNear.b*point[1] + this.planeNear.c*point[2] + this.planeNear.d > 0)) {
		
		return true;
	}

	return false;
};

Frustum.prototype.createPortalFrustum = function(hMatrix, zFar, room) {
	var pMatrix = mat4.create();
	var vMatrix = mat4.create();
	var hpvMatrix = mat4.create();
	var fov = Math.PI/2;
	var p1 = vec3.fromValues(0,0,0);
	var p2 = vec3.fromValues(0,0,0);

	if(this.portals.length == 0) {
		for(var i=0; i<portalsZ.length; i++) {
		    this.portals.push(new Frustum());
		}
	}

	if(this.portals.length == portalsZ.length) {
		for(var i=0; i<portalsZ.length; i++) {
			vec3.subtract(p1, portalsZ[i], Eye);
			vec3.subtract(p2, Center, Eye);
			vec3.normalize(p1, p1);
			vec3.normalize(p2, p2);
			
			fov = vec3.dot(p1, p2);
			if(fov > 1) fov = 0;
			else fov = Math.acos(fov);
			
		    mat4.perspective(pMatrix,fov/3,1,0.1,50); // create projection matrix
		    mat4.lookAt(vMatrix,Eye,portalsZ[i],Up); // create view matrix
		    mat4.multiply(hpvMatrix,hMatrix,pMatrix); // handedness * projection
		    mat4.multiply(hpvMatrix,hpvMatrix,vMatrix); // handedness * projection * view

		    this.portals[i].setMVP(hpvMatrix);
		}
	}
};

Frustum.prototype.triangleInPortal = function(vertices) {
	for(var j=0; j<vertices.length; j++) {
		if(this.pointInPortal(vertices[j])) {
			return true;
		}
	}

	return false;
};

Frustum.prototype.pointInPortal = function(point) {
	
	for(var i=0; i<portalsZ.length; i++) {
		if(this.pointInFrustum(portalsZ[i]) &&	//find which portal is visible at first
			(this.portals[i].planeLeft.a*point[0] + this.portals[i].planeLeft.b*point[1] + this.portals[i].planeLeft.c*point[2] + this.portals[i].planeLeft.d > 0) &&
			(this.portals[i].planeRight.a*point[0] + this.portals[i].planeRight.b*point[1] + this.portals[i].planeRight.c*point[2] + this.portals[i].planeRight.d > 0) &&
			(this.portals[i].planeTop.a*point[0] + this.portals[i].planeTop.b*point[1] + this.portals[i].planeTop.c*point[2] + this.portals[i].planeTop.d > 0) &&
			(this.portals[i].planeBottom.a*point[0] + this.portals[i].planeBottom.b*point[1] + this.portals[i].planeBottom.c*point[2] + this.portals[i].planeBottom.d > 0) &&
			(this.portals[i].planeFar.a*point[0] + this.portals[i].planeFar.b*point[1] + this.portals[i].planeFar.c*point[2] + this.portals[i].planeFar.d > 0) &&
			(this.portals[i].planeNear.a*point[0] + this.portals[i].planeNear.b*point[1] + this.portals[i].planeNear.c*point[2] + this.portals[i].planeNear.d > 0)) {
			
			return true;
		}
	}

	return false;
};



