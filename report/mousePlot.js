function mousePlot(loggerPack){
	var w = document.body.clientWidth;
	var h = document.body.clientHeight;
	var wLog = 0;
	var hLog = 0;
	var wTemp = 0;
	var hTemp = 0;
	var off = 100;
	
	var log = loggerPack;
	var mouseTrack = [];
	var index;
	var pluginTab = -1;
	var object = {};
	
	var previousTime = log[0][2];
	var currentTime = log[0][2];
	
	var coord = '';
	
	for(let line of log){
		
		if(line[3] == 'pageview' && line[7].indexOf('loggerPopup.html') == -1){
			
			index = line[7].indexOf('|');
			coord = line[7].slice(index + 1, line[7].length);
			
			index = coord.indexOf('x');
			wTemp = Number( coord.slice(0, index) );
			hTemp = Number( coord.slice(index + 1, line[7].length) );
			if(wTemp > wLog){
				wLog = wTemp;
			}
			
			if(hTemp > hLog){
				hLog = hTemp;
			}
			
		}
		else if(line[3] == 'resize'){
			
			coord = line[7];
			index = coord.indexOf('x');
			wTemp = Number( coord.slice(0, index) );
			hTemp = Number( coord.slice(index + 1, coord.length) );
			if(wTemp > wLog){
				wLog = wTemp;
			}
			
			if(hTemp > hLog){
				hLog = hTemp;
			}
		}
		
	}
	
	var name = '';
	var popup = 0;
	var tracks = 0;
	mouseTrack[tracks] = [];
	
	for(let line of log){
		
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
			coord = line[7].slice(index + 1, line[7].length);
			
			index = coord.indexOf('x');
			
			object = {
				'x': Number( coord.slice(0,index) ),
				'y': Number( coord.slice(index + 1, coord.length) ) - off, 
				'fixation': currentTime - previousTime
			};
			mouseTrack[tracks].push(object);
			
		}
		previousTime = line[2];
		
	}
	
	var mousePath = d3.line()
				 .x(function(d){ return d.x; })
				 .y(function(d){ return d.y; });
				 
	var svg = d3.select('body')
			    .append('svg')
				.attr('width', wLog)
				.attr('height', hLog)
				.attr('viewBox', '0 0 ' + wLog + ' ' + hLog)
				.attr('opacity', 0.5);
			
	for(let i = 0; i <= tracks; i++){
			
		var path = svg.append('path')
					  .datum(mouseTrack[i])
					  .attr('class', 'line')
					  .attr('d', mousePath)
					  .attr('stroke', 'black')
					  .attr('stroke-width', 1)
					  .attr('fill', 'none');
	   
	}
	   
	index;
	pluginTab = -1;
	object = {};
	var clicks = [];
	   
	for(let line of log){
				
		if(line[3] == 'pageview' && line[7].indexOf('loggerPopup.html') != -1){
			pluginTab = line[0];
		}
		
		if( ( line[3] == 'click' || line[3] == 'dblclick') && pluginTab != line[0]){
			
			index = line[7].indexOf('|');
			coord = line[7].slice(index + 1, line[7].length);
			
			index = coord.indexOf('x');
			object = {
				'x': Number( coord.slice(0,index) ),
				'y': Number( coord.slice(index + 1, coord.length) ) - off, 
				'event': line[3]
			};
			clicks.push(object);
		}
		
	}
	
	var g = svg.append('g');
	
	var count = 0;
	
	var circles = g.selectAll('circle')
					 .data(clicks)
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
					 .data(clicks)
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
				   .data(clicks)
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
					 		 
}
