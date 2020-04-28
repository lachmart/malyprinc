/*
    @author: David Pokorny david.pokorny@olc.cz
    @description: factory and functions for pilots
 */

var lp_img_lp = new Image();
lp_img_lp.src = 'assets/lp.png';

var lp_img_friend = new Image();
lp_img_friend.src = 'assets/friend.png';

var lp_img_tooltip = new Image();
lp_img_tooltip.src = 'assets/tooltip.png';

var lp_img_rocket = new Image();
lp_img_rocket.src = 'assets/rocket.png';

var lp_img_friends = new Image();
lp_img_friends.src = 'assets/friends.png';
var lp_img_friends2 = new Image();
lp_img_friends2.src = 'assets/friends2.png';

var lp_img_mision = new Image();
lp_img_mision.src = 'assets/mise.png';

var lp_img_photo = new Image();
lp_img_photo.src = 'assets/foto.png';

var lp_img_activity = new Image();
lp_img_activity.src = 'assets/activity.png';

var lp_img_start = new Image();
lp_img_start.src = 'assets/start.png';
var lp_img_stop = new Image();
lp_img_stop.src = 'assets/stop.png';


var lp_pilot = function () {};

lp_pilot.vars = function() {
    lp_pilot._avatar_layer = undefined;
    lp_pilot.data = undefined;
    lp_pilot.avatar = undefined;
    lp_pilot.tooltip = undefined;
    lp_pilot._flight = undefined;
    lp_pilot.flight_tooltip = undefined;
    lp_pilot.dialog = undefined;
    lp_pilot.counter = 10000;
    lp_pilot._start_button = undefined;
    lp_pilot._stop = false;
    lp_pilot.counter_title = undefined;
    lp_pilot._internal_blur = 5;
    lp_pilot._friend_box = undefined;
    lp_pilot._friends_htmlobject = undefined;
};

/**
 * Loading pilot data to main plan
 */
lp_pilot.init = function() {
    lp_pilot.data = lp_pilot._server_load_pilot_data();

    if (!lp_pilot._add_pilot_position()) {
        return false;
    }

    lp_pilot._render_friends_box();

};

/**
 *
 * @private
 */
lp_pilot._server_load_pilot_data = function() {
    var json_from_server =  $.ajax({
                                  url: 'map/pilot',
                                  async: false,
                                  dataType: 'json'
                              }).responseJSON;


    // add prefixes to source and target id, because server cannot know
    if (json_from_server.actual_flight !== null) {
        json_from_server.actual_flight.source_id = lp_planet.add_planet_prefix(json_from_server.actual_flight.source_id);
        json_from_server.actual_flight.target_id = lp_planet.add_planet_prefix(json_from_server.actual_flight.target_id);
    }

    // Save pilot rank to check
    if (typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        if (localStorage.getItem(json_from_server.id+"rank") === null) {
            localStorage.setItem(json_from_server.id+"rank", json_from_server.rank_id);
        }
    }

    console.log("Pilot data loaded.");
    return json_from_server;
};

/**
 * return if pilot is on planet or not
 * @returns {boolean}
 */
lp_pilot.is_on_planet = function () {
    if (lp_pilot.data === undefined) {
        console.log("Pilot data are not loaded.");
        return false;
    }

    return lp_pilot.data.actual_position !== null;
};

/**
 * return if pilot is on planet or not
 * @returns {boolean}
 */
lp_pilot.get_pilot_position = function () {
    if (lp_pilot.data === undefined) {
        console.log("Pilot data are not loaded.");
        return false;
    }

    if (!lp_pilot.is_in_flight()) {
        return lp_planet.add_planet_prefix(lp_pilot.data.actual_position);
    } else {
        return null;
    }
};

/**
 * Render pilot position to space
 *
 * @returns {boolean}
 * @private
 */
lp_pilot._add_pilot_position = function() {

    if (lp_pilot.data === undefined) {
        console.log("Invalid pilot data.");
        return false;
    }

    if (lp_pilot.data.actual_position !== null) {
        // Pilot is on any space object
        if (lp_planet.planet_data[lp_planet.add_planet_prefix(lp_pilot.data.actual_position)] === undefined) {
            console.log("Unknown actual position on planet.");
            return false;
        }
        var planet_id = lp_planet.add_planet_prefix(lp_pilot.data.actual_position);
        console.log("Pilot is on planet: "+lp_planet.planet_data[planet_id].name);
        lp_pilot._add_avatar(1, lp_planet.add_planet_prefix(lp_pilot.data.actual_position));

        lp_planet._rename_planet(planet_id);

        return true;
    } else
    {
        lp_pilot.flight_progress();
        return true;
    }
    return false;
};

