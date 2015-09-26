var gl,scene;
var circles,vs;
window.onload=webGLStart;

function webGLStart() {
	with(orwebgl){
		var canvas = document.getElementById("canvas0");
		gl=initGL(canvas);
		
		circles=new Array(3);
		for(var i=0;i<circles.length;i++){
			circles[i]=new obrengine.Circle(new obrengine.Vector2d(2*Math.random()-1,2*Math.random()-1),
				Math.random()/4);
		}
		vs=new Array(circles.length);
		for(var i=0;i<vs.length;i++){
			vs[i]=new obrengine.Vector2d(Math.random()/30-1/60,Math.random()/30-1/60);
		}
		
		scene=new TestScene(gl,circles);
		render(gl,[scene]); 
		
		setInterval("rerender()",1000/60);
	}
}

function rerender(){
	move();
	scene.vbm.updateBuffer();
	gl.clearColor(0,0,0,1);
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	scene.render();
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
}