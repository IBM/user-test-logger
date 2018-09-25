function getColor(sam){
	color = "";
	if(sam == 'incident'){
	   color = 'red';
	}

	return color;
}

function searchById(node){
	return node.id == source;
}

function createDot(graph){
	var stringDot = ""
	var weight, source, target, sourceIndex, targetIndex, sourceLabel, targetLabel, node;
	var nodes = graph.nodes;
	var links = graph.links;
	
	stringDot += "digraph {\n";
	stringDot += "\tnode [shape=record, style=filled, fillcolor=yellow, fontname=Arial];\n";
	
	var length = nodes.length;
	for(i = 0; i < length; i++){
		node = nodes[i];
		stringDot += "\t" + i + 
		
			' [label="' + node.id + '"' + 
			', fillcolor="' + getColor(node.sam) + '"' +
		
		']\n';	
	}
	
	stringDot += "\n";
	
	for(let edge of links){		
		weight = edge.weight;
		//only the string Id
		source = edge.source;
		target = edge.target;
		
		sourceIndex = nodes.findIndex(node => node.id == source);
		targetIndex = nodes.findIndex(node => node.id == target);
		
		//node object
		source = nodes[sourceIndex];
		target = nodes[targetIndex];
		
		sourceLabel = source.id;
		targetLabel = target.id;	
		
		stringDot += "\t" + sourceIndex + " -> " + targetIndex + "[" +

			"penwidth=" + weight + 

		"];\n";
		
	}
	
	stringDot += "}";
	
	return stringDot;
	
}

function init(backPage){
	graph = createGraph(backPage.loggerPack);
	dotFile = createDot(graph);
	console.log(dotFile);
	
	//Saving dot file
	var blob = new Blob([dotFile], {type: "text/csv;charset=utf-8"});
	
	var date = new Date(); 
	var filename = "" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "T" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "-graph.dot";
	
	saveAs(blob, filename, true);
	
	myPort.postMessage({done: 1});
}

var background = browser.runtime.getBackgroundPage();
console.log(background);

var myPort = browser.runtime.connect({name:"port-from-download"});

background.then(init);	  