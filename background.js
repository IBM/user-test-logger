	var reportsOpen = 0;
	var webPagesIds = 0;
	var connections = 0;
    var loggerPack = [];
	var portsFromCS = {};
	var message = {
			string: "",
			settings: {},
			id: 0
	}
	var settings = {
		"interval" : 500,
		"eventAndFlags": {"blur" : 1, "focus" : 1, "focusin" : 1, "focusout" : 1, "load" : 1, "resize" : 1, "scroll" : 1, "unload" : 1, "beforeunload" : 1, "click" : 1, "dblclick" : 1, "mousedown" : 1, "mouseup" : 1, "mousemove" : 1, "mouseover" : 1, "mouseout" : 1, "mouseenter" : 1, "mouseleave" : 1, "change" : 1, "select" : 1, "submit" : 1, "keypress" : 1, "keydown" : 1, "keyup" : 1, "error" : 1, "touchstart" : 1, "touchmove" : 1, "touchend" : 1, "touchcancel" : 1, "gesturestart" : 1, "gesturechange" : 1, "gestureend" : 1, "orientationchange" : 1, "DOMNodeInserted" : 1, "DOMNodeRemoved" : 1, "devicemotion" : 1, "deviceorientation" : 1, "geolocationchange" : 1, "pageview" : 1, "hashchange" : 1},
		"dataType" : "html",
		"columnMarker" : ",",
		"lineMarker" : ";",
		"nullMarker" : "-",
		"escapeMarker" : "\\",
		"recording" : 0,
		"report" : 0
	}; 
	 
	function connected(p) {
		if(p.name == 'port-from-report'){
			reportsOpen++;
			settings.report = 1;
			p.onDisconnect.addListener(function(m){
				reportsOpen--;
				if(reportsOpen == 0){
					settings.report = 0;
				}
				console.log('REPORT CLOSED');
			});
		}
		else{
			connections++;
			currentPort = (webPagesIds++).toString();
			portsFromCS[currentPort] = p;
		
			//Sending the first message to update sender's settings
			message.string = 'init';
			message.settings = settings;
			message.id = webPagesIds;
			portsFromCS[currentPort].postMessage(message);
		
			portsFromCS[currentPort].onMessage.addListener(function(m) {
				loggerPack.push(m.line);
			});
		}
	}
	
	function callRecordCS(){
		message.string = "record";
		settings.recording = 1;
		message.settings = settings;
		
		//try, maybe switch to if
		for (ports in portsFromCS){
			try{
				portsFromCS[ports].postMessage(message);
			}
			catch(e){
				delete portsFromCS[ports];
				connections--;
			}
		}
	}
	
	function callPauseCS(){
		message.string = "pause";
		settings.recording = 0;
		message.settings = settings;
		
		//try, maybe switch to if
		for(ports in portsFromCS){
			try{
				portsFromCS[ports].postMessage(message);
			}
			catch(e){
				delete portsFromCS[ports];
				connections--;
			}
		}
	}
	
	function callEventUpdateCS(){
		message.string = "eventUpdate";
		message.settings = settings;
		
		//try, maybe switch to if
		for(ports in portsFromCS){
			try{
				portsFromCS[ports].postMessage(message);
			}
			catch(e){
				delete portsFromCS[ports];
				connections--;
			}
		}
	}
	
	function eventUpdate(eventName){
		settings.eventAndFlags[eventName] = Math.abs( settings.eventAndFlags[eventName] - 1 );
		callEventUpdateCS();
	}
	
	function emptyPack(){
		loggerPack = [];
	}
	
	
	function reportGraph(){
		var reportPage = browser.extension.getURL('report/reportGraph.html');
		console.log( browser.extension.getURL('report/reportGraph.html') );
	
		var reportTab = browser.tabs.create({
			url:reportPage
		});			
	}
	
	function reportMp(){
		var reportPage = browser.extension.getURL('report/reportMp.html');
		console.log( browser.extension.getURL('report/reportMp.html') );
	
		var reportTab = browser.tabs.create({
			url:reportPage
		});			
	}
	
	function reportHeatmap(){
		var reportPage = browser.extension.getURL('report/reportHeatmap.html');
		console.log( browser.extension.getURL('report/reportHeatmap.html') );
	
		var reportTab = browser.tabs.create({
			url:reportPage
		});	
	}
	
	function downloadMousePlot(){
		var downloadPage = browser.extension.getURL('download/downloadMousePlot.html');
		console.log( browser.extension.getURL('download/reportMousePlot.html') );
	
		var downloadTab = browser.tabs.create({
			url:downloadPage
		});
	}
	
	function downloadHeatmap(){
		var downloadPage = browser.extension.getURL('download/downloadHeatmap.html');
		console.log( browser.extension.getURL('download/reportHeatmap.html') );
	
		var downloadTab = browser.tabs.create({
			url:downloadPage
		});
	}
	
	browser.runtime.onConnect.addListener(connected);