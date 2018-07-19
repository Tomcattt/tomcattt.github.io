/*! Timeline 3D web export v1.0 | (c) 2013 BEEDOCS, Inc. */
var chart={};chart.width=2048;chart.height=1024;var eventJSON=[[1845.414847161572, 138.0572653691322, 216.0353214980213, 124.8869596922762],[1176.855895196506, 138.0572653691322, 376.7685589519651, 124.8869596922762],[1151.528384279476, 276.9218941900929, 376.7685589519651, 155.8913265045033],[1143.231441048035, 394.7104985799332, 371.8133318372169, 134.8153020733829],[884.2794759825327, 574.4529088982327, 376.7685589519651, 197.0904634833856],[817.4672489082969, 775.1239597903589, 376.7685589519651, 217.8488506200532],[809.1703056768558, 892.8497998899768, 373.5600567280466, 134.7013282742563],[792.1397379912663, 169.0616321813593, 376.7685589519651, 155.8913265045033],[81.65938864628821, 169.0616321813593, 376.7685589519651, 155.8913265045033],[6.550218340611353, 276.9218941900929, 376.7685589519651, 124.8869596922762]];var prerenderedAspectRatios=[0.75000,1.00000,1.33333,1.50000,1.77778,2.39000];var lastEventIndex=9;var gl;var bdgl={};bdgl.ongoingImageLoads=[];chart.events=[]
var canvas;var canvasSize={};var FOV=35.0;var preImages=new Array()
function preload(){for(i=0;i<preload.arguments.length;i++){preImages[i]=new Image();preImages[i].src=preload.arguments[i];}}
var LINEAR=0;var EASEIN_EASEOUT=1;function calculatePosition(lengthOfTransition,lengthComplete,startingValue,endingValue,type){var percentComplete=lengthComplete/lengthOfTransition;if(percentComplete<0.0){return startingValue;}else if(percentComplete>1.0){return endingValue;}
if(type==LINEAR){return(1.0-percentComplete)*startingValue+percentComplete*endingValue;}else if(type==EASEIN_EASEOUT){var middle=(startingValue+endingValue)/2.0;var t=2.0*percentComplete;if(t<=1.0){return calculatePosition(lengthOfTransition,t*t*lengthOfTransition,startingValue,middle,LINEAR);}else{t-=1;return calculatePosition(lengthOfTransition,(1-t)*(1-t)*lengthOfTransition,endingValue,middle,LINEAR);}}
return 0;}
function createGLContext(canvas){var names=["webgl","experimental-webgl","webkit-3d","moz-webgl"];var context=null;for(var i=0;i<names.length;i++){try{context=canvas.getContext(names[i],{antialias:true});}catch(e){}
if(context){break;}}
if(context){context.viewportWidth=canvas.width;context.viewportHeight=canvas.height;}else{return undefined;}
return context;}
window.requestAnimFrame=(function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(callback,element){return window.setTimeout(callback,1000/60);};})();window.cancelRequestAnimFrame=(function(){return window.cancelCancelRequestAnimationFrame||window.webkitCancelRequestAnimationFrame||window.mozCancelRequestAnimationFrame||window.oCancelRequestAnimationFrame||window.msCancelRequestAnimationFrame||window.clearTimeout;})();function loadShaderFromDOM(id){var shaderScript=document.getElementById(id);if(!shaderScript){return null;}
var shaderSource="";var currentChild=shaderScript.firstChild;while(currentChild){if(currentChild.nodeType==3){shaderSource+=currentChild.textContent;}
currentChild=currentChild.nextSibling;}
var shader;if(shaderScript.type=="x-shader/x-fragment"){shader=gl.createShader(gl.FRAGMENT_SHADER);}else if(shaderScript.type="x-shader/x-vertex"){shader=gl.createShader(gl.VERTEX_SHADER);}else{return null;}
gl.shaderSource(shader,shaderSource);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)&&!gl.isContextLost()){alert(gl.getShaderInfoLog(shader));return null;}
return shader;}
function setupShaders(){var fragmentShader=loadShaderFromDOM("shader-fs-texture");var fragmentAlphaShader=loadShaderFromDOM("shader-fs-textureWithCrossFade");var vertexShader=loadShaderFromDOM("shader-vs");bdgl.programSimple=gl.createProgram();gl.attachShader(bdgl.programSimple,vertexShader);gl.attachShader(bdgl.programSimple,fragmentShader);gl.linkProgram(bdgl.programSimple);if(!gl.getProgramParameter(bdgl.programSimple,gl.LINK_STATUS)&&!gl.isContextLost()){alert("Could not initialise shaders");}
gl.useProgram(bdgl.programSimple);bdgl.programSimple.vertexPositionAttributeLoc=gl.getAttribLocation(bdgl.programSimple,"aVertexPosition");bdgl.programSimple.uniformProjMatrixLoc=gl.getUniformLocation(bdgl.programSimple,"uPMatrix");bdgl.programSimple.uniformMVMatrixLoc=gl.getUniformLocation(bdgl.programSimple,"uMVMatrix");bdgl.programSimple.vertexTextureAttributeLoc=gl.getAttribLocation(bdgl.programSimple,"aTextureCoord");bdgl.programSimple.uniformSamplerLoc=gl.getUniformLocation(bdgl.programSimple,"uSampler");bdgl.programSimple.uniformFadeLevelLoc=gl.getUniformLocation(bdgl.programSimple,"uFadeLevel");bdgl.programSimple.uniformAmbientLightLevelLoc=gl.getUniformLocation(bdgl.programSimple,"uAmbientLightLevel");bdgl.programSimple.uniformFocusDepthLoc=gl.getUniformLocation(bdgl.programSimple,"uFocusDepth");gl.enableVertexAttribArray(bdgl.programSimple.vertexPositionAttributeLoc);gl.enableVertexAttribArray(bdgl.programSimple.vertexTextureAttributeLoc);bdgl.programAlphaTransition=gl.createProgram();gl.attachShader(bdgl.programAlphaTransition,vertexShader);gl.attachShader(bdgl.programAlphaTransition,fragmentAlphaShader);gl.linkProgram(bdgl.programAlphaTransition);if(!gl.getProgramParameter(bdgl.programAlphaTransition,gl.LINK_STATUS)&&!gl.isContextLost()){alert("Could not initialise shaders");}
gl.useProgram(bdgl.programAlphaTransition);bdgl.programAlphaTransition.vertexPositionAttributeLoc=gl.getAttribLocation(bdgl.programAlphaTransition,"aVertexPosition");bdgl.programAlphaTransition.uniformProjMatrixLoc=gl.getUniformLocation(bdgl.programAlphaTransition,"uPMatrix");bdgl.programAlphaTransition.uniformMVMatrixLoc=gl.getUniformLocation(bdgl.programAlphaTransition,"uMVMatrix");bdgl.programAlphaTransition.vertexTextureAttributeLoc=gl.getAttribLocation(bdgl.programAlphaTransition,"aTextureCoord");bdgl.programAlphaTransition.uniformSamplerLoc=gl.getUniformLocation(bdgl.programAlphaTransition,"uSampler");bdgl.programAlphaTransition.uniformFadeLevelLoc=gl.getUniformLocation(bdgl.programAlphaTransition,"uFadeLevel");bdgl.programAlphaTransition.uniformAmbientLightLevelLoc=gl.getUniformLocation(bdgl.programAlphaTransition,"uAmbientLightLevel");bdgl.programAlphaTransition.uniformFocusDepthLoc=gl.getUniformLocation(bdgl.programAlphaTransition,"uFocusDepth");bdgl.programAlphaTransition.uniformAlphaBlendLoc=gl.getUniformLocation(bdgl.programAlphaTransition,"uAlphaBlend");gl.enableVertexAttribArray(bdgl.programAlphaTransition.vertexPositionAttributeLoc);gl.enableVertexAttribArray(bdgl.programAlphaTransition.vertexTextureAttributeLoc);}
function textureFinishedLoading(image,texture){gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);gl.generateMipmap(gl.TEXTURE_2D);gl.bindTexture(gl.TEXTURE_2D,null);}
function loadImageForTexture(url,texture,callback){texture.isLoaded=false;var image=new Image();image.onload=function(){bdgl.ongoingImageLoads.splice(bdgl.ongoingImageLoads.indexOf(image),1);textureFinishedLoading(image,texture);texture.isLoaded=true;if(callback)callback();}
bdgl.ongoingImageLoads.push(image);image.src=url;}
function unloadTexture(texture){texture.isLoaded=false;gl.deleteTexture(texture);}
function setupTextures(){bdgl.chartTexture=gl.createTexture();loadImageForTexture('t/chart.png',bdgl.chartTexture,function(){chart.timeFromBeginning=0;chart.inFade=true;preload('t/event'+lastEventIndex+'.png');});}
function degToRad(degrees){return degrees*Math.PI/180;}
function setupBuffers(){chart.scale=1.0/chart.width;chart.inFade=false;chart.timeFromBeginning=0.0;chart.FADE_IN_TIME=1.0;chart.fadeInPercentage=0.0;chart.currentEvent=0;chart.desiredEvent=0;chart.cameraRotation=0.01;chart.desiredAngle=0;chart.startAngle=chart.cameraRotation;chart.percentRotated=0.0;chart.MAX_ROTATION_DEGREES=55.0;chart.timelinePositionX=0;chart.desiredPositionX=chart.timelinePositionX;chart.startPositionX=chart.timelinePositionX;chart.timelinePositionY=0;chart.desiredPositionY=chart.timelinePositionY;chart.startPositionY=chart.timelinePositionY;chart.closeTimelineZ=0;chart.farTimelineZ=0;chart.rotationSpeed=1.75;chart.eventSpeed=0.75;chart.elapsed=0;bdgl.vertexBuffer=gl.createBuffer();bdgl.vertexBuffer.position={};bdgl.vertexBuffer.position.itemSize=3;bdgl.vertexBuffer.position.itemOffset=0;bdgl.vertexBuffer.textureCoord={};bdgl.vertexBuffer.textureCoord.itemSize=2;bdgl.vertexBuffer.textureCoord.itemOffset=3*Float32Array.BYTES_PER_ELEMENT;bdgl.vertexBuffer.stride=(bdgl.vertexBuffer.position.itemSize+bdgl.vertexBuffer.textureCoord.itemSize)*Float32Array.BYTES_PER_ELEMENT;bdgl.vertexBuffer.numItems=4;var widthTexOffset=1.0/(2048.0*2.0);var heightTexOffset=1.0/(2048.0*2.0);var vertices=[chart.width/2.0,chart.height/2.0,0.0,1.0-widthTexOffset,1.0-heightTexOffset,-chart.width/2.0,chart.height/2.0,0.0,widthTexOffset,1.0-heightTexOffset,chart.width/2.0,-chart.height/2.0,0.0,1.0-widthTexOffset,heightTexOffset,-chart.width/2.0,-chart.height/2.0,0.0,widthTexOffset,heightTexOffset];bdgl.vertexBuffer.chartBufferOffset=0;bdgl.widestEventWidth=0;bdgl.tallestEventHeight=0;var eventVertices=[];var eventBackgrounds=[];for(i=0;i<eventJSON.length;i++){var event={};event.x=eventJSON[i][0];event.y=eventJSON[i][1];event.width=eventJSON[i][2];event.height=eventJSON[i][3];var halfW=event.width/2.0;var halfH=event.height/2.0;event.startAngle=0;event.rotationDegrees=0;event.desiredAngle=0;event.transitionPercent=1;event.elapsed=-1;event.texture=0;event.timelinePositionX=0.5-event.x/chart.width;event.timelinePositionY=(0.5-(event.y-halfH)/chart.height)*chart.height/chart.width;chart.events.push(event);bdgl.widestEventWidth=(bdgl.widestEventWidth>event.width)?bdgl.widestEventWidth:event.width;bdgl.tallestEventHeight=(bdgl.tallestEventHeight>event.height)?bdgl.tallestEventHeight:event.height;eventVertices.push(-halfW,-halfH,0.0,widthTexOffset,heightTexOffset,-halfW,halfH,0.0,widthTexOffset,1.0-heightTexOffset,halfW,-halfH,0.0,1.0-widthTexOffset,heightTexOffset,halfW,halfH,0.0,1.0-widthTexOffset,1.0-heightTexOffset);eventBackgrounds.push(-halfW,-halfH,0.0,widthTexOffset,heightTexOffset,-halfW,halfH,0.0,widthTexOffset,0.25-heightTexOffset,halfW,-halfH,0.0,1.0-widthTexOffset,heightTexOffset,halfW,halfH,0.0,1.0-widthTexOffset,0.25-heightTexOffset);}
bdgl.vertexBuffer.eventsBufferOffset=bdgl.vertexBuffer.numItems;vertices=vertices.concat(eventVertices);bdgl.vertexBuffer.eventsBackgroundsBufferOffset=bdgl.vertexBuffer.numItems+chart.events.length*bdgl.vertexBuffer.numItems;vertices=vertices.concat(eventBackgrounds);gl.bindBuffer(gl.ARRAY_BUFFER,bdgl.vertexBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);}
function selectEventGL(index){var newIndex=chart.events.length-1-index;currentBeelineEvent.removeClass('selected');currentBeelineEvent=$('#'+(index+1)).addClass('selected');updateChartNav();for(var i=0;i<chart.events.length;i++){var event=chart.events[i];if(i==chart.currentEvent||i==chart.desiredEvent){if(event.desiredAngle!=0){event.startAngle=event.rotationDegrees;event.desiredAngle=0;event.elapsed=0;}}}
chart.desiredEvent=newIndex;var newEvent=chart.events[newIndex];if(!newEvent.texture.isLoaded){newEvent.texture=gl.createTexture();loadImageForTexture('t/event'+newIndex+'.png',newEvent.texture,function(){newEvent.elapsed=0;if(newIndex>0){preload('t/event'+(newIndex-1)+'.png');}});}else{newEvent.elapsed=0;}
newEvent.startAngle=newEvent.rotationDegrees;newEvent.desiredAngle=chart.desiredAngle;chart.elapsed=0;chart.desiredPositionX=newEvent.timelinePositionX;chart.desiredPositionY=newEvent.timelinePositionY;if(chart.cameraRotation!=0&&chart.cameraRotation!=chart.MAX_ROTATION_DEGREES&&chart.elapsed>0)return;chart.startPositionX=chart.timelinePositionX;chart.startPositionY=chart.timelinePositionY;chart.startAngle=chart.cameraRotation;if(chart.cameraRotation<0.1)setIs3D(true);}
function currentEventIndex(){return chart.events.length-1-chart.desiredEvent;}
var hasZoomed=false;function toggle3D(e){if(!hasZoomed){selectEventGL(0);return false;}
setIs3D(!is3D());return false;}
function nextEventGL(e){if(currentBeelineEvent.attr('id')===undefined){var firstEvent=$('#beeline li:not(.invisible):first');selectEventGL(firstEvent.attr('id')-1);}else{var nextEvent=currentBeelineEvent.nextAll(':not(.invisible):first');var eventID=nextEvent.attr('id');if(eventID===undefined){currentBeelineEvent=$();$('#cursor').css('left','-999px');setIs3D(false);}else{selectEventGL(eventID-1);}}
return false;}
function previousEventGL(e){if(currentBeelineEvent.attr('id')===undefined){var lastEvent=$('#beeline li:not(.invisible):last');selectEventGL(lastEvent.attr('id')-1);}else{var previousEvent=currentBeelineEvent.prevAll(':not(.invisible):first');var eventID=previousEvent.attr('id');if(eventID===undefined){currentBeelineEvent=$();$('#cursor').css('left','-999px');setIs3D(false);}else{selectEventGL(eventID-1);}}
return false;}
function is3D(){if(usingWebGL){return(chart.desiredAngle==chart.MAX_ROTATION_DEGREES&&chart.cameraRotation>0);}else{return currentBeelineEvent.size()>0;}}
function setIs3D(make3D){var current3D=is3D();if(current3D==make3D)return;chart.startAngle=chart.cameraRotation;chart.desiredAngle=(make3D)?chart.MAX_ROTATION_DEGREES:0;chart.elapsed=0;if(make3D==true){hasZoomed=true;if(chart.events[chart.desiredEvent].desiredAngle==0){selectEventGL(chart.events.length-1-chart.desiredEvent);}}else{var currentEvent=chart.events[chart.desiredEvent];currentEvent.startAngle=currentEvent.rotationDegrees;currentEvent.desiredAngle=0;currentEvent.elapsed=0;}}
var AMBIENT_WHEN_ROTATED=0.45;var AMBIENT_WHEN_3D=0.9;var MIN_TRANSITION_PERCENT=0.5;var MAX_TRANSITION_PERCENT=0.97;var X_ADJUSTMENT=-7.5;var Y_ADJUSTMENT=7;var currentTexture;function drawScene(){gl.clear(gl.COLOR_BUFFER_BIT);mat4.identity(bdgl.mvMatrix);if(bdgl.chartTexture.isLoaded==true){gl.useProgram(bdgl.programSimple);gl.uniform1f(bdgl.programSimple.uniformFocusDepthLoc,chart.closeTimelineZ);gl.uniform1f(bdgl.programSimple.uniformAmbientLightLevelLoc,chart.percentRotated*AMBIENT_WHEN_ROTATED+(1.0-chart.percentRotated)*AMBIENT_WHEN_3D);gl.uniform1f(bdgl.programSimple.uniformFadeLevelLoc,chart.fadeInPercentage);var depth=(chart.percentRotated*-chart.closeTimelineZ)+(1.0-chart.percentRotated)*-chart.farTimelineZ;var halfEventX=chart.percentRotated*(-bdgl.widestEventWidth/chart.width)/2.0;var slideX=chart.timelinePositionX*chart.percentRotated;var slideY=chart.timelinePositionY*chart.percentRotated;mat4.translate(bdgl.mvMatrix,bdgl.mvMatrix,[halfEventX,0,depth]);mat4.rotate(bdgl.mvMatrix,bdgl.mvMatrix,degToRad(chart.cameraRotation),[0,1,0]);mat4.translate(bdgl.mvMatrix,bdgl.mvMatrix,[slideX,slideY,0]);mat4.scale(bdgl.mvMatrix,bdgl.mvMatrix,[chart.scale,chart.scale,chart.scale]);gl.uniformMatrix4fv(bdgl.programSimple.uniformMVMatrixLoc,false,bdgl.mvMatrix);gl.bindBuffer(gl.ARRAY_BUFFER,bdgl.vertexBuffer);gl.vertexAttribPointer(bdgl.programSimple.vertexPositionAttributeLoc,bdgl.vertexBuffer.position.itemSize,gl.FLOAT,false,bdgl.vertexBuffer.stride,bdgl.vertexBuffer.position.itemOffset);gl.vertexAttribPointer(bdgl.programSimple.vertexTextureAttributeLoc,bdgl.vertexBuffer.textureCoord.itemSize,gl.FLOAT,false,bdgl.vertexBuffer.stride,bdgl.vertexBuffer.textureCoord.itemOffset);gl.bindTexture(gl.TEXTURE_2D,bdgl.chartTexture);gl.drawArrays(gl.TRIANGLE_STRIP,bdgl.vertexBuffer.chartBufferOffset,bdgl.vertexBuffer.numItems);for(var i=0;i<chart.events.length;i++){var event=chart.events[i];if(event.rotationDegrees>=0.01&&event.texture.isLoaded){var eventMatrix=mat4.clone(bdgl.mvMatrix);mat4.translate(eventMatrix,eventMatrix,[event.x-(chart.width/2.0)+(event.width/2.0),event.y-(chart.height/2.0)-(event.height/2.0),0]);gl.uniformMatrix4fv(bdgl.programSimple.uniformMVMatrixLoc,false,eventMatrix);if(currentTexture!=event.texture){gl.bindTexture(gl.TEXTURE_2D,event.texture);currentEvent=event.texture;}
gl.drawArrays(gl.TRIANGLE_STRIP,bdgl.vertexBuffer.eventsBackgroundsBufferOffset+i*bdgl.vertexBuffer.numItems,bdgl.vertexBuffer.numItems);}}
gl.useProgram(bdgl.programAlphaTransition);gl.uniform1f(bdgl.programAlphaTransition.uniformFocusDepthLoc,chart.closeTimelineZ);gl.uniform1f(bdgl.programAlphaTransition.uniformAmbientLightLevelLoc,chart.percentRotated*AMBIENT_WHEN_ROTATED+(1.0-chart.percentRotated)*AMBIENT_WHEN_3D);gl.uniform1f(bdgl.programAlphaTransition.uniformFadeLevelLoc,chart.fadeInPercentage);for(var i=0;i<chart.events.length;i++){var event=chart.events[i];if(event.rotationDegrees>=0.01&&event.texture.isLoaded){var eventMatrix=mat4.clone(bdgl.mvMatrix);mat4.translate(eventMatrix,eventMatrix,[X_ADJUSTMENT+event.x-(chart.width/2.0)+(event.width/2.0),Y_ADJUSTMENT+event.y-(chart.height/2.0)-(event.height/2.0),0]);mat4.translate(eventMatrix,eventMatrix,[-event.width/2.0,0,0]);mat4.rotate(eventMatrix,eventMatrix,degToRad(-event.rotationDegrees),[0,1,0]);mat4.translate(eventMatrix,eventMatrix,[event.width/2.0,0,0]);gl.uniformMatrix4fv(bdgl.programAlphaTransition.uniformMVMatrixLoc,false,eventMatrix);var alpha=(event.transitionPercent-MIN_TRANSITION_PERCENT)/(MAX_TRANSITION_PERCENT-MIN_TRANSITION_PERCENT);alpha=Math.min(alpha,1);alpha=Math.max(alpha,0);gl.uniform1f(bdgl.programAlphaTransition.uniformAlphaBlendLoc,alpha);if(currentTexture!=event.texture){gl.bindTexture(gl.TEXTURE_2D,event.texture);currentEvent=event.texture;}
gl.drawArrays(gl.TRIANGLE_STRIP,bdgl.vertexBuffer.eventsBufferOffset+i*bdgl.vertexBuffer.numItems,bdgl.vertexBuffer.numItems);}}}}
function animate(timestep){if(chart.inFade){chart.fadeInPercentage=chart.timeFromBeginning/chart.FADE_IN_TIME;if(chart.fadeInPercentage>=1.0){chart.fadeInPercentage=1.0;chart.inFade=false;}}
if(chart.elapsed!=-1){chart.elapsed+=timestep;if(chart.elapsed>=chart.rotationSpeed){chart.cameraRotation=chart.desiredAngle;chart.startAngle=chart.desiredAngle;chart.timelinePositionX=chart.desiredPositionX;chart.timelinePositionY=chart.desiredPositionY;chart.startPositionX=chart.desiredPositionX;chart.startPositionY=chart.desiredPositionY;chart.elapsed=-1;}else{chart.cameraRotation=calculatePosition(chart.rotationSpeed,chart.elapsed,chart.startAngle,chart.desiredAngle,EASEIN_EASEOUT);chart.timelinePositionX=calculatePosition(chart.rotationSpeed,chart.elapsed,chart.startPositionX,chart.desiredPositionX,EASEIN_EASEOUT);chart.timelinePositionY=calculatePosition(chart.rotationSpeed,chart.elapsed,chart.startPositionY,chart.desiredPositionY,EASEIN_EASEOUT);}
chart.percentRotated=chart.cameraRotation/chart.MAX_ROTATION_DEGREES;}
for(var i=0;i<chart.events.length;i++){var event=chart.events[i];if(event.elapsed!=-1){event.elapsed+=timestep;if(event.elapsed>=chart.eventSpeed){event.rotationDegrees=event.desiredAngle;event.transitionPercent=1.0;chart.currentEvent=chart.desiredEvent;event.startAngle=event.desiredEvent;event.elapsed=-1;if(event.rotationDegrees==0){unloadTexture(event.texture);}}else{event.rotationDegrees=calculatePosition(chart.eventSpeed,event.elapsed,event.startAngle,event.desiredAngle,EASEIN_EASEOUT);if(event.desiredAngle<0.01){event.transitionPercent=calculatePosition(chart.eventSpeed,event.elapsed,1,0,LINEAR);}else{event.transitionPercent=calculatePosition(chart.eventSpeed,event.elapsed,0,1,LINEAR);}}}}}
var previousTime;var animationStartTime;function tick(currentTime){bdgl.requestId=requestAnimFrame(tick);drawScene();if(currentTime===undefined){if(typeof window.performance==='undefined'){currentTime=Date.now();}else{currentTime=(performance.now()+performance.timing.navigationStart);}
previousTime=currentTime;}
if(animationStartTime===undefined){animationStartTime=currentTime;}
var diff=currentTime-animationStartTime;if(Math.abs(diff)>50000){animationStartTime=currentTime;previousTime=currentTime;}
var diffSec=(currentTime-previousTime)/1000.0;animate(diffSec);previousTime=currentTime;chart.timeFromBeginning+=diffSec;}
function init(){setupShaders();setupBuffers();setupTextures();gl.clearColor(0,0,0,1);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);calculateSizeDependencies();}
function handleContextLost(event){event.preventDefault();cancelRequestAnimFrame(bdgl.requestId);for(var i=0;i<bdgl.ongoingImageLoads.length;i++){bdgl.ongoingImageLoads[i].onload=undefined;}
bdgl.ongoingImageLoads=[];}
function handleContextRestored(event){init()
tick();}
function startup(){canvas=document.getElementById('timelineCanvas');gl=createGLContext(canvas);if(gl===undefined){return false;}
canvas.addEventListener('webglcontextlost',handleContextLost,false);canvas.addEventListener('webglcontextrestored',handleContextRestored,false);bdgl.mvMatrix=mat4.create();bdgl.pMatrix=mat4.create();resizeWindowGL();init();tick();return true;}
function calculateSizeDependencies(){gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);mat4.perspective(bdgl.pMatrix,degToRad(FOV),gl.viewportWidth/gl.viewportHeight,0.001,6.0);gl.useProgram(bdgl.programSimple);if(bdgl.programSimple!==undefined){gl.uniformMatrix4fv(bdgl.programSimple.uniformProjMatrixLoc,false,bdgl.pMatrix);}
gl.useProgram(bdgl.programAlphaTransition);if(bdgl.programAlphaTransition!==undefined){gl.uniformMatrix4fv(bdgl.programAlphaTransition.uniformProjMatrixLoc,false,bdgl.pMatrix);}
var normalizedWidth=canvasSize.x/canvasSize.y;var denominator=Math.tan(degToRad(FOV/2.0));var halfWidthAtWindow=0.5;var farBasedOnWidth=(halfWidthAtWindow/normalizedWidth)/denominator;var halfHeight=0.25;var farBasedOnHeight=halfHeight/denominator;chart.farTimelineZ=Math.max(farBasedOnWidth,farBasedOnHeight);var percentageOfWindowToFill_h=canvasSize.x*-0.00015+1.0;var percentageOfWindowToFill_v=canvasSize.y*-0.0001+0.82;var scaledWidth=bdgl.widestEventWidth/chart.width;var halfWidthAtWindow=scaledWidth/percentageOfWindowToFill_h/2.0;var basedOnWidth=(halfWidthAtWindow/normalizedWidth)/denominator;var scaledHeight=bdgl.tallestEventHeight/chart.height;var halfHeightAtWindow=scaledHeight/percentageOfWindowToFill_v/4.0;var basedOnHeight=halfHeightAtWindow/denominator;chart.closeTimelineZ=Math.max(basedOnWidth,basedOnHeight);}
function resizeWindowGL(){canvasSize.x=$(window).width();canvasSize.y=$(window).height();canvas.style.width=canvasSize.x+"px";canvas.style.height=canvasSize.y+"px";var devicePixelRatio=window.devicePixelRatio||1;canvas.width=canvasSize.x*devicePixelRatio;canvas.height=canvasSize.y*devicePixelRatio;gl=createGLContext(canvas);usingWebGL=gl;calculateSizeDependencies();resizeUserInterface(canvasSize.x,canvasSize.y);}
var blackoutTimerId;var preferedAspectRatio='1_00000';var preferedResolutionStr='L';function preferedChartRatio(){var windowRatio=$(window).width()/$(window).height();var closestDiff=9999;var useRatio=1;for(var i=0;i<prerenderedAspectRatios.length;i++){var thisDiff=Math.abs(prerenderedAspectRatios[i]-windowRatio);if(thisDiff<closestDiff){closestDiff=thisDiff;useRatio=prerenderedAspectRatios[i];}}
return useRatio;}
function preferedResolution(chartWidth,chartHeight){var resolutionInPoints=chartWidth*chartHeight;var resolutionInPixels=resolutionInPoints*window.devicePixelRatio*window.devicePixelRatio;if(resolutionInPixels>900000){return'L';}else if(resolutionInPixels>450000){return'M';}else{return'S';}}
var barThinY;var originalMargin=0;function resizeWindow(){var bodyMargin=$('body').css('margin').replace('px','');var totalSideMargin=bodyMargin*2;if(originalMargin==0&&bodyMargin!=0){originalMargin=bodyMargin;}
var chartDiv=$('#chart');var desiredRatio=preferedChartRatio();var windowRatio=$(window).width()/$(window).height();if(Math.abs(desiredRatio-windowRatio)<0.02){totalSideMargin=0;$('body').css('margin','0');}else{$('body').css('margin',originalMargin+'px');}
var desiredWidthInCSSPixels=$(window).width()-totalSideMargin;var desiredHeightInCSSPixels=$(window).height()-totalSideMargin;var chartRatio=desiredWidthInCSSPixels/desiredHeightInCSSPixels;if(chartRatio<=desiredRatio){desiredHeightInCSSPixels=desiredWidthInCSSPixels/desiredRatio;}else{desiredWidthInCSSPixels=desiredHeightInCSSPixels*desiredRatio;}
var needsUpdate=false;var desiredRatioStr=desiredRatio.toFixed(8).replace('.','_').substring(0,7);if(desiredRatioStr!=preferedAspectRatio){preferedAspectRatio=desiredRatioStr;needsUpdate=true;}
var desiredSizeStr=preferedResolution(desiredWidthInCSSPixels,desiredHeightInCSSPixels);if(desiredSizeStr!=preferedResolutionStr){preferedResolutionStr=desiredSizeStr;needsUpdate=true;}
if(needsUpdate){updateVisibleEventImage();}
chartDiv.css("width",desiredWidthInCSSPixels);chartDiv.css("height",desiredHeightInCSSPixels);$('#chart img.eventImage').css("width",(desiredWidthInCSSPixels+2)+'px').css("height",(desiredHeightInCSSPixels+4)+'px').css('top','-2px').css('left','-1px');resizeUserInterface(desiredWidthInCSSPixels,desiredHeightInCSSPixels);}
function updateVisibleEventImage(){loadImageWithTransition($('#current_image_bottom'),$('#current_image_top'),currentBeelineEvent.attr('id'));}
function loadImageWithTransition(bottomImg,topImg,eventID){if(eventID===undefined){eventID=0;}
var newSrc='i/'+preferedAspectRatio+'/'+preferedResolutionStr+'/event'+eventID+'.jpg';var nextImg='i/'+preferedAspectRatio+'/'+preferedResolutionStr+'/event'+(parseInt(eventID)+1)+'.jpg';window.clearTimeout(blackoutTimerId);if(topImg.hasClass('displaying')){bottomImg.attr('src',newSrc);topImg.removeClass('displaying');blackoutTimerId=window.setTimeout(function(){topImg.attr('src','i/black.gif');},1000);}else{topImg.attr('src',newSrc);topImg.addClass('displaying');blackoutTimerId=window.setTimeout(function(){bottomImg.attr('src','i/black.gif');},1000);}
if(eventID<=lastEventIndex){preload(nextImg);}}
function getEvent(eventID,callback){if(eventID==null){return;}
var event=$('#'+eventID);callback(event.find('.h, .t').clone());}
function selectEvent(eventID,skipMedia){getEvent(eventID,function(html){html=$(html);var currentEventID=currentBeelineEvent.attr('id');if(currentEventID===eventID)return;var direction=(parseInt(currentEventID)<parseInt(eventID))?-1:1;if(eventID==0){currentBeelineEvent=$();updateChartNav();$('#cursor').css('left','-999px');}else{currentBeelineEvent.removeClass('selected');currentBeelineEvent=$('#'+eventID).addClass('selected');updateChartNav();$('#cursor').css('left',currentBeelineEvent.css('left'));}
loadImageWithTransition($('#current_image_bottom'),$('#current_image_top'),eventID);});}
function nextEvent(){if(currentBeelineEvent.attr('id')===undefined){var firstEvent=$('#beeline li:not(.invisible):first');selectEvent(firstEvent.attr('id'));}else{var nextEvent=currentBeelineEvent.nextAll(':not(.invisible):first');var eventID=nextEvent.attr('id');if(eventID===undefined){selectEvent(0);}else{selectEvent(eventID);}}
return false;}
function previousEvent(){if(currentBeelineEvent.attr('id')===undefined){var lastEvent=$('#beeline li:not(.invisible):last');selectEvent(lastEvent.attr('id'));}else{var previousEvent=currentBeelineEvent.prevAll(':not(.invisible):first');var eventID=previousEvent.attr('id');if(eventID===undefined){selectEvent(0);}else{selectEvent(eventID);}}
return false;}
(function($){$.fn.extend({widthTruncate:function(options){var defaults={width:8,after:'…'};options=$.extend(defaults,options);return this.each(function(){truncateWidth=options.width;$(this).text($(this).attr('title')||$(this).text());if($(this).width()>truncateWidth&&$(this).width()>=8){var text=$(this).text();$(this).attr('title',text).addClass('trimmed');$(this).html(options.after);i=0;while($(this).width()+5<truncateWidth){$(this).html(text.substr(0,i)+options.after);i++;}
$(this).html(text.substr(0,i-1)+options.after);}});}});})(jQuery);var BEELINE={unbind:function(){$('#beeline').unbind('.BEELINE');},bind:function(){BEELINE.unbind();$('#beeline').bind('touchstart.BEELINE touchmove.BEELINE',function(event){event.pageX=event.originalEvent.touches[0].pageX;BEELINE.locate(event);});$('#beeline').bind('touchend.BEELINE',function(event){BEELINE.click(event);});$('#beeline').bind('mousemove.BEELINE mouseover.BEELINE',BEELINE.locate);$('#beeline').bind('mouseleave.BEELINE',BEELINE.gone);$('#beeline').bind('click.BEELINE',BEELINE.click);},locate:function(event){var xCoord=event.pageX;var events=$('#beeline li:not(.invisible)');events.removeClass('hover');var hoveredEvent=events.first();events.each(function(){var element=$(this);if(element.offset().left<xCoord){hoveredEvent=element;}else{return false;}});var after=events.filter('#'+hoveredEvent.attr('id')+' ~ li').first();var hit;if(after.length){if((after.offset().left-xCoord)<(xCoord-hoveredEvent.offset().left)){hit=after.addClass('hover');}else{hit=hoveredEvent.addClass('hover');}}else{hit=hoveredEvent.addClass('hover');}
if(!hit.length)return;var maxWidth=parseInt(hit.find('.h h2').css('max-width'))-1;hit.find('.h').find('h2:not(:has(a)), h2 a, .d').widthTruncate({width:maxWidth});var heading=hit.find('.h');var timelineEdge=hit.parent().offset().left+hit.parent().width();var eventEdge=heading.offset().left+heading.width()
if(eventEdge>timelineEdge&&parseInt(hit.css('left'))>50){heading.addClass('right');var greaterWidth=heading.find('h2').width()>heading.find('.d').width()?heading.find('h2').width():heading.find('.d').width();greaterWidth=maxWidth<greaterWidth?maxWidth:greaterWidth;heading.css('margin-left','-'+greaterWidth+'px');}
var thumbnail=heading.find('.t');if(thumbnail.length&&(thumbnail.offset().left<hit.parent().offset().left||(thumbnail.offset().left+thumbnail.width())>(hit.parent().offset().left+hit.parent().width()))){heading.addClass('stacked');}
event.preventDefault();},gone:function(event){$('#beeline li').removeClass('hover');event.preventDefault();},click:function(event){var element=$('#beeline li.hover');if(usingWebGL){selectEventGL(element.attr('id')-1)}else{selectEvent(element.attr('id'));}
if(event.type=="touchend"){$('#beeline li').removeClass('hover');event.stopPropagation();}
event.preventDefault();}};function showNavControls(isVisible){if(isVisible){$('#beeline').animate({bottom:0},250);$('#chart form').css('opacity',1);$('#nav-buttons').toggleClass('faded',false);}else{$('#beeline').animate({bottom:barThinY},250);$('#nav-buttons').toggleClass('faded',true);if($('#search-query').val().length<1){$('#chart form').css('opacity',0);}
fadeTimeline(false);}}
function fadeTimeline(isFaded){if(isFaded){$('#fadeChart').css('opacity',1);}else{$('#fadeChart').css('opacity',0);}}
function search(){var re=new RegExp($('#search-query').val(),'i');$('#beeline li').each(function(){var event=$(this);event.toggleClass('invisible',!re.test(event.text().toLowerCase()));});updateChartNav();return false;}
function handleKeydownGL(event){switch(event.keyCode){case 32:toggle3D();break;case 37:previousEventGL();break;case 39:nextEventGL();break;}}
function handleKeydown(event){switch(event.keyCode){case 32:selectEvent(0);break;case 37:previousEvent();break;case 39:nextEvent();break;}}
function updateChartNav(){var hasCurrentEvent=currentBeelineEvent.size()>0;if(currentBeelineEvent.nextAll(':not(.invisible):first').length||currentBeelineEvent.attr('id')===!hasCurrentEvent){$('#nav-buttons .next').removeClass('disabled');}else{$('#nav-buttons .next').addClass('disabled');}
if(currentBeelineEvent.prevAll(':not(.invisible):first').length){$('#nav-buttons .prev').removeClass('disabled');}else{$('#nav-buttons .prev').addClass('disabled');}
if(currentBeelineEvent.css('left')!=='0px'){$('#cursor').css('left',currentBeelineEvent.css('left'));}}
function switchToEventAtPoint(thisX,thisY)
{var divHeight=$('#chart').height();var divWidth=$('#chart').width();var yPercent=1-thisY/divHeight;var chartScaleRatio=divWidth/chart.width;var scaledChartHeight=chart.height*chartScaleRatio;percentVerticalFill=scaledChartHeight/divHeight;var distanceFromEdgeOfScreenToTimeline=(1.0-percentVerticalFill)/2.0;pX=thisX/divWidth;pY=(yPercent-distanceFromEdgeOfScreenToTimeline)/percentVerticalFill;for(var i=0;i<eventJSON.length;i++){var event=eventJSON[i];var width=event[2]/chart.width;var height=event[3]/chart.height;var x=event[0]/chart.width;var y=event[1]/chart.height-height;if(pX>x&&pX<x+width&&pY>y&&pY<y+height){var eventIndex=eventJSON.length-i;if(usingWebGL){selectEventGL(eventIndex-1)}else{selectEvent(eventIndex);}
return eventIndex;}}
return-1;}
function resizeUserInterface(chartWidth,chartHeight){var currentEvent=$('#beeline li.selected');$('#cursor').css('left',currentEvent.css('left'));if(chartWidth<700){$('#search-query').css('display','none');}else{$('#search-query').css('display','inherit');}
var barHeight=chartHeight*0.09;var maxBarHeight=30;if(barHeight>maxBarHeight){barHeight=maxBarHeight;}
var thinHeight=8;if(usingWebGL){barHeight+=4;thinHeight+=4;}
var listDiv=$('#beeline');listDiv.css("height",barHeight);barThinY=-(barHeight-thinHeight)+'px';var beeline=$('#beeline');if(beeline.css('bottom')==='-40px'){$('#beeline').animate({bottom:barThinY},1500);}else{$('#beeline').css('bottom',barThinY);}
var percentBarHeight=barHeight/chartHeight;var gradientStart=100-(percentBarHeight*2.5*100);var gradientEnd=gradientStart-15;$('#chart #fadeChart').css('background','-webkit-linear-gradient(rgba(0,0,0,0.1) '+gradientEnd+'%, rgba(0,0,0,0.6) '+gradientStart+'%)').css('background','-moz-linear-gradient(rgba(0,0,0,0.1) '+gradientEnd+'%, rgba(0,0,0,0.6) '+gradientStart+'%)').css('background','-ms-linear-gradient(rgba(0,0,0,0.1) '+gradientEnd+'%, rgba(0,0,0,0.6) '+gradientStart+'%)').css('background','-o-linear-gradient(rgba(0,0,0,0.1) '+gradientEnd+'%, rgba(0,0,0,0.6) '+gradientStart+'%)');$('#chart').css('opacity',1);}
var currentBeelineEvent;var usingWebGL=false;var touchStart=0;var touchEndTimerID;$(document).ready(function(){currentBeelineEvent=$('#beeline li.selected');$('#search-query').val('');var devicePixelRatio=window.devicePixelRatio||1;var thumbSrc=(devicePixelRatio==1)?'i/thumbs.jpg':'i/thumbs@2x.jpg'
if(window.WebGLRenderingContext){if(startup()){usingWebGL=true;$(window).resize(function(){resizeWindowGL();});$('#nav-buttons .next').click(nextEventGL);$('#nav-buttons .prev').click(previousEventGL);$(document).keydown(handleKeydownGL);$('body').css('margin',0);preload(thumbSrc);}}
if(!usingWebGL){$('#timelineCanvas').css('display','none');$(window).resize(function(){resizeWindow();});$('#nav-buttons .next').click(nextEvent);$('#nav-buttons .prev').click(previousEvent);$(document).keydown(handleKeydown);resizeWindow();preload('i/black.gif',thumbSrc);}
$('#chart').bind('touchstart touchmove',function(event){window.clearTimeout(touchEndTimerID);showNavControls(true);if(event.type=="touchstart"){var touch=event.originalEvent.touches[0];touchStart=touch.pageX;var clickedEvent=-1;if(!is3D()){var clickedEvent=switchToEventAtPoint(e.pageX-$(this).offset().left,e.pageY-$(this).offset().top);}}else{event.preventDefault();}});$('#chart').bind('touchend',function(event){touchEndTimerID=window.setTimeout(function(){showNavControls(false);},3000);var touch=event.originalEvent.changedTouches[0];var magnitude=Math.abs(touchStart-touch.pageX);if(magnitude>80){if((touchStart-touch.pageX)<0){if(usingWebGL){previousEventGL(event);}else{previousEvent(event);}}else{if(usingWebGL){nextEventGL(event);}else{nextEvent(event);}}}});$('#chart').click(function(e){if(!is3D()){switchToEventAtPoint(e.pageX-$(this).offset().left,e.pageY-$(this).offset().top);}});$('#chart').mouseenter(function(){showNavControls(true);});$('#chart').mouseleave(function(){showNavControls(false);});$('#beeline').mouseenter(function(){fadeTimeline(true);});$('#beeline').mouseleave(function(){fadeTimeline(false);});$('#search-query').bind('touchstart touchend',function(){window.clearTimeout(touchEndTimerID);});$('#search-query').keypress(function(event){return event.keyCode!=13;});$('#search-query').bind('click keyup',search).submit(function(){return false;});BEELINE.bind();});