console.log("ui.js loaded");

var c,g;
var stars;
var textColour,sFont,mFont,lFont,tFont;
var wid,hei;
var map;
var best;

//var hasReqAnimFrame;

var upArrowDown,rightArrowDown,leftArrowDown;
var mainPwr,sidePwr,mpbRect,spbRect;

var inTitle,inGame,inEnd,inPause;
var keyMode,touchMode;
var otPos,ntPos;
var tstr,pauseRect;

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

	initVars();
	initSize();
	initListeners();
	map=new Map(wid,hei);
	updateAll();
	setState("title");
	//if(hasReqAnimFrame) window.requestAnimationFrame(draw);
	setInterval("gameLoop()",20);
}

function initSize(){
	c.width=document.documentElement.clientWidth;
	c.height=document.documentElement.clientHeight;
	wid=c.width;
	hei=c.height;
	console.log(wid);
	console.log(hei);
	pauseRect=new obrengine.Rect(new obrengine.Vector2d(wid-hei/10,0),new obrengine.Vector2d(hei/10,hei/10));
	spbRect=new obrengine.Rect(new obrengine.Vector2d(88*wid/100,94*hei/100),
								new obrengine.Vector2d(wid/10,4*hei/100));
	mpbRect=new obrengine.Rect(new obrengine.Vector2d(93*wid/100-2*hei/100,92*hei/100-wid/10),
								new obrengine.Vector2d(4*hei/100,wid/10));
	sFont= wid/32;
	mFont= wid/24;
	lFont= wid/12;
	tFont= wid/10;
	prepBg();
}

function initVars(){
	mainPwr=0;
	sidePwr=0;
	upArrowDown=false;
	rightArrowDown=false;
	leftArrowDown=false;
	setMode("");
	tstr="";
/* 	hasReqAnimFrame= typeof window.requestAnimationFrame != "undefined";
	console.log(hasReqAnimFrame);
	if(hasReqAnimFrame) console.log("hasReqAnimFrame");
	if(!hasReqAnimFrame) console.log("not hasReqAnimFrame"); */
	ntPos=new obrengine.Vector2d(0,0);
	otPos=new obrengine.Vector2d(0,0);
	textColour="#b45094";
	c= document.getElementById("canvas0");
	g=c.getContext("2d");
}

function initListeners(){
	var body=document.body;
	window.addEventListener("resize", resizeWindow);
	body.addEventListener("keyup",keyUp);
	body.addEventListener("keydown",keyDown);
	c.addEventListener("touchstart",touchStart);
	c.addEventListener("touchend",touchEnd);
	c.addEventListener("touchmove",touchMove);
	c.addEventListener("touchcancel",touchCancel);
}

function prepBg(){
	//prepare background
	stars=[];
	for(var i=0;i<Math.ceil(wid*hei/20000);i++){
		stars[i]={x:Math.floor(Math.random()*wid),y:Math.floor(Math.random()*hei)};
	}
}

function draw(){
	//draw background
	g.fillStyle = "#000000";
	g.fillRect(0,0,wid,hei);
	g.fillStyle = "#eeeeee";
 	for(var i=0;i<stars.length;i++){
		g.beginPath();
		g.arc(stars[i].x,stars[i].y,2,0,2*Math.PI);
		g.fill();
	}	 
	
	if(inGame){
		drawGame();
	}
	else if (inPause){
		drawGame();
		g.fillStyle = textColour;
		g.font=getFont(lFont);
		g.textBaseline="top";
		g.textAlign="center";
		g.fillText("paused",wid/2,hei/2);
	}
	else if (inEnd){
		//game over screen
		updateBest();
		g.fillStyle = textColour;
		g.font=getFont(lFont);
		g.textBaseline="top";
		g.textAlign="center";
		g.fillText("GAME OVER!",wid/2,hei/2);
		g.font=getFont(mFont);
		g.fillText("score: "+map.score,wid/2,hei/2+lFont);
		g.fillText("best : "+best,wid/2,hei/2+lFont+mFont);
		g.textAlign="center";
		g.textBaseline="bottom";
		if(keyMode)g.fillText("Hit Enter to start again!",wid/2,hei);
		else if(touchMode) g.fillText("Touch the screen to start again!",wid/2,hei);
	}
	else if (inTitle){
		g.fillStyle = textColour;
		g.font=getFont(tFont);
		g.textBaseline="middle";
		g.textAlign="center";
		g.fillText("Stellar Drifts",wid/2,hei/2);
		g.font=getFont(sFont);
		g.fillText("Hit any key to begin in Key Mode!",wid/2,hei/2+tFont);
		g.fillText("Touch the screen to begin in Touch Mode!",wid/2,hei/2+tFont+mFont);
	}
	if(touchMode)drawTouch();
	
	//if(hasReqAnimFrame) window.requestAnimationFrame(draw);
}