/**
 * return if has friends
 * @returns {boolean|boolean}
 */
lp_pilot.count_of_friends = function() {
    var count = 0;
    var friend_index;
    for (friend_index in lp_pilot.data.friends) {
        count++;
    }
    return count;
};

/**
 * Add position of friend to plan
 * @private
 */
lp_pilot._render_friends_box = function() {
    // Prepare main box
    var count_of_friends = lp_pilot.count_of_friends();
    if (count_of_friends===0) {
        return;
    }
    // Create box for friends
    // 600x252
    var box_height = 600;
    var dialog_image = lp_img_friends;
    if (count_of_friends <= 2) {
        box_height = box_height/2;
        dialog_image = lp_img_friends2;
    }

    lp_pilot._friend_box = new Konva.Group({
        x: 0,
        y: lp_space.logo.height()+ (10*lp_space.scale_height),
        width: 252*lp_space.scale_width,
        height: box_height*lp_space.scale_height,
        draggable: true,
        opacity: 0.5,
    });

    var dialog6 = new Konva.Image({
        x: 0,
        y: 0,
        width: lp_pilot._friend_box.width(),
        height: lp_pilot._friend_box.height(),
        image: dialog_image,
    });

    var info_text = lp_pilot._get_text(30*lp_space.scale_width,30*lp_space.scale_height, "Přátelé",
        Math.round(15*lp_space.scale_width));
    var info_text2 = lp_pilot._get_text(info_text.x(),info_text.y()+info_text.height()+(5*lp_space.scale_height), "" +
        "Boxem lze pohybovat po obrazovce, Pokud jej nechcete, vypněte všechny sdílení v palubním deníku v sekci přátelé.",
        Math.round(10*lp_space.scale_width), (252*lp_space.scale_width)-(100*lp_space.scale_width));

    lp_pilot._friend_box.add(dialog6);
    lp_pilot._friend_box.add(info_text);
    lp_pilot._friend_box.add(info_text2);
    lp_space.add_to_space(lp_pilot._friend_box);

    var friend_index;
    var top = info_text2.y()+info_text2.height()+(10*lp_space.scale_width);

    for (friend_index in lp_pilot.data.friends) {
        var friend = lp_pilot.data.friends[friend_index];
        var friend_text = lp_pilot._friend_text(friend);
        var info_text_object = lp_pilot._get_text(info_text.x(), top, friend_text, Math.round(14*lp_space.scale_width), info_text2.width());
        lp_pilot._friend_box.add(info_text_object);

        lp_pilot.add_action_to_friends(info_text_object, friend);

        lp_pilot.add_rank_image(top, friend.rank_id, info_text2);
        top += info_text_object.height()+(15*lp_space.scale_width);
    }

    lp_space.draw();
};

/**
 * Add action to friend
 * @param info_text_object
 * @param friend
 */
lp_pilot.add_action_to_friends = function(info_text_object, friend) {
    // enter over friend
    info_text_object.on("mouseenter", function () {
        if (friend === undefined) {
            return;
        }

        if (friend.actual_flight === null) {
            var planet_id = lp_planet.add_planet_prefix(friend.actual_position);
            if (lp_planet.planet_data[planet_id]!== undefined && planet_id !== lp_pilot.get_pilot_position()) {
                // planet is in your dimension
                var planet_data = lp_planet.planet_data[planet_id];
                friend.avatar = new Konva.Image({
                    x: planet_data.actual_x-(30*lp_space.scale_height),
                    y: planet_data.actual_y-(68*lp_space.scale_width),
                    height: 70*lp_space.scale_width,
                    width: 59*lp_space.scale_height,
                    image: lp_img_friend,
                    shadowColor: 'black',
                    shadowBlur: 35,
                    shadowOffset: { x: 4, y: 4 },
                });
                lp_space.add_to_space(friend.avatar);
                lp_space.draw();
            }
        }  else {
            var target_planet = lp_planet.add_planet_prefix(friend.actual_flight.target_id);

            if (lp_planet.planet_data[target_planet]!== undefined) {
                var source_planet = lp_planet.add_planet_prefix(friend.actual_flight.source_id);
                var source_planet_data = lp_planet.planet_data[source_planet];
                var target_planet_data = lp_planet.planet_data[target_planet];

                friend.avatar = new Konva.Line({
                    points: [source_planet_data.actual_x, source_planet_data.actual_y, target_planet_data.actual_x, target_planet_data.actual_y],
                    stroke: 'yellow',
                    tension: 1,
                    dash: [2, 5]
                });
                lp_space.add_to_space(friend.avatar);
                lp_space.draw();
            }
        }
    });

    // leave friend
    info_text_object.on("mouseleave", function () {
        if (friend.avatar !== undefined) {
            friend.avatar.destroy();
            friend.avatar = undefined;
            lp_space.draw();
        }
    });
};

