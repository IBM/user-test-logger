function mousePlot(loggerPack){
	var w = document.body.clientWidth;
	var h = document.body.clientHeight;
	var wLog = 0;
	var hLog = 0;
	var wTemp = 0;
	var hTemp = 0;
	var off = 0;
	
	var log = loggerPack;
	var mouseTrack = [];
	var index;
	var pluginTab = -1;
	var object = {};
	
	var previousTime = log[0][2];
	var currentTime = log[0][2];
	
	var coord = '';
	
	var lastPageView = {};
	var wLastPageView = 0;
	var hLastPageView = 0;
	
	var string = '';
	
	var maps = {};
	var wdimensions = {};
	var hdimensions = {};
	
	var name = '';
	var popup = 0;
	var tracks = 0;
	mouseTrack[tracks] = [];
	
	var clicks = [];
	
	for(let line of log){
		currentTime = line[2];
		name = line[3];
		popup = line[7].indexOf('loggerPopup.html');
		
		if(name == 'pageview' && popup != -1){
			pluginTab = line[0];
		}
		else if(name == 'pageview'){
			
			index = line[7].indexOf('|');
			string = line[7].slice(0, index);
			lastPageView[line[0]] = string;
			
			if(maps[line[0]] == undefined){
				maps[line[0]] = {};
				maps[line[0]][string] = true;
			}
			else{
				maps[line[0]][string] = true;
			}
			
			index = line[7].indexOf('|');
			coord = line[7].slice(index + 1, line[7].length);
			
			index = coord.indexOf('x');
			wTemp = Number( coord.slice(0, index) );
			hTemp = Number( coord.slice(index + 1, line[7].length) );
			
			if(wdimensions[line[0]] == undefined && hdimensions[line[0]] == undefined){
				wdimensions[line[0]] = {};
				wdimensions[line[0]][string] = wTemp;
			
				hdimensions[line[0]] = {};
				hdimensions[line[0]][string] = hTemp;
			}
			else{
				wdimensions[line[0]][string] = wTemp;
				hdimensions[line[0]][string] = hTemp;
			}
			
		}
		
		if(line[3] == 'resize'){
			
			coord = line[7];
			index = coord.indexOf('x');
			wTemp = Number( coord.slice(0, index) );
			hTemp = Number( coord.slice(index + 1, coord.length) );
			
			if(wTemp > wdimensions[line[0]][lastPageView[line[0]]]){
				wdimensions[line[0]][lastPageView[line[0]]] = wTemp;
			}
			
			if(hTemp > hdimensions[line[0]][lastPageView[line[0]]]){
				hdimensions[line[0]][lastPageView[line[0]]] = hTemp;
			}
		}
		
		if(name == 'mouseout' && pluginTab != line[0] && line[7] == 'leftWindow'){
			
			tracks++;
			mouseTrack[tracks] = [];
			console.log(tracks);
		}
		
		if(name == 'mousemove' && pluginTab != line[0]){
			
			index = line[7].indexOf('|');
			//window coordinates
			//coord = line[7].slice(index + 1, line[7].length);
			
			//page coordinates
			coord = line[7].slice(0, index);
			
			index = coord.indexOf('x');
			
			object = {
				'x': Number( coord.slice(0,index) ),
				'y': Number( coord.slice(index + 1, coord.length) ) - off, 
				'fixation': currentTime - previousTime,
				'pageview': lastPageView[line[0]],
				'tab': line[0]
			};
			mouseTrack[tracks].push(object);
			
		}
		
		if( ( line[3] == 'click' || line[3] == 'dblclick') && pluginTab != line[0]){
			
			index = line[7].indexOf('|');
			//window coordinates			
			//coord = line[7].slice(index + 1, line[7].length);
			
			//page coordinates
			coord = line[7].slice(0, index);
			
			index = coord.indexOf('x');
			object = {
				'x': Number( coord.slice(0,index) ),
				'y': Number( coord.slice(index + 1, coord.length) ) - off, 
				'event': line[3],
				'pageview': lastPageView[line[0]],
				'tab': line[0]
			};
			clicks.push(object);
		}
		
		previousTime = line[2];
		
		//only when using window dimensions
		/*
		else if(line[3] == 'scroll'){
			coord = line[7];
			index = coord.indexOf('x');
			wTemp = Number( coord.slice(0, index) );
			hTemp = Number( coord.slice(index + 1, coord.length) );
			
			if(wLastPageView + wTemp > wLog){
				wLog = wLastPageView + wTemp;
			}
			
			if(hLastPageView + hTemp > hLog){
				hLog = hLastPageView + hTemp;
			}
		}
		*/
		
	}
	

	/*for(let line of log){
		
		currentTime = line[2];
		name = line[3];
		popup = line[7].indexOf('loggerPopup.html');
		
		if(name == 'pageview' && popup != -1){
			pluginTab = line[0];
		}
		
		if(name == 'mouseout' && pluginTab != line[0] && line[7] == 'leftWindow'){
			
			tracks++;
			mouseTrack[tracks] = [];
			console.log(tracks);
		}
		
		if(name == 'mousemove' && pluginTab != line[0]){
			
			index = line[7].indexOf('|');
			//window coordinates
			//coord = line[7].slice(index + 1, line[7].length);
			
			//page coordinates
			coord = line[7].slice(0, index);
			
			index = coord.indexOf('x');
			
			object = {
				'x': Number( coord.slice(0,index) ),
				'y': Number( coord.slice(index + 1, coord.length) ) - off, 
				'fixation': currentTime - previousTime
			};
			mouseTrack[tracks].push(object);
			
		}
		previousTime = line[2];
		
	}*/
	
	for(let tab in maps){
		for(let pageview in maps[tab]){
			
			maps[tab][pageview] = {};
			
			maps[tab][pageview]['tracks'] = [];
			maps[tab][pageview]['clicks'] = [];
			
		}
	}
	
	for(let x of mouseTrack){
		
		if(x.length != 0){
		
			maps[x[0].tab][x[0].pageview]['tracks'].push(x);	
			
		}
	}
	
	for(let x of clicks){
		maps[x.tab][x.pageview]['clicks'].push(x);
	}
	
	var body = document.getElementsByTagName("BODY")[0]; 
	
	for(let tab in maps){
		
		
		var header1 = document.createElement("div");
		header1.style.borderTop = "2px solid #c1c1c1";
		header1.style.borderBottom = "2px solid #c1c1c1";
		header1.style.fontSize = "1.1em";
		header1.style.textAlign = "center";
		header1.style.fontWeight = "bold";
		header1.style.padding = "10px 5px 10px 5px";
		header1.style.textAlign = "left";
		header1.style.fontFamily = "Segoe UI, Frutiger, Frutiger Linotype, Dejavu Sans, Helvetica Neue, Arial, sans-serif";
		
		var textNode = document.createTextNode('Tab ' + tab);
		header1.appendChild(textNode);
		body.appendChild(header1);
		
		for(let pageview in maps[tab]){
	
			var mousePath = d3.line()
						 .x(function(d){ return d.x; })
						 .y(function(d){ return d.y; });
						 
						 
						 
			var container = document.createElement("div");
			container.className = "container-pageview";
			container.id = tab + pageview;
			
			header1 = document.createElement("div");
			header1.className = "pageview-heading";
			
			//header1.style.borderTop = "1px solid #efefef";
			header1.style.borderBottom = "1px solid #c1c1c1";
			header1.style.fontSize = "1em";
			header1.style.textAlign = "center";
			//header1.style.fontWeight = "bold";
			header1.style.padding = "10px 5px 10px 5px";
			header1.style.textAlign = "left";
			header1.style.fontFamily = "Segoe UI, Frutiger, Frutiger Linotype, Dejavu Sans, Helvetica Neue, Arial, sans-serif";
			
			var arrow = document.createElement("span");
			arrow.className = "arrow-up";
			
			arrow.innerHTML = "&#9650;";
			arrow.style.fontSize = "0.8em";
			arrow.style.marginRight = "2px";
			arrow.style.cursor = "pointer";
			arrow.style.display = "none";
			header1.appendChild(arrow);
			
			arrow = document.createElement("span");
			arrow.className = "arrow-down";
			
			arrow.innerHTML = "&#9660;";
			arrow.style.fontSize = "0.8em";
			arrow.style.marginRight = "2px";
			arrow.style.cursor = "pointer";
			header1.appendChild(arrow);
			
			textNode = document.createTextNode(pageview);
			
			header1.appendChild(textNode);
			container.appendChild(header1);			
			body.appendChild(container);
						 
			var svg = d3.select('body')
						.append('svg')
						.attr('width',  wdimensions[tab][pageview])
						.attr('height',  hdimensions[tab][pageview])
						//.attr('viewBox', '0 0 ' + wLog + ' ' + hLog)
						.attr('opacity', 0.5);
					
			for(let i of maps[tab][pageview]['tracks']){
					
				var path = svg.append('path')
							  .datum(i)
							  .attr('class', 'line')
							  .attr('d', mousePath)
							  .attr('stroke', 'black')
							  .attr('stroke-width', 1)
							  .attr('fill', 'none');
			 			 
			}	
			
			var g = svg.append('g');
	
			var count = 0;
			
			var circles = g.selectAll('circle')
							 .data(maps[tab][pageview]['clicks'])
							 .enter()
							 .append('circle')
							 .filter(function(d) { return d.event == 'click' })
							 .attr('r', function(d){
								 count++;
								 return 14;
							 })
							 .attr('cx', function(d){
								 return d.x;
							 })
							 .attr('cy', function(d){
								 return d.y;
							 })
							 .attr('fill', 'black');
							 
			var circles2 = g.selectAll('circles2')
							 .data(maps[tab][pageview]['clicks'])
							 .enter()
							 .append('circle')
							 .filter(function(d) { return d.event == 'dblclick' })
							 .attr('r', 18)
							 .attr('cx', function(d){
								 return d.x;
							 })
							 .attr('cy', function(d){
								 return d.y;
							 })
							 .attr('fill', 'none')
							 .attr('stroke', 'black');
							 
			var texts = [];
			
			var max = count;
			
			var indices = g.selectAll('circles')
						   .data(maps[tab][pageview]['clicks'])
						   .enter()
						   .append('text')
						   .filter(function(d) { return d.event == 'click' })
						   .text(function(d){
							   count--;console.log(count);
							   return max - count;
						   })
						   .attr('x', function(d){
							   console.log(this);
								 return d.x;
						   })
						   .attr('y', function(d){
								return d.y;
						   })
						   .attr('dy', 2)
						   .attr('font-size', '10px')
						   .attr('text-anchor', 'middle')
						   .attr('fill', 'white')
						   .attr('font-family', 'sans-serif');

			svg.attr('class', 'heatmap-d3');
			svg.style('display', 'none');
			
		}
		
	}
	
	$(".container-pageview").click(function(e) {
			$(this).next(".heatmap-d3").stop().toggle();
			$(this).find(".arrow-up, .arrow-down").toggle();
			console.log('aa');
			console.log(e);
			});
	
	
}


