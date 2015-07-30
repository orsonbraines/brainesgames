console.log("space.js loaded");
//Ship Class
function Ship(pos,l){
	this.pos=pos;
	this.vel=new obrengine.Vector2d(0,0);
	//this.acc=new Vector2d(0,0);
	this.angle=0;
	this.angvel=0;
	//this.angacc=0;
	this.mass=1000;
	this.momentOfInertia=10000;

	this.maxThrust=5*l;
	this.maxSideThrust=.6*l;
	//thrust multiplier 0-1
	this.pwr=0;
	//thrust multiplier -1 - 1. positive is ccw, -ve cw
	this.sidePwr=0;
	
	this.len=l;
	this.wid=l/2;
	
	this.updateVertices();
}

Ship.prototype.move=function (t){
	with(obrengine){
		var fwrdAcc=scaleVector(getUnitVector(this.angle),this.maxThrust*this.pwr/this.mass);
		var sideAcc=scaleVector(getUnitVector(this.angle+Math.PI/2),this.maxSideThrust*this.sidePwr/this.mass);
		
		var acc=addVectors(fwrdAcc,sideAcc);
		var angacc=this.maxSideThrust*this.sidePwr/this.momentOfInertia;
		
		this.vel.add(scaleVector(acc,t));
		this.angvel+=angacc*t;
		
		this.pos.add(scaleVector(this.vel,t));
		this.angle+=this.angvel*t;
		
		this.updateVertices();
	}
}

Ship.prototype.updateVertices=function (){
	with(obrengine){
		var forward=scaleVector(getUnitVector(this.angle),this.len/2);
		var side=scaleVector(getUnitVector(this.angle+Math.PI/2),this.wid/2);
		this.vertices=[
			addVectors(this.pos,addVectors(forward,side)),
			addVectors(this.pos,scaleVector(forward,2)),
			addVectors(this.pos,subtractVectors(forward,side)),
			subtractVectors(this.pos,addVectors(forward,side)),
			addVectors(this.pos,subtractVectors(side,forward)),
		];
		
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
	this.mass=this.shape.radius*this.shape.radius;
}

Asteroid.prototype.move=function(t){
	this.shape.center.add(obrengine.scaleVector(this.v,t));
}

//Map Class
function Map(w,h){
	this.w=w;
	this.h=h;
	this.score=0;
	this.mean=(w+h)/2;
	this.ship=new Ship(new obrengine.Vector2d(w/2,h/2),this.mean/20);
	this.alive=true;
	this.asteroids=new Array(10);

	
	for(var i=0;i<this.asteroids.length;i++){
		this.asteroids[i]=this.generateAsteroid();
	}
}

Map.prototype.resize=function (nw,nh){
	var xratio=nw/this.w;
	var yratio=nh/this.h;
	var nmean=(nw+nh)/2;
	var mratio=nmean/this.mean;
	
	this.ship.pos=new obrengine.Vector2d(this.ship.pos.x*xratio,this.ship.pos.y*yratio);
	this.ship.vel.scale(mratio);
	this.ship.len=nmean/20;
	this.ship.wid=this.ship.len/2;
	this.maxThrust=5*this.ship.len;
	this.maxSideThrust=.6*this.ship.len;

	for(var i=0;i<this.asteroids.length;i++){
		this.asteroids[i].shape.center=new obrengine.Vector2d(this.asteroids[i].shape.center.x*xratio,
															this.asteroids[i].shape.center.y*yratio);
		this.asteroids[i].shape.radius*=mratio;
		this.asteroids[i].v.scale(mratio);
		this.asteroids[i].mass=this.asteroids[i].shape.radius*this.asteroids[i].shape.radius;
	}
	this.w=nw;
	this.h=nh;
	this.mean=nmean;
	this.ship.updateVertices;
}

Map.prototype.move=function(){
	this.score+=1+Math.floor(this.ship.vel.magnitude*500/this.mean);
	this.ship.move(1);
	for(var i=0;i<this.asteroids.length;i++){
		this.asteroids[i].move(1);
		
		if(obrengine.subtractVectors(this.asteroids[i].shape.center,this.ship.pos).magnitude<
		this.ship.len + this.asteroids[i].shape.radius){
			for(var j=0;j<5;j++){
				if(obrengine.intersects(this.asteroids[i].shape,this.ship.sides[j])){
					this.alive=false;
					break;
				}
			}
		}
		
		if(!this.inBounds(this.asteroids[i])) this.asteroids[i]=this.generateAsteroid();
	}
	for(var i=0;i<this.asteroids.length;i++){
		for(var j=i+1;j<this.asteroids.length;j++){
			if(obrengine.intersects(this.asteroids[i].shape,this.asteroids[j].shape)) 
				obrengine.collideCircles(this.asteroids[i].shape,this.asteroids[i].mass,this.asteroids[i].v,
										 this.asteroids[j].shape,this.asteroids[j].mass,this.asteroids[j].v);
		}
	}
	if (!(this.inBounds(this.ship.vertices[0])||
	this.inBounds(this.ship.vertices[1])||this.inBounds(this.ship.vertices[2])||
	this.inBounds(this.ship.vertices[3])||this.inBounds(this.ship.vertices[4]) ) ) this.alive=false;

}

Map.prototype.inBounds=function(p){
	if(p instanceof obrengine.Vector2d){
		return p.x>=0 && p.y>=0 && p.x<=this.w && p.y<=this.h;
	}
	else if(p instanceof Asteroid){
		return p.shape.center.x>=-p.shape.radius && p.shape.center.y>=-p.shape.radius
		&& p.shape.center.x<=this.w+p.shape.radius && p.shape.center.y<=this.h+p.shape.radius
	}
}

Map.prototype.generateAsteroid=function (){
	with(obrengine){
		var circle,vel,radius,mv;
		radius=this.mean/80+this.mean/40*Math.random();
		mv=this.mean/200;
		if(Math.random()>0.5){
			if(Math.random()>0.5){
				circle=new Circle(new Vector2d(-radius,Math.random()*this.h),radius);
				vel=new Vector2d(Math.random()*mv,-mv+Math.random()*2*mv);
			}
			else{
				circle=new Circle(new Vector2d(this.w+radius,Math.random()*this.h),radius);
				vel=new Vector2d(Math.random()*-mv,-mv+Math.random()*2*mv);
			}
		}
		else{
			if(Math.random()>0.5){
				circle=new Circle(new Vector2d(Math.random()*this.w,-radius),radius);
				vel=new Vector2d(-mv+Math.random()*2*mv,Math.random()*mv);
			}
			else{
				circle=new Circle(new Vector2d(Math.random()*this.w,this.h+radius),radius);
				vel=new Vector2d(-mv+Math.random()*2*mv,Math.random()*-mv);
			}
		}
		return new Asteroid(circle,vel);
	}
}