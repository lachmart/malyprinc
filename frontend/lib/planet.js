/*
    @author: David Pokorny david.pokorny@olc.cz
    @description: factory and functions for planet manipulation
 */
var lp_planet = function () {};
lp_planet.earth = undefined;
lp_planet.planets = {};

lp_planet.create_standard_planet = function (planet_data) {
    // create earth in the middle
    if ((planet_data.x > lp_space.stage.width()) || (planet_data.y > lp_space.stage.height())) {
        console.log("Planet "+planet_data.id+" is out of space.");
        return;
    }

    planet_key = "pl_"+planet_data.id;
    lp_planet.planets[planet_key] = new Konva.Circle({
         x: planet_data.x*lp_space.scale_width,
         y: planet_data.y*lp_space.scale_height,
         radius: 20*lp_space.scale_width,
         fill: planet_data.color,
         stroke: planet_data.color,
         strokeWidth: 1
    });

    lp_space._layer.add(lp_planet.planets[planet_key]);
};

/**
 * Add earth to stage
 * @param earth_data json
 * @private
 */
lp_planet.create_earth = function (earth_data) {
    // create earth in the middle
    if (lp_planet.earth != undefined) {
        console.log("Earth is only one allowed.");
        return;
    }

    lp_planet.earth = new Konva.Circle({
      x: lp_space.stage.width()/2,
      y: lp_space.stage.height()/2,
      radius: 70*lp_space.scale_width,
      fill: earth_data.color,
      stroke: earth_data.color,
      strokeWidth: 1
    });

    lp_space._layer.add(lp_planet.earth);
};