/**
 * Added image to rank
 * @param top
 * @param rank_id
 * @param object
 */
lp_pilot.add_rank_image = function(top, rank_id, object) {
    Konva.Image.fromURL(lp_action.url+"/upload/hodnosti/"+rank_id+".png", (rank) => {
        rank.x(object.x()+object.width());
        rank.y(top);
        rank.width(40*lp_space.scale_width);
        rank.height(40*lp_space.scale_width);
        lp_pilot._friend_box.add(rank);
        lp_space.draw();
    });
};

/**
 * @private
 */
lp_pilot._friend_text = function(friend_json) {

    var friend_name = friend_json.name+" ("+friend_json.rank_name.toLowerCase()+")";
    if (friend_json.actual_flight !== null) {
        var source_planet = lp_planet.get_planet_name(friend_json.actual_flight.source_id);
        var target_planet = lp_planet.get_planet_name(friend_json.actual_flight.target_id);
        var actual_date = new Date();
        var to_target = new Date(Date.parse(friend_json.actual_flight.finish_at));

        var minute_difference = Math.round((to_target.getTime()-actual_date.getTime())/60000);
        if (minute_difference < 0) {
            // already on planet, but seems to be this branch unused due correct server response
            friend_json.actual_position = friend_json.actual_flight.target_id;
            friend_json.actual_flight = null;
        } else {
            // on the way
            var hour = Math.floor(minute_difference/60);
            var minute = Math.round(minute_difference%60);
            return friend_name+" letí z planety "+source_planet+" na "+target_planet+" a bude tam za "+hour+"h "+minute+"min";
        }
    }

    if (friend_json.actual_position !== null) {
        if (friend_json.visited) {
            return friend_json.name+ " učinil objev a je na planetě "+lp_planet.get_planet_name(friend_json.actual_position)
        } else {
            if (!lp_pilot.is_in_flight() &&  friend_json.actual_position === lp_planet.remove_planet_prefix(lp_pilot.get_pilot_position())) {
                return friend_name+ " je na stejné planetě jako ty.";
            } else {
                return friend_name+ " je na planetě "+lp_planet.get_planet_name(friend_json.actual_position);
            }
        }
    }
    return friend_name+" je neznámo kde";
};

/**
 * Render avatar on planet
 * @param avatar_type 1 = on planet, 2 = on way
 * @param id
 * @private
 */
