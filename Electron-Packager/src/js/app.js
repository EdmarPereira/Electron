/**
* This variable contains current list of MSU and VU for selected exhibit.
*/
var valueArr = [];

//Please alter this variable as per the HTTP server URL
var exhibitURL = "exhibit.xml";

/**
* This method used to convert MSU to VU
*/
function convertMSUtoVU(vuMsuValue){
	if(vuMsuValue != null && valueArr != null && valueArr.length > 0 ){
		var msu = parseInt(vuMsuValue);
		var tempVal = 0.0;
		var remainingMsu = msu;
		for(var j=0;j<valueArr.length;j++){
			var currentRow = valueArr[j];
			var low = currentRow.substring(0, currentRow.indexOf('-'));
			var high = currentRow.substring(currentRow.indexOf('-')+1, currentRow.indexOf(','));
			var valueUnits_msu = currentRow.substring(currentRow.indexOf(',')+1, currentRow.length);
			
			if(high == '+'){
				tempVal = tempVal + (remainingMsu * valueUnits_msu);
				break;
			}
			
			if( msu > high ){
				var currentHigh = high;
				if(j !=0){
					currentHigh = (high - low) + 1 ;
				}
				tempVal = tempVal + (currentHigh * valueUnits_msu);
				remainingMsu = msu - high;	
			}else if(msu < high || remainingMsu != 0) {
				tempVal = tempVal + (remainingMsu * valueUnits_msu);
				break;
			}
		}
		/* #1554914 - VUE conv- Differences in calculation between VUE on the web and WLP VU Quick converter - pedmar */
		/* return Math.ceil(tempVal);	 */	
		return Math.ceil(tempVal.toFixed(8));	
	}
}

/**
* This method used to convert MSU to VU for first text box called blue area in the FRD
*/
function convertBlueMSUtoVU(){
	var temp = document.getElementById('blueMSUValue').value;
	
	if( !isNumber(temp)){
		alert("Enter a valid Number!");
	}else{
		if(checkExhibit()&& temp != ''){
			var numberVal = parseInt(temp);
			document.getElementById('blueVUValue').innerHTML = convertMSUtoVU(numberVal);				
		}	
	}	
}

/**
* This method used to convert VU to MSU for 2nd text box and 3rd Text box in the UI. 
* RenderId will differentiate based on request created text box 
*/
function convertVUtoMSU(orignalVal,renderId){
	
	if( !isNumber(orignalVal)){
		alert("Enter a valid Number!");
	} else{
		var tempVal=0,startRange=0,endRange=0;
		var equalValueFound = false;
		if(checkExhibit()){
			var i=1;
			var conditionFlag = true;
			while(conditionFlag){
				tempVal=convertMSUtoVU(i);
				//alert('tempVal : '+tempVal +'i : '+i)
				if(tempVal < orignalVal){
					startRange=i;
				}else if(tempVal == orignalVal && !equalValueFound){
					startRange=i;
					equalValueFound = true;
				}else if(tempVal > orignalVal){
					endRange=i-1;
					conditionFlag = false;
					break;
				}
				i++;
			}
			document.getElementById(renderId).innerHTML=startRange+" to "+endRange;
		}
	}	
}

/**
* To check entered value is valid number or not
*/
function isNumber(val){
	
	if( val == null ){
		return false;
	}else if ( val >= 0 ){
	return true;
	}else if(val == ''){
		return false;
	}else if(isNaN(val)){
		return false;
	}else{
		return true;
	}
}

/**
* This method will get called for add VU to MSU
*/
function addVUtoMSU(){
		
	var oldVUtemp = document.getElementById('greenMSUValue').value;
	var newVUtemp = document.getElementById('greenVUValue').value;
	
	if(	!isNumber(oldVUtemp) ){
		alert("Enter a valid Number!");
	} else if(	!isNumber(newVUtemp) ){
		alert("Enter a valid Number!");
	}else {
		if(checkExhibit() && oldVUtemp != '' && newVUtemp != ''){
			var oldVU=0,newVU=0;
			oldVU=convertMSUtoVU(parseInt(document.getElementById('greenMSUValue').value));
			newVU=parseInt(document.getElementById('greenVUValue').value)+oldVU;
			convertVUtoMSU(newVU,'greentotalUtilizationVal');
		}
	}    
}

