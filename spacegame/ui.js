console.log("ui.js loaded");

var c; 
var g;
var wid,hei;
var map;
var best;

var upArrowDown;
var rightArrowDown;
var leftArrowDown;
var mainPwr,sidePwr;

function init(){
	console.log("initialising");
	if(!navigator.cookieEnabled || document.cookie.search("high=")==-1){
		best=0;
	}
	else{
		var str=document.cookie.toString();
		//console.log(str);
		//console.log(str.substring(str.search("high=")+5).split(";")[0]);
		best=Number(str.substring(str.search("high=")+5).split(";")[0]);
		if(isNaN(best)) best=0;
	}

	mainPwr=0;
	sidePwr=0;
	upArrowDown=false;
	rightArrowDown=false;
	leftArrowDown=false;
	c= document.getElementById("canvas0");
	
	c.width=window.innerWidth-50;
	c.height=window.innerHeight-50;
	
	console.log(window.innerWidth);
	console.log(window.innerHeight);
	wid=c.width;
	hei=c.height;
	map=new Map(wid,hei);
	var body=document.getElementById("body");
	body.addEventListener("keyup",keyUp);
	body.addEventListener("keydown",keyDown);
	g=c.getContext("2d");
	updateAll();
	draw();
	//setInterval("rotater()",25);
	setInterval("gameLoop()",50);
}

function draw(){
	//draw background
	g.fillStyle = "#FFFFFF";
	g.fillRect(0,0,wid,hei);
	if(map.alive){
		//draw ship
		g.fillStyle = "#FF0000";
		g.beginPath();
		g.moveTo(map.ship.vertices[0].x,map.ship.vertices[0].y);
		for(var i=1;i<5;i++) g.lineTo(map.ship.vertices[i].x,map.ship.vertices[i].y);
		g.closePath();
		g.fill();
		//draw flames
		//main
		g.fillStyle = "#ff6400";
		g.beginPath();
		g.moveTo(map.ship.mainFlame[0].x,map.ship.mainFlame[0].y);
		for(var i=1;i<3;i++) g.lineTo(map.ship.mainFlame[i].x,map.ship.mainFlame[i].y);
		g.closePath();
		g.fill();
		//side
		g.beginPath();
		g.moveTo(map.ship.sideFlame[0].x,map.ship.sideFlame[0].y);
		for(var i=1;i<3;i++) g.lineTo(map.ship.sideFlame[i].x,map.ship.sideFlame[i].y);
		g.closePath();
		g.fill();
		//draw asteroids
		g.fillStyle="#642010"
		for(var i=0;i<map.asteroids.length;i++){
			var s=map.asteroids[i].shape;
			g.beginPath();
			g.arc(s.center.x,s.center.y,s.radius,0,2*Math.PI);
			g.fill();
		}
		//draw score
		g.fillStyle = "#000000";
		g.font="bold 16px Courier New";
		g.textBaseline="top";
		g.textAlign="left";
		g.fillText("score: "+map.score,5,0);
		g.fillText("best : "+best,5,20);
		//draw power meters
		g.fillStyle="#999999";
		g.fillRect(wid-90,hei-30,80,20);
		g.fillRect(wid-60,hei-120,20,80);
		g.strokeStyle= "#000000";
		g.lineWidth=(3);
		g.strokeRect(wid-90,hei-30,80,20);
		g.strokeRect(wid-60,hei-120,20,80);
		g.beginPath();
		g.moveTo(wid-50,hei-30);
		g.lineTo(wid-50,hei-10);
		g.stroke();
		//fill in power meters
		g.fillStyle="#FF0000";
		g.fillRect(wid-60,hei-120,20,mainPwr*8);
		if(sidePwr>=0)g.fillRect(wid-50,hei-30,sidePwr*4,20);
		else g.fillRect(wid-50+sidePwr*4,hei-30,sidePwr*-4,20);
	}
	else{
		//game over screen
		g.fillStyle = "#000000";
		g.font="bold 42px Courier New";
		g.textBaseline="center";
		g.textAlign="center";
		g.fillText("GAME OVER!",wid/2,hei/2);
		g.font="bold 20px Courier New";
		g.fillText("score: "+map.score,wid/2,hei/2+40);
		g.fillText("best : "+best,wid/2,hei/2+65);
		g.fillText("Hit Enter to start again!",wid/2,hei-40);
	}
}


