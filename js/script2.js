"use strict";
// Wenn alles geladen ist
window.onload = () => {

  // Array für den Zugriff auf die verschiedenen Funktionen
  const modelArr = ['none', 'invertiert', 'mitteln', 'schwellwert', 'Graubild',
        'Bild ebnen', 'Farbkanal Rot', 'Farbkanal Grün', 'Farbkanal Blau',
        'LUT'];
  // Zugriff auf die DOM-Elemente
  let canvas = document.getElementById('kopie');
  let imageUrl = document.getElementById('imageURL');
  let model = document.getElementById('model');
  let range = document.getElementById("range");
  let rangeAusgabe = document.getElementById("rangeValue");
  let rangeMin = document.getElementById("rangeMin");
  let rangeAusgabeMin = document.getElementById("rangeValueMin");
  let rangeMax = document.getElementById("rangeMax");
  let rangeAusgabeMax = document.getElementById("rangeValueMax");
  let img = document.getElementById('original');
  img.style.width = "300px";
  img.style.height = "auto";
  // Canvas Context einstellen
  let cv = canvas.getContext('2d');
  let pfad = [];
  //Erzeugen der Bildpfade
  for(let i = 1; i < 26; i++){
    pfad.push("./bilder/bild (" + i + ").jpg");
  }
  // Pfade in imageURL laden
pfad.map((user, i) => {
    let option = document.createElement('option');
    option.value = user;
    option.appendChild(document.createTextNode(user));
    imageUrl.appendChild(option);
  });
  // Das Selectfeld (model) bekommt hier die verschiedenen Optionen zugewiesen
  modelArr.map((user, i) => {
    let option = document.createElement('option');
    option.value = user;
    option.appendChild(document.createTextNode(user));
    model.appendChild(option);
  });

  //Funktion, um auf die Bilddaten zuzugreifen und die Daten aufzuteilen
  const getImageData = (bild) => {
    console.time("getImage");
    let again = true;
    // Einstellen der Höhe und weite der Canvas
    canvas.setAttribute('height', bild.height);
    canvas.setAttribute('width', bild.width);
    // console.log(img);
    // Bild aus dem img in die Canvas zeichnen
    // Neues IMG wird erst nach dem zweiten Versuch geladen
    // https://tse3.mm.bing.net/th?id=OIP.QH9b-hfYQFvy0kmd2m3_lQHaEp&pid=Api
    cv.clearRect(0, 0, canvas.width, canvas.height);
    cv.drawImage(bild,0,0,bild.width, bild.height);
    // rgba(0-255, 0-255, 0-255, 0-1)
    let rgbaObj = {
      r: [],
      g: [],
      b: [],
      a: []
    }
    //Zugriff auf die Daten des Bildes
    let imageData = cv.getImageData(0,0,canvas.width,canvas.height);
    // console.log(imageData.data.length);
    // console.log(canvas.height);
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
        if(zeilenR.length === canvas.width){
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
     // console.log(rgbaObj);
    console.timeEnd("getImage");
    return rgbaObj;
  } //Beende getImage

  // Funktion, um die Bilddaten zu invertieren
  const invertImage = () => {
    console.time("invertImage");
    let neuesImg = cv.createImageData(canvas.width, canvas.height);
    // console.log(bildDaten.r);
    // console.log(canvas.width);
    // Für die Zeilen -> Höhe
    let i = 0;
    for(let z = 0; z < bildDaten.r.length; z++){
      // Für die Spalten -> einzelne Werte
      for(let s = 0; s < canvas.width; s++){
        // Werte invertieren und in Daten einfügen
        neuesImg.data[i] = 255 - bildDaten.r[z][s];
        neuesImg.data[i + 1] = 255 - bildDaten.g[z][s];
        neuesImg.data[i + 2] = 255 - bildDaten.b[z][s];
        neuesImg.data[i + 3] = bildDaten.a[z][s];
        i += 4;
      }
    }
    // Canvas leeren
    cv.clearRect(0, 0, canvas.width, canvas.height);
    // invertiertes Image einfügen
    cv.putImageData(neuesImg, 0, 0);
    console.timeEnd("invertImage");
  } //Beende Invertieren-Funktion

  const mittelImage = (size) => {
    console.time("mittelImage");
    let mittelWerte = {
      mwR: 0,
      mwG: 0,
      mwB: 0,
      mwA: 0
    }
    let neuesImg = cv.createImageData(canvas.width-size, canvas.height-size);
    let i = 0;
    for(let z = 0; z < bildDaten.r.length - size; z++){
      // Für die Spalten -> einzelne Werte
      for(let s = 0; s < canvas.width - size; s++){
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
    // Canvas leeren
    cv.clearRect(0, 0, canvas.width, canvas.height);
    cv.putImageData(neuesImg, 0, 0);
    console.timeEnd("mittelImage");
  } //Ende Mitteln

  //Schwelwerte definieren
  const schwellImg = (minWert, maxWert) => {
    console.time("schwellwertImg");
    let neuesImg = cv.createImageData(canvas.width, canvas.height);
    // console.log(bildDaten.r);
    // console.log(canvas.width);
    // Für die Zeilen -> Höhe
    let i = 0;
    for(let z = 0; z < bildDaten.r.length; z++){
      // Für die Spalten -> einzelne Werte
      for(let s = 0; s < canvas.width; s++){
        // Werte invertieren und in Daten einfügen
        let mw = (bildDaten.r[z][s] + bildDaten.g[z][s] + bildDaten.b[z][s])/3
        if( mw >= minWert && mw <= maxWert)
            {
              neuesImg.data[i] = 200;
              neuesImg.data[i + 1] = 200;
              neuesImg.data[i + 2] = 200;
            } else {
              neuesImg.data[i] = 0;
              neuesImg.data[i + 1] = 0;
              neuesImg.data[i + 2] = 0;
            }
            neuesImg.data[i + 3] = 255;

        i += 4;
      }
    }
    // Canvas leeren
    cv.clearRect(0, 0, canvas.width, canvas.height);
    cv.putImageData(neuesImg, 0, 0);
    console.timeEnd("schwellwertImg");
  } //Ende Schwellwerte


  // Funktion, um Graubild auszugeben, mit mittleren Grauwerten
  const mwGreyImage = () => {
    // console.log("test");
    console.time("MW Graubild");
    let neuesImg = cv.createImageData(canvas.width, canvas.height);
    // Für die Zeilen -> Höhe
    let i = 0;
    for(let z = 0; z < bildDaten.r.length; z++){
      // Für die Spalten -> einzelne Werte
      for(let s = 0; s < canvas.width; s++){
        // Werte in Grauwert umwandeln und in Daten einfügen
        let gray = Math.round((bildDaten.r[z][s] + bildDaten.g[z][s] + bildDaten.b[z][s]) / 3);
          neuesImg.data[i] = gray;
          neuesImg.data[i + 1] = gray;
          neuesImg.data[i + 2] = gray;
          neuesImg.data[i + 3] = bildDaten.a[z][s];
        i += 4;
      }
    }
    // Canvas leeren
    cv.clearRect(0, 0, canvas.width, canvas.height);
    cv.putImageData(neuesImg, 0, 0);
    console.timeEnd("MW Graubild");
  } //Beende MW Graubild

  //Graubilder ebnen
  const ebneImage = () => {
    console.time("Ebnen");
    let histogramm = [];
    let kumHistogramm = [];
    let normHistogramm = [];
    // erstelle Histogramm-Array
    for(let i = 0; i < 256; i++){
      histogramm.push(0);
      kumHistogramm.push(0);
      normHistogramm.push(0);
    }
    let neuesImg = cv.createImageData(canvas.width, canvas.height);
    // Für die Zeilen -> Höhe
    let i = 0;
    for(let z = 0; z < bildDaten.r.length; z++){
      // Für die Spalten -> einzelne Werte
      for(let s = 0; s < canvas.width; s++){
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
    // console.log(histogramm);
    // console.log(kumHistogramm);
    // console.log(normHistogramm);
    //Werte aus dem ImageData umrechnen
    for(let i = 0; i < neuesImg.data.length; i+=4){
      let neuerWert = normHistogramm[neuesImg.data[i]];
      neuesImg.data[i] = neuerWert;
      neuesImg.data[i + 1] = neuerWert;
      neuesImg.data[i + 2] = neuerWert;
    }
    // Canvas leeren
    cv.clearRect(0, 0, canvas.width, canvas.height);
    cv.putImageData(neuesImg, 0, 0);
    console.timeEnd("Ebnen");
  } //Beende ebnen von Graubild

  // Zeige nur einen Farbkanal an
  const chooseColor = (kanal) => {
    console.time("Farbkanal");
    let neuesImg = cv.createImageData(canvas.width, canvas.height);
    // Für die Zeilen -> Höhe
    let i = 0;
    for(let z = 0; z < bildDaten.r.length; z++){
      // Für die Spalten -> einzelne Werte
      for(let s = 0; s < canvas.width; s++){
        // Werte invertieren und in Daten einfügen
        if(kanal == "rot"){
          neuesImg.data[i] = bildDaten.r[z][s];
          neuesImg.data[i + 1] = 0;
          neuesImg.data[i + 2] = 0;
        } else if(kanal == "gruen"){
          neuesImg.data[i + 1] = bildDaten.g[z][s];
          neuesImg.data[i + 2] = 0;
        } else if(kanal == "blau"){
          neuesImg.data[i] = 0;
          neuesImg.data[i + 1] = 0;
          neuesImg.data[i + 2] = bildDaten.b[z][s];
        }
        neuesImg.data[i + 3] = bildDaten.a[z][s];
        i += 4;
      }
    }
    // Canvas leeren
    cv.clearRect(0, 0, canvas.width, canvas.height);
    cv.putImageData(neuesImg, 0, 0);
    console.timeEnd("Farbkanal");
  }
  // Ende nur einen Farbkanal zeigen

  // LUT-Funktion
  const lutImage = (min, max) => {
    console.time("LUT");
    let histogramm = [];
    // erstelle Histogramm-Array
    for(let i = 0; i < 256; i++){
      histogramm.push(0);
    }
    let hmax = 0;
    let hmin = 0;
    let neuesImg = cv.createImageData(canvas.width, canvas.height);
    // Für die Zeilen -> Höhe
    let i = 0;
    for(let z = 0; z < bildDaten.r.length; z++){
      // Für die Spalten -> einzelne Werte
      for(let s = 0; s < canvas.width; s++){
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
    console.log(hmin, hmax);
    // Canvas leeren
    cv.clearRect(0, 0, canvas.width, canvas.height);
    cv.putImageData(neuesImg, 0, 0);
    console.timeEnd("LUT");
  } //Beende LUT


  // Bilddaten bekommen, wenn noch nichts getan wurde
  //Diese sollen auch aufgerufen werden, wenn die URL verändert wird -> neues Bild
  let bildDaten = getImageData(img);

  const showModel = (x, min, max) => {
    // console.log(model.value);
    switch(model.value){
      case modelArr[1]:
        // Invertieren
        invertImage();
        break;
      case modelArr[2]:
        // Mitteln
        mittelImage(x);
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
        lutImage(min,max);
        break;
      default:
        bildDaten = getImageData(img);
    }
  }

  updateRanges();
  imageUrl.addEventListener("change",function(){
      img.src = imageUrl.value;
      model.value = modelArr[0];
      setTimeout(function(){
        bildDaten = getImageData(img);
      },1500);
  });

  range.addEventListener("change", updateRanges);
  rangeMin.addEventListener("change", updateRanges);
  rangeMax.addEventListener("change", updateRanges);


  // Wenn das Select-Element verlassen wird, soll die entsprechende Funktion aufgerufen werden
  model.addEventListener('change', function(){
    showModel(parseInt(range.value), parseInt(rangeMin.value), parseInt(rangeMax.value));
  }); //Beende model wählen


  function updateRanges(){
    rangeAusgabe.textContent = range.value;
    rangeAusgabeMin.textContent = rangeMin.value;
    rangeAusgabeMax.textContent = rangeMax.value;
    showModel(parseInt(range.value), parseInt(rangeMin.value), parseInt(rangeMax.value));
  }

}; //Beende onload
