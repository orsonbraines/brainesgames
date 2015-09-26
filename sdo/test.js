window.onload=start;

function start(){
	var canvas = document.getElementById("canvas0");
	var map=new Map(500,500);
	map.ships[0].pwr=Math.random();
	map.ships[0].sidePwr=Math.random()*2-1;
	map.ships[0].angle=Math.random()*2*Math.PI;
	map.ships[0].updateVertices();
	var graphics=new Graphics(canvas,map);
	graphics.render();
}

