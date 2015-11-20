console.log("core.js loaded");
//Ship Class
function Ship(d,angle,l){
	this.d=d;
	this.v=new obrengine.Vector2d(0,0);
	this.angle=angle;
	this.angv=0;
	this.mass=500;
	this.momentOfInertia=300000;

	this.maxThrust=36;
	this.maxSideThrust=12;
	//thrust multiplier 0-1
	this.pwr=0;
	//thrust multiplier -1 - 1. positive is ccw, -ve cw
	this.sidePwr=0;
	
	this.len=l;
	this.wid=l/2;
	
	this.shoot=false;
	this.reload=0;
	
	//this.vertices=[];
	//this.sides=[];
	this.shape=new obrengine.Polygon([]);
	
	this.updateVertices();
}

Ship.prototype.move=function (t){
	with(obrengine){
		var fwrdAcc=scaleVector(getUnitVector(this.angle),this.maxThrust*this.pwr/this.mass);
		var sideAcc=scaleVector(getUnitVector(this.angle+Math.PI/2),this.maxSideThrust*this.sidePwr/this.mass);
		
		var acc=addVectors(fwrdAcc,sideAcc);
		var angacc=this.maxSideThrust*30*this.sidePwr/this.momentOfInertia;
		
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
		this.shape.vertices[0]=addVectors(this.d,addVectors(this.forward,this.side));
		this.shape.vertices[1]=addVectors(this.d,scaleVector(this.forward,2));
		this.shape.vertices[2]=addVectors(this.d,subtractVectors(this.forward,this.side));
		this.shape.vertices[3]=subtractVectors(this.d,addVectors(this.forward,this.side));
		this.shape.vertices[4]=addVectors(this.d,subtractVectors(this.side,this.forward));

		this.shape.updateLines();
	}
}

//Asteroid class
function Asteroid(shape,v){
	this.shape=shape;
	this.mass=this.shape.radius*this.shape.radius;
	this.v=v;
}

Asteroid.prototype.move=function(t){
	this.shape.center.add(obrengine.scaleVector(this.v,t));
}

//Bullet Class
function Bullet(ship){
	with (obrengine){
		this.mass=12;
		this.len=ship.len/2;
		this.angle=ship.angle;
		this.v=addVectors(ship.v,scaleVector(getUnitVector(this.angle),this.len*2));
		
		ship.v.add(scaleVector(getUnitVector(ship.angle),
			-this.mass*this.v.getMagnitude()/ship.mass));
			
		this.d=addVectors(ship.d,scaleVector(getUnitVector(this.angle),this.len*2));
		this.line=new Line(this.d,addVectors(this.d,scaleVector(getUnitVector(this.angle),this.len)));
		
		//this.dist=0;
	}
}

Bullet.prototype.move=function(t){
	with (obrengine){
		var delta=scaleVector(this.v,t);
		//this.dist+=delta.getMagnitude();
		this.d.add(delta);
		this.line=new Line(this.d,addVectors(this.d,scaleVector(getUnitVector(this.angle),this.len)));
	}
}

//Map Class
function Map(s){
	with (obrengine){
		this.s=s;
		this.rect=new obrengine.Rect(new obrengine.Vector2d(0,0),new obrengine.Vector2d(s,s));
		this.shipLength=40;
		this.ships=[];
		this.initAsteroids(50);
		this.initShip();
		this.bullets=[];
		
		this.maxShips=10;
		this.maxBullets=40;
	}
}

Map.prototype.move=function(t){
	with(this){		
		moveShips(t);
		moveAsteroids(t);
		moveBullets(t);
		collideEdges();
		collideSA();
		collideAA();
	}
}

Map.prototype.moveShips=function(t){
	with(this){
		for(var i=0;i<this.ships.length;i++){
			ships[i].move(t);
			if(ships[i].shoot && ships[i].reload==0){
				var b=new Bullet(ships[i]);
				bullets[bullets.length]=b;
				ships[i].shoot=false;
				ships[i].reload=25;
			}
			if(ships[i].reload>0)ships[i].reload--;
		}
	}
}