/**
* This method will get called for add MSU to MSU
*/
function addMSUtoMSU(){
	
	var oldMSUTemp = document.getElementById('redExistMSUValue').value;
	var newMSUTemp = document.getElementById('redMSUValue').value;
	if(!isNumber(oldMSUTemp) || !isNumber(newMSUTemp) ){
		alert("Enter a valid Number!");
	} else {
		if(checkExhibit() && oldMSUTemp != '' && newMSUTemp != '' ){
			var oldMSU=0,newMSU=0;
			oldMSU=parseInt(document.getElementById('redExistMSUValue').value);
			newMSU=parseInt(document.getElementById('redMSUValue').value);
			var total = (newMSU + oldMSU);
			var totalVUTemp = convertMSUtoVU(total);
			convertVUtoMSU(totalVUTemp,'redtotalUtilizationVal');					
			
			var oldVUforOldMSU = convertMSUtoVU(oldMSU);
			document.getElementById('redrequiredVUValue').innerHTML = totalVUTemp-oldVUforOldMSU;		
		}
	}	
}

/**
* This method will enable or disable all the fields
*/
function checkExhibit(){
	var exhibitFlag=false;
	if(document.getElementById('exhibitSelectBox').value!='Select'){
		exhibitFlag=true;
		for(var i=0;i<document.getElementsByTagName('input').length;i++){
			document.getElementsByTagName('input')[i].disabled=false;
		}
	}
	else{
		for(var i=0;i<document.getElementsByTagName('input').length;i++){
			document.getElementsByTagName('input')[i].disabled=true;
		}
	}
	return exhibitFlag;
}