lp_pilot._add_avatar = function(avatar_type, id, json_flight) {

    // create layer for avatar
    if (lp_pilot._avatar_layer === undefined) {
        lp_pilot._avatar_layer = new Konva.Layer();
        lp_space.stage.add(lp_pilot._avatar_layer);
    }

    // Remove existing avatar
    if (lp_pilot.avatar !== undefined) {
        lp_pilot.avatar.destroy();
        lp_pilot.avatar = undefined;
    }

    if (lp_pilot.tooltip!==undefined) {
        lp_pilot.pilot_details();
    }

    if (lp_pilot.flight_tooltip!==undefined) {
        lp_pilot.flight_tooltip.destroy();
        lp_pilot.flight_tooltip = undefined;
    }

    switch (avatar_type) {
        case 1: // on planet
             var planet = lp_planet.planet_data[id];
            // id is planet
             lp_pilot.avatar = new Konva.Image({
                  x: planet.actual_x-(30*lp_space.scale_height),
                  y: planet.actual_y-(68*lp_space.scale_width),
                  height: 70*lp_space.scale_width,
                  width: 59*lp_space.scale_height,
                  image: lp_img_lp,
                  shadowColor: 'black',
                  shadowBlur: 35,
                  shadowOffset: { x: 4, y: 4 },
             });

             lp_pilot.avatar.on('click', lp_pilot.pilot_details);
             lp_pilot.avatar.on('tap', lp_pilot.pilot_details);

             lp_pilot.avatar.on("mouseenter", function () {lp_space.stage.container().style.cursor = 'pointer';});
             lp_pilot.avatar.on("mouseleave", function () {lp_space.stage.container().style.cursor = 'default';});

             break;
        case 2: // on the way
            if (lp_planet.measure === undefined) {
                // display measure
                lp_planet.add_measure(json_flight.source_id, json_flight.target_id)
            }
            // Measure is already displayed, now rocket is display
            var result = lp_planet.get_distance_from_measure();
            var position = lp_pilot.get_flight_position(result.distance, json_flight.start_at, result.time_to_fligh);
            var rotation = (position.m2*90)+(position.m1*result["angle"]); // m1 and m2 are multiplier by segment

            var blur_size = 40;

            lp_pilot.avatar  = new Konva.Image({
                 x: position.x,
                 y: position.y,
                 image: lp_img_rocket,
                 rotation: rotation,
                 shadowColor: 'red',
                 shadowBlur: blur_size,
                 shadowOffset: { x: 0, y: 0 },
                 width: 30*lp_space.scale_width,
                 height: 96*lp_space.scale_height,
            });

            break
    }

    lp_pilot._avatar_layer.add(lp_pilot.avatar);
    lp_pilot._avatar_layer.draw();

    // Display cograts
    if (typeof(Storage) !== "undefined") {
        var saved = localStorage.getItem(lp_pilot.data.id + "rank");
        if (parseInt(saved) !== lp_pilot.data.rank_id) {
            localStorage.setItem(lp_pilot.data.id+"rank", lp_pilot.data.rank_id);
            lp_space.messagebox("Gratulujeme, právě jsi získal hodnost "+lp_pilot.data.rank_name.toLowerCase()+"!");
        }
    }
};

/**
 * calculate point on flight line
 * @param distance
 * @param start_at
 * @param time_to_flight
 */

lp_pilot.get_flight_position = function(distance, start_at, time_to_flight) {

    if (lp_planet.measure === undefined) {
        console.log("Invalid flight line.");
        return null;
    }

    var x_start = lp_planet.planet_data[lp_planet.measure_source_id].actual_x;
    var y_start = lp_planet.planet_data[lp_planet.measure_source_id].actual_y;
    var x_target = lp_planet.planet_data[lp_planet.measure_target_id].actual_x;
    var y_target = lp_planet.planet_data[lp_planet.measure_target_id].actual_y;

    var delta_x = x_target - x_start;
    var delta_y = y_target - y_start;

    var actual_date = new Date();

    // seconds
    //var second_difference = Math.round((actual_date.getTime()-Date.parse(start_at)));
    //var from_start = 1/(time_to_flight*1000)* second_difference;

    // minutes
    var second_difference = Math.round((actual_date.getTime()-Date.parse(start_at))/60000);
    var from_start = 1/(time_to_flight*60)* second_difference;

    var remain_distance = distance - (Math.round(distance*from_start));
    var remain_time = (time_to_flight*60) - ((time_to_flight*60)*from_start); // in minutes

    var ms_difference = Math.round((actual_date.getTime()-Date.parse(start_at)));
    var ms_from_start = 1/(time_to_flight*3600000)* ms_difference;
    var remain_time_in_ms = (time_to_flight*3600000) - ((time_to_flight*3600000)*ms_from_start); // in ms
    var remain_time_in_s = remain_time_in_ms/1000;

    var finish = false;
    if (from_start >= 1) {
        new_x_pos = x_target;
        new_y_pos = y_target;
        finish = true;
    } else {
        // Linear interpolation
        var new_x_pos = x_start + ((x_target) - x_start) * from_start;
        var new_y_pos = y_start + ((y_target) - y_start) * from_start;
    }

    var multiplier;
    var multiplier2;
    if (x_start>x_target && y_start<y_target) {
        multiplier = -1;
        multiplier2 = -1;
    }
    if (x_start>x_target && y_start>y_target) {
        multiplier = 1;
        multiplier2 = -1;
    }
    if (x_start<x_target && y_start<y_target) {
        multiplier = 1;
        multiplier2 = 1;
    }
    if (x_start<x_target && y_start>y_target) {
        multiplier = -1;
        multiplier2 = 1;
    }

    return {"x":new_x_pos ,"y":new_y_pos, "m1":multiplier, "m2":multiplier2, "finish": finish, "remain":remain_distance,
    "remain_time":remain_time, "remain_s": remain_time_in_s};
};

