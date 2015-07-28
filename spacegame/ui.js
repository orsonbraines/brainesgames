console.log("ui.js loaded");

var c,g;
var background,textColour;
var wid,hei,aspect;
var map;
var best;

var upArrowDown,rightArrowDown,leftArrowDown;
var mainPwr,sidePwr;

var inTitle,inGame,inEnd,inPause;
var keyMode,touchMode;
var touches,leftRect,rightRect,upRect,upRightRect,upLeftRect;

window.onload=init;

function init(){
	console.log("initialising");
	if(!navigator.cookieEnabled || document.cookie.search("high=")==-1){
		best=0;
	}
	else{
		var str=document.cookie.toString();
		best=Number(str.substring(str.search("high=")+5).split(";")[0]);
		if(isNaN(best)) best=0;
	}

	mainPwr=0;
	sidePwr=0;
	upArrowDown=false;
	rightArrowDown=false;
	leftArrowDown=false;
	setState("title");
	setMode("");
	touches=[];
	textColour="#0000ff";
	c= document.getElementById("canvas0");
	aspect=1.7;
	var mwid=window.innerWidth-40;
	var mhei=window.innerHeight-40;
	if(mwid >= aspect*mhei){
		c.width=Math.floor(aspect*mhei);
		c.height=mhei;
	}
	else{
		c.width=mwid;
		c.height=mwid/aspect;
	}
	wid=c.width;
	hei=c.height;
	map=new Map(wid,hei);
	var body=document.body;
	body.addEventListener("keyup",keyUp);
	body.addEventListener("keydown",keyDown);
	c.addEventListener("touchstart",touchStart);
	c.addEventListener("touchend",touchEnd);
	c.addEventListener("touchmove",touchMove);
	c.addEventListener("touchcancel",touchCancel);
	g=c.getContext("2d");
	//prepare background
	g.fillStyle = "#000000";
	g.fillRect(0,0,wid,hei);
	for(var i=0;i<Math.ceil(wid*hei/20000);i++){
		var x=Math.floor(Math.random()*wid);
		var y=Math.floor(Math.random()*hei);
		var grd = g.createRadialGradient(x, y, 1, x, y, 4);
		grd.addColorStop(0, "#ffffff");
		grd.addColorStop(1, "#000000");
		g.fillStyle = grd;
		g.beginPath();
		g.arc(x,y,4,0,2*Math.PI);
		g.fill();
	}
	background=g.getImageData(0,0,wid,hei);
	//configure control rect
	upRect=new obrengine.Rect(new obrengine.Vector2d(hei/10,8*hei/10),
							new obrengine.Vector2d(hei/10,hei/10));
	leftRect=new obrengine.Rect(new obrengine.Vector2d(0,9*hei/10),
						new obrengine.Vector2d(hei/10,hei/10));
	rightRect=new obrengine.Rect(new obrengine.Vector2d(2*hei/10,9*hei/10),
						new obrengine.Vector2d(hei/10,hei/10));
	upRightRect=new obrengine.Rect(new obrengine.Vector2d(2*hei/10,8*hei/10),
						new obrengine.Vector2d(hei/10,hei/10));
	upLeftRect=new obrengine.Rect(new obrengine.Vector2d(0/100,8*hei/10),
						new obrengine.Vector2d(hei/10,hei/10));
	//begin loop
	updateAll();
	draw();
	setInterval("gameLoop()",50);
}

function draw(){
	//draw background
	g.putImageData(background,0,0);
	if(inGame){
		drawGame();
		if(touchMode) drawTouch();
		
	}
	else if (inPause){
		drawGame();
		g.fillStyle = textColour;
		g.font="bold 52px Courier New";
		g.textBaseline="top";
		g.textAlign="center";
		g.fillText("paused",wid/2,hei/2);
	}
	else if (inEnd){
		//game over screen
		g.fillStyle = textColour;
		g.font="bold 42px Courier New";
		g.textBaseline="top";
		g.textAlign="center";
		g.fillText("GAME OVER!",wid/2,hei/2);
		g.font="bold 20px Courier New";
		g.textAlign="left";
		g.fillText("score: "+map.score,wid/2-75,hei/2+40);
		g.fillText("best : "+best,wid/2-75,hei/2+65);
		g.textAlign="center";
		if(keyMode)g.fillText("Hit Enter to start again!",wid/2,hei-40);
		else if(touchMode) g.fillText("Touch the screen to start again!",wid/2,hei-40);
	}
	else if (inTitle){
		g.fillStyle = textColour;
		g.font="bold 62px serif";
		g.textBaseline="middle";
		g.textAlign="center";
		g.fillText("Stellar Drifts",wid/2,hei/2);
		g.font="bold 28px Courier New";
		g.fillText("Hit any key to begin in Key Mode!",wid/2,hei/2+100);
		g.fillText("Touch the screen to begin in Touch Mode!",wid/2,hei/2+128);
	}
}

