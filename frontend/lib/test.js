function test(){

  /*var imageObj = new Image();
    imageObj.onload = function() {
    var yoda = new Konva.Image({
      x: (lp_space.screen_width/2)-75,
      y: (lp_space.screen_height/2)-75,
      image: imageObj,
      width: 150,
      height: 150
    });

    // add the shape to the layer
    lp_space.add_to_space(yoda);
    lp_space.draw();
  };
  imageObj.src = 'assets/earth.png';*/

  Konva.Image.fromURL('/assets/earth.png', function(darthNode) {
        darthNode.setAttrs({
            x: (lp_space.screen_width/2)-75,
          y: (lp_space.screen_height/2)-75,
          width: 150,
          height: 150
        });
        lp_space.add_to_space(darthNode);
    lp_space.draw();
      });
}