function updateMainFlame(){
	with(obrengine){
		var forward=scaleVector(getUnitVector(map.ship.angle),map.ship.len/2);
		var side=scaleVector(getUnitVector(map.ship.angle+Math.PI/2),map.ship.wid/2);
		map.ship.mainFlame=[
			subtractVectors(map.ship.pos,addVectors(forward,side)),
			addVectors(map.ship.pos,subtractVectors(side,forward)),
			subtractVectors(map.ship.pos,scaleVector(forward,1+map.ship.pwr*2)),
		];
	}
}

function updateSideFlame(){
	with(obrengine){
		var forward=scaleVector(getUnitVector(map.ship.angle),map.ship.len/2);
		var side=scaleVector(getUnitVector(map.ship.angle+Math.PI/2),map.ship.wid/2);
		if(sidePwr>=0){
			map.ship.sideFlame=[
			addVectors(map.ship.pos,subtractVectors(forward,side)),
			addVectors(map.ship.pos,subtractVectors(scaleVector(forward,0.8),scaleVector(side,1+map.ship.sidePwr))),
			addVectors(map.ship.pos,subtractVectors(scaleVector(forward,0.6),side)),
			];
		}
		else{
			map.ship.sideFlame=[
			addVectors(map.ship.pos,addVectors(forward,side)),
			addVectors(map.ship.pos,addVectors(scaleVector(forward,0.8),scaleVector(side,1-map.ship.sidePwr))),
			addVectors(map.ship.pos,addVectors(scaleVector(forward,0.6),side)),
			];
		}
	}
}

function updateAll(){
	map.ship.updateVertices();
	updateMainFlame();
	updateSideFlame();
}

function keyDown(e){
	////console.log("key down. code="+e.keyCode);
	//left arrow: -ve side thrust
	if(e.keyCode==37){
		leftArrowDown=true;
		rightArrowDown=false;
		if(sidePwr>0) sidePwr=0;
	}
	//up arrow
	else if(e.keyCode==38){
		upArrowDown=true;
	}
	//right arrow: +ve side thrust
	else if(e.keyCode==39){
		rightArrowDown=true;
		leftArrowDown=false;
		if(sidePwr<0) sidePwr=0;
	}
	//down arrow
	else if(e.keyCode==40){
		mainPwr=0;
		upArrowDown=false;
	}
	
	else if(e.keyCode==13 && !map.alive){
		map=new Map(wid,hei);
		mainPwr=0;
		sidePwr=0;
		upArrowDown=false;
		rightArrowDown=false;
		leftArrowDown=false;
		updateAll();
		draw();
	}
}

function keyUp(e){
	////console.log("key up. code="+e.keyCode);
	//left arrow: -ve side thrust
	if(e.keyCode==37){
		leftArrowDown=false;
	}
	//up arrow
	else if(e.keyCode==38){
		upArrowDown=false;
	}
	//right arrow: +ve side thrust
	else if(e.keyCode==39){
		rightArrowDown=false;
	}
	//down arrow
	else if(e.keyCode==40){
		
	}
}

function gameLoop(){
	//update power
	if(map.alive){
		if(!document.hasFocus()){
			upArrowDown=false;
			rightArrowDown=false;
			leftArrowDown=false;
		}
		
		if(upArrowDown && mainPwr<10) mainPwr++;
		else if (!upArrowDown && mainPwr>0) mainPwr--;
		if(rightArrowDown && sidePwr<10) sidePwr++;
		if(leftArrowDown && sidePwr>-10) sidePwr--;
		if(!(rightArrowDown || leftArrowDown) && sidePwr>0) sidePwr--;
		else if(!(rightArrowDown || leftArrowDown) && sidePwr<0) sidePwr++;
		//move ship
		map.ship.pwr=mainPwr/10;
		map.ship.sidePwr=sidePwr/10;
		map.move();
		updateAll();
	}
	if(map.score>best){
		best=map.score;
		if(navigator.cookieEnabled){
			document.cookie="high="+best+"; expires=Thu, 18 Dec 2033 12:00:00 UTC; path=/";
		}
	}
	draw();
}