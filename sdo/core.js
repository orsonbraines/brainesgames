console.log("core.js loaded");
//Ship Class
function Ship(d,l){
	this.d=d;
	this.v=new obrengine.Vector2d(0,0);
	this.angle=0;
	this.angv=0;
	this.mass=500;
	this.momentOfInertia=5000;

	this.maxThrust=300;
	this.maxSideThrust=100;
	//thrust multiplier 0-1
	this.pwr=0;
	//thrust multiplier -1 - 1. positive is ccw, -ve cw
	this.sidePwr=0;
	
	this.len=l;
	this.wid=l/2;
	
	this.vertices=[];
	this.sides=[];
	
	this.updateVertices();
}

Ship.prototype.move=function (t){
	with(obrengine){
		var fwrdAcc=scaleVector(getUnitVector(this.angle),this.maxThrust*this.pwr/this.mass);
		var sideAcc=scaleVector(getUnitVector(this.angle+Math.PI/2),this.maxSideThrust*this.sidePwr/this.mass);
		
		var acc=addVectors(fwrdAcc,sideAcc);
		var angacc=this.maxSideThrust*this.sidePwr/this.momentOfInertia;
		
		this.v.add(scaleVector(acc,t));
		this.angv+=angacc*t;
		
		this.d.add(scaleVector(this.v,t));
		this.angle+=this.angv*t;
		
		this.updateVertices();
	}
}

Ship.prototype.updateVertices=function (){
	with(obrengine){
		this.forward=scaleVector(getUnitVector(this.angle),this.len/2);
		this.side=scaleVector(getUnitVector(this.angle+Math.PI/2),this.wid/2);
		this.vertices[0]=addVectors(this.d,addVectors(this.forward,this.side));
		this.vertices[1]=addVectors(this.d,scaleVector(this.forward,2));
		this.vertices[2]=addVectors(this.d,subtractVectors(this.forward,this.side));
		this.vertices[3]=subtractVectors(this.d,addVectors(this.forward,this.side));
		this.vertices[4]=addVectors(this.d,subtractVectors(this.side,this.forward));
		
		this.sides=[
			new Line(this.vertices[0],this.vertices[1]),
			new Line(this.vertices[1],this.vertices[2]),
			new Line(this.vertices[2],this.vertices[3]),
			new Line(this.vertices[3],this.vertices[4]),
			new Line(this.vertices[4],this.vertices[0]),
		];
	}
}

//Asteroid class
function Asteroid(shape,v){
	this.shape=shape;
	this.v=v;
}

Asteroid.prototype.move=function(t){
	this.shape.center.add(obrengine.scaleVector(this.v,t));
}

//Bullet Class
function Bullet(ship){
	with (obrengine){
		this.len=ship.len/2;
		this.angle=ship.angle;
		this.v=scaleVector(getUnitVector(this.angle),this.len*2);
		
		this.d=addVectors(ship.d,scaleVector(getUnitVector(this.angle),this.len));
		this.line=new Line(this.d,addVectors(this.d,scaleVector(getUnitVector(this.angle),this.len)));
		this.mass=12;
		this.dist=0;
	}
}

Bullet.prototype.move=function(t){
	with (obrengine){
		var d=scaleVector(this.v,t);
		this.dist+=d.getMagnitude();
		this.d.add(d);
		this.line=new Line(this.d,addVectors(this.d,scaleVector(getUnitVector(this.angle),this.len)));
	}
}

//Map Class
function Map(w,h){
	with (obrengine){
		this.w=w;
		this.h=h;
		this.ships=[new Ship(new obrengine.Vector2d(w/2,h/2),50)];
		this.asteroids=[new Asteroid(new Circle(new Vector2d(Math.random()*w,Math.random()*h),50),
			new Vector2d(Math.random()*20,Math.random()*20))];
		this.bullets=[new Bullet(this.ships[0])];
		
		this.maxShips=2;
		this.maxBullets=2;
	}
}