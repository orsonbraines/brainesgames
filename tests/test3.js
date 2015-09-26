var gl,bgProg,bgVBO,cProg,cVBO,oProg,oVBO,oVertices;
var aPosLocBG,aPosLocO,aThetaLoc,uCenterLoc,uRadiusLoc,uColourLoc;
var circles,vs,numFloatsO;

window.onload=webGLStart;

function webGLStart() {
	var canvas = document.getElementById("canvas0");
	gl=orwebgl.initGL(canvas);
	initBG();
	initCircles();
	initOther();
	setInterval(animLoop,1000/60);
}

function initBG(){
	with(orwebgl){
		var vss="attribute vec4 aPos;"+
		"void main(){gl_Position=aPos;"+
		"gl_PointSize=2.0;}";
		bgProg=initProg(gl,vss,fss1);
		aPosLocBG=gl.getAttribLocation(bgProg,"aPos");
		gl.enableVertexAttribArray(aPosLocBG);
		var starVertices=new Array(200);
		for(var i=0;i<200;i++){
			starVertices[i]=2*Math.random()-1;
		}
		
		bgVBO=gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bgVBO);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(starVertices), gl.STATIC_DRAW);
	}
}

function initCircles(){
	with(orwebgl){
		var vss="attribute float aTheta;"+"\n"+
			"uniform vec2 uCenter;"+"\n"+
			"uniform float uRadius;"+"\n"+
			"void main(){if(aTheta<0.0)gl_Position=vec4(uCenter.x,uCenter.y,0,1);"+"\n"+
			"else gl_Position=vec4(uCenter.x+uRadius*cos(aTheta),uCenter.y+uRadius*sin(aTheta),0,1);}";
		
		var fss = "void main(void){"+
			"gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);}";
		
		cProg=initProg(gl,vss,fss);
		aThetaLoc=gl.getAttribLocation(cProg,"aTheta");
		uCenterLoc=gl.getUniformLocation(cProg,"uCenter");
		uRadiusLoc=gl.getUniformLocation(cProg,"uRadius");
		
		gl.enableVertexAttribArray(aThetaLoc);
		
		var thetas=new Array(32);
		thetas[0]=-1;
		for(var i=0;i<=30;i++){
			thetas[i+1]=i*2*Math.PI/30;
		}
		
		circles=new Array(25);
		for(var i=0;i<circles.length;i++){
			circles[i]=new obrengine.Circle(new obrengine.Vector2d(2*Math.random()-1,2*Math.random()-1),
				Math.random()/4);
		}
		vs=new Array(circles.length);
		for(var i=0;i<vs.length;i++){
			vs[i]=new obrengine.Vector2d(Math.random()/30-1/60,Math.random()/30-1/60);
		}
		
		cVBO=gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cVBO);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(thetas), gl.STATIC_DRAW);
	}
}

function initOther(){
	with(orwebgl){
		var fss ="precision mediump float;"+"\n"+
			"uniform vec4 uColour;"+"\n"+
			"void main(void){"+"\n"+
			"gl_FragColor = uColour;}";
		
		oProg=initProg(gl,vss1,fss);
		uColourLoc=gl.getUniformLocation(oProg,"uColour");
		aPosLocO=gl.getAttribLocation(oProg,"aPos");
		gl.enableVertexAttribArray(aPosLocO);
		
		numFloatsO=5000;
		oVertices=new Float32Array(numFloatsO);
		for(var i=0;i<numFloatsO;i++){
			oVertices[i]=2*Math.random()-1;
		}
		
		oVBO=gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, oVBO);
		gl.bufferData(gl.ARRAY_BUFFER, oVertices, gl.STREAM_DRAW);
	}
}

function render(){
	gl.clearColor(0,0,0,1);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(bgProg);
	gl.bindBuffer(gl.ARRAY_BUFFER, bgVBO);
	gl.vertexAttribPointer(aPosLocBG,2, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.POINTS,0,100);
		
	gl.useProgram(oProg);
	gl.bindBuffer(gl.ARRAY_BUFFER, oVBO);
	gl.bufferSubData(gl.ARRAY_BUFFER,0,oVertices);
	gl.vertexAttribPointer(aPosLocO,2, gl.FLOAT, false, 0, 0);
	gl.uniform4f(uColourLoc,1.0,0.5,0.0,1.0);
	gl.drawArrays(gl.TRIANGLES,0,numFloatsO/2);

	gl.useProgram(cProg);
	gl.bindBuffer(gl.ARRAY_BUFFER, cVBO);
	gl.vertexAttribPointer(aThetaLoc,1, gl.FLOAT, false, 0, 0);
	for(var i=0;i<circles.length;i++){
		gl.uniform2f(uCenterLoc,circles[i].center.x,circles[i].center.y);
		gl.uniform1f(uRadiusLoc,circles[i].radius);
		gl.drawArrays(gl.TRIANGLE_FAN,0,32);
	}
}

function move(){
	for(var i=0;i<circles.length;i++){
		circles[i].center.add(vs[i]);
		if(circles[i].center.x>1 || circles[i].center.x<-1){
			circles[i].center.x-=vs[i].x;
			vs[i].x*=-1;
		}
		if(circles[i].center.y>1 || circles[i].center.y<-1){
			circles[i].center.y-=vs[i].y;
			vs[i].y*=-1;
		}
	}
	
	for(var i=0;i<numFloatsO;i++){
		oVertices[i]+=0.001;
	}
}

function animLoop(){
	move();
	render();
}