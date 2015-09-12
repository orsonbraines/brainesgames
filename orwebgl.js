console.log("orwebgl.js loaded");

var orwebgl={};

with(orwebgl){
	orwebgl.fss1 = "void main(void){"+
	"gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);}";
	orwebgl.vss1 = "attribute vec4 aPos;"+
    "void main(){gl_Position = aPos;}";

	orwebgl.initGL=function (canvas) {
		try {
			gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
		} catch (e) {
		}
		if (!gl) {
			alert("Could not initialise WebGL");
		}
	}
	
	

}