Map.prototype.moveAsteroids=function(t){
	for(var i=0;i<this.asteroids.length;i++){
		this.asteroids[i].move(t);
	}
}

Map.prototype.moveBullets=function(t){
	with(this){
	//move bullets multiple times because high v
		for(var times=0;times<2;times++){
			//records bullets that hit to remove them at the end
			var hits=[]
			for(var i=0;i<this.bullets.length;i++){
				this.bullets[i].move(t/2);
				//collide bullet with ships
				for(var j=0;j<this.ships.length;j++){
					//rough collision
					if(obrengine.subtractVectors(this.ships[j].d,this.bullets[i].d).getMagnitude()<
						this.bullets[i].len + this.ships[j].len){
						//fine collision
						if(obrengine.intersects(this.ships[j].shape,this.bullets[i].line)){
							//mark collision with ship
							//****ADD COLLIISON EFFECTS****
							hits[hits.length]=i;
							break;
						}
					}
				}
				//if did not collide with ship test for collisions with asteroids
				if(hits.length==0 || hits[hits.length-1] != i){
					//collide bullet with asteroids
					for(var j=0;j<this.asteroids.length;j++){
						//rough collision
						if(obrengine.subtractVectors(this.asteroids[j].shape.center,this.bullets[i].d).getMagnitude()<
							this.bullets[i].len + this.asteroids[j].shape.radius){
								
							//fine collision
							if(obrengine.intersects(this.asteroids[j].shape,this.bullets[i].line)){
								//mark collision with asteroid
								this.asteroids[j].v=obrengine.scaleVector(obrengine.addVectors(
									obrengine.scaleVector(this.bullets[i].v,this.bullets[i].mass),
									obrengine.scaleVector(this.asteroids[j].v,asteroids[j].mass)),
									1/(this.bullets[i].mass+this.asteroids[j].mass));
								hits[hits.length]=i;
								break;
							}
						}
					}
				}
				//if did not collide and is out of screen
				if(hits.length==0 || hits[hits.length-1] != i){
					if(!rect.inside(bullets[i].d))hits[hits.length]=i;
				}
			}
			for(var i=0;i<hits.length;i++){
				this.bullets.splice(hits[i],1);
			}
		}
	}
}

Map.prototype.collideEdges=function(){
	with(this){
		//collide ships with edge
		for(var i=0;i<ships.length;i++){
			for(var j=0;j<ships[i].shape.vertices.length;j++){
				if(!rect.inside(ships[i].shape.vertices[j])){
					ships[i].angv*=-0.5;
					if(ships[i].shape.vertices[j].x>s){
						ships[i].v.x*=-1;
						ships[i].d.x-=4;
					}
					else if(ships[i].shape.vertices[j].x<0){
						ships[i].v.x*=-1;
						ships[i].d.x+=4;
					}
					else if(ships[i].shape.vertices[j].y>s){
						ships[i].v.y*=-1;
						ships[i].d.y-=4;
					}
					else{
						ships[i].v.y*=-1;
						ships[i].d.y+=4;
					}
					break;
				}
			}
		}
		
		//collide asteroids with edge
		for(var i=0;i<asteroids.length;i++){
			if(asteroids[i].shape.center.x>s-asteroids[i].shape.radius){
				asteroids[i].v.x*=-1;
				asteroids[i].shape.center.x-=4;
			}
			else if(asteroids[i].shape.center.x<asteroids[i].shape.radius){
				asteroids[i].v.x*=-1;
				asteroids[i].shape.center.x+=4;
			}
			else if(asteroids[i].shape.center.y>s-asteroids[i].shape.radius){
				asteroids[i].v.y*=-1;
				asteroids[i].shape.center.y-=4;
			}
			else if(asteroids[i].shape.center.y<asteroids[i].shape.radius){
				asteroids[i].v.y*=-1;
				asteroids[i].shape.center.y+=4;
			}
		}
	}
}

