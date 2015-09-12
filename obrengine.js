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
	}
	
	obrengine.Vector2d.prototype.set=function(x,y){
		this.x=x;
		this.y=y;
		this.magnitude=Math.sqrt(x*x+y*y);
	}
	
	obrengine.Vector2d.prototype.add=function (vector){
			this.x+=vector.x;
			this.y+=vector.y;
			this.magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
	}	
	
	obrengine.Vector2d.prototype.subtract=function(vector){
			this.x-=vector.x;
			this.y-=vector.y;
			this.magnitude=Math.sqrt(this.x*this.x+this.y*this.y);
	}

	obrengine.Vector2d.prototype.scale=function (scalar){
			this.x*=scalar;
			this.y*=scalar;
			this.magnitude*=scalar;
	}
	
	obrengine.Vector2d.prototype.toString=function (){
			return "x: "+this.x+"\ty: "+this.y+"\tmagnitude: "+this.magnitude;
	}
	
	obrengine.Vector2d.prototype.toUnit=function(){
		return scaleVector(this,1/this.magnitude);
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
	
	obrengine.dotProduct=function(v1,v2){
		return v1.x*v2.x + v1.y*v2.y;
	}

	obrengine.scaleVector=function(vector,scalar){
		return new Vector2d(vector.x*scalar,vector.y*scalar);
	}
	
	obrengine.negativeVector=function(vector){
		return scaleVector(vector,-1);
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
	}

	obrengine.Line.prototype.toString=function (){
			return "Line p1: "+this.p1+"\tp2: "+this.p2+"\tslope: "+this.slope;
	}

	//circle class
	obrengine.Circle=function (center,radius){
		this.center=center;
		this.radius=radius;
	}
	
	obrengine.Circle.prototype.inside=function(p){
		return subtractVectors(p,this.center).magnitude<this.radius;
	}
	
	obrengine.Circle.prototype.toString=function (){
			return "Circle center: "+this.center+"\tradius: "+this.radius;
	}
	
	//Rect class
	obrengine.Rect=function(corner,size){
		this.corner=corner;
		this.size=size;
	}
	
	obrengine.Rect.prototype.inside=function(p){
		return p.x>this.corner.x && p.x<this.corner.x+this.size.x &&
				p.y>this.corner.y && p.y<this.corner.y+this.size.y;
	}
	
	obrengine.Rect.prototype.toString=function (){
		return "Rect corner: "+this.corner+"\tsize: "+this.size;
	}
	
	//Polygon class
	obrengine.Polygon=function(points){
		this.points=points;
		this.lines=[];
		for(var i=0;i<this.points.length;i++){
			if(i==0) this.lines[i]=new Line(this.points[this.points.length-1],this.points[i]);
			else this.lines[i]=new Line(this.points[i-1],this.points[i]);
		}
	}
	
	obrengine.Polygon.prototype.toString=function (){
		return "Polygon";
	}

	//intersection tester
	obrengine.intersects=function (obj1,obj2){
		if (obj1 instanceof Circle && obj2 instanceof Circle){
			return (subtractVectors(obj1.center,obj2.center).magnitude < obj1.radius + obj2.radius);
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
		else if(obj1 instanceof Line && obj2 instanceof Line){
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
				return la.p1.x<xint && xint<la.p2.x && lb.p1.x<xint && xint<lb.p2.x;
			}
		}
		else if(obj1 instanceof Line && obj2 instanceof Polygon || obj1 instanceof Polygon && obj2 instanceof Line){
			var l,p;
			if(obj1 instanceof Line){
				l=obj1;
				p=obj2;
			}
			else{
				l=obj2;
				p=obj1;
			}
			
			for(var i=0;i<p.lines.length;i++){
				if(intersects(p.lines[i],l)) return true;
			}
			return false;
		}
		else if(obj1 instanceof Polygon && obj2 instanceof Polygon){
			for(var i=0;i<obj1.lines.length;i++){
				for(var j=0;j<obj2.lines.length;j++){
					if(intersects(obj1.lines[i],obj2.lines[j])) return true;
				}
			}
			return false;
		}
		else if(obj1 instanceof Rect && obj2 instanceof Rect){
			var l,r;
			if(obj1.corner.x>obj2.corner.x){
				r=obj1;
				l=obj2;
			}
			else{
				r=obj2;
				l=obj1;
			}
			return r.corner.x<l.corner.x+l.size.x &&(
				(r.corner.y>l.corner.y && r.corner.y<l.corner.y+l.size.y)||
				(r.corner.y+r.size.y>l.corner.y && r.corner.y+r.size.y<l.corner.y+l.size.y));
		}
	}
	
	//returns null if no lines intersect or an array of booleans indicating which lines intersect
	obrengine.intersectsAt=function(obj1,obj2){
		//TODO
		return null;
	}
	
	obrengine.collideCircles=function(circ1,m1,v1,circ2,m2,v2){	
		//logic: vrf.u= -bounce*vri.u
		var u=subtractVectors(circ1.center,circ2.center).toUnit();
		var vri=subtractVectors(v1,v2);
		var bounce=0.4;
		var dp=dotProduct(vri,u);
		if(dp<0){
			var f=-m1*m2*(bounce+1)*dp/(m1+m2);
			v1.add(obrengine.scaleVector(u,f/m1));
			v2.add(obrengine.scaleVector(u,-f/m2));
		}
	}
	
/*
***
Utility Function
***
*/

	obrengine.lowestEmpty= function(array){
		var c=0;
		while(c<array.length && typeof array[c]!="undefined" && array[c]!=null) c++;
		return c;
	}
}
