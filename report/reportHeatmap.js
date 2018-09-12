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
						fixation: time
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
		
	}
	
	for(let line of log){		
		currentTime = line[2];
		name = line[3];
		popup = line[7].indexOf('loggerPopup.html');
		
		if(name == 'pageview' && popup != -1){
			pluginTab = line[0];
		}
		
		if(name == 'mousemove' && pluginTab != line[0]){
			
			index = line[7].indexOf('|');
			coord = line[7].slice(index + 1, line[7].length);
			
			index = coord.indexOf('x');
			object = {
				'x': coord.slice(0,index),
				'y': coord.slice(index + 1, coord.length), 
				'fixation': currentTime - previousTime
			};
			mouseTrack.push(object);
		}
		previousTime = line[2];
		
	}
	var off = 100;
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
				
	var blur = svg.append("defs")
					    .append("filter")
					    .attr("id", "blur")
					    .append("feGaussianBlur")
					    .attr("stdDeviation", 5);
						
	var g = svg.append('g');
	
	var green = 255;
	var red = 0;
	
	var square = 20;
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
				'fixation': 0
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
		
	for( var k = 0 ; k < idtFixations.length ; k++ ){
			
		var iIndex = Math.min( Math.max( Math.round( idtFixations[k].x/square ), 0 ), map.length - 1 ) ;
		var jIndex = Math.min( Math.max( Math.round( idtFixations[k].y/square ), 0 ), map[iIndex].length - 1 ) ;
		
		var v = 1 ;	
			
		map[iIndex][jIndex].fixation+= v ;	
	
		try{ map[iIndex-1][jIndex].fixation+= v ; }catch(e){}
		try{ map[iIndex][jIndex-1].fixation+= v ; }catch(e){}
		try{ map[iIndex+1][jIndex].fixation+= v ; }catch(e){}
		try{ map[iIndex][jIndex+1].fixation+= v ; }catch(e){}
			
		try{ map[iIndex-1][jIndex-1].fixation+= v * 0.64 ; }catch(e){}
		try{ map[iIndex+1][jIndex+1].fixation+= v * 0.64 ; }catch(e){}
		try{ map[iIndex-1][jIndex+1].fixation+= v * 0.64 ; }catch(e){}
		try{ map[iIndex+1][jIndex-1].fixation+= v * 0.64 ; }catch(e){}

		try{ map[iIndex-2][jIndex].fixation+= v * 0.32 ; }catch(e){}
		try{ map[iIndex][jIndex-2].fixation+= v * 0.32 ; }catch(e){}
		try{ map[iIndex+2][jIndex].fixation+= v * 0.32 ; }catch(e){}
		try{ map[iIndex][jIndex+2].fixation+= v * 0.32 ;}catch(e){}

		try{ map[iIndex-1][jIndex-2].fixation+= v * 0.18 ;}catch(e){}
		try{ map[iIndex-2][jIndex-1].fixation+= v * 0.18 ;}catch(e){}
		try{ map[iIndex-1][jIndex+2].fixation+= v * 0.18 ;}catch(e){}
		try{ map[iIndex-2][jIndex+1].fixation+= v * 0.18 ;}catch(e){}
		try{ map[iIndex+1][jIndex-2].fixation+= v * 0.18 ;}catch(e){}
		try{ map[iIndex+2][jIndex-1].fixation+= v * 0.18 ;}catch(e){}
		try{ map[iIndex+1][jIndex+2].fixation+= v * 0.18 ;}catch(e){}
		try{ map[iIndex+2][jIndex+1].fixation+= v * 0.18 ;}catch(e){}

		try{ map[iIndex-3][jIndex].fixation+= v * 0.05 ; }catch(e){}
		try{ map[iIndex][jIndex-3].fixation+= v * 0.05 ; }catch(e){}
		try{ map[iIndex+3][jIndex].fixation+= v * 0.05 ; }catch(e){}
		try{ map[iIndex][jIndex+3].fixation+= v * 0.05 ;}catch(e){}

		try{ map[iIndex-2][jIndex-2].fixation+= v * 0.05 ; }catch(e){}
		try{ map[iIndex+2][jIndex+2].fixation+= v * 0.05 ; }catch(e){}
		try{ map[iIndex-2][jIndex+2].fixation+= v * 0.05; }catch(e){}
		try{ map[iIndex+2][jIndex-2].fixation+= v * 0.05 ;}catch(e){}
			
	}
				  
	for(let i = 0; i < mapWidth; i++){
		for(let j = 0; j < mapHeight; j++){
			points.push({
				'x': map[i][j].x,
				'y': map[i][j].y,
				'fixation': map[i][j].fixation
			});
		}
	}
				  
	points.sort(function(a, b){return a.fixation-b.fixation});
	
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
				  
	var scale = d3.scaleLinear().domain([0, max*0.5, max]).range(["green", "yellow", "red"]);			  
					   
	var circles = g.selectAll('circle2')
				   .data(points)
				   .enter()
				   .append('circle')
				   .attr('cx', function(d){
						return d.x;
			       })
				   .attr('cy', function(d){
						return d.y;
				   })
				   .attr('r', square/2 + 10)
				   .attr('fill', function(d){
						return scale(d.fixation);
				   })
				   .style('opacity', function(d){
						if( d.fixation > 0.05 ){ return 0.25 ; }
						return 0 ;
				   })
				   .attr('filter', 'url(#blur)');
									
}

function heatmapT(backPage){
	var w = document.body.clientWidth;
	var h = document.body.clientHeight;
	
	var svg = d3.select('body')
				.append('svg')
				.attr('width', w)
				.attr('height', h);
	
	var blurCircle = svg.append("defs")
					    .append("filter")
					    .attr("id", "blur")
					    .append("feGaussianBlur")
					    .attr("stdDeviation", 2);
						
	var circles = svg.selectAll('circle')
					 .data(avgData)
					 .enter()
					 .append('circle');
}

function init(backPage){
	heatMap(backPage.loggerPack);
}

var background = browser.runtime.getBackgroundPage();
var myPort = browser.runtime.connect({name:"port-from-report"});
background.then(init);