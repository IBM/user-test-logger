function heatMap(loggerPack){
	var w = document.body.clientWidth;
	var h = document.body.clientHeight;
	
	var log = loggerPack;
	var mouseTrack = [];
	var index;
	var pluginTab = -1;
	var object = {};
	
	var previousTime = log[0][2];
	var currentTime = log[0][2];
	
	var wLog = 0;
	var hLog = 0;
	var wTemp = 0;
	var hTemp = 0;
	
	function idt(track, dThreshold, vThreshold){		
		var duration = 0;
		var xWindow = 0;
		var yWindow = 0;
		var xCentroid = 0;
		var yCentroid = 0;
		var xMax, yMax, xMin, yMin;
		var fixation = {};
		var isFixation = true;
		var time = 0;
		var fixationArray = [];
		var obj = {};
		var j = 0;
		var dir2 = 0;
		var pageView = '';
		var tab = 0;
		
		var length = track.length;
		var esq = 0
		var dir = 0;
		xMax = 0;
		yMax = 0;
		xMin = 0;
		yMin = 0;
		while( dir < length ){			
			duration = 0;
			xMax = 0;
			yMax = 0;
			xMin = 999999;
			yMin = 999999;
			xCentroid = 0;
			yCentroid = 0;
			time = 0;
			
			for(let i = esq; i <= dir; i++){
				obj = track[i];
				duration += obj.fixation;
				
				xCentroid += Number(obj.x);
				yCentroid += Number(obj.y);
				time += obj.fixation;
				
				if(xMax < obj.x){
					xMax = obj.x;
				}
				if(yMax < obj.y){
					yMax = obj.y
				}
				if(xMin > obj.x){
					xMin = obj.x;
				}
				if(yMin > obj.y){
					yMin = obj.y
				}
				
			}
			
			if(duration > vThreshold){				
								
				xWindow = xMax - xMin;
				yWindow = yMax - yMin;
				
				if( dThreshold > (xWindow + yWindow) ){
										
					fixation = {
						x: xCentroid/(dir+1 - esq),
						y: yCentroid/(dir+1 - esq),
						fixation: time
					};
					
					
					while(dir < track.length){
						
						dir++;
						try{
							obj = track[dir];
						
							if(xMax < obj.x){
								xMax = obj.x;
							}
							if(yMax < obj.y){
								yMax = obj.y
							}
							if(xMin > obj.x){
								xMin = obj.x;
							}
							if(yMin > obj.y){
								yMin = obj.y
							}
					
							xWindow = xMax - xMin;
							yWindow = yMax - yMin;
							
							if( dThreshold > (xWindow + yWindow) ){
						
								xCentroid += Number(obj.x);
								yCentroid += Number(obj.y);
								time += obj.fixation;
								pageView = obj.pageview;
								tab = obj.tab;
						
							}
							else{
								break;
							}
							
						}
						catch(e){
							
						}						
						
					}
					dir--;
					
					fixation = {
						x: xCentroid/(dir+1 - esq),
						y: yCentroid/(dir+1 - esq),
						fixation: time,
						pageview: pageView,
						tab: tab
					};
					dir++;
					esq = dir;
					fixationArray.push(fixation);			
				}
				else{
					esq++;
				}
				
			}else{
				dir++;
			}
		}
		return fixationArray;
	}
	
	var lastPageView = {};
	var wLastPageView = 0;
	var hLastPageView = 0;
	
	for(let line of log){		
		if(line[3] == 'pageview' && line[7].indexOf('loggerPopup.html') == -1){
			
			index = line[7].indexOf('|');
			coord = line[7].slice(index + 1, line[7].length);
			
			index = coord.indexOf('x');
			wTemp = Number( coord.slice(0, index) );
			hTemp = Number( coord.slice(index + 1, line[7].length) );
			
			wLastPageView = wTemp;	
			hLastPageView = hTemp;

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
			
			wLastPageView = wTemp;
			hLastPageView = hTemp;		
			
			if(wTemp > wLog){
				wLog = wTemp;
			}
			
			if(hTemp > hLog){
				hLog = hTemp;
			}
		}
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
		}*/
		
	}
	
	for(let line of log){		
		currentTime = line[2];
		name = line[3];
		popup = line[7].indexOf('loggerPopup.html');
		
		if(name == 'pageview' && popup != -1){
			pluginTab = line[0];
		}
		else if(name == 'pageview'){
			index = line[7].indexOf('|');
			lastPageView[line[0]] = line[7].slice(0, index);
		}
		
		if(name == 'mousemove' && pluginTab != line[0]){
			
			index = line[7].indexOf('|');
			//window coordinates
			//coord = line[7].slice(index + 1, line[7].length);
			
			//page coordinates
			coord = line[7].slice(0, index);
			
			index = coord.indexOf('x');
			object = {
				'x': coord.slice(0,index),
				'y': coord.slice(index + 1, coord.length), 
				'fixation': currentTime - previousTime,
				'pageview': lastPageView[line[0]],
				'tab': line[0]
			};
			mouseTrack.push(object);
		}
		previousTime = line[2];
		
	}
	var off = 0;
	var idtFixations = idt(mouseTrack, 10, 50);
	for(let a of idtFixations){
		a.y -= off;
	}
		
	var mousePath = d3.line()
				 .x(function(d){ return d.x; })
				 .y(function(d){ return d.y; });
				 
	var svg = d3.select('body')
			    .append('svg')
				.attr('width', wLog)
				.attr('height', hLog);
						
	var g = svg.append('g');
	
	var green = 255;
	var red = 0;
	
	var square = 10;
	var mapWidth = Math.floor(wLog/square);
	var mapHeight = Math.floor(hLog/square);
					  
	var points = [];
	var map = [];
	
	for(let i = 0; i < mapWidth; i++){
		map.push([]);
		for(let j = 0; j < mapHeight; j++){
			map[i].push({
				'color': {'red': 0, 'green': 255},
				'x': i*square,
				'y': j*square,
				'fixation': 1 
			});
		}
	}
	
	function calcColor(fixation){
		
		if(scale(fixation) > -1){
			green = 255;
			red = 255 - scale(fixation);
		}
		else{
			green = 255 + scale(fixation);
			red = 255;
		}

		return { 'red': red, 
				 'green': green 
		};
	}
	
	function createMask( r, sigma ){
		mask = [] ;
		s = r * sigma * sigma ;
		for( var i = 0 ; i <= 2 * r; i++ ){
			mask[i] = [] ;
			for( var j = 0 ; j <= 2 * r; j++ ){
				mask[i][j] = 0 ;
				x = i - r ;
				y = j - r ;
				if( x * x + y * y <= r * r ){
					mask[i][j] = Math.pow( Math.E, ( ( x * x + y * y ) * -1 ) / s ) / ( Math.PI * s ) ;
					mask[i][j] = mask[i][j].toFixed( 3 ) ;
				}
			}
		}
		return mask ;
	}

	radius = 10 ;
	mask = createMask( radius, 2 ) ;

	for( var k = 0 ; k < idtFixations.length ; k++ ){
			
		var iIndex = Math.min( Math.max( Math.round( idtFixations[k].x/square ), 0 ), map.length - 1 ) ;
		var jIndex = Math.min( Math.max( Math.round( idtFixations[k].y/square ), 0 ), map[iIndex].length - 1 ) ;
		
		for( i = -1 * radius; i <= radius; i++ ){
			for( j = -1 * radius; j <= radius; j++ ){
				try{
					map[iIndex+i][jIndex+j].fixation += 1 * mask[i+radius][j+radius] / mask[Math.round(radius/2)][Math.round(radius/2)]; 
					
				}catch(e){}	
			}
		}
	}
				  
	for(let i = 0; i < mapWidth; i++){
		for(let j = 0; j < mapHeight; j++){
			if(map[i][j].fixation > 1){
				points.push({
					'x': map[i][j].x,
					'y': map[i][j].y,
					'fixation': map[i][j].fixation
				});
			}
		}
	}
	
	var min = points[0].fixation;
	var max = points[0].fixation;
	
	for(let obj of points){
		
		if(max < obj.fixation){
			max = obj.fixation;
		}
		if(min > obj.fixation){
			min = obj.fixation;
		}
		
	}
				  
	//var scale = d3.scaleLinear().domain([max*0.1, max*0.5, max]).range(["white", "blue", "purple"]);			  
	var scale = d3.scaleLinear().domain([max*0.05, max*0.1, max*0.2, max*0.55, max]).range(["white", "lightgreen", "green", "yellow", "red"]);
	
	var rects = g.selectAll('rect')
				   .data(points)
				   .enter()
				   .append('rect')
				   .attr('x', function(d){
						return d.x;
			       })
				   .attr('y', function(d){
						return d.y;
				   })
				   .attr('width', square )
				   .attr('height', square )
				   .attr('fill', function(d){
						return scale(d.fixation);
				   })
				   .style('opacity', function(d){
						if( d.fixation > 0.05 ){ return 1.0 ; }
						return 0 ;
				   });
				   
				   
	/*
	var heatmap = h337.create({
        container: document.getElementById('heatmapContainer'),
        maxOpacity: .6,
        radius: 20,
        blur: .10//,
        // backgroundColor with alpha so you can see through it
        //backgroundColor: 'rgba(0, 0, 58, 0.96)'
    });
	
	for(let point of points){
			heatmap.addData({ x: point.x, y: point.y, value: point.fixation });
		
	}*/
									
}