function drawTouch(){
/* 	g.fillStyle = textColour;
	g.font="bold 16px serif";
	g.textBaseline="top";
	g.textAlign="right";
	g.fillText(touchStr,wid,0); */
	
	g.fillStyle="rgba(255,255,255,0.7)";
	g.strokeStyle="rgba(0,0,0,0.7)";
	
	g.fillRect(upRect.corner.x,upRect.corner.y,upRect.size.x,upRect.size.y);
	g.strokeRect(upRect.corner.x,upRect.corner.y,upRect.size.x,upRect.size.y);
	g.fillRect(leftRect.corner.x,leftRect.corner.y,leftRect.size.x,leftRect.size.y);
	g.strokeRect(leftRect.corner.x,leftRect.corner.y,leftRect.size.x,leftRect.size.y);
	g.fillRect(rightRect.corner.x,rightRect.corner.y,rightRect.size.x,rightRect.size.y);
	g.strokeRect(rightRect.corner.x,rightRect.corner.y,rightRect.size.x,rightRect.size.y);
	g.fillRect(upRightRect.corner.x,upRightRect.corner.y,upRightRect.size.x,upRightRect.size.y);
	g.strokeRect(upRightRect.corner.x,upRightRect.corner.y,upRightRect.size.x,upRightRect.size.y);
	g.fillRect(upLeftRect.corner.x,upLeftRect.corner.y,upLeftRect.size.x,upLeftRect.size.y);
	g.strokeRect(upLeftRect.corner.x,upLeftRect.corner.y,upLeftRect.size.x,upLeftRect.size.y);
}

function drawGame(){
	//draw ship
	g.fillStyle = "#ff0000";
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
	g.fillStyle="#666666"
	for(var i=0;i<map.asteroids.length;i++){
		var s=map.asteroids[i].shape;
		g.beginPath();
		g.arc(s.center.x,s.center.y,s.radius,0,2*Math.PI);
		g.fill();
	}
	//draw score
	g.fillStyle = textColour;
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
	g.fillStyle="#ff0000";
	g.fillRect(wid-60,hei-120,20,mainPwr*8);
	if(sidePwr>=0)g.fillRect(wid-50,hei-30,sidePwr*4,20);
	else g.fillRect(wid-50+sidePwr*4,hei-30,sidePwr*-4,20);
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
	//console.log("key down. code="+e.keyCode);
	
	if(inTitle){
		setState("game");
		setMode("key");
	}
	else if (inGame){
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
		//p
		else if(e.keyCode==80){
			setState("pause");
		}
	}
	else if(inPause){
		//p
		if(e.keyCode==80) setState("game");
	}
	else if(inEnd){
		//enter key
		if(e.keyCode==13){
			startNew();
		}
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

function touchStart(e){
	if(inTitle){
		setState("game");
		setMode("touch");
	}
	if(inEnd){
		startNew();
	}
	
	touches=e.touches;
}

function touchEnd(e){
	touches=e.touches;
}

function touchMove(e){
	touches=e.touches;
}

function touchCancel(e){
	touches=e.touches;
}

function gameLoop(){
	//update power
	if(inGame){
		if(!document.hasFocus()){
			upArrowDown=false;
			rightArrowDown=false;
			leftArrowDown=false;
			setState("pause");
		}
		
		if(!map.alive){
			setState("end");
		}
		//set power
		setPower();
		//move ship
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

function setState(state){
	if(state=="pause"){
		inPause=true;
		inEnd=false;
		inGame=false;
		inTitle=false;
	}
	else if(state=="end"){
		inPause=false;
		inEnd=true;
		inGame=false;
		inTitle=false;
	}
	else if(state=="game"){
		inPause=false;
		inEnd=false;
		inGame=true;
		inTitle=false;
	}
	else if(state=="title"){
		inPause=false;
		inEnd=false;
		inGame=false;
		inTitle=true;
	}
}

function setMode(mode){
	if(mode=="key"){
		keyMode=true;
		touchMode=false;
	}
	else if(mode=="touch"){
		keyMode=false;
		touchMode=true;
	}
	else{
		keyMode=false;
		touchMode=false;
	}
}

function hasMode(){
	return keyMode || touchMode;
}

function startNew(){
	map=new Map(wid,hei);
	mainPwr=0;
	sidePwr=0;
	upArrowDown=false;
	rightArrowDown=false;
	leftArrowDown=false;
	setState("game");
	updateAll();
	draw();
}

function setPower(){
	if(keyMode){
		if(upArrowDown && mainPwr<10) mainPwr++;
		else if (!upArrowDown && mainPwr>0) mainPwr--;
		if(rightArrowDown && sidePwr<10) sidePwr++;
		if(leftArrowDown && sidePwr>-10) sidePwr--;
		if(!(rightArrowDown || leftArrowDown) && sidePwr>0) sidePwr--;
		else if(!(rightArrowDown || leftArrowDown) && sidePwr<0) sidePwr++;
	}
	else if(touchMode){	
		var rightDown=false;
		var leftDown=false;
		var upDown=false;
		for(var i=0;i<touches.length;i++){
			if(rightRect.inside(new obrengine.Vector2d(touches[i].clientX,touches[i].clientY))) rightDown=true;
			else if(leftRect.inside(new obrengine.Vector2d(touches[i].clientX,touches[i].clientY))) leftDown=true;
			else if(upRect.inside(new obrengine.Vector2d(touches[i].clientX,touches[i].clientY))) upDown=true;
			else if(upRightRect.inside(new obrengine.Vector2d(touches[i].clientX,touches[i].clientY))){
				upDown=true;
				rightDown=true;
			}
			else if(upLeftRect.inside(new obrengine.Vector2d(touches[i].clientX,touches[i].clientY))){
				upDown=true;
				leftDown=true;
			}
		}

		if(upDown && mainPwr<10) mainPwr++;
		else if (!upDown && mainPwr>0) mainPwr--;
		if(rightDown && sidePwr<10) sidePwr++;
		if(leftDown && sidePwr>-10) sidePwr--;
		if(!(rightDown || leftDown) && sidePwr>0) sidePwr--;
		else if(!(rightDown || leftDown) && sidePwr<0) sidePwr++;
	}
	map.ship.pwr=mainPwr/10;
	map.ship.sidePwr=sidePwr/10;
}