/**
 * add small tooltip
 * @private
 */
lp_pilot.pilot_details = function() {
     if (lp_pilot.tooltip===undefined) {

         lp_pilot.hide_flight_planer();
         lp_planet.remove_measure();

         // protection
         var x;
         if ((lp_pilot.avatar.x() + lp_pilot.avatar.width() + (350 * lp_space.scale_width)) > lp_space.screen_width) {
             x = lp_pilot.avatar.x() - (380 * lp_space.scale_width);
         } else {
             x = lp_pilot.avatar.x() + lp_pilot.avatar.width();
         }

         // Main relative group
         lp_pilot.tooltip = new Konva.Group({
             x: x,
             y: lp_pilot.avatar.y(),
             height: 142 * lp_space.scale_height,
             width: 380 * lp_space.scale_width,
         });

         // Pictures
         var tooltip_picture = new Konva.Image({
             x: 0,
             y: 0,
             height: lp_pilot.tooltip.height(),
             width: lp_pilot.tooltip.width(),
             image: lp_img_tooltip,
             opacity: 1,
             shadowColor: 'black',
             shadowBlur: 20,
             shadowOffset: {x: 10, y: 10},
         });

         lp_pilot.tooltip.add(tooltip_picture);

         var header_size = Math.round(lp_space.header_font * lp_space.scale_width);
         var basic_size = Math.round(lp_space.basic_font * lp_space.scale_width);

         // button photo
         if (lp_pilot.data.photo === "/upload/avatars/placeholder.jpg") {
             var button1 = new Konva.Image({
                 x: lp_pilot.tooltip.width() - ((83 * lp_space.scale_width) + 15),
                 y: 15 * lp_space.scale_height,
                 height: 108 * lp_space.scale_height,
                 width: 83 * lp_space.scale_width,
                 image: lp_img_photo,
                 opacity: 1,
             });
             button1.on("mouseenter", function() {lp_space.add_button_effect(button1,true, "#B3C6C6",lp_space._layer)});
             button1.on("mouseleave", function() {lp_space.add_button_effect(button1,false, null, lp_space._layer)});
             button1.on("click tap", function() {lp_action.go_to_deck_logbook()});

             lp_pilot.tooltip.add(button1);
         } else {
             console.log("pilot photo: "+lp_pilot.data.photo);
             Konva.Image.fromURL(lp_action.url+lp_pilot.data.photo, (image) => {
                 lp_pilot.tooltip.add(image);

                 image.x(lp_pilot.tooltip.width() - ((90 * lp_space.scale_width) + (15*lp_space.scale_width)));
                 image.y(15 * lp_space.scale_height);

                 image.width(90 * lp_space.scale_width);
                 image.height(108 * lp_space.scale_width);

                 image.on("mouseenter", function() {lp_space.add_button_effect(image,true, "#B3C6C6",lp_space._layer)});
                 image.on("mouseleave", function() {lp_space.add_button_effect(image,false, null, lp_space._layer)});
                 image.on("click tap", function() {lp_action.go_to_deck_logbook()});
                 lp_pilot.tooltip.draw();
             });
         }

         // button activity
         var button2 = new Konva.Image({
              x: (163*lp_space.scale_width),
              y: 85*lp_space.scale_height,
              height: 48*lp_space.scale_width,
              width: 48*lp_space.scale_height,
              image: lp_img_activity,
              opacity: 1,
         });


         // Activities are not for worm_hole
         button2.on("mouseenter", function() {lp_space.add_button_effect(button2,true, "#147EC2", lp_space._layer)});
         button2.on("mouseleave", function() {lp_space.add_button_effect(button2,false, null, lp_space._layer)});

         button2.on("click", function() {lp_pilot.click_activity(lp_planet.planet_data[lp_pilot.get_pilot_position()].type === "worm_hole");});
         button2.on("tap", function() {lp_pilot.click_activity(lp_planet.planet_data[lp_pilot.get_pilot_position()].type === "worm_hole");});
         lp_pilot.tooltip.add(button2);

         // Texts
         var planet = lp_pilot._get_text(20*lp_space.scale_width, 20*lp_space.scale_height,
                        "Planeta "+lp_planet.get_planet_name(lp_pilot.get_pilot_position()),
                         header_size, 200*lp_space.scale_width);

         var pilot_name = lp_pilot._get_text(planet.x(), planet.y()+planet.height(),
                        "Pilot : "+lp_pilot.data.name ,
                         basic_size);

         var rank_name = lp_pilot._get_text(planet.x(), pilot_name.y()+pilot_name.height(),
                        "Hodnost : "+lp_pilot.data.rank_name.toLowerCase(),
                         basic_size, 140*lp_space.scale_width);

         lp_pilot.tooltip.add(pilot_name);
         lp_pilot.tooltip.add(rank_name);
         lp_pilot.tooltip.add(planet);

         lp_space.add_to_space(lp_pilot.tooltip);
         console.log("Tooltip of pilot loaded");
     } else {
         lp_pilot.hide_pilot_details();
     }
     lp_space.draw();
};

