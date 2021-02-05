"use strict";

import MathGraph from "./Canvas.js";

// Wenn alles geladen ist
window.onload = () => {
  // Array für den Zugriff auf die verschiedenen Funktionen
  const modelArr = ['none', 'invertiert', 'mitteln', 'schwellwert', 'Graubild',
        'Bild ebnen', 'Farbkanal Rot', 'Farbkanal Grün', 'Farbkanal Blau',
        'Farbkanal RG', 'Farbkanal GB', 'Farbkanal BR', 'LUT'];
  // Zugriff auf die DOM-Elemente
  let canvasContainer = document.getElementById('canvas-container');
  let imgCanvas = document.getElementById('kopie');
  let chooseDatas = document.querySelectorAll("#chooseType input");
  let model = document.getElementById('model');
  let selectContainer = document.getElementById("toDo");
  let rangeContainer = document.getElementById('range-container');
  let img, bildDaten, pfad = [], json, storagePosition = localStorage.length;
  let imgDatenObjekt = {
    width: "",
    height: "",
    data: []
  };
  let saveJsonBtn = document.getElementById("saveJson");
  let storage = document.getElementById("storeCanvas");
  let nextStorage = document.getElementById("nextStorage");
  let prevStorage = document.getElementById("prevStorage");
  let clearStorage = document.getElementById("clearStorage");
  // Canvas Context einstellen
  let cv = imgCanvas.getContext('2d');


  // Canvas-Feld leeren Funktion
  function clearCanvas(){
    cv.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
  }

  // Eventlistener, um die Daten aus Canvas in Json abzupacken
  saveJsonBtn.addEventListener("click", saveJson);
  storage.addEventListener("click",function(){
    setTimeout(saveInStorage(),1000);});
  nextStorage.addEventListener("click",function(){
    moveInStorage(this.value); });
  prevStorage.addEventListener("click",function(){
    moveInStorage(this.value); });
  clearStorage.addEventListener("click",function(){
    localStorage.clear();
    setTimeout(chooseDataType(),10);
  });
  // addEventListener für die Radiobuttons
  chooseDatas[0].addEventListener("change", chooseDataType);
  chooseDatas[1].addEventListener("change", chooseDataType);

  // Das Selectfeld (model) bekommt hier die verschiedenen Optionen zugewiesen
  modelArr.map((user, i) => {
    let option = document.createElement('option');
    option.value = user;
    option.appendChild(document.createTextNode(user));
    model.appendChild(option);
  });

  // Wenn das Select-Element verlassen wird, soll die entsprechende Funktion aufgerufen werden
  model.addEventListener('change', function(){
    showModel();
  }); //Beende model wählen

  // Wenn man mit Bildern arbeiten möchte -> Bildpfade und img
  // Ansonsten mit JSON-Data
  chooseDataType();
// ################################################################################
// Bildverarbeitungsalgorithmen

// Funktion, um die Bilddaten zu invertieren
function invertImage (){
  console.time("invertImage");
  let neuesImg = cv.createImageData(imgCanvas.width, imgCanvas.height);
  // Für die Zeilen -> Höhe
  let i = 0;
  for(let z = 0; z < bildDaten.r.length; z++){
    // Für die Spalten -> einzelne Werte
    for(let s = 0; s < imgCanvas.width; s++){
      // Werte invertieren und in Daten einfügen
      neuesImg.data[i] = 255 - bildDaten.r[z][s];
      neuesImg.data[i + 1] = 255 - bildDaten.g[z][s];
      neuesImg.data[i + 2] = 255 - bildDaten.b[z][s];
      neuesImg.data[i + 3] = bildDaten.a[z][s];
      i += 4;
    }
  }
  // invertiertes Image einfügen
  getNewImageObj(neuesImg);
  console.timeEnd("invertImage");
} //Beende Invertieren-Funktion

// ################################################################################

function mittelImage(size) {
  if(imgCanvas.width - size < 30) return;
  if(rangeContainer.children.length != 1) {
    erzeugeRange(1, 1, 25);
  }
  console.time("mittelImage");
  let mittelWerte = {
    mwR: 0,
    mwG: 0,
    mwB: 0,
    mwA: 0
  }
  let neuesImg = cv.createImageData(imgCanvas.width-size, imgCanvas.height-size);
  let i = 0;
  for(let z = 0; z < bildDaten.r.length - size; z++){
    // Für die Spalten -> einzelne Werte
    for(let s = 0; s < imgCanvas.width - size; s++){
      for(let n = 0; n < size; n++){
        // Für die Spalten -> einzelne Werte
        for(let m = 0; m < size; m++){
          // Werte summieren und Mittelwert bilden
          mittelWerte.mwR += (bildDaten.r[z + n][s + m] / (size*size));
          mittelWerte.mwG += (bildDaten.g[z + n][s + m] / (size*size));
          mittelWerte.mwB += (bildDaten.b[z + n][s + m] / (size*size));
          mittelWerte.mwA += (bildDaten.a[z + n][s + m] / (size*size));
        }
      } //Ende n x m Schleife
      // Werte invertieren und in Daten einfügen
      neuesImg.data[i] = mittelWerte.mwR;
      neuesImg.data[i + 1] = mittelWerte.mwG;
      neuesImg.data[i + 2] = mittelWerte.mwB;
      neuesImg.data[i + 3] = mittelWerte.mwA;
      mittelWerte.mwR = 0;
      mittelWerte.mwG = 0;
      mittelWerte.mwB = 0;
      mittelWerte.mwA = 0;
      i += 4;
    }
  } //Ende s x z Schleife
  getNewImageObj(neuesImg);
  console.timeEnd("mittelImage");
} //Ende Mitteln

// ################################################################################

//Schwelwerte definieren
function schwellImg(minWert, maxWert) {
  if(rangeContainer.children.length != 2)
    erzeugeRange(2, 0, 255);
  console.time("schwellwertImg");
  let neuesImg = cv.createImageData(imgCanvas.width, imgCanvas.height);
  // Für die Zeilen -> Höhe
  let i = 0;
  for(let z = 0; z < bildDaten.r.length; z++){
    // Für die Spalten -> einzelne Werte
    for(let s = 0; s < imgCanvas.width; s++){
      // Werte invertieren und in Daten einfügen
      let mw = (bildDaten.r[z][s] + bildDaten.g[z][s] + bildDaten.b[z][s])/3
      if( mw >= minWert && mw <= maxWert)
          {
            neuesImg.data[i] = 230;
            neuesImg.data[i + 1] = 230;
            neuesImg.data[i + 2] = 230;
          }
          neuesImg.data[i + 3] = 255;

      i += 4;
    }
  }
  getNewImageObj(neuesImg);
  console.timeEnd("schwellwertImg");
} //Ende Schwellwerte

// ################################################################################

// Funktion, um Graubild auszugeben, mit mittleren Grauwerten
function mwGreyImage() {
  console.time("MW Graubild");
  let neuesImg = cv.createImageData(imgCanvas.width, imgCanvas.height);
  // Für die Zeilen -> Höhe
  let i = 0;
  for(let z = 0; z < bildDaten.r.length; z++){
    // Für die Spalten -> einzelne Werte
    for(let s = 0; s < imgCanvas.width; s++){
      // Werte in Grauwert umwandeln und in Daten einfügen
      let gray = Math.round((bildDaten.r[z][s] + bildDaten.g[z][s] + bildDaten.b[z][s]) / 3);
        neuesImg.data[i] = gray;
        neuesImg.data[i + 1] = gray;
        neuesImg.data[i + 2] = gray;
        neuesImg.data[i + 3] = bildDaten.a[z][s];
      i += 4;
    }
  }
  getNewImageObj(neuesImg);
  console.timeEnd("MW Graubild");
} //Beende MW Graubild

// ################################################################################

//Graubilder ebnen
function ebneImage() {
  console.time("Ebnen");
  let histogramm = [];
  let kumHistogramm = [];
  let normHistogramm = [];
  let xAchse = [];
  // erstelle Histogramm-Array
  for(let i = 0; i < 256; i++){
    histogramm.push(0);
    kumHistogramm.push(0);
    normHistogramm.push(0);
    xAchse.push(i);
  }
  let neuesImg = cv.createImageData(imgCanvas.width, imgCanvas.height);
  // Für die Zeilen -> Höhe
  let i = 0;
  for(let z = 0; z < bildDaten.r.length; z++){
    // Für die Spalten -> einzelne Werte
    for(let s = 0; s < imgCanvas.width; s++){
      // Werte in Grauwert umwandeln und in Daten einfügen
      let gray = Math.round((bildDaten.r[z][s] + bildDaten.g[z][s] + bildDaten.b[z][s]) / 3);
      // Histogramm erstellen -> für jeden Wert die Anzahl der Vorkommen in ein Array eintragen
        histogramm[gray] += 1;
        neuesImg.data[i] = gray;
        neuesImg.data[i + 1] = gray;
        neuesImg.data[i + 2] = gray;
        neuesImg.data[i + 3] = bildDaten.a[z][s];
      i += 4;
    }
  }
  // Werte umrechnen zum kumulierten Histogramm
  for(let i = 0; i < kumHistogramm.length; i++){
    if(i == 0){
      kumHistogramm[i] = histogramm[i];
    } else{
      kumHistogramm[i] = histogramm[i] + kumHistogramm[i-1];
    }
  }
  // Umrechnung auf normiertes Histogramm
  let letzerWertKH = kumHistogramm[kumHistogramm.length-1];
  for(let i = 0; i < kumHistogramm.length; i++){
    normHistogramm[i] = Math.round(kumHistogramm[i] * 255 /  letzerWertKH);
  }
  //Werte aus dem ImageData umrechnen
  for(let i = 0; i < neuesImg.data.length; i+=4){
    let neuerWert = normHistogramm[neuesImg.data[i]];
    neuesImg.data[i] = neuerWert;
    neuesImg.data[i + 1] = neuerWert;
    neuesImg.data[i + 2] = neuerWert;
  }
  drawHisto("histoC",xAchse, histogramm);
  // drawHisto("kumHistoC",xAchse, kumHistogramm, 10, 10, -5, -2000, 260, kumHistogramm[kumHistogramm.length]);
  // drawHisto("normHistoC",xAchse, normHistogramm, 10, 10, -5, -20, 260, normHistogramm[normHistogramm.length]);
  getNewImageObj(neuesImg);
  console.timeEnd("Ebnen");
} //Beende ebnen von Graubild

// ################################################################################

// Zeige nur einen Farbkanal an
function chooseColor (kanal){
  console.time("Farbkanal");
  let neuesImg = cv.createImageData(imgCanvas.width, imgCanvas.height);
  // Für die Zeilen -> Höhe
  let i = 0;
  for(let z = 0; z < bildDaten.r.length; z++){
    // Für die Spalten -> einzelne Werte
    for(let s = 0; s < imgCanvas.width; s++){
      // Werte invertieren und in Daten einfügen
      if(kanal == "rot"){
        neuesImg.data[i] = bildDaten.r[z][s];
      } else if(kanal == "gruen"){
        neuesImg.data[i + 1] = bildDaten.g[z][s];
      } else if(kanal == "blau"){
        neuesImg.data[i + 2] = bildDaten.b[z][s];
      }
      else if(kanal == "rg"){
        neuesImg.data[i] = bildDaten.r[z][s];
        neuesImg.data[i + 1] = bildDaten.g[z][s];
      }
      else if(kanal == "gb"){
        neuesImg.data[i + 1] = bildDaten.g[z][s];
        neuesImg.data[i + 2] = bildDaten.b[z][s];
      }
      else if(kanal == "br"){
        neuesImg.data[i] = bildDaten.r[z][s];
        neuesImg.data[i + 2] = bildDaten.b[z][s];
      }
      neuesImg.data[i + 3] = bildDaten.a[z][s];
      i += 4;
    }
  }
  getNewImageObj(neuesImg);
  console.timeEnd("Farbkanal");
}
// Ende nur einen Farbkanal zeigen

// ################################################################################

// LUT-Funktion
function lutImage (min, max) {
  if(rangeContainer.children.length != 2)
    erzeugeRange(2, 0, 255);
  console.time("LUT");
  let histogramm = [];
  let xAchse = [];
  // erstelle Histogramm-Array
  for(let i = 0; i < 256; i++){
    histogramm.push(0);
    xAchse.push(i);
  }
  let hmax = 0;
  let hmin = 0;
  let neuesImg = cv.createImageData(imgCanvas.width, imgCanvas.height);
  // Für die Zeilen -> Höhe
  let i = 0;
  for(let z = 0; z < bildDaten.r.length; z++){
    // Für die Spalten -> einzelne Werte
    for(let s = 0; s < imgCanvas.width; s++){
      // Bild in MW-Grauwerte umwandeln
      let gray = Math.round((bildDaten.r[z][s] + bildDaten.g[z][s] + bildDaten.b[z][s]) / 3);
      // Histogramm erstellen -> für jeden Wert die Anzahl der Vorkommen in ein Array eintragen
        histogramm[gray] += 1;
        neuesImg.data[i] = gray;
        neuesImg.data[i + 1] = gray;
        neuesImg.data[i + 2] = gray;
        neuesImg.data[i + 3] = bildDaten.a[z][s];
      i += 4;
    }
  }
  if( isNaN(Number(min)) && isNaN(Number(max)))
  {
    //Max-Wert des Histogramms bestimmen
    let hi = histogramm.length-1;
    do{
      hmax = hi;
      hi--;
    }while(histogramm[hi] == 0);
    hi = 0;
    do{
      hmin = hi;
      hi++;
    }while(histogramm[hi] == 0);
  } else if(isNaN(Number(min))){
    let hi = 0;
    do{
      hmin = hi;
      hi++;
    }while(histogramm[hi] == 0);
  }else if(isNaN(Number(max))){
    //Max-Wert des Histogramms bestimmen
    let hi = histogramm.length-1;
    do{
      hmax = hi;
      hi--;
    }while(histogramm[hi] == 0);
  }
  else {
      hmin = min;
      hmax = max;
  }
  let c1 = -hmin;
  let c2 = 255 / (hmax - hmin);
  for(let i = 0; i < neuesImg.data.length; i+=4){
    let neuerWert = Math.round(neuesImg.data[i] * c2 + c1 * c2);
    neuesImg.data[i] = neuerWert;
    neuesImg.data[i + 1] = neuerWert;
    neuesImg.data[i + 2] = neuerWert;
  }
  drawHisto("histoC",xAchse, histogramm);
  getNewImageObj(neuesImg);
  console.timeEnd("LUT");
} //Beende LUT

// Ende Bildverarbeitungsalgorithmen
// ################################################################################


// ################################################################################
  function showModel(min, max){
    removeHisto(model.value);
    if(!min){
      min = 1;
    }
    if(!max){
      max= 255;
    }
    removeRange(model.value);
    switch(model.value){
      case modelArr[1]:
        // Invertieren
        invertImage();
        break;
      case modelArr[2]:
        // Mitteln
        mittelImage(min);
        break;
      case modelArr[3]:
        schwellImg(min, max);
        break;
      case modelArr[4]:
        mwGreyImage();
        break;
      case modelArr[5]:
        ebneImage();
        break;
      case modelArr[6]:
        chooseColor("rot");
        break;
      case modelArr[7]:
        chooseColor("gruen");
        break;
      case modelArr[8]:
        chooseColor("blau");
        break;
      case modelArr[9]:
        chooseColor("rg");
        break;
      case modelArr[10]:
        chooseColor("gb");
        break;
      case modelArr[11]:
        chooseColor("br");
        break;
      case modelArr[12]:
        lutImage(min,max);
        break;
      default:
        bildDaten = getImageData();
    }
  } //Ende showModel
// ################################################################################


// ################################################################################
  // Histogramme zeichnen
  function drawHisto(id, xAchse, yAchse, sizex, sizey, minx, miny, maxx,maxy){
    // Canvas für Histogramme erzeugen
    let newCanvas = document.createElement("canvas");
    newCanvas.id = id;
    newCanvas.className = "histogramme"
    canvasContainer.appendChild(newCanvas);
    if(document.getElementById(id)){
      const objH = new MathGraph(id, 250, 250);
      objH.drawValues([xAchse], [yAchse], "histo", sizex, sizey, minx, miny, maxx, maxy);
    }
  } //Ende zeichne Histogramm
// ################################################################################

// ################################################################################
// Hiermit werden histogramme entfernt
  function removeHisto(){
    let allCanvas = document.querySelectorAll("canvas.histogramme");
    if(allCanvas.length > 1){
      for(let i = 0; i < allCanvas.length; i++){
        allCanvas[i].remove();
      }
    }
    console.log("me");
  }
  // } Ende entferne Histogramme
// ################################################################################

// ################################################################################
  // Funktion um eine Anzahl an ranges zu erzeugen
  function erzeugeRange(anzahl, min, max){
    for(let i = 0; i < anzahl; i++){
      let div = document.createElement("div");
      let range = document.createElement("input");
      range.type = "range";
      range.min = min;
      range.max = max;
      range.step = 1;
      if(i == 0) range.value = parseInt(min);
      else range.value = parseInt(max);
      let rangeAusgabe = document.createElement("span");
      rangeAusgabe.textContent = range.value;
      div.appendChild(range);
      div.appendChild(rangeAusgabe);
      rangeContainer.appendChild(div);
      range.addEventListener("change", function(){
        updateRange(anzahl);
      });
    }
  } //Ende erzeuge Ranges
// ################################################################################

// ################################################################################
// Funktion um die Ranges zu aktualisieren
  function updateRange(anzahl){
      let output = document.querySelectorAll("#range-container span");
      let input = document.querySelectorAll("#range-container input");
      if( anzahl == 1){
        output[0].textContent =  input[0].value;
        showModel(parseInt(input[0].value));
      }
      else if(anzahl == 2){
        output[0].textContent =  input[0].value;
        output[1].textContent =  input[1].value;
        showModel(parseInt(input[0].value), parseInt(input[1].value));
      }
  } //Ende update Ranges
// ################################################################################

// ################################################################################
  function removeRange(model){
    if(model != modelArr[12] && model != modelArr[3]
          && model != modelArr[2]){
      while(rangeContainer.hasChildNodes()){
        rangeContainer.removeChild(rangeContainer.childNodes[0]);
      }
    }
    // Test auf mitteln
    else if(rangeContainer.children.length > 1 && model == modelArr[2]){
      while(rangeContainer.hasChildNodes()){
        rangeContainer.removeChild(rangeContainer.childNodes[0]);
      }
    }
    // test auf Schwellwert oder LUT
    else if(rangeContainer.children.length == 1 &&
        (model == modelArr[3] || model == modelArr[12]) ){
          while(rangeContainer.hasChildNodes()){
            rangeContainer.removeChild(rangeContainer.childNodes[0]);
          }
    }
  } //Ende Remove Ranges
// ################################################################################

// ################################################################################
// Je nachdem welcher Radiobutton checked ist, wird entweder mit img oder mit Canvas/JSon gearbeitet
  function chooseDataType(){
    chooseDatas[2].disabled = (localStorage.length == 0);
    isEmptyLocalStorage();
    removeImageCanvasElement();
    if(chooseDatas[0].checked){
      //Erzeugen der Bildpfade
      for(let i = 1; i < 26; i++){
        pfad.push("./bilder/bild (" + i + ").jpg");
      }
      if(!document.querySelector("#imageUrl")){
        let imageUrl = document.createElement('select');
        imageUrl.value = "none";
        imageUrl.id = "imageUrl";
        selectContainer.insertBefore(imageUrl, model)
      } else {
        let imageUrl = document.querySelector("#imageUrl");
      }
      // Erzeugen eines Image-Elements
      img = document.createElement("img");
      img.id = "original";
      img.src = pfad[0];
      img.style.height = "200px";
      img.style.width = "auto";
      // Image einfügen
      canvasContainer.insertBefore( img ,imgCanvas);
      // Pfade in imageURL laden
      pfad.map((user, i) => {
        let option = document.createElement('option');
        option.value = user;
        option.appendChild(document.createTextNode(user));
        imageUrl.appendChild(option);
      });
      imageUrl.value = pfad[0];
      imageUrl.addEventListener("change",function(){
          img.src = imageUrl.value;
          model.value = modelArr[0];
          setTimeout(function(){
            bildDaten = getImageData();
            showModel();
          },1500);
      });
      // Bilddaten bekommen, wenn noch nichts getan wurde
      //Diese sollen auch aufgerufen werden, wenn die URL verändert wird -> neues Bild
      setTimeout(function(){
        bildDaten = getImageData();
        showModel();
      },1000);
    }
    // Mit JSON-Daten arbeiten
    else if(chooseDatas[1].checked) {
      if(document.querySelector("#imageUrl")) document.querySelector("#imageUrl").remove();
      if(document.querySelector("#original")){
        img = document.querySelector("#original");
      } else{
        img = document.createElement("canvas");
        img.id = "original";
        canvasContainer.insertBefore( img ,imgCanvas);
      }
      img.setAttribute("width", "200px");
      img.setAttribute("height", "200px");
      setTimeout(function(){
        loadJson(img);
      },1000);
    } else if(chooseDatas[2].checked){
      if(document.querySelector("#imageUrl")) document.querySelector("#imageUrl").remove();
      if(document.querySelector("#original")){
        img = document.querySelector("#original");
      } else{
        img = document.createElement("canvas");
        img.id = "original";
        canvasContainer.insertBefore( img ,imgCanvas);
      }
      img.setAttribute("width", "200px");
      img.setAttribute("height", "200px");
      setTimeout(function(){
        loadStorage(img, storagePosition);
      },1000);
    }
  } //Ende choose Data Type
// ################################################################################

// #################################################################################
// Entfernt das Image oder das Canvas-Element
  function removeImageCanvasElement(){
    if(document.querySelector("#canvas-container #original"))
    document.querySelector("#canvas-container #original").remove();
    if(document.querySelector("#canvas-container #jsonCanvas"))
    document.querySelector("#canvas-container #jsonCanvas").remove();
  }

// ################################################################################
  //Funktion, um auf die Bilddaten zuzugreifen und die Daten aufzuteilen
  function getImageData(){
    console.time("getImage");
    let again = true;
    // Wenn bild ein Array ist, dann soll ein neues ImageData erzeugt werden
    // Die Values ersetzt und mit putImage gearbeitet
    if(document.querySelector("#original")) {
      // Einstellen der Höhe und weite der Canvas
        imgCanvas.setAttribute('height', img.height);
        imgCanvas.setAttribute('width', img.width);
        clearCanvas();
        cv.drawImage(img,0,0,img.width, img.height);
    }
    // else Canvas erzeugen und CanvasDaten auslesen
    // rgba(0-255, 0-255, 0-255, 0-1)
    let rgbaObj = {
      r: [],
      g: [],
      b: [],
      a: []
    }
    //Zugriff auf die Daten des Bildes
    let imageData = cv.getImageData(0 ,0 ,imgCanvas.width ,imgCanvas.height );
    if(model.value = modelArr[0]) {
      imgDatenObjekt.width = imageData.width;
      imgDatenObjekt.height = imageData.height;
      imgDatenObjekt.data = imageData.data;
      console.log(imgDatenObjekt);
    }
    let zeilenR = [];
    let zeilenG = [];
    let zeilenB = [];
    let zeilenA = [];
    // durchlaufen des ImageData.data- Arrays
    for(let i = 0; i < imageData.data.length ; i += 4){
        zeilenR.push(imageData.data[i]);
        zeilenG.push(imageData.data[i+1]);
        zeilenB.push(imageData.data[i+2]);
        zeilenA.push(imageData.data[i+3]);
        // Nach einer Zeile, Array einfügen und neue Zeile starten
        if(zeilenR.length === imgCanvas.width){
          rgbaObj.r.push(zeilenR);
          rgbaObj.g.push(zeilenG);
          rgbaObj.b.push(zeilenB);
          rgbaObj.a.push(zeilenA);
          zeilenR = [];
          zeilenG = [];
          zeilenB = [];
          zeilenA = [];
        }
      }
    console.timeEnd("getImage");
    return rgbaObj;
  } //Beende getImage
// ################################################################################

// ################################################################################
  function saveJson(){
    if(imgDatenObjekt.width != ""){
      let xhr = new XMLHttpRequest();
      xhr.onload = function(){
        if(xhr.status != 200) return;
        chooseDataType();
      }
      xhr.open("POST", "script.php");
      xhr.send(JSON.stringify(imgDatenObjekt));
    }
  }
// ################################################################################

// ################################################################################
// Die Daten aus dem NewImage bekommen -> breite und Höhe und Datenarray
  function getNewImageObj(obj){
    imgDatenObjekt.width = obj.width;
    imgDatenObjekt.height = obj.height;
    imgDatenObjekt.data = obj.data;
    clearCanvas();
    cv.putImageData(obj, 0, 0);
  }
// ################################################################################

// ################################################################################
//ImageURl soll verschwinden, wenn man nicht mit image-Objekt arbeitet
function loadJson(canvasElement){
  let xhr = new XMLHttpRequest();
  xhr.onload = function(){
    if(xhr.status != 200) return;
    json = JSON.parse(xhr.response);
    // Lese json aus und erstelle ein neues imgObjekt
    let neuesImg = cv.createImageData(json.width, json.height);
    for(let i = 0; i < neuesImg.data.length; i++){
      neuesImg.data[i] = json.data[i];
    }
    canvasElement.setAttribute("width", json.width);
    canvasElement.setAttribute("height", json.height);
    canvasElement.id = "jsonCanvas";
    let cvJson = canvasElement.getContext('2d');
    cvJson.putImageData(neuesImg, 0, 0);
    clearCanvas();
    imgCanvas.setAttribute('height', neuesImg.height);
    imgCanvas.setAttribute('width', neuesImg.width);
    cv.putImageData(neuesImg, 0, 0);
    setTimeout(function(){
      bildDaten = getImageData();
      showModel();
      // showModel();
    },10);
  }
  xhr.open("GET", "./imageData.json");
  xhr.send();
}
// ################################################################################

// ################################################################################
// Funktion um jeden Schritt im localStorage zu speichern (ersetzen)
function saveInStorage(){
  // Speichert Daten nur, wenn der Width gesetzt wurde
  if(imgDatenObjekt.width !== ""){
    if(localStorage.length < 2 ){
      localStorage.setItem("schritt" + (localStorage.length + 1), JSON.stringify(imgDatenObjekt));
      storagePosition = localStorage.length;
    }
    else if (localStorage.length == 2){
      switch(storagePosition){
        case 1:
          localStorage.setItem("schritt2", JSON.stringify(imgDatenObjekt));
          storagePosition = 2;
          break;
        case 2:
          localStorage.setItem("schritt1", JSON.stringify(imgDatenObjekt));
          storagePosition = 1;
          break;
      }
    }
    chooseDatas[2].checked = true;
    isEmptyLocalStorage();
    chooseDataType();
  }
}

function loadStorage(canvasElement, position){
  if(localStorage.length > 0){
    let storageObj = JSON.parse(localStorage.getItem("schritt" + position));
    console.log(position);
    let neuesImg = cv.createImageData(storageObj.width, storageObj.height);
    for(let i = 0; i < neuesImg.data.length; i++){
      neuesImg.data[i] = storageObj.data[i];
    }
    canvasElement.setAttribute("width", storageObj.width);
    canvasElement.setAttribute("height", storageObj.height);
    canvasElement.id = "jsonCanvas";
    let cvJson = canvasElement.getContext('2d');
    cvJson.putImageData(neuesImg, 0, 0);
    clearCanvas();
    imgCanvas.setAttribute('height', neuesImg.height);
    imgCanvas.setAttribute('width', neuesImg.width);
    cv.putImageData(neuesImg, 0, 0);
    setTimeout(function(){
      bildDaten = getImageData();
      showModel();
      // showModel();
    },10);
  }
}
// Buttons damit man die Schritte vor und zurückgehen kann.
function isEmptyLocalStorage(){
  if(localStorage.length == 0){
    nextStorage.disabled = (localStorage.length == 0);
    prevStorage.disabled = (localStorage.length == 0);
  } else{
    nextStorage.disabled = (storagePosition == localStorage.length);
    prevStorage.disabled = (storagePosition == 1);
  }
}
// Button, damit man eine Einstellung behält und an dieser weiterarbeitet -> img wird zu Canvas mit Image-Objekt
function moveInStorage(value){
  if(localStorage.length == 0) return;
  if(value == "next" && storagePosition < localStorage.length) storagePosition++;
  else if(value == "prev" && storagePosition > 1) storagePosition--;
  chooseDatas[2].checked == true;
  chooseDataType();
}
// ################################################################################


}; //Beende onload
