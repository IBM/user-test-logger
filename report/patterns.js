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

function show(e){
	var elem = e.target;
	var tooltip = elem.childNodes[1];
	
	console.log(tooltip);
	tooltip.style.left = e.layerX + "px";
	tooltip.style.top = e.layerY + "px";
	tooltip.style.visibility = "visible";
}

function hide(e){
	var elem = e.target;	
	var tooltip = elem.childNodes[1];
	
	tooltip.style.visibility = "hidden";
}

function showHide(e){
	var elem = e.target;	
	var tooltip = elem.childNodes[1];
	
	tooltip.style.visibility = "hidden";
	
	function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  console.log('Taking a break...');
  await sleep(2000);
  console.log('Two seconds later');
  tooltip.style.visibility = "visible";
}

demo();
	
	
}

function sheets(nodes, i, cardinality){
	var table = document.getElementById("jobsTable");
	var content = document.getElementById("content");
	
	while(i < cardinality){
		
		node = nodes[i];
		links = node.links;
		
		var sources = [], targets = [];
		
		for(let x of links){
			//console.log(x);
			if(x.source == node.id && x.target != node.id){
				targets.push(x.targetReference);
			}
			else if(x.target == node.id && x.source != node.id){
				sources.push(x.sourceReference);
			}
			else{
				/////////THINK
				sources.push(x.sourceReference);
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
		
		var tooltip, tooltiptxt;
		var description, linebreak;
		var boxSource, box, boxTarget;
		var ts, tb, tt;
		var sheetEoi, sheetSource, sheetTarget;
		var row, rowSource, rowTarget;
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
		sheetEoi.title = "Event: " + node.eventName + 
							"\nOccurrences: " + node.occurrences +
							"\nTab: " + node.tabId + 
							"\nPath: " + node.path + 
							"\nMean Distance: " + node.meanDistance + 
							"\nMean Time: " + node.meanTimestamp;
		row.appendChild(sheetEoi);
		description = document.createTextNode(node.eventName);
		sheetEoi.appendChild(description);
		
		//tooltip in box	
		/*		
		tooltiptxt = document.createElement("span");
		tooltiptxt.className = "tooltiptxt";
		
		description = document.createTextNode("Event: " + node.eventName);
		tooltiptxt.appendChild(description);
		linebreak = document.createElement('br');
		tooltiptxt.appendChild(linebreak);
		
		description = document.createTextNode("Tab: " + node.tabId);
		tooltiptxt.appendChild(description);
		linebreak = document.createElement('br');
		tooltiptxt.appendChild(linebreak);
		
		description = document.createTextNode("Path: " + node.path);
		tooltiptxt.appendChild(description);
		linebreak = document.createElement('br');
		tooltiptxt.appendChild(linebreak);
		
		description = document.createTextNode("Mean Distance: " + node.meanDistance);
		tooltiptxt.appendChild(description);
		linebreak = document.createElement('br');
		tooltiptxt.appendChild(linebreak);
		
		description = document.createTextNode("Mean Time: " + node.meanTimestamp);
		tooltiptxt.appendChild(description);
		linebreak = document.createElement('br');
		tooltiptxt.appendChild(linebreak);
		
		sheetEoi.appendChild(tooltiptxt);
		*/
		//Event Listener - tooltip
	    //sheetEoi.addEventListener("mouseover", show);
		//sheetEoi.addEventListener("mousemove", showHide);
		//sheetEoi.addEventListener("mouseout", hide);
		
		
		var j = 0, nodeSource, nodeTarget;
		while(j < min[0]){
			
			nodeSource = sources[j];
			nodeTarget = targets[j];
			
			rowSource = document.createElement("tr");
			rowSource.className = "innerRow";
			ts.appendChild(rowSource);

			sheetSource = document.createElement("td");
			sheetSource.className = "source";
			sheetSource.title = "Event: " + nodeSource.eventName + 
								"\nOccurrences: " + nodeSource.occurrences +
								"\nTab: " + nodeSource.tabId + 
								"\nPath: " + nodeSource.path + 
								"\nMean Distance: " + nodeSource.meanDistance + 
								"\nMean Time: " + nodeSource.meanTimestamp;
			rowSource.appendChild(sheetSource);
			description = document.createTextNode(nodeSource.eventName);
			sheetSource.appendChild(description);
			
			rowTarget = document.createElement("tr");
			rowTarget.className = "innerRow";
			tt.appendChild(rowTarget);
			
			sheetTarget = document.createElement("td");
			sheetTarget.className = "target";
			sheetTarget.title = "Event: " + nodeTarget.eventName + 
								"\nOccurrences: " + nodeTarget.occurrences +
								"\nTab: " + nodeTarget.tabId + 
								"\nPath: " + nodeTarget.path + 
								"\nMean Distance: " + nodeTarget.meanDistance + 
								"\nMean Time: " + nodeTarget.meanTimestamp;
			rowTarget.appendChild(sheetTarget);
			description = document.createTextNode(nodeTarget.eventName);
			sheetTarget.appendChild(description);
			
		
			j++;
		}
			
		var array, className, t, sheet;
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
		
		var nodex;
		while(j < max[0]){
			
			nodex = array[j];
			
			row = document.createElement("tr");
			row.className = "innerRow";
			t.appendChild(row);

			sheet = document.createElement("td");
			sheet.className = className;
			sheet.title = "Event: " + nodex.eventName + 
							"\nOccurrences: " + nodex.occurrences +
							"\nTab: " + nodex.tabId + 
							"\nPath: " + nodex.path + 
							"\nMean Distance: " + nodex.meanDistance + 
							"\nMean Time: " + nodex.meanTimestamp;
			sheet.width = "100%";
			row.appendChild(sheet);
			description = document.createTextNode(nodex.eventName);
			sheet.appendChild(description);
			
			
		
			j++;
		}
		
		i++;
	}

}

function patterns(backPage){
	graph = createGraph(backPage.loggerPack);
	nodes = graph.nodes;
	links = graph.links;
	
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
			if(ratio >= threshold) below = false;
			x = occurrences;
			i++			
		}		
	}
	
	sheets(nodes, i, cardinality);
	console.log("patterns");
}
 