/**
 * Display ativity
 * @param worm_hole
 */
lp_pilot.click_activity = function(worm_hole) {
    if (worm_hole) {
        lp_space.messagebox("Na červí díře není co objevovat, ale může pomoci jako zkratka. Leť dále.");
    } else {
        lp_space.display_activity(lp_pilot.get_pilot_position());
    }
};

/**
 * create text object
 * @param x
 * @param y
 * @param text
 * @param size
 * @private
 */
lp_pilot._get_text = function (x, y, text, size, width) {
    var result = new Konva.Text({
          x: x,
          y: y,
         text: text,
         fontSize: size,
         fontFamily: 'Calibri',
         fill: 'white'
    });

    if (width !== undefined) {
        result.width(width);
    }

    return result;
};

/**
 * Hide tooltip card of pilot
 */
lp_pilot.hide_pilot_details = function() {
    if (lp_pilot.tooltip!==undefined) {
        lp_pilot.tooltip.destroy();
        lp_pilot.tooltip = undefined;
        lp_space.draw();
    };
};

/**
 * Start flight
 */
lp_pilot.start_flight = function() {

    lp_pilot.hide_flight_planer();
    lp_pilot.hide_pilot_details();

    var result = lp_planet.get_distance_from_measure();

    var target_planet = lp_planet.planet_data[lp_planet.measure_target_id].object;
    var dialog_x = (lp_space.screen_width/2)-((450/2)*lp_space.scale_width);

    var dialog_y;
    if (lp_planet.planet_data[lp_planet.measure_target_id].y>=lp_space.basic_height/2) {
        dialog_y = (0);
    } else {
        dialog_y = ((lp_space.screen_height)-(186*lp_space.scale_height))-(80*lp_space.scale_height);
    }

    // Main dialog group
    lp_pilot.dialog = new Konva.Group({
        x: dialog_x,
        y: dialog_y,
        width: 450*lp_space.scale_width,
        height: 186*lp_space.scale_height,
        draggable: true,
    });

    var dialog_box = new Konva.Image({
        x: 0,
        y: 0,
        width: lp_pilot.dialog.width(),
        height: lp_pilot.dialog.height(),
        image: lp_img_mision,
    });

    lp_pilot.dialog.add(dialog_box);

    var ratio = target_planet.width()/target_planet.height();

    // Change button to start/stop
    lp_pilot._start_button = new Konva.Image({
        x: lp_pilot.dialog.width()-((70*ratio*lp_space.scale_width)+(30)*lp_space.scale_width),
        y: lp_pilot.dialog.height()-((70*lp_space.scale_width)+(30)*lp_space.scale_height),
        width: (70*lp_space.scale_width),
        height: (70*lp_space.scale_width),
        image: lp_img_start,
    });

    // Events
    lp_pilot._start_button.on("click",lp_pilot._activate_flight);
    lp_pilot._start_button.on("tap",lp_pilot._activate_flight);

    lp_pilot._start_button.on("mouseenter", function() {lp_space.add_button_effect(lp_pilot._start_button,true, "red", lp_pilot._avatar_layer)});
    lp_pilot._start_button.on("mouseleave", function() {lp_space.add_button_effect(lp_pilot._start_button,false, null, lp_pilot._avatar_layer)});

    lp_pilot.dialog.add(lp_pilot._start_button);

    var header_size = Math.round(lp_space.header_font*lp_space.scale_width);
    var basic_size = Math.round(lp_space.basic_font*lp_space.scale_width);

    var flight = lp_pilot._get_text(120*lp_space.scale_width,30*lp_space.scale_height,
                  "Cíl "+lp_planet.get_planet_name(lp_planet.measure_target_id), header_size);

    var parameters = lp_pilot._get_text(flight.x(), flight.y()+flight.height(),
                "Parametry letu: "+result.distance/1000+"K MaPr, letový úhel: "+result.angle, basic_size);

     var time = lp_pilot._get_text(flight.x(), parameters.y()+parameters.height(),
                "Přílet: "+lp_planet.get_planet_name(lp_planet.measure_target_id)+" za "+result["time_to_fligh"]+" hodin.", basic_size);

     // Time to end
     var actual_time = new Date();
     var time_to_end = new Date();
     time_to_end.setTime(actual_time.getTime()+(result["time_to_fligh"]*60*60*1000));
     var display_time = time_to_end.getDate()+"."+(time_to_end.getMonth()+1)+"."+time_to_end.getFullYear()+" "+time_to_end.getHours()+":"+time_to_end.getMinutes();

     var time2 = lp_pilot._get_text(flight.x(), time.y()+time.height(), "Čas příletu: "+display_time, basic_size);
     lp_pilot.counter_title = lp_pilot._get_text(150*lp_space.scale_width, lp_pilot.dialog.height()-(40*lp_space.scale_height), "", header_size);

     lp_pilot.dialog.add(flight);
     lp_pilot.dialog.add(parameters);
     lp_pilot.dialog.add(time);
     lp_pilot.dialog.add(time2);
     lp_pilot.dialog.add(lp_pilot.counter_title);

    lp_pilot._avatar_layer.add(lp_pilot.dialog);
    lp_pilot._avatar_layer.draw();
};

