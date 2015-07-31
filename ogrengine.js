console.log("ogrengine.js loaded");

var ogrengine={};

/**
	***This graphics engine requires obrengine***
*/
//if( typeof module != "undefined") module.exports=ogrengine;

with(ogrengine){
	ogrengine.version="1.0.0";
	ogrengine.description="a simple graphics engine by Orson Baines";
	
	/**
		Style CLASS
		type should be "f" for fill,"s" for stroke or "fs" for fill and stroke
		style should be the string supplied to graphics context
	*/
	ogrengine.Style=function(type,fStyle,sStyle){
		this.type=type;
		this.fStyle=fStyle;
		this.sStyle=sStyle;
	}
	
	/**
		Group CLASS
		A group is an array of objects and the style with which they will be rendered
	*/
	ogrengine.Group=function(obs,style){
		this.obs=obs;
		this.style=style;
	}
	
	/**
		Scene CLASS
		A scene is an array of groups in the order which they will be rendered,
		along with the graphics context used to render them
	*/
	ogrengine.Scene=function(groups,ctx){
		this.groups=groups;
		this.ctx=ctx;
	}
	
	ogrengine.Scene.prototype.render=function(){
		for(var i=0;i<this.groups.length;i++){
			if(this.groups[i].style.type="f")this.renderFill(this.groups[i]);
			else if(this.groups[i].style.type="s")this.renderStroke(this.groups[i]);
			else if(this.groups[i].style.type="fs"){
				this.renderFill(this.groups[i]);
				this.renderStroke(this.groups[i]);
			}
		}
	}
	
	ogrengine.Scene.prototype.renderFill=function(group){
		this.ctx.fillStyle=group.style.fStyle;
		for(var i=0;i<group.obs.length;i++){
			var ob=group.obs[i];
			if(ob instanceof obrengine.Rect){
				ctx.fillRect(ob.corner.x,ob.corner.y,ob.size.x,ob.size.y);
			}
			else if(ob instanceof obrengine.Circle){
				ctx.beginPath();
				ctx.arc(ob.center.x,ob.center.y,ob.radius,0,2*Math.PI);
				ctx.fill();
			}
			else if(ob instanceof obrengine.Polygon){
				ctx.beginPath();
				ctx.moveTo(ob.points[0].x,ob.points[0].y);
				for(var j=1;j<ob.points.length;j++) ctx.lineTo(ob.points[j].x,ob.points[j].y);
				ctx.closePath();
				ctx.fill();
			}
		}
	}
	
	ogrengine.Scene.prototype.renderStroke=function(group){
		this.ctx.strokeStyle=group.style.sStyle;
		for(var i=0;i<group.obs.length;i++){
			var ob=group.obs[i];
			if(ob instanceof obrengine.Line){
				ctx.beginPath();
				ctx.moveTo(ob.p1.x,ob.p1.y);
				ctx.lineTo(ob.p2.x,ob.p2.y);
				ctx.stroke();
			}
			else if(ob instanceof obrengine.Rect){
				ctx.strokeRect(ob.corner.x,ob.corner.y,ob.size.x,ob.size.y);
			}
			else if(ob instanceof obrengine.Circle){
				ctx.beginPath();
				ctx.arc(ob.center.x,ob.center.y,ob.radius,0,2*Math.PI);
				ctx.stroke();
			}
			else if(ob instanceof obrengine.Polygon){
				ctx.beginPath();
				ctx.moveTo(ob.points[0].x,ob.points[0].y);
				for(var j=1;j<ob.points.length;j++) ctx.lineTo(ob.points[j].x,ob.points[j].y);
				ctx.closePath();
				ctx.stroke();
			}
		}
	}
}