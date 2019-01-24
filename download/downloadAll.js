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

function getSVGString( svgNode ) {
	svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
	var cssStyleText = getCSSStyles( svgNode );
	appendCSS( cssStyleText, svgNode );

	var serializer = new XMLSerializer();
	var svgString = serializer.serializeToString(svgNode);
	svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
	svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

	return svgString;

	function getCSSStyles( parentElement ) {
		var selectorTextArr = [];

		// Add Parent element Id and Classes to the list
		selectorTextArr.push( '#'+parentElement.id );
		for (var c = 0; c < parentElement.classList.length; c++)
				if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
					selectorTextArr.push( '.'+parentElement.classList[c] );

		// Add Children element Ids and Classes to the list
		var nodes = parentElement.getElementsByTagName("*");
		for (var i = 0; i < nodes.length; i++) {
			var id = nodes[i].id;
			if ( !contains('#'+id, selectorTextArr) )
				selectorTextArr.push( '#'+id );

			var classes = nodes[i].classList;
			for (var c = 0; c < classes.length; c++)
				if ( !contains('.'+classes[c], selectorTextArr) )
					selectorTextArr.push( '.'+classes[c] );
		}

		// Extract CSS Rules
		var extractedCSSText = "";
		for (var i = 0; i < document.styleSheets.length; i++) {
			var s = document.styleSheets[i];
			
			try {
			    if(!s.cssRules) continue;
			} catch( e ) {
		    		if(e.name !== 'SecurityError') throw e; // for Firefox
		    		continue;
		    	}

			var cssRules = s.cssRules;
			for (var r = 0; r < cssRules.length; r++) {
				if ( contains( cssRules[r].selectorText, selectorTextArr ) )
					extractedCSSText += cssRules[r].cssText;
			}
		}
		

		return extractedCSSText;

		function contains(str,arr) {
			return arr.indexOf( str ) === -1 ? false : true;
		}

	}

	function appendCSS( cssText, element ) {
		var styleElement = document.createElement("style");
		styleElement.setAttribute("type","text/css"); 
		styleElement.innerHTML = cssText;
		var refNode = element.hasChildNodes() ? element.children[0] : null;
		element.insertBefore( styleElement, refNode );
	}
}


function svgString2Image( svgString, width, height, format, backPage, output, callback, zip, dateName ) {
	var x;
	var format = format ? format : 'png';

	var imgsrc = 'data:image/svg+xml;base64,'+ btoa( unescape( encodeURIComponent( svgString ) ) ); // Convert SVG string to data URL

	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");

	canvas.width = width;
	canvas.height = height;

	var image = new Image();
	image.onload = function() {
		context.clearRect ( 0, 0, width, height );
		context.drawImage(image, 0, 0, width, height);

		canvas.toBlob( function(blob) {
			var filesize = Math.round( blob.length/1024 ) + ' KB';
			
			x = document.createElement("p");
			x.id = output;
			
			document.body.appendChild(x);
			
			var newurl = window.URL.createObjectURL(blob);
			x.src = newurl;
			
			console.log(blob);
			
			if(callback){ callback(zip, dateName);}
			
		});

		
	};

	image.src = imgsrc;
	
}

function init(backPage){	
	function getBlob(id, src, zip){
		
		return new Promise((resolve, reject) => {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', src, true);
			xhr.responseType = 'blob';
			xhr.onload = function(e) {
				if (this.status == 200) {
					var myBlob = this.response;
					console.log(myBlob);
					zip.file(id + ".png", myBlob);
					console.log(zip);
					resolve('h');
				}
			};
			xhr.send();	
		});	
	}
	
	function save(zip, dateName){
		console.log('save');
		var mp = document.getElementById("mouseplot");
		var hm = document.getElementById("heatmap");
		mp = mp.src;
		hm = hm.src;
		
		var promises = [];
		
		promises.push(getBlob(dateName + '-mouseplot', mp, zip));
		promises.push(getBlob(dateName + '-heatmap', hm, zip));
		
		Promise.all(promises).then(function() {
			zip.generateAsync({type:"blob"})
			.then(function (blob) {
				saveAs(blob, dateName + "-report.zip");
				//closing window
				myPort.postMessage({done: 1});
			});
		});
		 
	}
	
	var zip = new JSZip();
	
	var date = new Date(); 
	var dateName = "" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "T" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	
	//PATTERNS
	patterns(backPage);
	
	var htmlContent = [(new XMLSerializer()).serializeToString(document)];
	var blobP = new Blob(htmlContent, {type: "text/html"});

	zip.file(dateName + "-patterns.html", blobP);
	
	//CONFIGURE FOR INCIDENTS
	
	var tableElements = document.getElementById('divTable');
	var divContent = document.getElementById('content');
	divContent.removeChild(tableElements);
	
	tableElements = document.getElementById('divTableIncident');
	tableElements.style.display = 'block';
	
	//INCIDENTS
	incidents(backPage);
	
	var htmlContent = [(new XMLSerializer()).serializeToString(document)];
	var blobP = new Blob(htmlContent, {type: "text/html"});

	zip.file(dateName + "-incidents.html", blobP);
	
	//CLEAR THE SCREEN
	var list = document.body.childNodes;
    for (var i = list.length - 1; i >= 0 ;i--){
        document.body.removeChild(list[i])
    }
	
	//GRAPH
	graph = createGraph(backPage.loggerPack);
	dotFile = createDot(graph);
	
	var blobG = new Blob([dotFile], {type: "text/csv;charset=utf-8"});
	
	zip.file(dateName + "-graph.dot", blobG);
	
	//MOUSEPLOT
	mousePlot(backPage.loggerPack);
	
	var svg = d3.selectAll('svg');
	svg.style('display', 'block');
	
	var htmlContent = [(new XMLSerializer()).serializeToString(document)];
	var blob = new Blob(htmlContent, {type: "text/html"});
	
	zip.file(dateName + "-mousePlot.html", blob);
	
	//CLEAR THE SCREEN
	var list = document.body.childNodes;
    for (var i = list.length - 1; i >= 0 ;i--){
        document.body.removeChild(list[i])
    }
	
	/*download as png
	//The mouseplot was generated by the mousePlot script
	//Saving using the library saveSvgAsPng
	var svg = document.getElementsByTagName("svg")[0];
	var dimW = svg.width.baseVal.value;
	var dimH = svg.height.baseVal.value;
		
	var svgString = getSVGString(svg);
	svgString2Image( svgString, dimW, dimH, 'png', backPage, "mouseplot" ); // passes Blob and filesize String to the callback
	*/
		
	//HEATMAP
	heatMap(backPage.loggerPack);
	
	svg = d3.selectAll('svg');
	svg.style('display', 'block');
	
	htmlContent = [(new XMLSerializer()).serializeToString(document)];
	blob = new Blob(htmlContent, {type: "text/html"});
	
	zip.file(dateName + "-heatmap.html", blob);
	
	/*download as png
	var svg = document.getElementsByTagName("svg")[1];
	var dimW = svg.width.baseVal.value;
	var dimH = svg.height.baseVal.value;
	
	var svgString = getSVGString(svg);
	svgString2Image( svgString, dimW, dimH, 'png', backPage, "heatmap", save, zip, dateName );
	*/
	
	zip.generateAsync({type:"blob"})
			.then(function (blob) {
				saveAs(blob, dateName + "-report.zip");
				//closing window
				myPort.postMessage({done: 1});
			});
	
}

var background = browser.runtime.getBackgroundPage();

var myPort = browser.runtime.connect({name:"port-from-download"});

background.then(init);