Map.prototype.collideSA=function(){
	with(this){
		//asteroid ship collision
		for(var i=0;i<this.asteroids.length;i++){
			for(var j=0;j<this.ships.length;j++){
				//rough collision
				if(obrengine.subtractVectors(this.asteroids[i].shape.center,this.ships[j].d).getMagnitude()<
					this.ships[j].len + this.asteroids[i].shape.radius){
					//fine collision
					if(obrengine.intersects(this.asteroids[i].shape,this.ships[j].shape)){
						var params1={
							"m":this.asteroids[i].mass,
							"v":this.asteroids[i].v,
							"c":this.asteroids[i].shape.center,
							"I":0,
						};
					
						var params2={
							"m":this.ships[j].mass,
							"v":this.ships[j].v,
							"c":this.ships[j].d,
							"I":this.ships[j].momentOfInertia,
							"w":this.ships[j].angv,
						};
						//calculate the point of collision
						
						var inscts=obrengine.intersectsAt(this.asteroids[i].shape,this.ships[j].shape);
						
						this.pOfCollision=new obrengine.Vector2d(0,0);
						for(var k=0;k<inscts.length;k++)this.pOfCollision.add(inscts[k]);
						this.pOfCollision.scale(1/inscts.length);
						
						var u=obrengine.subtractVectors(this.pOfCollision,this.asteroids[i].shape.center);
						var coll=obrengine.collide(params1,params2,u,this.pOfCollision);
							
						if(coll.collide){
							this.asteroids[i].v=coll.v1;
							this.ships[j].v=coll.v2;
							this.ships[j].angv=coll.w2;
						}
					}
				}
			}
		}
	}
}

Map.prototype.collideAA=function(){
	with(this){
		//asteroid-asteroid collisions
		for(var i=0;i<this.asteroids.length;i++){
			for(var j=i+1;j<this.asteroids.length;j++){
				if(obrengine.intersects(this.asteroids[i].shape,this.asteroids[j].shape)){
					var params1={
						"m":this.asteroids[i].mass,
						"v":this.asteroids[i].v,
						"c":this.asteroids[i].shape.center,
						"I":0
					};
				
					var params2={
						"m":this.asteroids[j].mass,
						"v":this.asteroids[j].v,
						"c":this.asteroids[j].shape.center,
						"I":0
					};

					var coll=obrengine.collide(params1,params2,obrengine.subtractVectors(this.asteroids[j].shape.center,
					this.asteroids[i].shape.center));
					
					this.asteroids[i].v=coll.v1;
					this.asteroids[j].v=coll.v2;

				}
			}
		} 
	}
}

Map.prototype.initShip=function(){
	//spawn ship not touching asteroids
	var angle=Math.random()*2*Math.PI;
	do{
		var collides=false;
		var d=new obrengine.Vector2d(Math.random()*this.s,Math.random()*this.s);
		var safetyBubble=new obrengine.Circle(d,this.shipLength*2);
		for(var i=0;i<this.asteroids.length;i++){
			collides=collides||obrengine.intersects(safetyBubble,this.asteroids[i].shape);
		}
		for(var i=0;i<this.ships.length;i++){
			collides=collides||obrengine.intersects(safetyBubble,this.ships[i].shape);
		}
	}while(collides);
	
	this.ships[this.ships.length]=new Ship(d,angle,this.shipLength);
}

Map.prototype.initAsteroids=function(num){
	with(obrengine){
		this.asteroids=new Array(num);
		var mv=0.5;
		for(var i=0;i<num;i++){
			do{
				collides=false;
				var radius=10+20*Math.random();
				var v=new Vector2d(-mv+2*mv*Math.random(),-mv+2*mv*Math.random());	
				var d=new Vector2d(this.s*Math.random(),this.s*Math.random());
				this.asteroids[i]=new Asteroid(new Circle(d,radius),v);
				for(var j=0;j<i;j++){
					collides=collides||intersects(this.asteroids[i].shape,this.asteroids[j].shape);
				}
			}while(collides);
		}
	}
}
//generate an asteroid
Map.prototype.generateAsteroid=function (){
	with(obrengine){
		var radius,v,position,circ;
		var mv=3;
		radius=10+20*Math.random();
		v=new Vector2d(-mv+2*mv*Math.random(),-mv+2*mv*Math.random());	
		//finish
		
	}
}