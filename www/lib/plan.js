/*
    @author: David Pokorny david.pokorny@olc.cz
    @description: main class for handling space and area
 */

/* images from planet.js */
var lp_img_space = new Image();
lp_img_space.src = 'assets/space.jpg';

var lp_logo = new Image();
lp_logo.src = 'assets/logo.png';

var lp_worm_hole = new Image();
lp_worm_hole.src = 'assets/worm_hole.png';

var lp_activity_dialog = new Image();
lp_activity_dialog.src = 'assets/dialog.png';

var lp_messagebox = new Image();
lp_messagebox.src = 'assets/dialog2.png';

var lp_close = new Image();
lp_close.src = 'assets/close.png';

// Namespace for functions
var lp_space = function () {};

// Global array
lp_space.vars = function() {
    lp_space.stage = undefined;
    lp_space._layer = undefined;
    lp_space._dialog_layer = undefined;
    lp_space._area = undefined;
    lp_space._earth = undefined;
    lp_space._activity_dialog = undefined;
    lp_space._messagebox = undefined;
    lp_space._cover = undefined;
    lp_space._text_object = undefined;

    lp_space.div_space_id = "lp_space";

    // dimensions
    lp_space.basic_width = undefined;
    lp_space.basic_height = undefined;
    lp_space.screen_width = undefined;
    lp_space.screen_height = undefined;
    lp_space.scale_width = undefined;
    lp_space.scale_height = undefined;

    lp_space.header_font = 20;
    lp_space.basic_font = 16;
    lp_space._show_screen_position = false;
};


/* initialization of space for little prince */
lp_space.init = function()
{
    lp_space.vars();
    lp_pilot.vars();
    lp_planet.vars();

    lp_space.create_space();
    lp_pilot.init();
};

/**
 * Add button effect
 * @param button obj to add
 * @param direction true enable, false disable
 * @param color
 * @param layer to render
 */
lp_space.add_button_effect = function(button, direction, color, layer) {
    if (direction) {
        button.shadowColor(color);
        button.shadowBlur(25);
        button.shadowOffset({ x: 0, y: 0 });
        lp_space.stage.container().style.cursor = 'pointer';
    } else {
        button.shadowBlur(0);
        lp_space.stage.container().style.cursor = 'default';
    }
    layer.draw();
};

/**
 * Basic calculation of dimensions
 */
lp_space.create_space = function() {
    lp_space.basic_width = 1440;
    lp_space.basic_height = 810;

    lp_space.screen_width = window.innerWidth;

    // preserve 16:9 format
    lp_space.screen_height = Math.round(9/16*lp_space.screen_width);

    console.log("Space area: "+lp_space.screen_width+"x"+lp_space.screen_height);

    lp_space.scale_width = lp_space.screen_width/lp_space.basic_width;
    lp_space.scale_height = lp_space.screen_height/lp_space.basic_height;

    // init stage
    lp_space._createStage();
};

/**
 *  Initialization of konva stage
 * @private
 */
lp_space._createStage = function() {
    console.log("Creating Little prince environment.");
    lp_space.stage = new Konva.Stage({
        container: lp_space.div_space_id,
        width: lp_space.basic_width*lp_space.scale_width,
        height: lp_space.basic_height*lp_space.scale_height
    });

    // main layer for objects
    lp_space._layer = new Konva.Layer();

    // create space for events
    lp_space._area = new Konva.Image({
        x:0,
        y:0,
        image: lp_img_space,
        width: lp_space.stage.width(),
        height: lp_space.stage.height(),
    });

    lp_space._area.on("click tap", function() {
        // debug variant
        if (lp_space._show_screen_position) {
            position = lp_space.stage.getPointerPosition();
            alert(lp_space.screen_width+"x"+lp_space.screen_height+" x:"+position.x+ "y:"+position.y);
        } else {
            lp_action.openFullscreen();
        }
    });


    var logo = new Konva.Image({
        x:5*lp_space.scale_width,
        y:5*lp_space.scale_width,
        opacity: 1,
        image: lp_logo,

        width: 70*lp_space.scale_width,
        height: 70*lp_space.scale_width,
    });

    logo.on("mouseenter", function() {lp_space.add_button_effect(logo,true, "#B3C6C6",lp_space._layer)});
    logo.on("mouseleave", function() {lp_space.add_button_effect(logo,false, null, lp_space._layer)});
    logo.on("click", function() {lp_action.go_to_deck_logbook()});
    logo.on("tap", function() {lp_action.go_to_deck_logbook()});

    lp_space.stage.add(lp_space._layer);
    lp_space.add_to_space(lp_space._area);
    lp_space.add_to_space(logo);
    lp_space._add_plannets();
    lp_space.draw();
};

/**
 * redraw main layer of space
 */
lp_space.draw = function() {
    lp_space._layer.draw();
};

/**
 * Add object to space without render
 * @param object
 */
lp_space.add_to_space = function(object) {
    lp_space._layer.add(object);
};


/**
 * Add planets from server
 * @private
 */
