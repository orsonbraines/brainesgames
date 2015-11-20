console.log("imnput.js loaded");

function Input(){
	this.reset();
}

Input.prototype.reset=function(){
	this.down=false;
	this.up=false;
	this.right=false;
	this.left=false;
	this.space=false;
	this.z=false;
	this.x=false;
}

function keyDown(e){
	//console.log("key down. code="+e.keyCode);
	//left arrow: -ve side thrust
	if(e.keyCode==37){
		input.left=true;
	}
	//up arrow
	else if(e.keyCode==38){
		input.up=true;
	}
	//right arrow: +ve side thrust
	else if(e.keyCode==39){
		input.right=true;
	}
	//down arrow
	else if(e.keyCode==40){
		input.down=true;
	}
	//space bar
	else if(e.keyCode==32){
		input.space=true;
	}
	//z
	else if(e.keyCode==90){
		input.z=true;
	}
	//x
	else if(e.keyCode==88){
		input.x=true;
	}
	//p
	else if(e.keyCode==80){
		clearInterval(loop);
	}
}

var input=new Input();

function keyUp(e){
	//console.log("key up. code="+e.keyCode);
	//left arrow: -ve side thrust
	if(e.keyCode==37){
		input.left=false;
	}
	//up arrow
	else if(e.keyCode==38){
		input.up=false;
	}
	//right arrow: +ve side thrust
	else if(e.keyCode==39){
		input.right=false;
	}
	//down arrow
	else if(e.keyCode==40){
		input.down=false;
	}
	//space bar
	else if(e.keyCode==32){
		input.space=false;
	}
	//z
	else if(e.keyCode==90){
		input.z=false;
	}
	//x
	else if(e.keyCode==88){
		input.x=false;
	}
}

function updateInput(ship,graphics){
	updateShoot(ship);
	updatePwrs(ship);
	updateZoom(graphics);
}

function updateZoom(graphics){
	if(input.z && graphics.camera.s>30)graphics.camera.s/=1.1;
	if(input.x && graphics.camera.s<graphics.map.s)graphics.camera.s*=1.1;
}

function updateShoot(ship){
	if(input.space){
		ship.shoot=true;
	}
	else{
		ship.shoot=false;
	}
}

function updatePwrs(ship){
	//adjust main pwr
	var inc=0.02;
	if(input.up)ship.pwr+=inc;
	else ship.pwr-=inc;
	if(input.down)ship.pwr=0;
	
	if(ship.pwr>1)ship.pwr=1;
	if(ship.pwr<0)ship.pwr=0;
	
	if(ship.sidePwr>=0){
		if(input.right)ship.sidePwr= -inc;
 		else if(input.left){
			ship.sidePwr+=inc;
			if(ship.sidePwr>1)ship.sidePwr=1;
		}
		else {
			ship.sidePwr-=inc;
			if(ship.sidePwr<0)ship.sidePwr=0;
		}
	}
	else{
		if(input.left){
			ship.sidePwr=inc;
		}
 		else if(input.right){
			ship.sidePwr-=inc;
			if(ship.sidePwr<-1)ship.sidePwr=-1;
		}
		else {
			ship.sidePwr+=inc;
			if(ship.sidePwr>0)ship.sidePwr=0;
		}
	}
	//console.log(ship.sidePwr);
}