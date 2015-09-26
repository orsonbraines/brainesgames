function Graphics(canvas,map){
	with(orwebgl){
		this.gl=orwebgl.initGL(canvas);
		this.map=map;
		
		this.pMatrix=new Float32Array([
			1/250, 0     , 0 ,0 ,
			0    , 1/250 , 0 ,0 ,
			0    , 0     , 1 ,0 ,
			-1   , -1    , 0, 1
		]);
		
		this.vss2="attribute vec4 aPos;"+
		"uniform mat4 uMatrix;"+
		"void main(){gl_Position=uMatrix*aPos;"+
		"gl_PointSize=2.0;}";
		this.bgProg=initProg(gl,this.vss2,fss1);
		this.aPosLocBG=this.gl.getAttribLocation(this.bgProg,"aPos");
		this.uMatrixLocBG=this.gl.getUniformLocation(this.bgProg,"uMatrix");
		this.gl.enableVertexAttribArray(this.aPosLocBG);
		this.starVertices=new Array(200);
		for(var i=0;i<200;i+=2){
			this.starVertices[i]=Math.random()*this.map.w;
		}
		for(var i=1;i<200;i+=2){
			this.starVertices[i]=Math.random()*this.map.h;
		}
		
		this.bgVBO=this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bgVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.starVertices), this.gl.STATIC_DRAW);
		
		this.vss3="attribute float aTheta;"+"\n"+
			"uniform mat4 uMatrix;"+"\n"+
			"uniform vec2 uCenter;"+"\n"+
			"uniform float uRadius;"+"\n"+
			"void main(){if(aTheta<0.0)gl_Position=uMatrix*vec4(uCenter.x,uCenter.y,0,1);"+"\n"+
			"else gl_Position=uMatrix*vec4(uCenter.x+uRadius*cos(aTheta),uCenter.y+uRadius*sin(aTheta),0,1);}";
		
		this.fss2 = "void main(void){"+
			"gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);}";
		
		this.cProg=initProg(this.gl,this.vss3,this.fss2);
		this.aThetaLoc=this.gl.getAttribLocation(this.cProg,"aTheta");
		this.uCenterLoc=this.gl.getUniformLocation(this.cProg,"uCenter");
		this.uRadiusLoc=this.gl.getUniformLocation(this.cProg,"uRadius");
		this.uMatrixLocC=this.gl.getUniformLocation(this.cProg,"uMatrix");
		
		this.gl.enableVertexAttribArray(this.aThetaLoc);
		
		this.thetas=new Array(52);
		this.thetas[0]=-1;
		for(var i=0;i<=50;i++){
			this.thetas[i+1]=i*2*Math.PI/50;
		}
		
		this.cVBO=this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.thetas), this.gl.STATIC_DRAW);
		
		
		this.vss4="attribute vec4 aPos;"+
			"uniform mat4 uMatrix;"+
			"void main(){gl_Position=uMatrix*aPos;}";
		
		this.fss3 ="precision mediump float;"+"\n"+
			"uniform vec4 uColour;"+"\n"+
			"void main(void){"+"\n"+
			"gl_FragColor = uColour;}";
		
		this.oProg=initProg(this.gl,this.vss4,this.fss3);
		this.uColourLoc=this.gl.getUniformLocation(this.oProg,"uColour");
		this.uMatrixLocO=this.gl.getUniformLocation(this.oProg,"uMatrix");
		this.aPosLocO=this.gl.getAttribLocation(this.oProg,"aPos");
		this.gl.enableVertexAttribArray(this.aPosLocO);
		
		this.maxShips=this.map.maxShips;
		this.maxBullets=this.map.maxBullets;
		this.shipsIdx=0;
		this.flamesIdx=2*(this.maxShips*7);
		this.bulletsIdx=2*(this.maxShips*13);
		this.numFloatsO=2*(this.maxShips*13+this.maxBullets*2);
		this.oVertices=new Float32Array(this.numFloatsO);
		for(var i=0;i<this.numFloatsO;i++){
			this.oVertices[i]=0.0;
		}
		
		this.numShips=this.map.ships.length;
		this.numBullets=this.map.bullets.length;
		
		this.oVBO=this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.oVBO);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.oVertices, this.gl.STREAM_DRAW);
	}
}

