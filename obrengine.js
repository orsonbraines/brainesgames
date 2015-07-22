console.log("obrengine.js loaded");

var obrengine={};


if( typeof module != "undefined") module.exports=obrengine;

with(obrengine){
	obrengine.version="1.0.0";
	obrengine.description="a simple game engine by Orson Baines";
/*
***
Geometry Section
***
*/

//vector class
	obrengine.Vector2d= function(x,y){
		this.x=x;
		this.y=y;
		this.magnitude=Math.sqrt(x*x+y*y);
		this.add=function (vector){
			this.x+=vector.x;
			this.y+=vector.y;
			this.magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
		}	
		this.subtract=function(vector){
			this.x-=vector.x;
			this.y-=vector.y;
			this.magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
		}
		this.scale=function (scalar){
			this.x*=scalar;
			this.y*=scalar;
			this.magnitude*=scalar;
		}
		this.toString=function (){
			return "x: "+this.x+"\ty: "+this.y;
		}
	}


	//vector functions

	obrengine.getUnitVector=function(angle){
		return new Vector2d(Math.cos(angle),Math.sin(angle));
	}

	obrengine.addVectors=function(v1,v2){
		return new Vector2d(v1.x+v2.x,v1.y+v2.y);
	}

	obrengine.subtractVectors=function(v1,v2){
		return new Vector2d(v1.x-v2.x,v1.y-v2.y);
	}

	obrengine.scaleVector=function(vector,scalar){
		return new Vector2d(vector.x*scalar,vector.y*scalar);
	}

	//line class
	obrengine.Line=function(p1,p2){
		if(p1.x!=p2.x){
			if(p1.x<p2.x){
				this.p1=p1;
				this.p2=p2;
			}
			else{
				this.p1=p2;
				this.p2=p1;
			}
			this.slope=(this.p2.y-this.p1.y)/(this.p2.x-this.p1.x);
		}
		else{
			if(p1.y<=p2.y){
				this.p1=p1;
				this.p2=p2;
			}
			else{
				this.p1=p2;
				this.p2=p1;
			}
			this.slope=NaN;
		}
		
		this.toString=function (){
			return "Line p1: "+this.p1+"\tp2: "+this.p2+"\tslope: "+this.slope;
		}
	}



	//circle class
	obrengine.Circle=function (center,radius){
		this.center=center;
		this.radius=radius;
		this.inside=function(p){
			return subtractVectors(p,center).magnitude<this.radius;
		}
		this.toString=function (){
			return "Circle center: "+this.center+"\tradius: "+this.radius;
		}
	}

	//intersection tester
	obrengine.intersects=function (obj1,obj2){
		if(obj1 instanceof Line && obj2 instanceof Line){
			if(obj1.p1.x==obj1.p2.x || obj2.p1.x==obj2.p2.x){
				if(obj1.p1.x==obj1.p2.x && obj2.p1.x==obj2.p2.x)return false;
				var la,lb;
				if(obj1.p1.x==obj1.p2.x) {lb=obj1;la=obj2;}
				else {lb=obj2;la=obj1;}
				
				var yint=la.slope*(lb.p1.x-la.p1.x)+la.p1.y;
				return (la.p1.x<lb.p1.x && lb.p1.x<la.p2.x) && (lb.p1.y<yint && yint<lb.p2.y);
			}
			else{
				var la=obj1;
				var lb=obj2;
				var xint=(la.slope*la.p1.x + lb.p1.y - lb.slope*lb.p1.x -la.p1.y)/(la.slope-lb.slope);
				console.log("xint: "+xint);
				return la.p1.x<xint && xint<la.p2.x && lb.p1.x<xint && xint<lb.p2.x;
			}
		}
		else if(obj1 instanceof Circle && obj2 instanceof Line  || obj2 instanceof Circle && obj1 instanceof Line){
			var circle,line;
			if(obj1 instanceof Circle){
				circle=obj1;
				line=obj2;
			}
			else{
				circle=obj2;
				line=obj1;
			}
			
			if(line.p1.x == line.p2.x){
				//vertical line
				return (circle.inside(line.p1) || circle.inside(line.p2) ||
				(Math.abs(line.p1.x-circle.center.x)<circle.radius && line.p1.y<circle.center.y 
				&& circle.center.y<line.p2.y));
			}
			else if(line.p1.y==line.p2.y){
				//horizontal line
				return (circle.inside(line.p1) || circle.inside(line.p2) ||
				(Math.abs(line.p1.y-circle.center.y)<circle.radius && line.p1.x<circle.center.x
				&& circle.center.x<line.p2.x));
			}
			else{
				if(circle.inside(line.p1) || circle.inside(line.p2)) return true;
				
				var cx=(line.slope*line.slope*line.p1.x + circle.center.x +
				line.slope*(circle.center.y-line.p1.y))/
				(line.slope*line.slope+1);
				var closestPoint=new Vector2d(cx,line.slope*(cx-line.p1.x)+line.p1.y);
				
				return (circle.inside(closestPoint) && line.p1.x<closestPoint.x  && closestPoint.x<line.p2.x);
			}
		}
	}
}
