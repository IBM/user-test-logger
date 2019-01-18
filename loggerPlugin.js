var packFile = "";
var ownId = 0;
var seen = 0;

var settings = {
	"interval" : 500,
	"packSize" : 1000,
	"eventAndFlags": {"blur" : 1, "focus" : 1, "focusin" : 1, "focusout" : 1, "load" : 1, "resize" : 1, "scroll" : 1, "unload" : 1, "beforeunload" : 1, "click" : 1, "dblclick" : 1, "mousedown" : 1, "mouseup" : 1, "mousemove" : 1, "mouseover" : 1, "mouseout" : 1, "mouseenter" : 1, "mouseleave" : 1, "change" : 1, "select" : 1, "submit" : 1, "keypress" : 1, "keydown" : 1, "keyup" : 1, "error" : 1, "touchstart" : 1, "touchmove" : 1, "touchend" : 1, "touchcancel" : 1, "gesturestart" : 1, "gesturechange" : 1, "gestureend" : 1, "orientationchange" : 1, "DOMNodeInserted" : 1, "DOMNodeRemoved" : 1, "devicemotion" : 1, "deviceorientation" : 1, "geolocationchange" : 1, "pageview" : 1, "hashchange" : 1},
	"dataType" : "html",
	"columnMarker" : ",",
	"lineMarker" : ";",
	"nullMarker" : "-",
	"escapeMarker" : "\\",
	"recording" : 0
};

var methods = {
	getNodeIndex : function (obj) {
		if (!obj.previousSibling) {
			return 0;
		}
		else {
			return 1 + methods.getNodeIndex(obj.previousSibling);
		}
	},

	getNodePath : function (obj) {
		if (!obj.parentNode) {
			return "";
		}
		else {
			return methods.getNodePath(obj.parentNode) + "/" + obj.nodeName.toLowerCase() + "/" + methods.getNodeIndex(obj);
		}
	},
	
	getXPath : function (obj) {
		var path = methods.getNodePath(obj);
		
		return path == "" ? "-" : path;
	},
	
	getOwnId : function () {
		return ownId.toString();
	},

	getURL : function () {
		var encodedURL = encodeURI(document.URL);
		return encodedURL.replace(settings.columnMarker, settings.escapeMarker + settings.columnMarker, "g").replace(settings.lineMarker, settings.escapeMarker + settings.lineMarker, "g");
	},

	getReferer : function () {
		var encodedReferer = encodeURI(document.referrer);
		return ( (encodedReferer == "" || typeof(encodedReferer) === undefined) ? "-" : encodedReferer );
	},

	// Dealing with firefox bug because welfit.jQuery's event.timeStamp is always 0
	getTimeStamp : function (event) {
		return (new Date).getTime().toString();
	},

	getEvent : function (event) {
		return event.type;
	},

	getId : function (event) {
		return ((typeof (event.target.id) != 'undefined' && event.target.id) ? event.target.id : ((typeof (event.target.name) != 'undefined' && event.target.name) ? event.target.name : settings.nullMarker));
	},
	
	//Filtering data in target.type == password
	getWhich : function (event) {
		var whichKey = settings.nullMarker;
		if(typeof (event.which) != 'undefined' && event.which){
			whichKey = event.which.toString();
			if(event.target.type == "password") whichKey = "*";
		}
		
		return whichKey;
	},

	getExtraInfo : function (event) {
		var extra = "";

		switch (event.type) {
			case "pageview": //DOUBT
				//extra = location.href + "|" + $(window).width() + "x" + $(window).height(); //DOUBT $ DOUBT
				extra = location.href + "|" + $(document).width() + "x" + $(document).height();
				extra.replace(settings.columnMarker, settings.escapeMarker + settings.columnMarker, "g").replace(settings.lineMarker, settings.escapeMarker + settings.lineMarker, "g");
				break;
			case "geolocationchange":
				navigator.geolocation.getCurrentPosition(  // WatchPosition can be more useful: http://dev.w3.org/geo/api/spec-source.html#watch-position
			    function (position) {
					extra = position.coords.latitude + "x" + position.coords.longitude;
				}
				);
				break;
			case "resize":
				extra = "" + $(window).width() + "x" + $(window).height();
				break;
			case "mouseout":
				var f = event.relatedTarget || event.toElement;
				if (!f || f.nodeName == "HTML") {
					extra = 'leftWindow';
				}
				break;
			case "scroll":
				console.log('scroll');
				var place = $(event.target);
				extra = place.scrollLeft().toFixed(0) + 'x' + place.scrollTop().toFixed(0);
				break;
			case "click":
			case "dblclick":
			case "mousemove":
			case "submit":
				extra = event.pageX + "x" + event.pageY + "|" + event.screenX + "x" + event.screenY;//CHANGED
				break;
			default:
				extra = settings.nullMarker;
		}

		return extra;
	},

	getLogLine : function (event) {
		var logLine = [];

		logLine[0] = methods.getOwnId();
		logLine[1] = methods.getReferer(event);
		logLine[2] = methods.getTimeStamp(event);
		logLine[3] = methods.getEvent(event);
		logLine[4] = methods.getId(event);
		logLine[5] = methods.getXPath(event.target);
		logLine[6] = methods.getWhich(event);
		logLine[7] = methods.getExtraInfo(event);

		return logLine;
	},

	sendLine : function (logLine) {		
		myPort.postMessage({line: logLine});
	},

	record : function (event) {
		//verifying if it is the first time the user is seeing the webpage
		if(!seen){
			seen = 1;
			$(window).trigger('pageview');
		}
		
		var resize = event.type == 'resize' && event.target.location.toString().search('loggerPopup.html') != -1;
		var eRecorded = event.target.id == 'count' && (event.type == 'DOMNodeInserted' || event.type == 'DOMNodeRemoved');
				
		if(settings.eventAndFlags[event.type] == 1 && !resize && !eRecorded){			
			var logLine = methods.getLogLine(event);
			methods.sendLine(logLine);
		}
	}
	
}

function bindEvents(){	
	for(events in settings.eventAndFlags){
	    $(window).bind(events, methods.record);
	}	
}

function messageReceiver(message){	
	var action = message.string;	
	switch(action){
		case 'init':
			settings = message.settings;
			ownId = message.id;
			if(settings.recording == 1){
				bindEvents();
			}			
			break;
		case 'record':
			settings = message.settings;
			bindEvents();
			break;
		case 'pause':
			settings = message.settings;
			seen = 0;
			for(events in settings.eventAndFlags){
				$(window).unbind(events, methods.record);
			}
			break;
		case 'eventUpdate':
			settings = message.settings;
			break;
		default:
			console.log(action);
	}
}

var myPort = browser.runtime.connect({name:"port-from-cs"}); //NAMEUNIQUELY
myPort.onMessage.addListener(messageReceiver);