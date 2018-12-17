function getReference(nodes, links){
	for(let x of nodes){
		x.links = [];
	}
	
	for(let i of links){
		var n = 0;
		for(let j of nodes){
			if(n == 2) break;
			var id = j.id;
			if(i.source == id && i.target != id){
				j.links.push(i);
				i.sourceReference = j;
				n++;
			}
			else if(i.target == id && i.source != id){
				j.links.push(i);
				i.targetReference = j;
				n++;
			}
			else if(i.target == id && i.source == id){
				j.links.push(i);
				i.targetReference = j;
				i.sourceReference = j;
				n = 2;
			}
			
		}
	}	
}

function sheets(nodes, i, cardinality){
	var table = document.getElementById("jobsTable");
	
	while(i < cardinality){
		
		node = nodes[i];
		links = node.links;
		
		var sources = [], targets = [];
		
		for(let x of links){
			
			if(x.source == node.id && x.target != node.id){
				targets.push(x.target);
			}
			else if(x.target == node.id && x.source != node.id){
				sources.push(x.source);
			}
			else{
				/////////THINK
				sources.push(x.source);
			}
			
		}
		
		var min, max;
		if(sources.length < targets.length){
			min = [sources.length, "sources"];
			max = [targets.length, "targets"];
		}
		else{
			max = [sources.length, "sources"];
			min = [targets.length, "targets"];
		}
		
		var diff = max[0] - min[0];
		
		var boxSource, box, boxTarget;
		var size = 50*max[0];
		
		
		row = document.createElement("tr");
		table.appendChild(row);
		
		//boxSource
		boxSource = document.createElement("td");
		boxSource.className = "boxSource";
		boxSource.height = size;
		row.appendChild(boxSource);
		
		ts = document.createElement("table");
		ts.className = "innerTable";
		ts.style.height = size + 'px';
		boxSource.appendChild(ts);
		
		//box
		box = document.createElement("td");
		box.className = "box";
		box.height = size;
		row.appendChild(box);
		
		tb = document.createElement("table");
		tb.className = "innerTable";
		tb.style.height = size + 'px';
		box.appendChild(tb);
		
		//boxTarget
		boxTarget = document.createElement("td");
		boxTarget.className = "boxTarget";
		boxTarget.height = size;
		row.appendChild(boxTarget);
		
		tt = document.createElement("table");
		tt.className = "innerTable";
		tt.style.height = size + 'px';
		boxTarget.appendChild(tt);
		

		//Node in box
		row = document.createElement("tr");
		row.className = "innerRow";
		tb.appendChild(row);
		
		sheetEoi = document.createElement("td");
		sheetEoi.className = "eoi";
		row.appendChild(sheetEoi);
		description = document.createTextNode(node.id);
		sheetEoi.appendChild(description);
		
		
		console.log(node);
		
		
		/*
		sheetSource = document.createElement("td");
		sheetSource.className = "source";
		row.appendChild(sheetSource);
		description = document.createTextNode(sources[0]);
		sheetSource.appendChild(description);
		
		sheet = document.createElement("td");
		sheet.className = "eoi";
		row.appendChild(sheet);
		sheet.rowSpan = max[0];
		description = document.createTextNode(node.id);
		sheet.appendChild(description);		
		
		sheetTarget = document.createElement("td");
		sheetTarget.className = "target";	
		row.appendChild(sheetTarget);
		description = document.createTextNode(targets[0]);
		sheetTarget.appendChild(description);	*/
		
		var j = 0;
		while(j < min[0]){
			/*
			row = document.createElement("tr");
			table.appendChild(row);

			sheetSource = document.createElement("td");
			sheetSource.className = "source";
			row.appendChild(sheetSource);
			description = document.createTextNode(sources[j]);
			sheetSource.appendChild(description);
			
			sheetTarget = document.createElement("td");
			sheetTarget.className = "target";	
			row.appendChild(sheetTarget);
			description = document.createTextNode(targets[j]);
			sheetTarget.appendChild(description);		*/
			
			rowSource = document.createElement("tr");
			rowSource.className = "innerRow";
			ts.appendChild(rowSource);

			sheetSource = document.createElement("td");
			sheetSource.className = "source";
			rowSource.appendChild(sheetSource);
			description = document.createTextNode(sources[j]);
			sheetSource.appendChild(description);
			
			rowTarget = document.createElement("tr");
			rowTarget.className = "innerRow";
			tt.appendChild(rowTarget);
			
			sheetTarget = document.createElement("td");
			sheetTarget.className = "target";
			rowTarget.appendChild(sheetTarget);
			description = document.createTextNode(targets[j]);
			sheetTarget.appendChild(description);
			
		
			j++;
		}
			
		var array, className;
		if(max[1] == "sources"){
			array = sources;
			className = "source";
			t = ts;
		}
		else{
			array = targets;
			className = "target";
			t = tt;
		}
		console.log(diff);
		console.log(node);
		while(j < max[0]){
			
			row = document.createElement("tr");
			row.className = "innerRow";
			t.appendChild(row);

			sheet = document.createElement("td");
			sheet.className = className;
			sheet.width = "100%";
			row.appendChild(sheet);
			description = document.createTextNode(array[j]);
			sheet.appendChild(description);
			
			
		
			j++;
		}
		
		i++;
	}
}

function init(backPage){
	graph = createGraph(backPage.loggerPack);
	nodes = graph.nodes;
	links = graph.links;
	console.log(links);
	
	getReference(nodes, links);
		
	nodes.sort(function(a, b){return a.occurrences - b.occurrences;});
	
	var cardinality = nodes.length;
	var threshold = 0.8;
	
	var ratio;
	var x = nodes[0].occurrences;
	var i = 1;
	var below = true;
	while(below){
		var occurrences = nodes[i].occurrences;
		if(i == cardinality) break;
		
		if(x == occurrences){
			i++;
		}
		else{
			ratio = i/cardinality;
			console.log(ratio);
			console.log(x);
			console.log('-');
			if(ratio >= threshold) below = false;
			x = occurrences;
			i++			
		}		
	}
	console.log('---------------------------');
	console.log(i);
	console.log(cardinality);
	console.log(nodes);
	sheets(nodes, i, cardinality);
}

var background = browser.runtime.getBackgroundPage();
console.log(background);

var myPort = browser.runtime.connect({name:"port-from-report"});

background.then(init);	  