lp_space._add_plannets = function() {
    console.log("Adding planets.");
    var plannets = lp_space._server_load_space_object();
    for (var pos in plannets.planet) {
        switch(plannets.planet[pos].type.toLowerCase()) {
            case "earth":
                lp_planet.create_earth(plannets.planet[pos]);
                break;
            case "standard_planet":
                lp_planet.create_planet(plannets.planet[pos], lp_img_planet);
                break;
            case "special_planet":
                lp_planet.create_planet(plannets.planet[pos], lp_img_planet2);
                break;
            case "chair_planet":
                lp_planet.create_planet(plannets.planet[pos], lp_img_planet3);
                break;
            case "worm_hole":
                lp_planet.create_planet(plannets.planet[pos], lp_worm_hole);
                break;
            default:
                // other objects
                break
        }
    }
};


/**
 * Load space object from server in json
 * @private
 */
lp_space._server_load_space_object = function() {
    return $.ajax({
        url: 'map/planets',
        async: false,
        dataType: 'json'
    }).responseJSON;
};

/**
 * Planet activity
 * @param planet_id
 */
lp_space.display_activity = function(planet_id) {

    lp_pilot.hide_flight_planer();

    if (lp_space._dialog_layer===undefined) {
        lp_space._dialog_layer = new Konva.Layer();
        lp_space.stage.add(lp_space._dialog_layer);
    }

    // Main dialog group
    lp_space._activity_dialog = new Konva.Group({
        x: (lp_space.screen_width/2)-((874*lp_space.scale_width)/2),
        y: (lp_space.screen_height/2)-((625*lp_space.scale_height)/2),
        width: 874*lp_space.scale_width,
        height: 625*lp_space.scale_height,
    });

      // Cover
    lp_space._cover = new Konva.Rect({
        x: 0,
        y: 0,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 1,
        opacity: 0.5,
        width: lp_space.screen_width,
        height: lp_space.screen_height,
    });

    var dialog_box = new Konva.Image({
        x: 0,
        y: 0,
        width: lp_space._activity_dialog.width(),
        height: lp_space._activity_dialog.height(),
        image: lp_activity_dialog,
        shadowColor: 'black',
        shadowBlur: 20,
        shadowOffset: { x: 10, y: 10 },
    });

    var close_button = new Konva.Image({
        x: lp_space._activity_dialog.width()-(80*lp_space.scale_width),
        y: 30*lp_space.scale_height,
        width: 60*lp_space.scale_width,
        height: 60*lp_space.scale_height,
        image: lp_close,
    });

    close_button.on("mouseenter", function() {lp_space.add_button_effect(close_button,true, "white",lp_space._dialog_layer)});
    close_button.on("mouseleave", function() {lp_space.add_button_effect(close_button,false, null, lp_space._dialog_layer)});
    close_button.on("click", function() {lp_space.hide_displayed_activity()});
    close_button.on("tap", function() {lp_space.hide_displayed_activity()});

    var title = lp_pilot._get_text(100*lp_space.scale_width,40*lp_space.scale_height, "Planeta "+ lp_planet.get_planet_name(lp_pilot.get_pilot_position()), Math.round(30* lp_space.scale_width), 300*lp_space.scale_width);

    lp_space._dialog_layer.add(lp_space._cover);
    lp_space._activity_dialog.add(dialog_box);
    lp_space._activity_dialog.add(close_button);
    lp_space._activity_dialog.add(title);

    lp_space._dialog_layer.add(lp_space._activity_dialog);
    lp_space._dialog_layer.draw();

    var dialog_position = lp_space._activity_dialog.getAbsolutePosition();

    lp_space._text_object = document.createElement('div');
    document.body.appendChild(lp_space._text_object);

    lp_space._text_object.innerHTML = "Chvilku vydrž, načítám aktivitu planety.";
    lp_space._text_object.classList.add("activity_container");
    lp_space._text_object.style.position = 'absolute';
    lp_space._text_object.style.top = (dialog_position.y + title.y() + title.height() +30*lp_space.scale_height) + 'px';
    lp_space._text_object.style.left = (dialog_position.x + title.x()) + 'px';
    lp_space._text_object.style.color = "white";
    lp_space._text_object.style.width = (lp_space._activity_dialog.width()-title.x()-(40*lp_space.scale_width))+"px";
    lp_space._text_object.style.height = (lp_space._activity_dialog.height()- title.y()-title.height()-(80*lp_space.scale_height))+"px";
    lp_space._text_object.style.overflowY = "auto";

    // Load description from server
    lp_space._text_object.innerHTML = lp_space.get_activity(planet_id);
};

/**
 * Get activity from server
 */
