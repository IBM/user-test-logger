function clicksHandler(event){
	//FUNCTIONS	
	function save(loggerPack){
		
		var blob = new Blob([JSON.stringify(loggerPack, null, '\t')], {type: "text/json;charset=utf-8"});
		
		var date = new Date(); 
        var fileName = "" + date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + "T" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "-log.json";
			
		saveAs(blob, fileName);
	}
	
	function onError(error) {
		console.log(`Error: ${error}`);
	}
	
	function startRecording(backPage){
		backPage.callRecordCS();
	}
	
	function pauseRecording(backPage){
		backPage.callPauseCS();
	}
	
	function downloadLoggerFile(backPage){
		save( backPage.loggerPack );
		backPage.emptyPack(); //VERIFICAR SE BAIXOU
	}
	
	function checkboxUpdate(backPage){
		backPage.eventUpdate(popupButton);
	}
	
	function callReportGraph(backPage){
		backPage.reportGraph();
	}
	
	function callReportMp(backPage){
		backPage.reportMp();
	}
	
	function callReportHeatmap(backPage){
		backPage.reportHeatmap();
	}
		
	//HANDLING THE CLICKS
	var popupButton = event.target.id;
	var background = browser.runtime.getBackgroundPage();
	
	switch(popupButton){
		case 'record':
		case 'imageRecord':
			if( recordFlag == 1 ){
				
				downloadDisabled();
				reportDisabled();
				
				downloadFlag = 0;
				reportFlag = 0;
				
				contextShift("record", "pause");
				background.then(startRecording, onError);
				window.close();
			}
			break;
		case 'pause':
		case 'imagePause':
		
			downloadActive();
			reportActive();
			
			downloadFlag = 1;
			reportFlag = 1;
			
			contextShift("pause", "record");
			background.then(pauseRecording, onError);
			break;
		case 'download':
		case 'imageDownload':
			if(downloadFlag == 1){
				downloadDisabled();
				reportDisabled();
				background.then(downloadLoggerFile, onError);	
			}
			break;
		case 'report':
		case 'rightReport':
		case 'imageReport':
			if(reportFlag == 1){
				contextShift("popup-content-main", "popup-content-report");
			}
			break;
		case 'graph':
			console.log(popupButton);
			allDisabled();
			recordFlag = 0;
			downloadFlag = 0;
			eventFlag = 0;
			background.then(callReportGraph, onError);
			window.close();
			break;
		case 'heatmap':
			console.log(popupButton);
			allDisabled();
			recordFlag = 0;
			downloadFlag = 0;
			eventFlag = 0;
			background.then(callReportHeatmap, onError);
			window.close();
			break;
		case 'mousePlot':
			console.log(popupButton);
			allDisabled();
			recordFlag = 0;
			downloadFlag = 0;
			eventFlag = 0;
			background.then(callReportMp, onError);
			window.close();
			break;
		case 'downloadAll':
			console.log(popupButton);
			break;
		case 'csv':
			console.log(popupButton);
			break;
		case 'backReport':
			console.log(popupButton);
			contextShift("popup-content-report", "popup-content-main");
			break;
		case 'events':
		case 'rightEvents':
		case 'imageEvents':
			if(eventFlag == 1){
				contextShift("popup-content-main", "popup-content-events");
			}
			break;
		case 'keyboard':
		case 'rightKeyboard':
			contextShift("popup-content-events", "popup-content-events-keyboard");
			break;
		case 'mouse':
		case 'rightMouse':
			contextShift("popup-content-events","popup-content-events-mouse");
			break;
		case 'window':
		case 'rightWindow':
			contextShift("popup-content-events","popup-content-events-window");
			break;
		case 'others':
		case 'rightOthers':
			contextShift("popup-content-events","popup-content-events-others");
			break;
		case 'backKeyboard':
		case 'leftKeyboard':
			contextShift("popup-content-events-keyboard","popup-content-events");
			break;
		case 'backMouse':
		case 'leftMouse':
			contextShift("popup-content-events-mouse", "popup-content-events");
			break;
		case 'backWindow':
		case 'leftWindow':
			contextShift("popup-content-events-window", "popup-content-events");
			break;
		case 'backOthers':
		case 'leftOthers':
			contextShift("popup-content-events-others","popup-content-events");
			break;
		case 'backReport':
		case 'leftReport':
			contextShift("popup-content-report", "popup-content-main");
			break;		
		case 'backEvents':
		case 'leftEvents':
			contextShift("popup-content-events", "popup-content-main");
			break;
		default:
			console.log(popupButton);
			if(event.target.type){
				background.then(checkboxUpdate, onError);
			}
	}
	
}

//See CSS
function reportActive(){
	var x = document.getElementById("report");
	x.className = "button report";
}
//See CSS
function reportDisabled(){
	var x = document.getElementById("report");
	x.className = "button report disabled";
}

//See CSS
function downloadActive(){
	var x = document.getElementById("download");
	x.className = "button download";
}
//See CSS
function downloadDisabled(){
	var x = document.getElementById("download");
	x.className = "button download disabled"; 
}

function allDisabled(){
	var x = document.getElementById("download");
	var y = document.getElementById("record");
	var z = document.getElementById("events");
	x.className = "button download disabled";
	y.className = "button record disabled";
	z.className = "button events disabled";
}
	
function contextShift(current, next){
	var currentList = document.getElementById(current);
	var nextList = document.getElementById(next);
	
	currentList.style.display = 'none';
	nextList.style.display = 'block';
				
}

//UPDATING THE CHECKBOXES AND RECORDING STATUS
function init(backPage){
	recordFlag = 1;
	reportFlag = 0;
	eventFlag = 1;
	downloadFlag = 0;
	
	if(backPage.settings.recording == 1){
		contextShift("record", "pause");
		reportFlag = 0;
		downloadFlag = 0;
	}
	
	if(backPage.settings.recording == 0 && backPage.loggerPack.length > 0){
		reportActive();
		downloadActive();
		downloadFlag = 1;
		reportFlag = 1;
	}
	
	if(backPage.settings.report == 1){
		allDisabled();
		reportFlag = 1;
		recordFlag = 0;
		eventFlag = 0;
		downloadFlag = 0;
	}
	
	eventAndFlags = backPage.settings.eventAndFlags;
	for(events in eventAndFlags){
		document.getElementById(events).checked = eventAndFlags[events];
	}
	
}

var recordFlag, reportFlag, eventFlag, downloadFlag;

browser.runtime.getBackgroundPage().then(init);

window.addEventListener('click', clicksHandler);