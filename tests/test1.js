var obrengine=require("../obrengine");
with (obrengine){
	var l1=new Line(new Vector2d(3,3),new Vector2d(6,6));
	var l2=new Line(new Vector2d(4,2),new Vector2d(5,6));
	console.log(intersects(l1,l2));
}