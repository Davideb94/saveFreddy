
$('#fullScreenVideo').YTPlayer({
		fitToBackground: true,
		videoId: '8Fw3OyQbfRM'
});

var game = {};

game.running = false;

game.startGame = function(){
	
	game.reset();
	hideExplanation();
	progressBar.startTimer();
	game.startMassage();

}

game.reset = function(){
	game.breaths = 0;
	game.massages = 0;
	game.step = 0;
	game.rightFrequency = true;
	game.badFrequncyTimes = 0;
	game.lastMassage = 0;
	game.massageInterval = '';
	game.running = true;
	$("#heartCounter").html("");
	jQuery('#bolt').addClass('reallyHide');
	jQuery('#finalGood').addClass('reallyHide');
	jQuery('#finalBad').addClass('reallyHide');



}

game.endGame = function(){

	game.evaluateFrequency();

	if( game.massages == 60 && game.breaths == 4 && game.rightFrequency ){
		showAED();
	}else{
		slideToBadFinal();
	}

	game.running = false;
	showExplanation();
	//evaluate

}

game.evaluateFrequency = function(){
	if( game.badFrequncyTimes > 10 ){
		game.rightFrequency = false;
	}
}

game.checkLastMassageSlow = function(){

	if ( getMilliseconds() - game.lastMassage > 1000){
		game.badFrequncyTimes++;
		heartMessage("<b>FASTER</b>");
	}else{
		heartMessage("");

	}
	 
}

game.checkLastMassageFast = function(){

	if ( getMilliseconds() - game.lastMassage < 300){
		game.badFrequncyTimes++;
		heartMessage("<b>SLOWER</b>");
	}else{
		heartMessage("");

	}

}

function slideToGoodFinal(){
    hideAED();
    jQuery('#finalGood').removeClass('reallyHide');
    jQuery('#bolt').removeClass('reallyHide');
	jQuery("#finalGoodLink").click();
}
function slideToBadFinal(){
    
    jQuery('#finalBad').removeClass('reallyHide');
	jQuery("#finalBadLink").click();

}

game.startMassage = function(){
	showMassage();
	hideBreath();
	game.massageInterval = setInterval( game.checkLastMassageSlow, 500 );
}

game.endMassage = function(){
	game.step++;
	clearInterval( game.massageInterval );

	showBreath();
	game.startBreath();
}

game.startBreath = function(){
	hideMassage();


}

game.endBreath = function(){
	game.step++;

	if( game.step < 4 ){
		showMassage();
		game.startMassage();
		
	}else{
		game.endGame();
	}
}

game.addBreath = function(){
	if( game.step % 2 != 0){

		game.breaths++;
		if( game.breaths % 2 == 0 ){
			game.endBreath();
		}
	}

}

game.addMassage = function(){

	if( game.step % 2 == 0){
		game.checkLastMassageFast();
		$("#heartCounter").html(game.massages+1);
		game.massages++;
		game.lastMassage = getMilliseconds();

		if( game.massages % 30 == 0){
			if( game.step == 4 ){
				game.endGame();
			}else{
				game.endMassage();
			}
		}
	}
}

function getMilliseconds(){
	var d = new Date();
	return d.valueOf();
}

function hideExplanation(){

	$("#explanation").addClass("reallyHide");

}				
function showExplanation(){

	$("#explanation").removeClass("reallyHide");

}				
function hideAED(){

	$("#aed").addClass("reallyHide");

}				
function showAED(){

	$("#aed").removeClass("reallyHide");

}



function hideBreath(){
	$("#breathBox").addClass("opaque");
}
function showBreath(){
	$("#breathBox").removeClass("opaque");
}
function hideMassage(){
	$("#hearthBox").addClass("opaque");
}
function showMassage(){
	$("#hearthBox").removeClass("opaque");
}

function heartMessage( message ){
	$("#heartMessage").html(message);
}

function addRedHearth(e) {
    e = e || window.event;

    if(e.keyCode==32 && game.running && game.step % 2 == 0){
    	e.preventDefault();
    	jQuery("#hearthBox").addClass("red");
    	game.addMassage();
    }
}

function removeRedHearth(e){
	e = e || window.event;
    if(e.keyCode==32){

	    e.preventDefault();
     	jQuery("#hearthBox").removeClass("red");

    }
}

document.onkeydown = addRedHearth;
document.onkeyup = removeRedHearth;


var progressBar = {};

progressBar.startTimer = function() {

	progressBar.bar = document.getElementById("myBar");   
	progressBar.width = 0;
	progressBar.intervalId = setInterval(progressBar.manageProgressBar, 600);
}

progressBar.manageProgressBar = function() {

		if ( progressBar.width == 100) {
			clearInterval( progressBar.intervalId );
			progressBar.endTimerListener();
		} else {
			progressBar.width++; 
			progressBar.bar.style.width = progressBar.width + '%'; 
		}
}

progressBar.endTimerListener = function(){
	game.endGame();
}

navigator.getUserMedia = navigator.getUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia;

if (navigator.getUserMedia) {
	navigator.getUserMedia({
			audio: true
		},
		function(stream) {
			audioContext = new AudioContext();
			analyser = audioContext.createAnalyser();
			microphone = audioContext.createMediaStreamSource(stream);
			javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

			analyser.smoothingTimeConstant = 0.8;
			analyser.fftSize = 1024;

			microphone.connect(analyser);
			analyser.connect(javascriptNode);
			javascriptNode.connect(audioContext.destination);

			canvasContext = document.getElementById('breath');
			canvasContext = canvasContext.getContext("2d");

			javascriptNode.onaudioprocess = function() {
					var array = new Uint8Array(analyser.frequencyBinCount);
					analyser.getByteFrequencyData(array);
					var values = 0;

					var length = array.length;
					for (var i = 0; i < length; i++) {
						values += (array[i]);
					}

					var average = values / length;
					if( average > 110 && game.running ){

						setTimeout( game.addBreath(), 1000 );
						

					}
					//console.log(Math.round(average - 40));

					canvasContext.clearRect(0, 0, 1000, 1000);
					canvasContext.fillStyle = '#BadA55';
					canvasContext.fillRect(0, 100 - average, 1000, 1000);
					

				} // end fn stream
		},
		function(err) {
			console.log("The following error occured: " + err.name)
		});
} else {
	console.log("getUserMedia not supported");
}