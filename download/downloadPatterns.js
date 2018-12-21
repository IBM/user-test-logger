

function init(backPage){	
	patterns(backPage);
	
	var htmlContent = [(new XMLSerializer()).serializeToString(document)];
	var blob = new Blob(htmlContent, {type: "text/html"});
	
	var date = new Date(); 
	var fileName = "" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "T" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "-patterns.html";
	
	saveAs(blob, fileName);
	
	myPort.postMessage({done: 1});
	
}

var background = browser.runtime.getBackgroundPage();

var myPort = browser.runtime.connect({name:"port-from-download"});

background.then(init);