lp_space.get_activity = function(planet_id) {
    var planet_id_int = lp_planet.remove_planet_prefix(planet_id);

     response_json = $.ajax({
        url: 'map/activity',
        async: false,
        data: {"planet_id": planet_id_int},
        dataType: 'json'
    }).responseJSON;

     // prepared outpu html
     var html = "";
     if (response_json === null || response_json.name === "") {
         html = "<div>Tato planeta nemá žádnou aktivitu :(.</div>";
     } else {
         html = "<h2>"+response_json.name+"</h2>";

         html += "<div class='accessories mp_block'><span class='block_title'>Potřeby:</span><div>"+response_json.accessories+"</div></div>";
         html += "<div class='output mp_block'><span class='block_title'>Splnění:</span><div>"+response_json.output+" <a href='"+lp_action.url+"/denik/objevy'>(nahrávej sem)</a></div></div>";

         html += "<div class='mp_block'><span class='block_title'>Popis aktivity:</span>";
         html += "<div class='main_description'>"+response_json.description+"</div>";
         html += "</div>";

         html += "<div class='category mp_block'><span class='block_title'>Věkové kategorie:</span><div>"+response_json.category+"</div></div>";

         if (response_json.notes !== null && response_json.notes !== "") {
             html += "<div class='notes mp_block'><span class='block_title'>Poznámky:</span>";
             html += "<div>"+response_json.notes+"</div>";
             html += "</div>";
         }

         if (response_json.author !== null && response_json.author !== "") {
            html += "<div class='author mp_block'><span class='block_title'>Author:</span><div>"+response_json.author+"</div></div>";
         }
     }
     return html;
};

/**
 * Dialog is opened or not
 * @returns {boolean}
 */
lp_space.is_displayed_activity = function() {
    return lp_space._activity_dialog !== undefined;
};

/**
 *
 * @returns {boolean}
 */
lp_space.hide_displayed_activity = function() {
    if (lp_space.is_displayed_activity()) {
        lp_space._activity_dialog.destroy();
        lp_space._activity_dialog = undefined;
        lp_space._cover.destroy();
        lp_space._cover = undefined;
        lp_space._dialog_layer.draw();
        document.body.removeChild(lp_space._text_object);
        lp_space._text_object = undefined;

    }
};

/**
 * Display messagebox
 *
 * @param message
 * @param action_to_click
 * @param picture
 * @return dict with objects
 */

lp_space.messagebox = function(message, action_to_click) {
    if (lp_space._dialog_layer===undefined) {
        lp_space._dialog_layer = new Konva.Layer();
        lp_space.stage.add(lp_space._dialog_layer);
    }

    // Main dialog group
    lp_space._cover = new Konva.Rect({
        x: 0,
        y: 0,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 1,
        opacity: 0.5,
        width: lp_space.screen_width,
        height: lp_space.screen_height,
    });

    // Main dialog group
    lp_space._messagebox = new Konva.Group({
        x: (lp_space.screen_width/2)-((550*lp_space.scale_width)/2),
        y: (lp_space.screen_height/2)-((199*lp_space.scale_width)/2),
        width: 550*lp_space.scale_width,
        height: 199*lp_space.scale_width,
    });

    var dialog_box = new Konva.Image({
        x: 0,
        y: 0,
        width: lp_space._messagebox.width(),
        height: lp_space._messagebox.height(),
        image: lp_messagebox,
        shadowColor: 'black',
        shadowBlur: 20,
        shadowOffset: { x: 10, y: 10 },
    });

    var close_button = new Konva.Image({
        x: lp_space._messagebox.width()-(85*lp_space.scale_width),
        y: 25*lp_space.scale_width,
        width: 60*lp_space.scale_width,
        height: 60*lp_space.scale_width,
        image: lp_close,
    });

    close_button.on("mouseenter", function() {lp_space.add_button_effect(close_button,true, "white",lp_space._dialog_layer)});
    close_button.on("mouseleave", function() {lp_space.add_button_effect(close_button,false, null, lp_space._dialog_layer)});
    close_button.on("click", function() {lp_space.hide_messagebox()});
    close_button.on("tap", function() {lp_space.hide_messagebox()});

    lp_space._messagebox.add(dialog_box);
    lp_space._messagebox.add(close_button);

    var text_message = new Konva.Text({
        x: 180*lp_space.scale_width,
        y: 50*lp_space.scale_height,
        width: 280*lp_space.scale_width,
        text: message,
        fontSize: Math.round(20*lp_space.scale_width),
        fontFamily: 'Calibri',
        fill: 'white'
    });

    if (action_to_click !== undefined) {
        text_message.on("mouseenter", function() {lp_space.add_button_effect(text_message,true, "black",lp_space._dialog_layer)});
        text_message.on("mouseleave", function() {lp_space.add_button_effect(text_message,false, null, lp_space._dialog_layer)});

        text_message.on("click", action_to_click);
        text_message.on("tap", action_to_click);
    }

    lp_space._messagebox.add(text_message);

    lp_space._dialog_layer.add(lp_space._cover);
    lp_space._dialog_layer.add(lp_space._messagebox);
    lp_space._dialog_layer.draw();

    return {"text_message": text_message, "close_button": close_button, "dialog_box": dialog_box};
};

/**
 * Hide messagebox
 */
lp_space.hide_messagebox = function() {
    if (lp_space._messagebox !== undefined) {
        lp_space._cover.destroy();
        lp_space._cover = undefined;
        lp_space._messagebox.destroy();
        lp_space._messagebox = undefined;
        if (lp_space._text_object !== undefined) {
            document.body.removeChild(lp_space._text_object);
            lp_space._text_object = undefined;
        }
        lp_space._dialog_layer.draw();
    }
};
