// Roulette Wheel from https://codepen.io/barney-parker/pen/OPyYqy/?editors=0010
// Variable format
// Type, Global/Public/Local, Variable e.g. spv  (string, public, variable)
// B = Boolean
// S = String
// N = Number
// A = Array

let npvWinningNumber      = 0
   ,apvRouletteNumbersArr = []
   ,allCoins              = document.querySelectorAll('.chips')
   

// Create roulette board numbers
for (let i = 0; i < allCoins.length; i++) {
  allCoins[i].addEventListener('click',setBetAmountFnc); 
}

for (let i = 0; i <= 36; i++) {
  apvRouletteNumbersArr.push(i);
}

let startAngle      = 0
   ,arc             = Math.PI / (apvRouletteNumbersArr.length / 2)
   ,spinTimeout     = null
   ,spinArcStart    = 10
   ,spinTime        = 0
   ,spinTimeTotal   = 0
   ,ctx
   ,outsideRadius   = 200
   ,textRadius      = 160
   ,insideRadius    = 125
   ,canvas          = document.getElementById("canvas")
   ,bpvCoinSelected = false
   ,npvBetAmount    = 0
   ,epvWinningAmount = document.getElementById("winningAmount")
   ,epvBetValue     = document.getElementById("betDisplay")
   ,npvBankId       = document.getElementById('bankTotal')
   ,npvBankTotal    = parseInt(npvBankId.textContent)
   ,npvLeftCount    = 0  
   ,npvAppendCount  = 0
   ,npvOldBet
   ,apvWinningNumbers = []
   ,recentWinCounter = 0
   ,npvRemoveCount   = 0
   ,epvAllNumbers;    

function canvasInitFnc(){
  ctx = canvas.getContext("2d");
  // Clears down winning number after each spin. else numbers overlap
  ctx.clearRect(0,0,500,500);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.font = '15px Century Gothic';
}


function calcWheelFnc(index){

  let angle = startAngle + index * arc;                       
  // Background colour roulette numbers
  ctx.fillStyle = boardColourFnc(index);
  ctx.beginPath();
  ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
  ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
  ctx.stroke();
  ctx.fill();
  ctx.save();
  // Wheel number colour  
  ctx.fillStyle = "white";
  ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius, 
                250 + Math.sin(angle + arc / 2) * textRadius);
  ctx.rotate(angle + arc / 2 + Math.PI / 2);
  let text = apvRouletteNumbersArr[index];
  ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
  ctx.restore();
}

function boardColourFnc(npvLoopCount){

  let slvFillColour;
  
  if (npvLoopCount == 0){
    slvFillColour = 'green';
  }else if(npvLoopCount % 2 == 0){
    slvFillColour = 'red';  
  }else{
    slvFillColour = 'black'
  }

  return slvFillColour;
}  

function drawArrowFnc(){  
    ctx.fillStyle = "gold";
    ctx.beginPath();
    ctx.moveTo(250 - 4, 250 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 250 - (outsideRadius + 5));
    ctx.lineTo(250 + 4, 250 - (outsideRadius - 5));
    ctx.lineTo(250 + 9, 250 - (outsideRadius - 5));
    ctx.lineTo(250 + 0, 250 - (outsideRadius - 13));
    ctx.lineTo(250 - 9, 250 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 250 - (outsideRadius - 5));
    ctx.lineTo(250 - 4, 250 - (outsideRadius + 5));
    ctx.fill();
}

function easeOut(t, b, c, d) {
  let ts = (t/=d)*t
     ,tc = ts*t;

  return b+c*(tc + -3*ts + 3*t);
} 


function wheelMathFnc(){
  let degrees = startAngle * 180 / Math.PI + 90
     ,arcd = arc * 180 / Math.PI
     ,index = Math.floor((360 - degrees % 360) / arcd);

     return index;
}


function drawRouletteWheelFnc() {
  
  canvasInitFnc(); 

  if (canvas.getContext) {         
    for(let i = 0; i < apvRouletteNumbersArr.length; i++) {
       calcWheelFnc(i)
    }
  }
  drawArrowFnc();
  epvAllNumbers = document.querySelectorAll('.innerNumbers')
}

function spin() {
  
  // Check bet is placed before spinning
  if (parseInt(epvBetValue.innerHTML) > 0){

    spinAngleStart = Math.random() * 10 + 10;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3 + 4 * 1000;    
    // set winning value to 0
    epvWinningAmount.innerHTML = 0
    rotateWheel();  

  } else{
    alert('You must place a bet before spinning the wheel')
  }

}

