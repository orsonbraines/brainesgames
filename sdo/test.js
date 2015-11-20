window.onload=start;
window.addEventListener("keyup",keyUp);
window.addEventListener("keydown",keyDown);
window.addEventListener("resize", resizeWindow);
var canvas,map,graphics;
var loop;
var timeBefore;

function start(){
	canvas = document.getElementById("canvas0");
	canvas.width=document.documentElement.clientWidth;
	canvas.height=document.documentElement.clientHeight;
	aspect=canvas.width/canvas.height;
	map=new Map(2500);

	graphics=new Graphics(canvas,map);
	graphics.render();
	
	timeBefore=new Date().getTime();
	loop=setInterval("renderLoop()",1000/60);
}

function renderLoop(){
	var timeNow=new Date().getTime();
	console.log(timeNow-timeBefore);
	timeBefore=timeNow;
	map.move(1);
	updateInput(map.ships[0],graphics);
	graphics.render();
}
