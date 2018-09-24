function init(backPage){	
	mousePlot(backPage.loggerPack);
}

var background = browser.runtime.getBackgroundPage();

var myPort = browser.runtime.connect({name:"port-from-report"});

background.then(init);