function rotateWheel() {
  
  // Spin time of wheel. lower takes longer. 3 takes longer than 300
  spinTime += 30;

  if(spinTime >= spinTimeTotal) {    
    stopRotateWheel();    
    return;
  }

  let spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);  
  drawRouletteWheelFnc();    
  spinTimeout = setTimeout('rotateWheel()', 10);  

}

function stopRotateWheel() {
  clearTimeout(spinTimeout);
  checkWinnerFnc(apvRouletteNumbersArr[wheelMathFnc()])       
}

function splitNumberFromIdFnc(spvElementId){  
  return spvElementId.substring(spvElementId.toString().lastIndexOf('_')+1)  
}

function checkWinnerFnc(npvWinNum){

  /*
     1. Loop through all user bets stored in array [betid, betvalue]
     2. Add win value and add to new bank total
     3. Display winning number, add to array of winnings and reset game
  */
  
  npvWinningNumber = npvWinNum  

  // 1. 
  let alvBetsArr       = returnAllBetsFnc()
     ,nlvWinValue      = 0
     ,nlvWinMultiplier = 0
     ,nlvUserBetSplit  = 0
     ,alvAllWinArea    = []

  
  for (let i = 0; i < alvBetsArr.length; i++) {    

    nlvUserBetSplit = parseInt(splitNumberFromIdFnc(alvBetsArr[i][0]));

    // Check if number won
    if (nlvUserBetSplit == npvWinningNumber){
       // 2. 
       nlvWinValue += alvBetsArr[i][1] * apvRouletteNumbersArr.length              
    }
    
     // Check if side bets won. if zero then no side bets can be won
     if(checkSideBetsFnc(npvWinningNumber).includes(nlvUserBetSplit) && npvWinningNumber != 0){
          // If betting on row where ids (37,38,39) then * 3. else user bet on bottom 6 where multiplier is * 2
          nlvWinMultiplier = nlvUserBetSplit > 39 ? 2 : 3;
          nlvWinValue      += alvBetsArr[i][1] * nlvWinMultiplier;    
     
     }     
  }

  // Update bank and winning value
  epvWinningAmount.innerHTML = nlvWinValue     
  npvBankId.innerHTML = (npvBankTotal += nlvWinValue)

  // Only show if number is not zero
  if (npvWinningNumber != 0){
    alvAllWinArea = checkSideBetsFnc(npvWinningNumber);
    alvAllWinArea.push(npvWinningNumber);
    pulseWinAreasFnc(alvAllWinArea)
  }
  
  
  // 3. 
  printWinningNumFnc(npvWinNum) 
  recentWinningsFnc(npvWinNum)
  initFnc()
     
}

function pulseWinAreasFnc(apvWinningNums){
    /*
       1. Apply pulse class to all areas that won
       2. Wait then remove class
    */

    // 1.
     for (let i = 0; i < apvWinningNums.length; i++) {
        let elvElement =  document.getElementById('numbers_'+apvWinningNums[i])
        elvElement.classList.add('pulseTextCls')
     }

     // 2.
     setTimeout(function(){
      
      for (let i = 0; i < epvAllNumbers.length; i++) {
        let elvElement = document.getElementById(epvAllNumbers[i].id)        
        elvElement.classList.remove('pulseTextCls')
      }
     }, 5000)

}

  function checkSideBetsFnc(npvWinningNumber){

    /*
       Function to return array of all side bets

       1. what row wins.
       2. odd/even
       3. black / red
       4. 1 to 18 / 19 to 36
       
    */

     let alvWinningSideBets = [];       

     
     //1.
     if ( (npvWinningNumber - 1) % 3 == 0){
       alvWinningSideBets.push(37) // 1st Row
     }else if ( (npvWinningNumber - 2) % 3 == 0){
       alvWinningSideBets.push(38) // 2nd Row
     }else{
       alvWinningSideBets.push(39) // 3rd Row
     }

     // 2. 
     if ( npvWinningNumber % 2 == 0){
        alvWinningSideBets.push(41) // even
     }else{ 
      alvWinningSideBets.push(44) // odd
     }

     // 3. function already existed which determined red or black so re-used it
    if (boardColourFnc(npvWinningNumber) == 'red'){
      alvWinningSideBets.push(42) // red
    } else{
      alvWinningSideBets.push(43) // black
    }

    // 4.
    if (npvWinningNumber < 19){
      alvWinningSideBets.push(40) // 1 to 18
    }else{
      alvWinningSideBets.push(45) // 19 to 36
    }

    return alvWinningSideBets;
    

}

  

