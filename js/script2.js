"use strict";

import MathGraph from "./Canvas.js";

// Wenn alles geladen ist
window.onload = () => {
  // Array für den Zugriff auf die verschiedenen Funktionen
  const modelArr = ['none', 'invertiert', 'mitteln', 'schwellwert', 'Graubild',
        'Bild ebnen', 'Farbkanal Rot', 'Farbkanal Grün', 'Farbkanal Blau',
        'Farbkanal RG', 'Farbkanal GB', 'Farbkanal BR', 'LUT', 'Mittelwert und Abweichung',
        'Cooccurrencematrix', 'horizontaler Linescan', 'vertikaler Linescan',
        'Gaußfilter', 'Kantenerkennung (vert) nach Perwitt', 'Kantenerkennung (hor) nach Perwitt',
        'Kantenerkennung (vert) nach Soebel', 'Kantenerkennung (hor) nach Soebel'
      ];
  // Zugriff auf die DOM-Elemente
  let canvasContainer = document.getElementById('canvas-container');
  let imgCanvas = document.getElementById('kopie');
  let chooseDatas = document.querySelectorAll("#chooseType input");
  let model = document.getElementById('model');
  let selectContainer = document.getElementById("toDo");
  let rangeContainer = document.getElementById('range-container');
  let img, bildDaten, pfad = [], json = {}, storagePosition = localStorage.length;
  let allBtns = document.querySelectorAll("button");
  let imgDatenObjekt = {
    width: "",
    height: "",
    data: []
  };
  let currentPath = "./bilder/bild (1).jpg";
  let currentModel = modelArr[0];
  let min = 1;
  let max = 255;
  let saveJsonBtn = document.getElementById("saveJson");
  let storage = document.getElementById("storeCanvas");
  let nextStorage = document.getElementById("nextStorage");
  let prevStorage = document.getElementById("prevStorage");
  let clearStorage = document.getElementById("clearStorage");
  // Canvas Context einstellen
  let cv = imgCanvas.getContext('2d');

  //Erzeugen der Bildpfade
  for(let i = 1; i < 26; i++){
    pfad.push("./bilder/bild (" + i + ").jpg");
  }

  // Canvas-Feld leeren Funktion
  function clearCanvas(){
    cv.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
  }

  for(let i = 0; i < allBtns.length; i++){
    allBtns[i].addEventListener("click",function(){
      let btn = this;
      btn.style.padding = "5px 12px";
      setTimeout(function(){
        btn.style.padding = "7px 15px";
      }, 100);
    });
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
    chooseDatas[0].checked = true;
    chooseDataType();
  });
  // addEventListener für die Radiobuttons
  chooseDatas[0].addEventListener("change", chooseDataType);
  chooseDatas[1].addEventListener("change", chooseDataType);
  chooseDatas[2].addEventListener("change", chooseDataType);

  // Das Selectfeld (model) bekommt hier die verschiedenen Optionen zugewiesen
  modelArr.map((modelText, i) => {
    let option = document.createElement('option');
    option.value = modelText;
    option.appendChild(document.createTextNode(modelText));
    model.appendChild(option);
  });

  // Wenn das Select-Element verlassen wird, soll die entsprechende Funktion aufgerufen werden
  model.addEventListener('change', function(){
    currentModel = model.value;
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

function mittelImage() {
  console.time("mittelImage");
  setCanvasWidth();
  if(min > 25) min = 10;
  let size = min;
  if(imgCanvas.width - size < 30) return;
  erzeugeRange(1, 1, 25);
  let mittelWerte = {
    mwR: 0,
    mwG: 0,
    mwB: 0,
    mwA: 0
  }
  let neuesImg = cv.createImageData(imgCanvas.width-size, imgCanvas.height-size);
  let i = 0;
  let sizeQuadrat = size*size;
  for(let z = 0; z < bildDaten.r.length - size; z++){
    // Für die Spalten -> einzelne Werte
    for(let s = 0; s < imgCanvas.width - size; s++){
      for(let n = 0; n < size; n++){
        // Für die Spalten -> einzelne Werte
        for(let m = 0; m < size; m++){
          // Werte summieren
          mittelWerte.mwR += bildDaten.r[z + n][s + m];
          mittelWerte.mwG += bildDaten.g[z + n][s + m];
          mittelWerte.mwB += bildDaten.b[z + n][s + m];
          mittelWerte.mwA += bildDaten.a[z + n][s + m];
        }
      } //Ende n x m Schleife
      // Werte in Daten einfügen
      neuesImg.data[i] = Math.round(mittelWerte.mwR / sizeQuadrat);
      neuesImg.data[i + 1] = Math.round(mittelWerte.mwG / sizeQuadrat);
      neuesImg.data[i + 2] = Math.round(mittelWerte.mwB  / sizeQuadrat);
      neuesImg.data[i + 3] = Math.round(mittelWerte.mwA / sizeQuadrat);
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
function schwellImg() {
  erzeugeRange(2, 0, 255);
  console.time("schwellwertImg");
  if(min > 255) min = 1;
  if(max > 255) max = 255;
  let neuesImg = cv.createImageData(imgCanvas.width, imgCanvas.height);
  // Für die Zeilen -> Höhe
  let i = 0;
  for(let z = 0; z < bildDaten.r.length; z++){
    // Für die Spalten -> einzelne Werte
    for(let s = 0; s < imgCanvas.width; s++){
      // Werte invertieren und in Daten einfügen
      let mw = 0.299*bildDaten.r[z][s] + 0.587*bildDaten.g[z][s] + 0.114*bildDaten.b[z][s];
      if( mw >= min && mw <= max)
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
      let gray = Math.round(0.299*bildDaten.r[z][s] + 0.587*bildDaten.g[z][s] + 0.114*bildDaten.b[z][s]);
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
      let gray = Math.round(0.299*bildDaten.r[z][s] + 0.587*bildDaten.g[z][s] + 0.114*bildDaten.b[z][s]);
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
  drawHisto("histoC",[xAchse], [histogramm]);
  // drawHisto("histoK",[xAchse], [kumHistogramm]);
  // drawHisto("histoN",[xAchse], [normHistogramm]);
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
function lutImage () {
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
      let gray = Math.round(0.299*bildDaten.r[z][s] + 0.587*bildDaten.g[z][s] + 0.114*bildDaten.b[z][s]);
      // Histogramm erstellen -> für jeden Wert die Anzahl der Vorkommen in ein Array eintragen
        neuesImg.data[i] = gray;
        neuesImg.data[i + 1] = gray;
        neuesImg.data[i + 2] = gray;
        neuesImg.data[i + 3] = bildDaten.a[z][s];
      i += 4;
    }
  }
  let c1 = -min;
  let c2 = 255 / (max - min);
  for(let i = 0; i < neuesImg.data.length; i+=4){
    let neuerWert = Math.round(neuesImg.data[i] * c2 + c1 * c2);
    histogramm[neuerWert] += 1;
    neuesImg.data[i] = neuerWert;
    neuesImg.data[i + 1] = neuerWert;
    neuesImg.data[i + 2] = neuerWert;
  }
  drawHisto("histoC",[xAchse], [histogramm]);
  getNewImageObj(neuesImg);
  console.timeEnd("LUT");
} //Beende LUT

// ################################################################################

  // Berechnen des Mittelwertes und der quadratischen Abweichung
  function mittelWert_quadrAbweich(){
    console.time("MW und QA");
    // Für die Zeilen -> Höhe
    let mw = [0, 0, 0, 0];
    let mwArr = [[], [], [], []];
    let qa = [0, 0, 0, 0]
    let bildGroesse = imgCanvas.width * imgCanvas.height;
    let i = 0;
    for(let z = 0; z < bildDaten.r.length; z++){
      // Für die Spalten -> einzelne Werte
      for(let s = 0; s < imgCanvas.width; s++){
        mw = [
          mw[0] + bildDaten.r[z][s],
          mw[1] + bildDaten.g[z][s],
          mw[2] + bildDaten.b[z][s],
          mw[3] + bildDaten.a[z][s]
        ];
        mwArr[0].push(bildDaten.r[z][s]);
        mwArr[1].push(bildDaten.g[z][s]);
        mwArr[2].push(bildDaten.b[z][s]);
        mwArr[3].push(bildDaten.a[z][s]);
        i += 4;
      }
    }
    mw = [
      (mw[0] / bildGroesse),
      (mw[1] / bildGroesse),
      (mw[2] / bildGroesse),
      (mw[3] / bildGroesse)
    ];
    let mwQadrat = [
      Math.pow( mw[0], 2),
      Math.pow( mw[1], 2),
      Math.pow( mw[2], 2),
      Math.pow( mw[3], 2)
    ];
    for(let i = 0; i < mwArr[0].length; i++){
      qa = [
        qa[0] + Math.pow(mwArr[0][i], 2) - mwQadrat[0],
        qa[1] + Math.pow(mwArr[1][i], 2) - mwQadrat[1],
        qa[2] + Math.pow(mwArr[2][i], 2) - mwQadrat[2],
        qa[3] + Math.pow(mwArr[3][i], 2) - mwQadrat[3],
      ];
    }
    qa = [
      Math.round(Math.sqrt(qa[0] / bildGroesse)),
      Math.round(Math.sqrt(qa[1] / bildGroesse)),
      Math.round(Math.sqrt(qa[2] / bildGroesse)),
      Math.round(Math.sqrt(qa[3] / bildGroesse))
    ];
    let message = `RGBA(${Math.round(mw[0])}, ${Math.round(mw[1])}, ${Math.round(mw[2])}, ${Math.round(mw[3])})`;
    clearCanvas();
    cv.font = "16px";
    cv.fillText("Mittelwert", 10, 30);
    cv.fillText(message, 10, 60);
    message = `RGBA(${qa[0]}, ${qa[1]}, ${qa[2]}, ${qa[3]})`;
    cv.fillText("Abweichung", 10, 100);
    cv.fillText(message, 10, 130);
    let p = document.createElement("p");
    console.timeEnd("MW und QA");
  } //Ende Mittelwert und Quadratische Abweichung


//Farbenspiel -> Der entsprechenden Kanal soll mit einer Konstante erhöht werden
/*
  Wert > 255 -> 0 + rest
  Auswahlfeld, mit den Kanälen und dem Grauwert
  Dieses sollspäter wieder gelöscht werden
*/

//Cooccurrencematrix
  function coocurrenceImg(){
      console.time("Cooc");
      let cMatrix = [[],[],[]];
      for(let i = 0; i < 256; i++){
        cMatrix[0][i] = [];
        cMatrix[1][i] = [];
        cMatrix[2][i] = [];
        for(let j = 0; j < 256; j++){
          cMatrix[0][i][j] = 0;
          cMatrix[1][i][j] = 0;
          cMatrix[2][i][j] = 0;
        }
      }
      //Testen auf rechter nachbar von einem Wert
      let ds = 1;
      let dz = 0;
      for(let z = 1; z < bildDaten.r.length; z++){
        // Für die Spalten -> einzelne Werte
        for(let s = 1; s < imgCanvas.width; s++){
          let zeilen = [
            bildDaten.r[z - dz][s - ds],
            bildDaten.g[z - dz][s - ds],
            bildDaten.b[z - dz][s - ds]
          ];
          let spalten = [
            bildDaten.r[z][s],
            bildDaten.g[z][s],
            bildDaten.b[z][s]
          ];
          cMatrix[0][zeilen[0]][spalten[0]]++;
          cMatrix[1][zeilen[1]][spalten[1]]++;
          cMatrix[2][zeilen[2]][spalten[2]]++;
        }
      }
      let neuesImg = cv.createImageData(256, 256);
      let max = -Infinity;
      // Den höchsten Wert bestimmen
      for(let z = 0; z < 256; z++){
        for(let s = 0; s < 256; s++){
          for(let i = 0; i < 3; i++){
            if(cMatrix[i][z][s] > max){
              max = cMatrix[i][z][s];
            }
          }
        }
      }
      // Auf den höchsten Wert umrechnen
      // Matrix in Image einfügen
      let i = 0;
      for(let z = 0; z < 256; z++){
        for(let s = 0; s < 256; s++){
          neuesImg.data[i] = Math.ceil(cMatrix[0][z][s] * 255 / max);
          neuesImg.data[i + 1] = Math.ceil(cMatrix[1][z][s] * 255 / max);
          neuesImg.data[i + 2] = Math.ceil(cMatrix[2][z][s] * 255 / max);
          neuesImg.data[i + 3] = 255;
          i += 4;
        }
      }
      console.log(neuesImg.data);
      getNewImageObj(neuesImg);
      console.timeEnd("Cooc");
  } //Ende Cooccurrencematrix

  // horizontaler Linescan
  function horizontalLineScan(){
    console.time("hor. lineScan");
    setCanvasWidth();
    let neuesImg = cv.createImageData(imgCanvas.width, imgCanvas.height);
    // Für die Zeilen -> Höhe
    let line = [[], [], []];
    let xAchse = [];
    let lineWidth = imgCanvas.width;
    let hoehe = imgCanvas.height-1
    erzeugeRange(1, 0, hoehe);
    let i = 0;
    if(min > hoehe) min = hoehe;
    let zeile = min;
    for(let z = 0; z < bildDaten.r.length; z++){
      // Für die Spalten -> einzelne Werte
      for(let s = 0; s < imgCanvas.width; s++){
        // Werte invertieren und in Daten einfügen
        neuesImg.data[i] = bildDaten.r[z][s];
        neuesImg.data[i + 1] = bildDaten.g[z][s];
        neuesImg.data[i + 2] = bildDaten.b[z][s];
        neuesImg.data[i + 3] = bildDaten.a[z][s];
        if(z == zeile){
          neuesImg.data[i] = 255;
          neuesImg.data[i + 1] = 255;
          neuesImg.data[i + 2] = 255;
          neuesImg.data[i + 3] = 255;
        }
        i += 4;
      }
    }
    for(let i = 0; i < lineWidth; i++){
      xAchse.push(i+1);
      line[0].push(bildDaten.r[zeile][i]);
      line[1].push(bildDaten.g[zeile][i]);
      line[2].push(bildDaten.b[zeile][i]);
    }
    drawHisto("hrLineScan",[xAchse, xAchse, xAchse], line, "line");
    // Image einfügen
    getNewImageObj(neuesImg);
    console.timeEnd("hor. lineScan");
  } //Ende horizontaler Linescan

  // verticaler lineScan
  function verticalLineScan(){
    setCanvasWidth();
    console.time("ver.. lineScan");
    let neuesImg = cv.createImageData(imgCanvas.width, imgCanvas.height);
    // Für die Zeilen -> Höhe
    let line = [[], [], []];
    let xAchse = [];
    let lineHeight = imgCanvas.height;
    let laenge = imgCanvas.width-1
    erzeugeRange(1, 0, laenge);
    let i = 0;
    if(min > laenge) min = laenge;
    let spalte = min;
    for(let z = 0; z < bildDaten.r.length; z++){
      // Für die Spalten -> einzelne Werte
      for(let s = 0; s < imgCanvas.width; s++){
        // Werte invertieren und in Daten einfügen
        neuesImg.data[i] = bildDaten.r[z][s];
        neuesImg.data[i + 1] = bildDaten.g[z][s];
        neuesImg.data[i + 2] = bildDaten.b[z][s];
        neuesImg.data[i + 3] = bildDaten.a[z][s];
        if(s == spalte){
          neuesImg.data[i] = 255;
          neuesImg.data[i + 1] = 255;
          neuesImg.data[i + 2] = 255;
          neuesImg.data[i + 3] = 255;
        }
        i += 4;
      }
    }
    for(let i = 0; i < lineHeight; i++){
      xAchse.push(i+1);
      line[0].push(bildDaten.r[i][spalte]);
      line[1].push(bildDaten.g[i][spalte]);
      line[2].push(bildDaten.b[i][spalte]);
    }
    drawHisto("hrLineScan",[xAchse, xAchse, xAchse], line, "line");
    // Image einfügen
    getNewImageObj(neuesImg);
    console.timeEnd("ver. lineScan");
  }   // Ende vertikaler linescan

  // Gaußfilter
  function gaussFilter(){
    console.time("Gaußfilter");
    let pascalDreieck = [[1], [1, 1]];
    //Dreieck berechnen
    for(let i = 1; i < 19; i++){
      let array = [1];
      for(let j = 1; j < pascalDreieck[i].length; j++){
        array.push(pascalDreieck[i][j] + pascalDreieck[i][j - 1]);
      }
      array.push(1);
      pascalDreieck.push(array);
    }
    setCanvasWidth();
    if(min > 20) min = 20;
    let size = min;
    erzeugeRange(1, 1, 20);
    let mittelWerte = {
      mwR: 0,
      mwG: 0,
      mwB: 0,
      mwA: 0
    };
    let pascalDreieckReihe = pascalDreieck[size - 1];
    let h = [];
    let teiler = 0;
    for(let n = 0; n < pascalDreieckReihe.length; n++){
      let array = [];
      for(let m = 0; m < pascalDreieckReihe.length; m++){
        let value = pascalDreieckReihe[n] * pascalDreieckReihe[m];
        array.push(value);
        teiler += value;
      }
      h.push(array);
    }
    let neuesImg = cv.createImageData(imgCanvas.width-size, imgCanvas.height-size);
    let i = 0;
    let sizeQuadrat = size*size;
    for(let z = 0; z < bildDaten.r.length - size; z++){
      // Für die Spalten -> einzelne Werte
      for(let s = 0; s < imgCanvas.width - size; s++){
        for(let n = 0; n < size; n++){
          // Für die Spalten -> einzelne Werte
          for(let m = 0; m < size; m++){
            // Werte summieren
            mittelWerte.mwR += (bildDaten.r[z + n][s + m] * h[n][m]);
            mittelWerte.mwG += (bildDaten.g[z + n][s + m] * h[n][m]);
            mittelWerte.mwB += (bildDaten.b[z + n][s + m] * h[n][m]);
            mittelWerte.mwA += (bildDaten.a[z + n][s + m] * h[n][m]);
          }
        } //Ende n x m Schleife
        // Werte in Daten einfügen
        neuesImg.data[i] = Math.round(mittelWerte.mwR / teiler);
        neuesImg.data[i + 1] = Math.round(mittelWerte.mwG / teiler);
        neuesImg.data[i + 2] = Math.round(mittelWerte.mwB  / teiler);
        neuesImg.data[i + 3] = Math.round(mittelWerte.mwA / teiler);
        mittelWerte.mwR = 0;
        mittelWerte.mwG = 0;
        mittelWerte.mwB = 0;
        mittelWerte.mwA = 0;
        i += 4;
      }
    } //Ende s x z Schleife
    getNewImageObj(neuesImg);
    console.timeEnd("Gaußfilter");
  } // Ende Gaußfilter

  function kantenImg(direction){
    console.time("Richtung");
    let operator;
    let size = 3;
    if(direction == "unten"){
       operator = [
        [-1, -1, -1],
        [0, 0, 0],
        [1, 1, 1]
      ];
    }
    if(direction == "rechts"){
      operator = [
        [-1, 0, 1],
        [-1, 0, 1],
        [-1, 0, 1]
      ];
    }
    if(direction == "soebelunten"){
       operator = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
      ];
    }
    if(direction == "soebelrechts"){
      operator = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
      ];
    }
    let teiler = 0;
    for(let n = 0; n < size; n++){
      for(let m = 0; m < size; m++){
        teiler += Math.abs(operator[n][m]);
      }
    }
    // y nach rechts -> Spalten
    // x nach unten -> Zeilen
    setCanvasWidth();
    let mittelWert = 0;
    let neuesImg = cv.createImageData(imgCanvas.width - size, imgCanvas.height - size);
    let i = 0;
    let sizeQuadrat = size*size;
    for(let z = 0; z < bildDaten.r.length - size; z++){
      // Für die Spalten -> einzelne Werte
      for(let s = 0; s < imgCanvas.width - size; s++){
        for(let n = 0; n < size; n++){
          // Für die Spalten -> einzelne Werte
          for(let m = 0; m < size; m++){
            // Werte summieren
            let gray = Math.round(0.299*bildDaten.r[z + n][s + m] + 0.587*bildDaten.g[z + n][s + m]
                  + 0.114*bildDaten.b[z + n][s + m]);
            mittelWert += (gray * operator[n][m]);
          }
        } //Ende n x m Schleife
        // if(mittelWert/3 > 255 || mittelWert/3 < -127)
        //   console.log(mittelWert/3);
        // Werte in Daten einfügen
        neuesImg.data[i] = (Math.round(mittelWert / teiler) + 127);
        neuesImg.data[i + 1] = (Math.round(mittelWert / teiler) + 127);
        neuesImg.data[i + 2] = (Math.round(mittelWert / teiler) + 127);
        neuesImg.data[i + 3] = 255;
        mittelWert = 0;
        i += 4;
      }
    } //Ende s x z Schleife
    getNewImageObj(neuesImg);
    console.time("Richtung");
  }

// Ende Bildverarbeitungsalgorithmen
// ################################################################################


// ################################################################################
  function showModel(){
    removeHisto(model.value);
    removeRange(model.value);
    switch(model.value){
      case modelArr[1]:
        // Invertieren
        invertImage();
        break;
      case modelArr[2]:
        // Mitteln
        mittelImage();
        break;
      case modelArr[3]:
        schwellImg();
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
        lutImage();
        break;
      case modelArr[13]:
        mittelWert_quadrAbweich();
        break;
      case modelArr[14]:
        coocurrenceImg();
        break;
      case modelArr[15]:
        horizontalLineScan();
        break;
      case modelArr[16]:
        verticalLineScan();
        break;
      case modelArr[17]:
        gaussFilter();
        break;
      case modelArr[18]:
        kantenImg("unten");
        break;
      case modelArr[19]:
        kantenImg("rechts");
        break;
      case modelArr[20]:
        kantenImg("soebelunten");
        break;
      case modelArr[21]:
        kantenImg("soebelrechts");
        break;
      default:
        bildDaten = getImageData();
    }
  } //Ende showModel
// ################################################################################


// ################################################################################
  // Histogramme zeichnen
  function drawHisto(id, xAchse, yAchse, form){
    // Canvas für Histogramme erzeugen
    if(!form) form = "histo";
    let newCanvas = document.createElement("canvas");
    newCanvas.id = id;
    newCanvas.className = "histogramme"
    canvasContainer.appendChild(newCanvas);
    if(document.getElementById(id)){
      const objH = new MathGraph(id, 250, 250);
      objH.drawValues(xAchse, yAchse, form);
    }
  } //Ende zeichne Histogramm
// ################################################################################

// ################################################################################
// Hiermit werden histogramme entfernt
  function removeHisto(){
    let allCanvas = document.querySelectorAll(".histogramme");
    if(allCanvas.length > 0){
      for(let i = 0; i < allCanvas.length; i++){
        allCanvas[i].remove();
      }
    }
  }
  // } Ende entferne Histogramme
// ################################################################################

// ################################################################################
  // Funktion um eine Anzahl an ranges zu erzeugen
  function erzeugeRange(anzahl, minVal, maxVal){
    for(let i = 0; i < anzahl; i++){
      let div = document.createElement("div");
      let range = document.createElement("input");
      range.type = "range";
      range.min = minVal;
      range.max = maxVal;
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
        min = parseInt(input[0].value);
        showModel();
      }
      else if(anzahl == 2){
        output[0].textContent =  input[0].value;
        output[1].textContent =  input[1].value;
        min = parseInt(input[0].value);
        max = parseInt(input[1].value);
        showModel();
      }
  } //Ende update Ranges
// ################################################################################

// ################################################################################
  function removeRange(model){
    while(rangeContainer.hasChildNodes()){
      rangeContainer.removeChild(rangeContainer.childNodes[0]);
    }
  } //Ende Remove Ranges
// ################################################################################

// ################################################################################
// Je nachdem welcher Radiobutton checked ist, wird entweder mit img oder mit Canvas/JSon gearbeitet
  function chooseDataType(){
    chooseDatas[2].disabled = (localStorage.length == 0);
    desableButtons();
    removeImageCanvasElement();
    if(chooseDatas[0].checked){
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
      img.src = currentPath;
      img.style.height = "200px";
      img.style.width = "auto";
      // Image einfügen
      canvasContainer.insertBefore( img ,imgCanvas);
      // Pfade in imageURL laden
      console.log(document.querySelectorAll("option"));
      if(!imageUrl.hasChildNodes()){
        for(let i = 0; i < pfad.length; i++){
          let option = document.createElement('option');
          option.value = pfad[i];
          option.appendChild(document.createTextNode(pfad[i]));
          console.log(option);
          imageUrl.appendChild(option);
        }
      }
      imageUrl.value = currentPath;
      imageUrl.addEventListener("change",function(){
          img.src = this.value;
          model.value = currentModel;
          currentPath = this.value;
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
        canvasContainer.insertBefore( img ,imgCanvas);
      }
      img.setAttribute("width", "200px");
      img.setAttribute("height", "200px");
      img.id = "jsonCanvas";
      setTimeout(function(){
        loadJson(img);
      },1000);
    } else if(chooseDatas[2].checked){
      if(document.querySelector("#imageUrl")) document.querySelector("#imageUrl").remove();
      if(document.querySelector("#original")){
        img = document.querySelector("#original");
      } else{
        img = document.createElement("canvas");
        canvasContainer.insertBefore( img ,imgCanvas);
      }
      img.setAttribute("width", "200px");
      img.setAttribute("height", "200px");
      img.id = "jsonCanvas";
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
    setCanvasWidth();
    clearCanvas();
    if(document.querySelector("#original")) {
        cv.drawImage(img,0,0,img.width, img.height);
      }
    else if(document.querySelector("canvas#jsonCanvas")){
      let originalCv = document.querySelector("canvas#jsonCanvas").getContext("2d");
      let originalImg = originalCv.getImageData(0 ,0 ,imgCanvas.width ,imgCanvas.height );
      cv.putImageData(originalImg,0,0);
      }
    let imageData = cv.getImageData(0 ,0 ,imgCanvas.width ,imgCanvas.height );
    // rgba(0-255, 0-255, 0-255, 0-1)
    let rgbaObj = {
      r: [],
      g: [],
      b: [],
      a: []
    }
    if(model.value == modelArr[0]) {
      imgDatenObjekt.width = imageData.width;
      imgDatenObjekt.height = imageData.height;
      imgDatenObjekt.data = imageData.data;
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
    imgCanvas.setAttribute('height', obj.height);
    imgCanvas.setAttribute('width', obj.width);
    cv.putImageData(obj, 0, 0);
  }
// ################################################################################

// ################################################################################
//ImageURl soll verschwinden, wenn man nicht mit image-Objekt arbeitet
  function loadJson(canvasElement){
    console.log(json);
    let xhr = new XMLHttpRequest();
    xhr.onload = function(){
      if(xhr.status != 200) return;
      json = JSON.parse(xhr.response);
      // console.log(json.width);
      // Lese json aus und erstelle ein neues imgObjekt
      let neuesImg = cv.createImageData(json.width, json.height);
      for(let i = 0; i < neuesImg.data.length; i++){
        neuesImg.data[i] = json.data[i];
      }
      canvasElement.setAttribute("width", json.width);
      canvasElement.setAttribute("height", json.height);
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
    xhr.setRequestHeader("Cache-Control", "no-cache");
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
      desableButtons();
      chooseDataType();
    }
  }

  function loadStorage(canvasElement, position){
    if(localStorage.length > 0){
      let storageObj = JSON.parse(localStorage.getItem("schritt" + position));
      let neuesImg = cv.createImageData(storageObj.width, storageObj.height);
      for(let i = 0; i < neuesImg.data.length; i++){
        neuesImg.data[i] = storageObj.data[i];
      }
      canvasElement.setAttribute("width", storageObj.width);
      canvasElement.setAttribute("height", storageObj.height);
      let cvJson = canvasElement.getContext('2d');
      cvJson.putImageData(neuesImg, 0, 0);
      clearCanvas();
      imgCanvas.setAttribute('height', neuesImg.height);
      imgCanvas.setAttribute('width', neuesImg.width);
      cv.putImageData(neuesImg, 0, 0);
      setTimeout(function(){
        bildDaten = getImageData();
        showModel();
      },10);
    }
  }
  // Buttons damit man die Schritte vor und zurückgehen kann.
  function desableButtons(){
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

  function setCanvasWidth(){
    imgCanvas.setAttribute("width", img.width);
    imgCanvas.setAttribute("height", img.height);
  }
// ################################################################################


}; //Beende onload
