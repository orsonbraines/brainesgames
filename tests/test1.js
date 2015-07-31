var obrengine=require("../obrengine");
with (obrengine){
	var trig=new Polygon([new Vector2d(0,0),new Vector2d(10,0),new Vector2d(5,5)]);
	var sq=new Polygon([new Vector2d(0,3),new Vector2d(10,3),new Vector2d(10,13),new Vector2d(0,13)]);
	
	console.log(intersects(trig,sq));
}