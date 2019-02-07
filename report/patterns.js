//formatting timestamp -> human readable
function getTimestamp(time){	
	var timehr = '';
	var x = 0;	
	x = Math.floor(time/3600000);
	if(x < 10 && x > -1)
		timehr += '0' + x;
	else	
		timehr += '' + x;
	
	time = time%3600000;
	x = Math.floor(time/60000);
	if(x < 10 && x > -1)
		timehr += ':0' + x;
	else
		timehr += ':' + x;
	
	time = time%60000;
	x = Math.floor(time/1000);
	if(x < 10 && x > -1)
		timehr += ':0' + x;
	else
		timehr += ':' + x;
	
	time = Math.floor(time%1000);
	x = Math.floor(time/1000);
	if(time < 10 && x > -1){
		timehr += '.00' + time;
	}
	else if(time < 100 && x > -1){
		timehr += '.0' + time;
	}
	else{
		timehr += '.' + time;
	}
	return timehr;	
}


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
	
}

function sheets(nodes, i, cardinality){
	var table = document.getElementById("jobsTable");
	var content = document.getElementById("content");
	
	
	nodes = nodes.slice(i, cardinality);
	nodes.sort(function(a, b){return a.tabId - b.tabId || b.occurrences - a.occurrences;});
	
	var lastTab = nodes[0].tabId;
	
	var rowTab = document.createElement("tr");
	table.appendChild(rowTab);
	var	tabH = document.createElement("th");
	tabH.className = "tabHeader";
	tabH.colSpan = 5;
	tabH.id = 'tab' + lastTab;
	
	var tabD = document.createTextNode('Tab ' + lastTab);
	tabH.appendChild(tabD);
	
	rowTab.appendChild(tabH);
	
	for(let node of nodes){
		
		var tab = node.tabId;
		
		if(tab != lastTab){
			rowTab = document.createElement("tr");
			table.appendChild(rowTab);
			tabH = document.createElement("th");
			tabH.className = "tabHeader";
			tabH.colSpan = 5;
			tabH.id = 'tab' + tab;
			
			tabD = document.createTextNode('Tab ' + tab);
			tabH.appendChild(tabD);
			rowTab.appendChild(tabH);
			
			lastTab = tab;
		}		
		
		
		//getting the source and target nodes
		var links = node.links;
		
		var sources = [], targets = [];
		
		for(let x of links){
			
			if(x.source == node.id && x.target != node.id){
				targets.push(x.targetReference);
			}
			else if(x.target == node.id && x.source != node.id){
				sources.push(x.sourceReference);
			}
			else{
				/////////THINK
				targets.push(x.sourceReference);
			}
			
		}
		
		//getting the source and target nodes (from each source/target node of the event of interest)
		var sources2 = [], targets2 = [];
		var links2 = undefined;
		
		for(let y of sources){
			links2 = y.links;
			y.sources = [];
			
			for(let x of links2){
				
				if(x.target == y.id){
					y.sources.push(x.sourceReference);
				}
			
			}
			
		}
		
		for(let y of targets){
			links2 = y.links;
			y.targets = [];
			
			for(let x of links2){
				
				if(x.source == y.id){
					y.targets.push(x.targetReference);
				}
				
			}
			
		}
		
		var min, max;
		var sumSource = 0, sumTarget = 0;
		
		for(let x of sources){
			sumSource += x.sources.length;			
		}
		
		for(let x of targets){
			sumTarget += x.targets.length;
		}		
		
		if(sumSource < sumTarget){
			min = [sumSource, "sources"];
			max = [sumTarget, "targets"];
		}
		else{
			max = [sumSource, "sources"];
			min = [sumTarget, "targets"];
		}
		
		var diff = max[0] - min[0];
		
		var tooltip, tooltiptxt, where;
		var description, linebreak;
		var boxSource, box, boxTarget, boxSource1, boxTarget1;
		var ts, tb, tt, ts1, tt1;
		var sheetEoi, sheetSource, sheetTarget, sheetSource1, sheetTarget1;
		var row, rowSource, rowTarget, rowSource1, rowTarget1;
		var mHeight = 50;
		var size = mHeight*max[0];
		var padding = 24;		
				
		row = document.createElement("tr");
		table.appendChild(row);
		
		//boxSource -1
		boxSource1 = document.createElement("td");
		boxSource1.className = "boxSource1";
		boxSource1.height = size;
		row.appendChild(boxSource1);
		
		ts1 = document.createElement("table");
		ts1.className = "innerTable";
		ts1.style.height = size + 'px';
		boxSource1.appendChild(ts1);
		
		
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
		
		//boxTarget + 1
		boxTarget1 = document.createElement("td");
		boxTarget1.className = "boxTarget1";
		boxTarget1.height = size;
		row.appendChild(boxTarget1);
		
		tt1 = document.createElement("table");
		tt1.className = "innerTable";
		tt1.style.height = size + 'px';
		boxTarget1.appendChild(tt1);

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
							"\nElement Id: " + node.elementId + 
							"\nMean Distance: " + node.meanDistance.toFixed(2) + 
							"\nMean Time: " + getTimestamp(node.meanTimestamp) +
							"\nSam: " + node.sam;
		sheetEoi.headers = 'header2 tab' + tab;
		row.appendChild(sheetEoi);
		
		where = node.elementId;
		if(where == '-') where = node.path;
		description = document.createTextNode(node.eventName + '@' + where);
		sheetEoi.appendChild(description);
		
		var sumMin = 0;
		var heightT, heightS;
		
		if(max[1] == 'targets'){
			heightT = mHeight;
			
			for(let x of sources){
				sumMin += x.sources.length;
			}
			heightS = size/sumMin;
		}
		else{
			heightS = mHeight;
			
			for(let x of targets){
				sumMin += x.targets.length;
			}
			heightT = size/sumMin;
		}
				
		//source -1 nodes
		for(let x of sources){
			links2 = x.sources;
			
			rowSource = document.createElement("tr");
			rowSource.className = "innerRow";
			ts.appendChild(rowSource);

			sheetSource = document.createElement("td");
			sheetSource.style.height = (heightS*links2.length - padding) + 'px';
			sheetSource.className = "source";
			sheetSource.title = "Event: " + x.eventName + 
								"\nOccurrences: " + x.occurrences +
								"\nTab: " + x.tabId + 
								"\nPath: " + x.path + 
								"\nElement Id: " +  x.elementId +
								"\nMean Distance: " + x.meanDistance.toFixed(2) + 
								"\nMean Time: " + getTimestamp(x.meanTimestamp) +
								"\nSam: " + x.sam;
			sheetSource.headers = 'header1 tab' + tab;
			rowSource.appendChild(sheetSource);
			
			where = x.elementId;
			if(where == '-') where = x.path;
			description = document.createTextNode(x.eventName + '@' + where);
			sheetSource.appendChild(description);
			
			for(let y of links2){
				
				rowSource1 = document.createElement("tr");
				rowSource1.className = "innerRow";
				ts1.appendChild(rowSource1);
				
				sheetSource1 = document.createElement("td");
				sheetSource1.className = "source1";
				sheetSource1.title = "Event: " + y.eventName + 
									"\nOccurrences: " + y.occurrences +
									"\nTab: " + y.tabId + 
									"\nPath: " + y.path + 
									"\nElement Id: " +  y.elementId +
									"\nMean Distance: " + y.meanDistance.toFixed(2) + 
									"\nMean Time: " + getTimestamp(y.meanTimestamp) +
									"\nSam: " + y.sam;
				sheetSource1.headers = 'header0 tab' + tab;
				rowSource1.appendChild(sheetSource1);
				
				where = y.elementId;
				if(where == '-') where = y.path;
				description = document.createTextNode(y.eventName + '@' + where);
				sheetSource1.appendChild(description);
			}
		}
		
		//target nodes
		for(let x of targets){
			links2 = x.targets;
			
			rowTarget = document.createElement("tr");
			rowTarget.className = "innerRow";
			tt.appendChild(rowTarget);
			
			sheetTarget = document.createElement("td");
			sheetTarget.style.height = (heightT*links2.length - padding) + 'px';
			sheetTarget.className = "target";
			sheetTarget.title = "Event: " + x.eventName + 
								"\nOccurrences: " + x.occurrences +
								"\nTab: " + x.tabId + 
								"\nPath: " + x.path + 
								"\nElement Id: " + x.elementId +
								"\nMean Distance: " + x.meanDistance.toFixed(2) + 
								"\nMean Time: " + getTimestamp(x.meanTimestamp) +
								"\nSam: " + x.sam;
			sheetTarget.headers = 'header3 tab' + tab;
			rowTarget.appendChild(sheetTarget);
			
			where = x.elementId;
			if(where == '-') where = x.path;
			description = document.createTextNode(x.eventName + '@' + where);
			sheetTarget.appendChild(description);
			
			for(let y of links2){
				rowTarget1 = document.createElement("tr");
				rowTarget1.className = "innerRow";
				tt1.appendChild(rowTarget1);
				
				sheetTarget1 = document.createElement("td");
				sheetTarget1.className = "target1";
				sheetTarget1.title = "Event: " + y.eventName + 
									"\nOccurrences: " + y.occurrences +
									"\nTab: " + y.tabId + 
									"\nPath: " + y.path + 
									"\nElement Id: " +  y.elementId +
									"\nMean Distance: " + y.meanDistance.toFixed(2) + 
									"\nMean Time: " + getTimestamp(y.meanTimestamp) +
									"\nSam: " + y.sam;
				sheetTarget1.headers = 'header4 tab' + tab;
				rowTarget1.appendChild(sheetTarget1);
				
				where = y.elementId;
				if(where == '-') where = y.path;
				description = document.createTextNode(y.eventName + '@' + where);
				sheetTarget1.appendChild(description);
			}
		}
		
	}

}

function patterns(backPage){
	var graph = createGraph(backPage.loggerPack);
	var nodes = graph.nodes;
	var links = graph.links;
	
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
 