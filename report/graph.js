//new
function neighbourhoodDev(node, mean){	
	var sum = 0;
	for(let x of node.adjList){
		sum += Math.pow( (x.meanDistance - mean), 2 )
	}
	
	return Math.sqrt( (sum/node.adjList.length) );
	
}
//new
function neighbourhoodMean(node){	
	var sum = 0;
	for(let x of node.adjList){
		sum += x.meanDistance;
	}
	
	return sum/node.adjList.length;
	
}

//node id: event@id@path:targetid
function getNodeId(line){
	return line[0] + '@' + line[3] + '@' + line[5] + ':' + line[4];
}

function createNode(line, id, distance, initialTs){
	var node = {};
	node.id = id;
	node.meanDistance = distance;
	node.meanTimestamp = Number( line[2] ) - initialTs;
	node.occurrences = 1
	node.eventName = line[3]
	node.path = line[5];
	node.tabId = line[0];
	node.elementId = line[4];
	//new
	node.adjList = [];
	
	return node;
}

function createEdge(previousNodeId, nodeId){
	var link = {};
	link.source = previousNodeId;
	link.target = nodeId;
	link.weight = 1;
	
	return link;
}

function calcMean (oldMean, value, n){
	return ( (oldMean * (n - 1) ) + value)/n;
}

function createGraph(loggerPack){	
	var graph = {
		nodes : [],
		links : [],
		addNode : function (node){
			graph.nodes.push(node);
		},
		getNode : function (nodeId){
			for(let node of graph.nodes){
				if(node.id == nodeId){
					return node;
				}
			}
			return null;
		},
		getNumberOfNodes : function (){
			return graph.nodes.length;
		},
		addEdge : function (link){
			graph.links.push(link);
		},
		getEdge : function (previousId, id){
			for(let link of graph.links){
				if( previousId == link.source && id == link.target ){
					return link;
				}
			}
			return null;
		}
	}
	
	var initialTs = 0;
	var previousNode = {};
	var node = {};
	var link = {};
	var distance = 0;
	var currentId = "";
		
	var start = {};
	start.id = "start";
	start.meanDistance = -1;
	start.meanTimestamp = -1;
	start.occurrences = 1;
	start.eventName = 'start';
	start.path = '-';
	start.tabId = '-1';
	start.elementId = '-';
	start.adjList = [];
		
	graph.addNode(start);
	previousNode = start;
	
	initialTs = Number( loggerPack[0][2] );
		
	for (let line of loggerPack) {
		currentId = getNodeId(line);
		node = graph.getNode(currentId);
		if( node == null ){
			node = createNode(line, currentId, distance, initialTs);
			graph.addNode(node);
			
		}
		else{
			node.occurrences++;
			node.meanDistance = calcMean(node.meanDistance, distance, node.occurrences);
			node.meanTimestamp = calcMean(node.meanTimestamp, ( Number( line[2] ) - initialTs ), node.occurrences); 
		}
		
		link = graph.getEdge(previousNode.id, node.id);
		
		if(link == null){
			link = createEdge(previousNode.id, node.id);
			graph.addEdge(link);
			previousNode.adjList.push(node);
		}
		else{
			link.weight++;
		}
		previousNode = node;
		distance++;
	}
	//???????
	var end = {};
	end.id = "end";
	end.meanDistance = previousNode.meanDistance;///convention
	end.meanTimestamp = -1;
	end.occurrences = 1;
	end.eventName = 'end';
	end.path = '-';
	end.tabId = '-1';
	end.elementId = '-';
	end.adjList = [];
	
	graph.addNode(end);
	graph.addEdge( createEdge(previousNode.id, end.id) );
	previousNode.adjList.push(end);
	
	//graph finished

	sam(graph);
	start.sam = 'regular';
	end.sam = 'regular';
	
	return graph;	
}

function sam(graph){	
	for(let node of graph.nodes){		
		var meanNeighbours = neighbourhoodMean(node);
		var devNeighbours = neighbourhoodDev(node, meanNeighbours);
		node.devNeighbours = devNeighbours;
		node.meanNeighbours = meanNeighbours;
		if( node.meanDistance > (meanNeighbours + 2*devNeighbours) ){
			node.sam = 'incident';
		}
		else if( node.meanDistance < (meanNeighbours - 2*devNeighbours) ){
			node.sam = 'shortcut';
		}
		else{
			node.sam = 'regular';
		}		
	}
}

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

