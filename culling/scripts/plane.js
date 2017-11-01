function Plane() {
	//set up default values for a b c d where ax + by + cz + d = 0 is plane equation
	this.a = 0;
	this.b = 0;
	this.c = 0;
	this.d = 0;
}

Plane.prototype.setPlaneData = function(col1, col2) {
	this.a = col1[0] + col2[0];
	this.b = col1[1] + col2[1];
	this.c = col1[2] + col2[2];
	this.d = col1[3] + col2[3];
};