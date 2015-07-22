console.log("space.js loaded");
//Ship Class
function Ship(x,y){
	this.pos=new obrengine.Vector2d(x,y);
	this.vel=new obrengine.Vector2d(0,0);
	//this.acc=new Vector2d(0,0);
	this.angle=0;
	this.angvel=0;
	//this.angacc=0;
	this.mass=1000;
	this.momentOfInertia=10000;

	this.maxThrust=200;
	this.maxSideThrust=25;
	//thrust multiplier 0-1
	this.pwr=0;
	//thrust multiplier -1 - 1. positive is ccw, -ve cw
	this.sidePwr=0;
	
	this.len=40;
	this.wid=20;
	
	this.move=function (t){
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
	this.updateVertices=function (){
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
	
	this.updateVertices();
/*	this.updateMainFlame=updateMainFlame;
	this.updateSideFlame=updateSideFlame;
	this.updateAll=updateAll;
	
	this.updateAll(); */
}
//Asteroid class
function Asteroid(shape,v){
	with(obrengine){
		this.shape=shape;
		this.v=v;
		this.move=function(t){
			this.shape.center.add(scaleVector(this.v,t));
		}
	}
}

//Map Class
function Map(w,h){
	this.w=w;
	this.h=h;
	this.score=0;
	this.ship=new Ship(w/2,h/2);
	this.alive=true;
	this.asteroids=new Array(5);
	
	this.move=function(){
		this.score+=1+Math.floor(this.ship.vel.magnitude);
		this.ship.move(1);
		for(var i=0;i<this.asteroids.length;i++){
			this.asteroids[i].move(1);
			for(var j=0;j<5;j++){
				if(obrengine.intersects(this.asteroids[i].shape,this.ship.sides[j]))this.alive=false;
			}
			
			if(!this.inBounds(this.asteroids[i])) this.asteroids[i]=this.generateAsteroid();
		}
		if (!(this.inBounds(this.ship.vertices[0])||
		this.inBounds(this.ship.vertices[1])||this.inBounds(this.ship.vertices[2])||
		this.inBounds(this.ship.vertices[3])||this.inBounds(this.ship.vertices[4]) ) ) this.alive=false;

	}
	
	this.inBounds=function(p){
		if(p instanceof obrengine.Vector2d){
			return p.x>=0 && p.y>=0 && p.x<=this.w && p.y<=this.h;
		}
		else if(p instanceof Asteroid){
			return p.shape.center.x>=-p.shape.radius && p.shape.center.y>=-p.shape.radius
			&& p.shape.center.x<=this.w+p.shape.radius && p.shape.center.y<=this.h+p.shape.radius
		}
	}
	
	this.generateAsteroid=function (){
		with(obrengine){
			var circle,vel,radius;
			radius=10+20*Math.random();
			if(Math.random()>0.5){
				if(Math.random()>0.5){
					circle=new Circle(new Vector2d(-radius,Math.random()*this.h),radius);
					vel=new Vector2d(Math.random()*3,-3+Math.random()*6);
				}
				else{
					circle=new Circle(new Vector2d(this.w+radius,Math.random()*this.h),radius);
					vel=new Vector2d(Math.random()*-3,-3+Math.random()*6);
				}
			}
			else{
				if(Math.random()>0.5){
					circle=new Circle(new Vector2d(Math.random()*this.w,-radius),radius);
					vel=new Vector2d(-3+Math.random()*6,Math.random()*3);
				}
				else{
					circle=new Circle(new Vector2d(Math.random()*this.w,this.h+radius),radius);
					vel=new Vector2d(-3+Math.random()*6,Math.random()*-3);
				}
			}
			return new Asteroid(circle,vel);
		}
	}
	
	for(var i=0;i<this.asteroids.length;i++){
		this.asteroids[i]=this.generateAsteroid();
		console.log("genning asteroid:");
		console.log(this.asteroids[i]);
	}
}


 

/*function updateMainFlame(){
	var forward=scaleVector(getUnitVector(this.angle),this.len/2);
	var side=scaleVector(getUnitVector(this.angle+Math.PI/2),this.wid/2);
	this.mainFlame=[
		subtractVectors(this.pos,addVectors(forward,side)),
		addVectors(this.pos,subtractVectors(side,forward)),
		subtractVectors(this.pos,scaleVector(forward,1+this.pwr*2)),
	];
}

function updateSideFlame(){
	var forward=scaleVector(getUnitVector(this.angle),this.len/2);
	var side=scaleVector(getUnitVector(this.angle+Math.PI/2),this.wid/2);
	if(sidePwr>=0){
		this.sideFlame=[
		addVectors(this.pos,subtractVectors(forward,side)),
		addVectors(this.pos,subtractVectors(scaleVector(forward,0.8),scaleVector(side,1+this.sidePwr))),
		addVectors(this.pos,subtractVectors(scaleVector(forward,0.6),side)),
		];
	}
	else{
		this.sideFlame=[
		addVectors(this.pos,addVectors(forward,side)),
		addVectors(this.pos,addVectors(scaleVector(forward,0.8),scaleVector(side,1-this.sidePwr))),
		addVectors(this.pos,addVectors(scaleVector(forward,0.6),side)),
		];
	}
}

function updateAll(){
	this.updateVertices();
	this.updateMainFlame();
	this.updateSideFlame();
} */