function drawTouch(){

	if(inGame || inPause){
		g.fillStyle= "rgba(255,255,255,0.7)";
		g.strokeStyle= "rgba(255,255,255,0.7)";
		var startX=pauseRect.corner.x;
		var startY=pauseRect.corner.y;
		var s=pauseRect.size.x;
		g.strokeRect(startX,startY,s,s);
		if(inGame){
			g.fillRect(startX+25*s/100,startY+2*s/10,2*s/10,6*s/10);
			g.fillRect(startX+55*s/100,startY+2*s/10,2*s/10,6*s/10);
		}
		else{
			g.beginPath();
			g.moveTo(startX+18*s/100,startY+1*s/10);
			g.lineTo(startX+18*s/100,startY+9*s/10);
			g.lineTo(startX+88*s/100,startY+5*s/10);
			g.closePath();
			g.fill();
		}
	}
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
	g.fillStyle="#bbbbbb"
	for(var i=0;i<map.asteroids.length;i++){
		var s=map.asteroids[i].shape;
		g.beginPath();
		g.arc(s.center.x,s.center.y,s.radius,0,2*Math.PI);
		g.fill();
	}
	//draw bullets
	g.strokeStyle="#aaaa00";
	g.lineWidth=5;
	for(var i=0;i<map.bullets.length;i++){
		if(map.bullets[i]!="null"){
			g.beginPath();
			g.moveTo(map.bullets[i].line.p1.x,map.bullets[i].line.p1.y);
			g.lineTo(map.bullets[i].line.p2.x,map.bullets[i].line.p2.y);
			g.stroke();
		}
	}
	//draw score
	g.fillStyle = textColour;
	g.font=getFont(sFont);
	g.textBaseline="top";
	g.textAlign="left";
	g.fillText("score: "+map.score+" +"+map.pointsGained,5,0);
	g.fillText("best : "+best,5,sFont);
	//***draw debug string
/* 	g.fillStyle = textColour;
	g.font=getFont(10);
	g.textBaseline="top";
	g.textAlign="right";
	g.fillText(tstr,wid,0);  */
	//***
	//draw power meters
	g.fillStyle="rgba(200,200,200,0.7)";
	g.fillRect(mpbRect.corner.x,mpbRect.corner.y,mpbRect.size.x,mpbRect.size.y);
	g.fillRect(spbRect.corner.x,spbRect.corner.y,spbRect.size.x,spbRect.size.y);
	g.strokeStyle="#000000";
	g.lineWidth=(3);
	g.strokeRect(mpbRect.corner.x,mpbRect.corner.y,mpbRect.size.x,mpbRect.size.y);
	g.strokeRect(spbRect.corner.x,spbRect.corner.y,spbRect.size.x,spbRect.size.y);
	g.beginPath();
	g.moveTo(spbRect.corner.x+spbRect.size.x/2,spbRect.corner.y);
	g.lineTo(spbRect.corner.x+spbRect.size.x/2,spbRect.corner.y+spbRect.size.y);
	g.stroke();
	//fill in power meters
	g.fillStyle="rgba(255,0,0,0.7)";
	if(mainPwr>0)g.fillRect(mpbRect.corner.x,mpbRect.corner.y,mpbRect.size.x,mpbRect.size.y*mainPwr/10);
	if(sidePwr>0)g.fillRect(spbRect.corner.x+spbRect.size.x/2,spbRect.corner.y,
							spbRect.size.x/2*sidePwr/10,spbRect.size.y);
	else if(sidePwr<0)g.fillRect(spbRect.corner.x+spbRect.size.x/2*(1+sidePwr/10),spbRect.corner.y,
							spbRect.size.x/2*-sidePwr/10,spbRect.size.y);
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

function resizeWindow(){
	initSize();
	
	map.resize(wid,hei);
	updateAll();
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
		//space bar
		else if(e.keyCode==32){
			map.reqGun=true;
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
	e.preventDefault();
	otPos.set(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
	ntPos.set(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
	if(inTitle){
		setState("game");
		setMode("touch");
	}
	if(inEnd){
		startNew();
	}
	if(pauseRect.inside(ntPos)){
		if(inPause){
			setState("game");
		}
		else if(inGame){
			setState("pause");
		}
	}
	
	touches=e.touches;
}

function touchEnd(e){
	e.preventDefault();
	ntPos.set(otPos.x,otPos.y);
}

function touchMove(e){
	e.preventDefault();
	ntPos.set(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
}

function touchCancel(e){
	e.preventDefault();
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
		//tstr="ship.v"+map.ship.vel;
		draw();
		updateBest();
	}
	
	//if(!hasReqAnimFrame){
		
	//	console.log("drawing from game loop");
	//}
}

function updateBest(){
	if(map.score>best){
		best=map.score;
		if(navigator.cookieEnabled){
			document.cookie="high="+best+"; expires=Thu, 18 Dec 2033 12:00:00 UTC; path=/";
		}
	}
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
	draw();
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
	updateAll();
	setState("game");
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
		
		var delta=obrengine.subtractVectors(ntPos,otPos);
		var theta=Math.atan2(delta.y,delta.x)-map.ship.angle;
		var dx=delta.getMagnitude()*Math.cos(theta);
		var dy=delta.getMagnitude()*Math.sin(theta);
		var msens=3;
		var ssens=2;
		mainPwr=dx-msens;
		if (mainPwr<0) mainPwr=0;
		if (mainPwr>10) mainPwr=10;
		sidePwr=dy/ssens;
		if (sidePwr<-ssens) sidePwr+=ssens;
		if (sidePwr>ssens) sidePwr-=ssens;
		if (sidePwr<-10) sidePwr=-10;
		if (sidePwr>10) sidePwr=10;
		otPos.set(ntPos.x,ntPos.y);
	}
	//tstr="mp: "+mainPwr+" sp: "+sidePwr;
	map.ship.pwr=mainPwr/10;
	map.ship.sidePwr=sidePwr/10;
}

function getFont(size){
		return "bold "+size+"px Courier New";
}