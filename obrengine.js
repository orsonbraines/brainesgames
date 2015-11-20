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
	}
	
	obrengine.Vector2d.prototype.set=function(x,y){
		this.x=x;
		this.y=y;
	}
	
	obrengine.Vector2d.prototype.add=function (vector){
			this.x+=vector.x;
			this.y+=vector.y;
	}	
	
	obrengine.Vector2d.prototype.subtract=function(vector){
			this.x-=vector.x;
			this.y-=vector.y;
	}

	obrengine.Vector2d.prototype.scale=function (scalar){
			this.x*=scalar;
			this.y*=scalar;
	}
	
	obrengine.Vector2d.prototype.getMagnitude=function(){
		return Math.sqrt(this.x*this.x+this.y*this.y);
	}
	
	obrengine.Vector2d.prototype.toString=function (){
			return "x: "+this.x+"\ty: "+this.y+"\tmagnitude: "+this.getMagnitude();
	}
	
	obrengine.Vector2d.prototype.toUnit=function(){
		return scaleVector(this,1/this.getMagnitude());
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
		this.p1=p1;
		this.p2=p2;
		this.dif=subtractVectors(p2,p1);
	}

	obrengine.Line.prototype.toString=function (){
			return "Line p1: "+this.p1+"\tp2: "+this.p2;
	}

	//circle class
	obrengine.Circle=function (center,radius){
		this.center=center;
		this.radius=radius;
	}
	
	obrengine.Circle.prototype.inside=function(p){
		return subtractVectors(p,this.center).getMagnitude()<this.radius;
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
	obrengine.Polygon=function(vertices){
		this.vertices=vertices;
		this.lines=[];
		for(var i=0;i<this.vertices.length;i++){
			if(i==0) this.lines[i]=new Line(this.vertices[this.vertices.length-1],this.vertices[i]);
			else this.lines[i]=new Line(this.vertices[i-1],this.vertices[i]);
		}
	}
	
	obrengine.Polygon.prototype.updateLines=function(){
		for(var i=0;i<this.vertices.length;i++){
			if(i==0) this.lines[i]=new Line(this.vertices[this.vertices.length-1],this.vertices[i]);
			else this.lines[i]=new Line(this.vertices[i-1],this.vertices[i]);
		}
	}
	
	obrengine.Polygon.prototype.getCenter=function(){
		var xt=0;
		var yt=0;
		for(var i=0;i<this.vertices.length;i++){
			xt+=this.vertices[i].x;
			yt+=this.vertices[i].y;
		}
		return new Vector2d(xt/this.vertices.length,yt/this.vertices.length);
	}
	
	obrengine.Polygon.prototype.toString=function (){
		return "Polygon";
	}

	//intersection tester
	obrengine.intersects=function (obj1,obj2){
		if (obj1 instanceof Circle && obj2 instanceof Circle){
			return (subtractVectors(obj1.center,obj2.center).getMagnitude() < obj1.radius + obj2.radius);
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
			
			var a=line.dif.x*line.dif.x+line.dif.y*line.dif.y;
			var b=2*((line.p1.x-circle.center.x)*line.dif.x+(line.p1.y-circle.center.y)*line.dif.y);
			var c=line.p1.x*line.p1.x+line.p1.y*line.p1.y+
					circle.center.x*circle.center.x+circle.center.y*circle.center.y-
					circle.radius*circle.radius-2*
					(line.p1.x*circle.center.x + line.p1.y*circle.center.y);
			var det=b*b-4*a*c;
			if(det<0) return false;
			var t1=(-b+Math.sqrt(det))/(2*a);
			var t2=(-b-Math.sqrt(det))/(2*a);
			return t1>=0 && t1<=1 || t2>=0 && t2<=1;
		}
		else if(obj1 instanceof Line && obj2 instanceof Line){
			if(obj1.dif.x==0){
				if(obj1.dif.y==0 || obj2.dif.x==0)return false;
				var t2=(obj1.p1.x-obj2.p1.x)/obj2.dif.x;
				var t1=(obj2.p1.y-obj1.p1.y+t2*obj2.dif.y)/obj1.dif.y;

				return t1>=0 && t1<=1 && t2>=0 && t2<=1;
			}
			var denom=obj2.dif.x * obj1.dif.y - obj2.dif.y * obj1.dif.x;
			if (denom==0) return false;
			var t2=(obj1.dif.x*(obj2.p1.y-obj1.p1.y)+obj1.dif.y*(obj1.p1.x-obj2.p1.x))/denom;
			var t1=(obj2.p1.x-obj1.p1.x+t2*obj2.dif.x)/obj1.dif.x;

			return t1>=0 && t1<=1 && t2>=0 && t2<=1;

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
		else if(obj1 instanceof Circle && obj2 instanceof Polygon || obj1 instanceof Polygon && obj2 instanceof Circle){
			var c,p;
			if(obj1 instanceof Circle){
				c=obj1;
				p=obj2;
			}
			else{
				c=obj2;
				p=obj1;
			}
			for(var i=0;i<p.lines.length;i++){
				if(intersects(p.lines[i],c)) return true;
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
	
	//returns an array of of the intersection points, or null if no intersection
	obrengine.intersectsAt=function(obj1,obj2){
		if(obj1 instanceof Circle && obj2 instanceof Line  || obj2 instanceof Circle && obj1 instanceof Line){
			var circle,line;
			if(obj1 instanceof Circle){
				circle=obj1;
				line=obj2;
			}
			else{
				circle=obj2;
				line=obj1;
			}
			
			var a=line.dif.x*line.dif.x+line.dif.y*line.dif.y;
			var b=2*((line.p1.x-circle.center.x)*line.dif.x+(line.p1.y-circle.center.y)*line.dif.y);
			var c=line.p1.x*line.p1.x+line.p1.y*line.p1.y+
					circle.center.x*circle.center.x+circle.center.y*circle.center.y-
					circle.radius*circle.radius-2*
					(line.p1.x*circle.center.x + line.p1.y*circle.center.y);
			var det=b*b-4*a*c;
			if(det<0) return new Array(0);
			var t1=(-b+Math.sqrt(det))/(2*a);
			var t2=(-b-Math.sqrt(det))/(2*a);
			var res=[];
			if(t1>=0 && t1<=1)res[0]=addVectors(line.p1,scaleVector(line.dif,t1));
			if(t2>=0 && t2<=1)res[res.length]=addVectors(line.p1,scaleVector(line.dif,t2));
			//console.log("circle line:"+res);
			return res;
		}
		else if(obj1 instanceof Circle && obj2 instanceof Polygon || obj1 instanceof Polygon && obj2 instanceof Circle){
			var c,p;
			if(obj1 instanceof Circle){
				c=obj1;
				p=obj2;
			}
			else{
				c=obj2;
				p=obj1;
			}
			var res=[];
			for(var i=0;i<p.lines.length;i++){
				res=res.concat(intersectsAt(p.lines[i],c));
			}
			//console.log("circle poly:"+res);
			return res;
		}
		else{
			console.log("not right shape");
			return null;
		}
	}
	
	obrengine.collide=function(params1,params2,u,p){
		//u is the direction from the first object to the second
		u=u.toUnit();
		
		//no torque
		//console.log("1.I"+params1.I);
		//console.log("2.I"+params2.I);
		if(params1.I==0 && params2.I==0){
			var bounce=0.4;
			var vri=subtractVectors(params1.v,params2.v);
			var dp=dotProduct(vri,u);
			if(dp>0){
				var f=params1.m*params2.m*(1+bounce)*dp/(params1.m+params2.m);
				var val={
					"v1":subtractVectors(params1.v,scaleVector(u,f/params1.m)),
					"v2":addVectors(params2.v,scaleVector(u,f/params2.m))
				};
				return val;
			}
			else{
				//no change(should uncollide naturaly)
				var val={
					"v1":params1.v,
					"v2":params2.v
				};
				return val;
			}
		}
		//object1 with no torque object2 with  torque
		else if(params1.I==0){
			var bounce=0.4;
			//vector from center of 2nd ob to point of collision
			var r=subtractVectors(p,params2.c);
			//direction of rotational motion
			var thetaR=Math.atan2(r.y,r.x);
			var thetaU=Math.atan2(u.y,u.x);
			var wb=getUnitVector(thetaR+Math.PI/2);
			var vri=subtractVectors(params1.v,addVectors(params2.v,scaleVector(wb,params2.w*r.getMagnitude())));
			var dp=dotProduct(vri,u);
			
			if(dp>0){
				//multiply by force to get the difference of vr due to linear motion
				var lb=scaleVector(u,-(params1.m+params2.m)/(params1.m*params2.m));
				
				//multiply by force to get the difference of vr due to rotational motion
				var rb=scaleVector(wb,-r.getMagnitude()*r.getMagnitude()*Math.sin(thetaU-thetaR)/params2.I);
				//multiply by force to get delta vr
				b=addVectors(lb,rb);
				
				
				var f=-(1+bounce)*dp/(dotProduct(b,u));
				var val={
					"collide":true,
					"v1":subtractVectors(params1.v,scaleVector(u,f/params1.m)),
					"v2":addVectors(params2.v,scaleVector(u,f/params2.m)),
					"w2":params2.w+f*r.getMagnitude()*Math.sin(thetaU-thetaR)/params2.I
				};
				return val;
 			}
			else{
				//no change(should uncollide naturaly)
				var val={
					"collide":false,
					"v1":params1.v,
					"v2":params2.v,
					"w2":params2.w
				};
				return val;
			}
		}
		//else console.log("I!=0");
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
