console.log("orwebgl.js loaded");
/**
	Dependencies: obrengine.js
*/

var orwebgl={};

with(orwebgl){
	
	/*
	*****SETUP
	*/
	orwebgl.verticesPerCircle=32;
	orwebgl.vss1 = "attribute vec4 aPos;"+
		"void main(){gl_Position = aPos;}";
	orwebgl.fss1 = "void main(void){"+
		"gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);}";


	orwebgl.initGL=function (canvas) {
		console.log("initing GL");
		try {
			gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
		} catch (e) {
			console.log("error");
		}
		if (!gl) {
			console.log("Could not initialise WebGL");
			alert("Could not initialise WebGL");
		}
		else{
			console.log("GL init success");
		}
		return gl;
	}
	
	
	orwebgl.initProg=function(gl,vss,fss){
		var vs=initShader(gl,false,vss);
		var fs=initShader(gl,true,fss);
		
		var prog=gl.createProgram();
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.linkProgram(prog);

		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		return prog;
	}
	
	orwebgl.initShader=function(gl,frag,source){
		var shader;
		if(frag) shader=gl.createShader(gl.FRAGMENT_SHADER);
		else shader=gl.createShader(gl.VERTEX_SHADER);
		
		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(shader));
			return null;
		}

		return shader;
	}
	
	/*
	*****Shapes
	*/
	
	orwebgl.vertexCount=function (shape){
		if(shape instanceof obrengine.Line)return 2;
		else if(shape instanceof obrengine.Circle)return verticesPerCircle;
		else if(shape instanceof obrengine.Rect)return 4;
		else if(shape instanceof obrengine.Polygon)return shape.vertices.length+2;
		else throw "Not a recognized shape";
	}
	
	orwebgl.vc=function(shapes){
		var vertices=0;
		for(var i=0;i<shapes.length;i++){
			vertices+=vertexCount(shapes[i]);
		}
		return vertices;
	}
	
	orwebgl.loadVertices=function(array,idx,shape){
		if(shape instanceof obrengine.Line){
			array[idx]=shape.p1.x;
			array[idx+1]=shape.p1.y;
			array[idx+2]=shape.p2.x;
			array[idx+3]=shape.p2.y;
		}
		else if(shape instanceof obrengine.Circle){
			array[idx]=shape.center.x;
			array[idx+1]=shape.center.y;
			for(var i=1;i<verticesPerCircle;i++){
				array[idx+2*i]=shape.center.x+shape.radius*Math.cos(2*Math.PI*(i-1)/(verticesPerCircle-2));
				array[idx+2*i+1]=shape.center.y+shape.radius*Math.sin(2*Math.PI*(i-1)/(verticesPerCircle-2));
			}
		}
		else if(shape instanceof obrengine.Rect){
			array[idx]=shape.corner.x;
			array[idx+1]=shape.corner.y;
			array[idx+2]=shape.corner.x;
			array[idx+3]=shape.corner.y+shape.size.y;
			array[idx+4]=shape.corner.x+shape.size.x;
			array[idx+5]=shape.corner.y;
			array[idx+6]=shape.corner.x+shape.size.x;
			array[idx+7]=shape.corner.y+shape.size.y;
		}
		else if(shape instanceof obrengine.Polygon){
			array[idx]=shape.getCenter().x;
			array[idx+1]=shape.getCenter().y;
			for(var i=0;i<shape.vertices.length;i++){
				array[idx+2*(i+1)]=shape.vertices[i].x;
				array[idx+2*(i+1)+1]=shape.vertices[i].y;
			}
			array[idx+2*(shape.vertices.length+1)]=shape.vertices[0].x;
			array[idx+2*(shape.vertices.length+1)+1]=shape.vertices[0].y;
		}
	}
	
	orwebgl.renderShape=function(gl,shape,idx){
		if(shape instanceof obrengine.Line)gl.drawArrays(gl.LINES,idx,2);
		else if(shape instanceof obrengine.Circle)gl.drawArrays(gl.TRIANGLE_FAN,idx,verticesPerCircle);
		else if(shape instanceof obrengine.Rect)gl.drawArrays(gl.TRIANGLE_STRIP,idx,4);
		else if(shape instanceof obrengine.Polygon)gl.drawArrays(gl.TRIANGLE_FAN,idx,vertexCount(shape));
		console.log("renderedShape");
	}
	
	/*
		BufferManagers
	*/
	
	orwebgl.VertexBufferManager=function(gl,shapes,dimension){
		this.vbo=gl.createBuffer();
		this.shapes=shapes;
		this.dimension=dimension;
		this.vertices=new Array(vc(shapes));
		this.updateBuffer();
	}
	
	orwebgl.VertexBufferManager.prototype.updateBuffer=function(){
		var idx=0;
		for(var i=0;i<this.shapes.length;i++){
			loadVertices(this.vertices,idx,this.shapes[i]);
			idx+=this.dimension*vertexCount(this.shapes[i]);
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		console.log(this.vertices);
		//console.log(this.vbo);
	}
	
	/*
	*****Scenes
	*/
	
	orwebgl.TestScene=function(gl,shapes){
		this.gl=gl;
		this.shapes=shapes;
		this.prog=initProg(gl,vss1,fss1);
		this.aPosLoc=gl.getAttribLocation(this.prog,"aPos");
		this.vbm=new VertexBufferManager(gl,shapes,2);
		gl.enableVertexAttribArray(this.aPosLoc);
	}
	
	orwebgl.TestScene.prototype.render=function(){
		console.log("started render");
		gl.clear(gl.DEPTH_BUFFER_BIT);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbm.vbo);
		gl.vertexAttribPointer(this.aPosLoc,2, gl.FLOAT, false, 0, 0);
		var idx=0;
		for(var i=0;i<this.shapes.length;i++){
			console.log(idx);
			renderShape(gl,this.shapes[i],idx);
			idx+=vertexCount(this.shapes[i]);
		}
		console.log("rendered test scene");
	}
	
	orwebgl.render=function(gl,scenes){
		gl.clearColor(0,0,0,1);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		for(var i=0;i<scenes.length;i++){
			gl.useProgram(scenes[i].prog);
			scenes[i].render();
		}
	}
}