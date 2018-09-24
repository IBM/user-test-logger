function init(backPage){
	graph = createGraph(backPage.loggerPack);
	displayGraph(graph);
}

var background = browser.runtime.getBackgroundPage();
console.log(background);

var myPort = browser.runtime.connect({name:"port-from-report"});

background.then(init);	  