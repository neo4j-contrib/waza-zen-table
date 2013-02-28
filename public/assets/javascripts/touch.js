    /* == GLOBAL DECLERATIONS == */
    TouchMouseEvent = {
        DOWN: "touchmousedown",
        UP: "touchmouseup",
        MOVE: "touchmousemove"
    }
   
    /* == EVENT LISTENERS == */
    var onMouseEvent = function(event) {
        var type;
        
        switch (event.type) {
            case "mousedown": type = TouchMouseEvent.DOWN; break;
            case "mouseup":   type = TouchMouseEvent.UP;   break;
            case "mousemove": type = TouchMouseEvent.MOVE; break;
            default: 
                return;
        }
        
        var touchMouseEvent = normalizeEvent(type, event, event.pageX, event.pageY);      
        $(event.target).trigger(touchMouseEvent); 
		event.preventDefault();
    }
    var onTouchEvent = function(event) {
        console.log(touchMouseEvent)
        var type;
        
        switch (event.type) {
            case "touchstart": type = TouchMouseEvent.DOWN; break;
            case "touchend":   type = TouchMouseEvent.UP;   break;
            case "touchmove":  type = TouchMouseEvent.MOVE; break;
            default: 
                return;
        }
        
        var touch = event.originalEvent.touches[0];
        var touchMouseEvent;
        
        if (type == TouchMouseEvent.UP) 
            touchMouseEvent = normalizeEvent(type, event, null, null);
        else 
            touchMouseEvent = normalizeEvent(type, event, touch.pageX, touch.pageY);
        $(event.target).trigger(touchMouseEvent); 
    }
    
    /* == NORMALIZE == */
    var normalizeEvent = function(type, original, x, y) {
		console.log(offset,x,y)
        return $.Event(type, {
            pageX: x-offset.x,
            pageY: y-offset.y,
            originalEvent: original
        });
    }
    
    var offset = {x:0,y:0}
    /* == LISTEN TO ORIGINAL EVENT == */
    function registerInputEvents(target,dx,dy) {
	    var jQueryDocument = $(typeof target == "string" ? $(target) : target);
		offset.x=dx||0;
		offset.y=dy||0;
	    if ("ontouchstart" in window) {
	        jQueryDocument.on("touchstart", onTouchEvent);
	        jQueryDocument.on("touchmove", onTouchEvent);
	        jQueryDocument.on("touchend", onTouchEvent); 
	    } else {
	        jQueryDocument.on("mousedown", onMouseEvent);
	        jQueryDocument.on("mouseup", onMouseEvent);
	        jQueryDocument.on("mousemove", onMouseEvent);
	    }
	}