function recentWinningsFnc(npvNum){

/*
   1. Add winning number to array
   2. Get last number from array and append recent numbes. if too big remove first element
*/

  //1.  
  apvWinningNumbers.push(npvNum)
  
  
  // 2. 
  let nlvLastNum = apvWinningNumbers[apvWinningNumbers.length - 1]  
  let nlvParent = document.getElementById('recentNumbers')
  
  if(apvWinningNumbers.length > 18){
    document.getElementById('recentNumbers_'+npvRemoveCount).remove()
    npvRemoveCount++
  }

  createElementFnc(nlvParent,'li', nlvLastNum, 'recentNumbers_'+recentWinCounter, 'recentWinningCls', null, nlvLastNum, null, boardColourFnc(npvNum))    
  
  recentWinCounter++
}

function printWinningNumFnc(npvWinNum){
  ctx.save();
  ctx.font = 'bold 30px Helvetica, Arial';  
  ctx.fillText(npvWinNum, 250 - ctx.measureText(npvWinNum).width / 2, 250 + 10);
  ctx.restore();
}

function createElementFnc(spvParent, spvType, spvTextNode, spvId, spvClass, bpvEvent, spvValue, spvStyleValue, spvColour){

  let elvLiElement = document.createElement(spvType)    
     ,elvNode
  
  if (spvTextNode != null){
    elvNode    = document.createTextNode(spvTextNode);
  }     

  if (bpvEvent == true){
    elvLiElement.addEventListener('click',getBetNumberFnc);   
  }
  
 if (spvStyleValue != null){  
  elvLiElement.style.left = spvStyleValue
 }

 if (spvId != null){
  elvLiElement.id = spvId
 }


 if (spvColour != null){
  elvLiElement.style.backgroundColor = spvColour
 }
  
  elvLiElement.classList.add(spvClass)   
  elvLiElement.value = spvValue;  
  
  elvLiElement.appendChild(elvNode);   

  
  spvParent.append(elvLiElement);
  
  

}

function returnThirdTxtFnc(npvIndex){

  if(npvIndex == 1){
    return '1st'
  }else if(npvIndex == 2){
    return '2nd'
  }else{
    return '3rd'
  }

}

function returnPercent50Fnc(npvIndex){

  if(npvIndex == 1){
    return '1 to 18'
  }else if(npvIndex == 2){
    return 'EVEN'
  }else if(npvIndex == 3){
    return 'RED'
  }else if(npvIndex == 4){
    return 'BLACK'
  }else if(npvIndex == 5){
    return 'ODD'
  }
  else{
    return '19 to 36'
  }

}


function drawNumbersOnBoard(){

  let elvParent       = document.querySelector('.outerTable');
     

  for (let i = 0; i < apvRouletteNumbersArr.length; i++) {
    createElementFnc(elvParent, 'li', apvRouletteNumbersArr[i], 'numbers_'+i, 'innerNumbers', true, 0, null, boardColourFnc(apvRouletteNumbersArr[i]))   
  }

  drawAdditionalBets(elvParent)


}

function activeClassFnc(){


  removeActiveClassFnc('.innerNumbers','active')

  let nlvStartWith = parseInt(this.id.substring(0,1)) - 3;
  

  for(i = 0; i < 12 ; i++){          
      let element = document.getElementById("numbers_"+ (nlvStartWith += 3) )      
      element.classList.add("active");  
  }

 // remove hover after 2 seconds
  setTimeout(function(){
        removeActiveClassFnc('.innerNumbers','active')
      },2000)
   
}


function drawAdditionalBets(epvParent){

  for (let i = 1; i <= 3; i++){       
    createElementFnc(epvParent, 'li',returnThirdTxtFnc(i),'numbers_'+ (36 + i) , 'innerNumbers', true, 0, null, 'gold');    
  } 

  for (let i = 1; i <= 6; i++){       
    createElementFnc(epvParent, 'li',returnPercent50Fnc(i),'numbers_'+ (39 + i) , 'innerNumbers', true, 0, null, 'gold')
  } 

}

function setBetAmountFnc(){  

  /*
     1. Remove all active classes
     2. Add class to current coin
     3. Set bet amount
  */

   let activeClass = document.getElementById(this.id);
   // 1.
   removeActiveClassFnc('.chips','active')
   // 2.
   activeClass.classList.add("active");   
   // 3.
   npvBetAmount = this.value;   
}

function removeActiveClassFnc(spvClass,spvClassName){

  /*
     1. Define coin ID's
     2. Loop through and remove active class from all

  */

  // 1.  
  let removeClassArr = document.querySelectorAll(spvClass)    

  // 2.
  for (let i = 0; i < removeClassArr.length; i++) {
      let removeClass = document.getElementById(removeClassArr[i].id)
      removeClass.classList.remove(spvClassName)
   }

}

