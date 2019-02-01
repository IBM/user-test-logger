function init(backPage){	
	mousePlot(backPage.loggerPack, backPage.blobs);
}

var background = browser.runtime.getBackgroundPage();

var myPort = browser.runtime.connect({name:"port-from-report"});

background.then(init);