/**
* This method will get called on change of exhibit select box
*/
function exhibitOnChangeEvent(){
	
	if (window.XMLHttpRequest)
	{
	  xhttp=new XMLHttpRequest();
	} else // for IE 5/6
	{
	  xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhttp.open("GET",exhibitURL,false);
	xhttp.send(null);
	xmlDoc=xhttp.responseXML;
	
	var exhibitValue=document.getElementById('exhibitSelectBox').value;
	var exhibitSelect = document.getElementById('exhibitSelectBox');
	valueArr = [];
	for(var i=0;i<xmlDoc.getElementsByTagName("exhibit").length;i++){
		
		var exhibitTag = xmlDoc.getElementsByTagName("exhibit")[i];
		if( exhibitTag.getElementsByTagName("longname")[0].childNodes[0].nodeValue != null && 
			exhibitTag.getElementsByTagName("longname")[0].childNodes[0].nodeValue == exhibitValue){	
			
			var levelTag = exhibitTag.getElementsByTagName("level");
			
			for(var j=0;j<levelTag.length;j++){
				var lowval = levelTag[j].getElementsByTagName("lowval")[0].childNodes[0].nodeValue;
				var hival = levelTag[j].getElementsByTagName("hival")[0].childNodes[0].nodeValue;
				var vuVal = levelTag[j].getElementsByTagName("vu")[0].childNodes[0].nodeValue;
				valueArr[j] = lowval +'-'+hival+','+vuVal;
			}
		}		
	}
	
	convertMSUtoVU();
	convertBlueMSUtoVU();
	convertVUtoMSU(document.getElementById('orangeVUValue').value,'orangeMSUValue');
	addVUtoMSU();
	addMSUtoMSU();
	// CODE ADDED - 
	if(exhibitValue!=='Select'){
		createConvertionTable(exhibitValue,xmlDoc);
	}else{
		document.getElementById('conversionTable').innerHTML='';
		for(var j=0;j<document.getElementsByClassName('exhibitAbbreviation').length;j++){
			document.getElementsByClassName('exhibitAbbreviation')[j].innerHTML=' MSU';
		}		
	}
	
}

/**
* This method will get called on change of exhibit to create the exhibit table
*/
function createConvertionTable(exhibitValue,xmlDoc){ 
	var exVal=exhibitValue.lastIndexOf(' '); 
	var exhibitCategoryType='';
	var tableobjVal='';
	exhibitCategoryType="VUE"+exhibitValue.substring(exVal).trim();
	var conversionTableObj=document.getElementById('conversionTable');
	
	var x=xmlDoc.getElementsByTagName("exhibit");

	for(var i=0;i<x.length;i++){
		if(exhibitCategoryType==xmlDoc.getElementsByTagName("exhibit")[i].getAttribute('category')){
			var specificExhibit=xmlDoc.getElementsByTagName("exhibit")[i];
			for(var z=0;z<specificExhibit.getElementsByTagName('level').length;z++){
				var rowHeader=findRowHead(z);
				var lowHighValue='';
				if(z==0){
					tableobjVal='<table class="table table-bordered"><tr><th></th><th><center>'+specificExhibit.getElementsByTagName('abbreviation')[0].textContent+'s</center></th><th><center> Value Units/'+specificExhibit.getElementsByTagName('abbreviation')[0].textContent+'s</center></th></tr>';
				}
				tableobjVal=tableobjVal+"<tr><td> <center>"+rowHeader+"</center></td><td><center>"+specificExhibit.getElementsByTagName('lowval')[z].textContent+"-"+specificExhibit.getElementsByTagName('hival')[z].textContent+"</center></td><td> <center>"+specificExhibit.getElementsByTagName('vu')[z].textContent+"</center></td></tr>";
			}
			for(var j=0;j<document.getElementsByClassName('exhibitAbbreviation').length;j++){
				document.getElementsByClassName('exhibitAbbreviation')[j].textContent=" "+specificExhibit.getElementsByTagName('abbreviation')[0].textContent+"s";
			}			
			break;
		}
	}
	conversionTableObj.innerHTML=tableobjVal+"</table>";
	
}

/**
* This method will used to generate first column of exhibit table
*/
function findRowHead(rowNo){
	var rowHead='';
	switch(rowNo){
		case 0:
		rowHead='Base';
		break;

		case 1:
		rowHead='Tier A';
		break;

		case 2:
		rowHead='Tier B';
		break;

		case 3:
		rowHead='Tier C';
		break;

		case 4:
		rowHead='Tier D';
		break;

		case 5:
		rowHead='Tier E';
		break;

		case 6:
		rowHead='Tier F';
		break;

		case 7:
		rowHead='Tier G';
		break;

		case 8:
		rowHead='Tier H';
		break;

		case 9:
		rowHead='Tier I';
		break;

		default:
		rowHead='Base';

	}
	return rowHead;
}

/**
* this method will get called on load of the page.
*/
function processUnits(){
	 checkExhibit();
/*	document.getElementById('themeCombo').selectedIndex = 0;*/
	for(var i=0;i<document.getElementsByTagName('input').length;i++){
		document.getElementsByTagName('input')[i].value=0;
	}
	if (window.XMLHttpRequest)
	  {
	  xhttp=new XMLHttpRequest();
	  }
	else // for IE 5/6
	  {
	  xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	  }
	xhttp.open("GET",exhibitURL,false);
	xhttp.send();
	xmlDoc=xhttp.responseXML;

	var exhibitValue='';

	var exhibitSelect = document.getElementById('exhibitSelectBox');
	
	for(var i=0;i<xmlDoc.getElementsByTagName("exhibit").length;i++){
		var exhibitTag = xmlDoc.getElementsByTagName("exhibit")[i];
		var exhibitLongVal = exhibitTag.getElementsByTagName("longname")[0].childNodes[0].nodeValue;
		var exhibitNameVal = exhibitTag.getElementsByTagName("name")[0].childNodes[0].nodeValue;
		var exhibitLabelVal = exhibitTag.getElementsByTagName("label")[0].childNodes[0].nodeValue;
		
		var opt = document.createElement("option");
		opt.value = exhibitLongVal;
		opt.text = exhibitNameVal + " " + exhibitLabelVal;
		
		exhibitSelect.add(opt);
		
		var levelTag = exhibitTag.getElementsByTagName("level");
		//valueArr = new 
		for(var j=0;j<levelTag.length;j++){
			var lowval = levelTag[j].getElementsByTagName("lowval")[0].childNodes[0].nodeValue;
			var hival = levelTag[j].getElementsByTagName("hival")[0].childNodes[0].nodeValue;
			var vuVal = levelTag[j].getElementsByTagName("vu")[0].childNodes[0].nodeValue;
			
			valueArr[j] = lowval +'-'+hival+','+vuVal;
			//break;
		}
		//break;
	}
	
	
	for(var j=0;j<document.getElementsByClassName('exhibitAbbreviation').length;j++){
			document.getElementsByClassName('exhibitAbbreviation')[j].innerHTML=' 0 to 0 MSU';
	}		
	
	
}