function displayGraph(graph){
	var wclient = document.body.clientWidth;
	var hclient = document.body.clientHeight;
	var w = wclient*4;
	var h = hclient*4;
	var minw = Math.floor(w/2) - Math.floor(wclient/2);
	var minh = Math.floor(h/2) - Math.floor(hclient/2);
	var maxw = Math.floor(w/2) + Math.floor(wclient/2);
	var maxh = Math.floor(h/2) + Math.floor(hclient/2);
	var radius = 10;

	var svg = d3.select("body")
				.append('svg')
				.attr('width', w)
				.attr('height', h)
				.attr('viewBox', '' + minw + ' ' + minh + ' ' + maxw + ' ' + maxh)
				.call(d3.zoom()
						.on("zoom", function () {
							nodes.attr("transform", d3.event.transform);
						    links.attr("transform", d3.event.transform);
						})
				);

	var force = d3.forceSimulation(graph.nodes)
				  .force('collision', d3.forceCollide(radius*2))
				  .force('center', d3.forceCenter().x(w/2).y(h/2))
				  .force('link', d3.forceLink(graph.links).strength(function(d){
					  if(d.eventName == 'end')
						  return 3;
					  return 1.5;
				  })
				  .id(function(d){ 
					  return d.id; })
				  .distance(1))
				  .force('charge', d3.forceManyBody())
				  .force('positioningY', d3.forceY(h/2).strength(0.1))
				  .force('positioningStart', d3.forceX(radius*2).strength(function(d){
					  if(d.eventName == 'start')
						  return 1;
					  return 0;
				  }))
				  .force('positioningEnd', d3.forceX(w - radius*2).strength(function(d){
					  if(d.eventName == 'end')
						  return 1;
					  return 0;;
				  }));
				  
	var links = svg.selectAll('path')
				   .data(graph.links)
			       .enter()
			       .append('path')
			       .style("stroke", "#000")
                   .style("stroke-width", function(d){
					return 1 + 0.1*d.weight;
			       })
			       .attr('fill', 'none');
		
	var nodes = svg.selectAll('g')
				   .data(graph.nodes)
				   .enter()
			       .append('g')
				   .attr('cursor', 'pointer');
			   
	var circles = nodes.append("circle")
					   .attr("r", radius)
					   .attr('fill', function(d){
						   var color = '';
						   
						   if(d.sam == 'incident'){
							   color = 'red';
						   }
						   else{
							   color = 'yellow';
						   }
						   return color;
					   })
					   .attr('stroke', 'black');
	
	var tooltip;
	var tooltips = nodes.append('title')
	    			  .text(function(d) {		
						
						var hrTime = getTimestamp(d.meanTimestamp);
						
						tooltip = 'Event: ' + d.eventName + '\n' +
						'Tab: ' + d.tabId + '\n' +
						'Path: ' + d.path + '\n' +
						'Element Id: ' + d.elementId + '\n' +
						'Mean Distance: ' + d.meanDistance.toFixed(2) + '\n' + 
						'Mean Time: ' + hrTime;
						    
						return tooltip;
						
					  });		  
					  
	var labels = nodes.append('text')
					  .attr('id', 'text 1')
					  .text(function (d) {
							return d.eventName;
					  })
					  .attr('dy', -4)
					  .call(d3.drag()
					  .on("start", dragStarted)    
		              .on("drag", dragging)     
		              .on("end", dragEnded)); 

	var labels2 = nodes.append('text')
					   .attr('id', 'text 2')
					   .text(function (d) {
							return d.tabId + '#' + d.elementId;
					   })
					   .attr('dy', 0)
					   .call(d3.drag() 
					   .on("start", dragStarted)    
		               .on("drag", dragging)     
		               .on("end", dragEnded));  
	
	circles.call(d3.drag()
	       .on("start", dragStarted)    
		   .on("drag", dragging)     
		   .on("end", dragEnded)); 
			   
	var marker = svg.append('defs')
	    			.selectAll('marker')
		     		.data(graph.links)
			    	.enter()
				    .append('marker')
				    .attr('id', function(d){
					  return 'arrow' + d.index;
				    })
				    .attr('orient', 'auto')
				    //.attr('viewBox', '-0 -5 10 10')
				    .attr('refX', function(d){
				      return 8;
				    })
				    .attr('refY', 5)
				    .attr('markerWidth', 9)
				    .attr('markerHeight', 9)
				    .append('path')
				    .attr('d', 'M2,2 L2,8 L8,5 L2,2')
				    .attr('fill', 'black');
				    //.attr('xoverflow', 'visible');	

	links.attr('marker-end', function(d){
		if(d.source != d.target){
			return 'url(#arrow' + d.index + ')';
		}
	});					 
	
	force.on('tick', function(){		
		var label2 = '';
		
		nodes.attr('cx', function(d){
			return Math.max( 0 + radius, Math.min(w - radius, d.x) );
		})
		.attr('cy',function(d){
			 return Math.max( 0 + radius, Math.min(h - radius, d.y) );
		});
		
		
		circles.attr('cx', function(d){
			return Math.max( 0 + radius, Math.min(w - radius, d.x) );
		})
		.attr('cy',function(d){
			 return Math.max( 0 + radius, Math.min(h - radius, d.y) );
		});
		
		
		labels.attr('x', function(d){
			return Math.max( 0 + radius, Math.min(w - radius, d.x) ) - d.eventName.length/2;
		})
		.attr('y',function(d){
				 return Math.max( 0 + radius, Math.min(h - radius, d.y) );
		});		
		
		labels2.attr('x', function(d){
			
			label2 = d.tabId + '#' + d.elementId;
			
			return Math.max( 0 + radius, Math.min(w - radius, d.x) ) - label2.length/2;
		})
		.attr('y',function(d){
			 return Math.max( 0 + radius, Math.min(h - radius, d.y) );
		});

		links.attr('d', function(d) {
			
			var startWeight = 0;
			var endWeight = 0;
			var x1, x2, y1, y2;
			
			if(d.source.id == 'start'){
				startWeight	= radius*6;
			}
			if(d.target.id == 'end'){
				endWeight = -radius*6;
			}
		
			x1 = Math.max( 0 + radius, Math.min(w - radius, d.source.x) );
			y1 = Math.max( 0 + radius, Math.min(h - radius, d.source.y /*+ startWeight*/) );
			x2 = Math.max( 0 + radius, Math.min(w - radius, d.target.x) );
			y2 = Math.max( 0 + radius, Math.min(h - radius, d.target.y /*+ endWeight*/) );
		
			var output = '';
		
			if(	d.source.x == d.target.x && d.source.y == d.target.y ){
				x1 += 5;
				x2 += -5;
				y1 -= 5;
				y2 -= 5;
				
				linkRadius = 8 + d.weight*0.1;
			
				output = 'M' + x1 + ',' + y1 + ' A' + linkRadius + ',' + linkRadius + ' 0 1,0 ' + x2 + ',' + y2;
			}
			else{
			
				var tg = (y2 - y1)/(x2 - x1);
				var angle = Math.atan( Math.abs(tg) );
			
				if(x1 < x2){
					x1 += radius*Math.cos(angle);
					x2 -= radius*Math.cos(angle);
				}
				else{
					x2 += radius*Math.cos(angle);
					x1 -= radius*Math.cos(angle);
				}
			
				if(y1 < y2){
					y1 += radius*Math.sin(angle);
					y2 -= radius*Math.sin(angle);
				}
				else{
					y2 += radius*Math.sin(angle);
					y1 -= radius*Math.sin(angle);
				}
						
				output = 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2;
			}
		
			return output;
		
		});
			   		 
	});
			   
	function dragStarted(d) {    
		if (!d3.event.active) 
			force.alphaTarget(0.3).restart();   
		d.fx = d.x;    d.fy = d.y; 
		
	} 
	
	function dragging(d) {  				
		d.fx = d3.event.x;
		d.fy = d3.event.y;		
	} 
	
	function dragEnded(d) {    
		if (!d3.event.active) 
			force.alphaTarget(0);    
		d.fx = null;    
		d.fy = null; 
	}	

}	