Graphics.prototype.updateBuffer=function(){
	with(this){
		this.numShips=this.map.ships.length;
		this.numBullets=this.map.bullets.length;
		for(var i=0;i<numShips;i++){
			oVertices[shipsIdx+14*i]=map.ships[i].d.x;
			oVertices[shipsIdx+14*i+1]=map.ships[i].d.y;
			for(var j=0;j<5;j++){
				oVertices[shipsIdx+14*i+2*j+2]=map.ships[i].vertices[j].x;
				oVertices[shipsIdx+14*i+2*j+3]=map.ships[i].vertices[j].y;
			}
			oVertices[shipsIdx+14*i+12]=map.ships[i].vertices[0].x;
			oVertices[shipsIdx+14*i+13]=map.ships[i].vertices[0].y;
		}
		for(var i=0;i<numShips;i++){
			//main flame
			oVertices[flamesIdx+12*i]=  map.ships[i].d.x-map.ships[i].forward.x-map.ships[i].side.x;
			oVertices[flamesIdx+12*i+1]=map.ships[i].d.y-map.ships[i].forward.y-map.ships[i].side.y;
			oVertices[flamesIdx+12*i+2]=map.ships[i].d.x-map.ships[i].forward.x+map.ships[i].side.x;
			oVertices[flamesIdx+12*i+3]=map.ships[i].d.y-map.ships[i].forward.y+map.ships[i].side.y;
			oVertices[flamesIdx+12*i+4]=map.ships[i].d.x-map.ships[i].forward.x*(1+map.ships[i].pwr*2);
			oVertices[flamesIdx+12*i+5]=map.ships[i].d.y-map.ships[i].forward.y*(1+map.ships[i].pwr*2);
			
			//side flame
			if(map.ships[i].sidePwr>=0){
				oVertices[flamesIdx+12*i+6]= map.ships[i].d.x+map.ships[i].forward.x-map.ships[i].side.x;
				oVertices[flamesIdx+12*i+7]= map.ships[i].d.y+map.ships[i].forward.y-map.ships[i].side.y;
				oVertices[flamesIdx+12*i+8]= map.ships[i].d.x+map.ships[i].forward.x*0.6-map.ships[i].side.x;
				oVertices[flamesIdx+12*i+9]= map.ships[i].d.y+map.ships[i].forward.y*0.6-map.ships[i].side.y;
				oVertices[flamesIdx+12*i+10]=map.ships[i].d.x+map.ships[i].forward.x*0.8-map.ships[i].side.x*(1+map.ships[i].sidePwr);
				oVertices[flamesIdx+12*i+11]=map.ships[i].d.y+map.ships[i].forward.y*0.8-map.ships[i].side.y*(1+map.ships[i].sidePwr);
			}
			else{
				oVertices[flamesIdx+12*i+6]= map.ships[i].d.x+map.ships[i].forward.x+map.ships[i].side.x;
				oVertices[flamesIdx+12*i+7]= map.ships[i].d.y+map.ships[i].forward.y+map.ships[i].side.y;
				oVertices[flamesIdx+12*i+8]= map.ships[i].d.x+map.ships[i].forward.x*0.6+map.ships[i].side.x;
				oVertices[flamesIdx+12*i+9]= map.ships[i].d.y+map.ships[i].forward.y*0.6+map.ships[i].side.y;
				oVertices[flamesIdx+12*i+10]=map.ships[i].d.x+map.ships[i].forward.x*0.8+map.ships[i].side.x*(1-map.ships[i].sidePwr);
				oVertices[flamesIdx+12*i+11]=map.ships[i].d.y+map.ships[i].forward.y*0.8+map.ships[i].side.y*(1-map.ships[i].sidePwr);
			}
		}
		
		//bullets
		for(var i=0;i<numBullets;i++){
			oVertices[bulletsIdx+4*i]=   map.bullets[i].d.x;
			oVertices[bulletsIdx+4*i+1]= map.bullets[i].d.y;
			oVertices[bulletsIdx+4*i+2]= map.bullets[i].d.x+map.bullets[i].len*Math.cos(map.bullets[i].angle);
			oVertices[bulletsIdx+4*i+3]= map.bullets[i].d.y+map.bullets[i].len*Math.sin(map.bullets[i].angle);
		}
		
		gl.bindBuffer(gl.ARRAY_BUFFER, oVBO);
		gl.bufferSubData(gl.ARRAY_BUFFER,0, this.oVertices);
	}
}

Graphics.prototype.render=function(){
	with(this){
		updateBuffer();
		gl.clearColor(0,0,0,1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(bgProg);
		gl.bindBuffer(gl.ARRAY_BUFFER, bgVBO);
		gl.vertexAttribPointer(aPosLocBG,2, gl.FLOAT, false, 0, 0);
		gl.uniformMatrix4fv(uMatrixLocBG,false,pMatrix);
		gl.drawArrays(gl.POINTS,0,100);
		
		gl.useProgram(cProg);
		gl.bindBuffer(gl.ARRAY_BUFFER, cVBO);
		gl.vertexAttribPointer(aThetaLoc,1, gl.FLOAT, false, 0, 0);
		gl.uniformMatrix4fv(uMatrixLocC,false,pMatrix);
		for(var i=0;i<map.asteroids.length;i++){
			gl.uniform2f(uCenterLoc,map.asteroids[i].shape.center.x,map.asteroids[i].shape.center.y);
			gl.uniform1f(uRadiusLoc,map.asteroids[i].shape.radius);
			gl.drawArrays(gl.TRIANGLE_FAN,0,52);
		}
		
		gl.useProgram(oProg);
		gl.bindBuffer(gl.ARRAY_BUFFER, oVBO);
		gl.vertexAttribPointer(aPosLocO,2, gl.FLOAT, false, 0, 0);
		gl.uniformMatrix4fv(uMatrixLocO,false,pMatrix);
		gl.uniform4f(uColourLoc,1.0,0.0,0.0,1.0);
 		for(var i=0;i<numShips;i++){
			gl.drawArrays(gl.TRIANGLE_FAN,i*7,7);
		}
		gl.uniform4f(uColourLoc,1.0,0.5,0.0,1.0);
		gl.drawArrays(gl.TRIANGLES,flamesIdx/2,numShips*6);
		gl.uniform4f(uColourLoc,1.0,1.0,0.0,1.0);
		gl.drawArrays(gl.LINES,bulletsIdx/2,numBullets*2);
		console.log(oVertices); 
	}
}