function checkDebitBankFnc(){  
  let nlvDebitAmount = bankDebitFnc(npvBankTotal, npvBetAmount);  
  return (nlvDebitAmount >= 0);
}

function getBetNumberFnc(){


  if (checkDebitBankFnc()){         
     appendBetDivFnc(this)
  }else{
    alert("You don't have sufficient funds for this bet")
  }

returnAllBetsFnc()
}

function returnChipColour(npvChipValue){
  /*
     1. Get ID of chip based on value
     2. Return background colour. used for when appending chip in div
  */
  let elvChip = document.getElementById('chips_'+npvChipValue)  
  return elvChip.style.backgroundColor
}


function appendBetDivFnc(element){

 /*
    1. Set rouletee number html val element. value = value + new bet amount
    2. Append div inside roulette number, shows user they placed bet    
    3. Update bank total
    4. Update append counter if betting on same square
    5. varibale for storing last square bet on
 */

 // 1.
     element.value         += npvBetAmount;           
     
 // 2.     
     createElementFnc(element, 'div', npvBetAmount, null, 'betAppend', false, npvBetAmount, checkDivAppendFnc(element)+'px', returnChipColour(npvBetAmount))            
 // 3.     
     npvBankTotal          -= npvBetAmount;               
     epvBetValue.innerHTML = parseInt(epvBetValue.innerHTML) + npvBetAmount
     npvBankId.innerHTML   = npvBankTotal
 // 4.     
     npvAppendCount++
 // 5    
     npvOldBet = element.id;
}



function checkDivAppendFnc(element){

  // count appended divs in element
  let nlvParent = document.getElementById(element.id)
     ,nlvClassCount = nlvParent.getElementsByClassName('betAppend').length  
     ,nlvClassLimit = 7

    if (nlvClassCount >= nlvClassLimit){
      alert('You cannot have more than '+nlvClassLimit+' bets in an area')
    }else{

      // if appending more than 1 div and inside the same area add 25px left
      if (npvAppendCount > 0 && npvOldBet == element.id){
        return (npvLeftCount += 30)            
      }else{
        npvAppendCount = 0
        npvLeftCount   = 0
        return         0      
      }
    }        
}

function bankDebitFnc(npvBankAmount, npvCreditAmount){
  return npvBankAmount -= npvCreditAmount
}

function bankCreditFnc(npvBankAmount, npvCreditAmount){  
  return npvBankAmount += npvCreditAmount
}

function returnAllBetsFnc(){

  let slvId     = '#numbers_'
     ,alvBetArr = []

  for(i = 0; i < epvAllNumbers.length; i++){
      
      let betId = document.querySelector(slvId+i)
      
      if (betId.value > 0){        
        // [bet area, value]
        alvBetArr.push([betId.id, betId.value])
      }      
  }
  return alvBetArr;
}


function getArrIdxFnc(apvArr, spvId){
  for (let i = 0; i < apvArr.length; i++) {
    if(apvArr[i] == spvId){
      return i;
    }
  }
}


function initFnc(){

  /* 
     1. Reset value of roulette numbers to 0      
     2. clear bets remove classes
     3. Remove active coin classes
     4. Reset counters back
     5. If user has bet but not span the wheel. reset bank total. Then set bet amount to 0
  */


  // 1. 
  let htmlBetVal           = document.getElementsByClassName('innerNumbers')    

  for (i = 0; i < htmlBetVal.length; i++){
    htmlBetVal[i].value = 0
  }
 
 
 // 2. 
 const removeElements = (elms) => elms.forEach(el => el.remove());
 removeElements( document.querySelectorAll(".betAppend") );      

 // 3.
 removeActiveClassFnc('.chips','active')

 // 4. 
 npvLeftCount = 0
 npvAppendCount = 0
 npvOldBet = ''

 // 5. 
 epvBetValue.innerHTML      = 0 

}

function resetBetFnc(){
  /*
     1. User gets their bet back
     2. reset game
  */
  let nlvCurrentBet = parseInt(epvBetValue.innerHTML)
     ,nlvNewBankTotal = npvBankTotal += nlvCurrentBet;

  npvBankId.innerHTML   = nlvNewBankTotal;

  initFnc()   
  
}


drawNumbersOnBoard()
drawRouletteWheelFnc();
document.getElementById('spinBtn').addEventListener('click',spin)
document.getElementById('resetBtn').addEventListener('click',resetBetFnc)