/**
 * Hide dialog from screen
 */
lp_pilot.hide_flight_planer = function() {
    if (lp_pilot.dialog !== undefined) {
        lp_pilot.dialog.destroy();
        lp_pilot.dialog = undefined;
        lp_pilot._avatar_layer.draw();
    };
};

/**
 * Activate flight
 */
lp_pilot._activate_flight = function() {
    if (!lp_pilot.is_system_for_live_support_ok()) {
        return;
    }

    if (lp_pilot.is_on_planet() && lp_planet.measure_target_id !== undefined) {
        if (lp_pilot.is_in_flight()) {
            return
        }

        lp_pilot._start_button.image(lp_img_stop);
        lp_pilot._start_button.off('click tap');
        lp_pilot._start_button.on("click tap", function () {
            lp_pilot._stop = true;
        });

        var counter_animation = new Konva.Animation(function(frame) {
            lp_pilot.counter -= frame.timeDiff;

            if (lp_pilot._stop) {
                console.log("Flight counter interupted");
                lp_planet.remove_measure();
                lp_pilot.hide_flight_planer();
                lp_pilot.counter = 10000;
                lp_pilot._stop = false;
                this.stop();
            }

            var display_counter = lp_pilot.counter/1000;
            display_counter = display_counter.toFixed(3);

            lp_pilot.counter_title.text(display_counter);

            if (lp_pilot.counter <= 0) {
                console.log("Flight counter finished...");
                this.stop();
                lp_pilot.counter = 10000;
                lp_pilot._activate_flight_after_counter();
            }
        }, lp_pilot._avatar_layer);

        console.log("Flight counter started");
        counter_animation.start();
    } else {
        console.log("Flight is not possible, because measure is missing.")
    }
};

/**
 * Fight action after animation
 * @private
 */
lp_pilot._activate_flight_after_counter = function() {
    lp_pilot.hide_flight_planer();
    lp_planet.get_planet_name(lp_planet.measure_target_id);

    var json_to_server = lp_pilot.create_flight_json();

    // Set visited
    if (lp_planet.measure_source_id !== "pl_1" && lp_planet.planet_data[lp_planet.measure_source_id].type!=="worm_hole") {
        lp_planet.planet_data[lp_planet.measure_source_id].visited = true;
        lp_planet.planet_data[lp_planet.measure_source_id].object.opacity(0.3);
        lp_planet.planet_data[lp_planet.measure_source_id].title.opacity(0.3);
    }

    jQuery.ajax({
        url: 'map/flight',
        dataType: 'json',
        data: json_to_server,
        async: false,
    });

    lp_pilot.data.actual_flight = json_to_server;
    lp_pilot.flight_progress();
};

/* Starting flight */
lp_pilot.flight_progress = function() {

    if (lp_pilot.is_in_flight()) {
        // cannot flight twice in one time
        return false;
    }

    if (lp_pilot.data.actual_flight === null) {
        console.log("Unknown position of pilot.");
        return false;
    }

    lp_pilot._add_avatar(2, null, lp_pilot.data.actual_flight);

    var result = lp_planet.get_distance_from_measure();
    lp_pilot.data.actual_flight["distance"] = result.distance;
    lp_pilot.data.actual_flight["time_to_fligh"] = result.time_to_fligh;

    console.log("Flight in progress.");

    lp_pilot._flight = new Konva.Animation(function(frame) {
        var position = lp_pilot.get_flight_position(lp_pilot.data.actual_flight.distance, lp_pilot.data.actual_flight.start_at, lp_pilot.data.actual_flight.time_to_fligh);

        /*var time = frame.time,
        timeDiff = frame.timeDiff,
        frameRate = frame.frameRate;*/

        // new position
        lp_pilot.avatar.x(position.x);
        lp_pilot.avatar.y(position.y);

        // Change title
        var hour_to = Math.floor(position.remain_time/60);
        var min_to = Math.round(position.remain_time%60);

        lp_planet.measure_title.text(hour_to+"h "+min_to+"min");
        lp_space.draw();

        // Animation of flare
        var blur_size = lp_pilot.avatar.shadowBlur();
        if (blur_size>= 60) {
            lp_pilot._internal_blur = -5;
        }
        if (blur_size<= 10) {
            lp_pilot._internal_blur = 5;
        }
        lp_pilot.avatar.shadowBlur(blur_size+lp_pilot._internal_blur);

        lp_planet.display_counter_time(position.remain_s);

        if (position.finish) {
            console.log("Flight finished");
            lp_planet.hide_counter_time();
            this.stop();
            lp_pilot.set_planet_position(lp_planet.measure_target_id);
        }

    }, lp_pilot._avatar_layer);

    lp_pilot._flight.start();
};


/**
 * Set position to new planet
 * @param target_id
 */
lp_pilot.set_planet_position = function(target_id) {
    // Set new position
    if (lp_planet.planet_data[target_id].type==="worm_hole") {
        lp_pilot.data.actual_position = lp_planet.planet_data[target_id].end;
    } else {
        lp_pilot.data.actual_position = target_id;
    }

    // reset flight
    lp_pilot.data.actual_flight = null;
    lp_pilot._flight = undefined;

    // Remove measure
    lp_planet.remove_measure();

    // display avatar
    lp_pilot._add_pilot_position();

    var json_to_server = {
        "target_id": lp_planet.remove_planet_prefix(target_id),
        "new_name": null,
    }
};

/**
 * Return flight in progress.
 * @returns {boolean}
 */
lp_pilot.is_in_flight = function() {
    return lp_pilot._flight !== undefined;
};

/**
 * return json with flight information. Only source and target are important.
 * @returns {*}
 */
lp_pilot.create_flight_json = function() {
        result = lp_planet.get_distance_from_measure();

        if (result === null) {
            console.log("Invalid distance.");
            return null;
        }

        var source_id = lp_planet.measure_source_id;
        var target_id = lp_planet.measure_target_id;

        // Time to end
        var actual_time = new Date();
        var time_to_end = new Date();
        time_to_end.setTime(actual_time.getTime()+(result["time_to_fligh"]*60*60*1000));

        var returned_json = {
            "source_id": lp_planet.remove_planet_prefix(source_id),
            "target_id": lp_planet.remove_planet_prefix(target_id),
            "start_at": actual_time.toISOString(),
            "finish_at": time_to_end.toISOString(),
            "distance": result.real_distance,
        };

        return returned_json;
};

/**
 * Check live system
 * @returns {boolean}
 */
lp_pilot.is_system_for_live_support_ok = function() {

    /*var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var json_to_server = {'time': yesterday.toISOString()};*/
    // data: json_to_server,

    var json_answer = $.ajax({
        url: 'map/lifesupport',
        async: false,
        dataType: 'json'
    }).responseJSON;

    //{"day": actual_date.toISOString(), "status": true, percentage: 70};

    if (!json_answer.status) {
        lp_space.messagebox("Systém podpory života byl včera aktivní jen na "+json_answer.percentage+"%. Nezbytné je nejméně 70%. Klikni pro detaily.", lp_action.go_to_live_support_system);
        return false;
    }
    return true;
};
