/*
  Eigene Bibliothek zum Zeichnen von Werten
  Veränderungsvorschläge:
    Werte auf der Achse sollten zuletzt gezeichnet werden, da diese sonst
    überzeichnet werden.

    Möglichkeit zum Zeichnen von Balkendiagramen fehlt noch.
    Kuchendiagramme sind auch nicht vorhanden.
    Alternativ vielleicht noch eine Diagram, wie in MAthcad, bei dem die Werte
      auf einem Kreis mit Achsen angezeigt werden -> sin, cos etc.
*/

class MathGraph {
  constructor(canvasId, width, height){
    this.canvas = canvasId;
    this.width = 600;
    this.height = 300;
    // Zeichenelement
    this.ctx;
    // Achsen-Grenze
    this.min = [-10, -10];
    this.max = [10, 10],
    // Achsen Kreuz
    this.mitte = [0, 0];
    // Gesamter Bereich -> min bis max
    this.range = [20 , 20];
    // Gitterlinien
    this.size = [1, 1];
    // Gitter-Wert, um das Gitter anzupassen -> width/range
    this.gridSize = [0, 0];
    this.delta = [0, 0];
    // Werte die eingezeichnet werden sollen
    this.values = {x: [], y: [], xCalculated: [], yCalculated: []};
    // initialisiert die Canvas
    this.init(width, height);
    // Zeichnet die Gitterlinien
    this.grid();
  }

  // Canvas initialisieren
  init(width, height){
    // Wenn width und height Integer-Werte sind -> neue width und height einstellen
    if(!isNaN(Number(width))) this.width = Math.ceil(Number(width));
    if(!isNaN(Number(height))) this.height = Math.ceil(Number(height));
    // Canvas-Element greifen
    this.canvas = document.getElementById(this.canvas);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.border = "2px solid #000000";
    this.ctx = this.canvas.getContext("2d");
    // Dieses Element ist aufgrund der Warnung durch die Konsole eingefügt worden
    this.ctx.imageSmoothingEnabled = "true";
    this.ctx.font = "12px Arial";
  }

  // Achsenkreuz erstellen
  axis(minX, minY, maxX, maxY){
    // Zeichnung starten
    this.ctx.beginPath();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = "#333333";
    // sind die Werte Nummern?
    minX = Number(minX);
    minY = Number(minY);
    maxX = Number(maxX);
    maxY = Number(maxY);
    let temp;
    if(!isNaN(minX)) this.min[0] = minX;
    if(!isNaN(minY)) this.min[1] = minY;
    if(!isNaN(maxX)) this.max[0] = maxX;
    if(!isNaN(maxY)) this.max[1] = maxY;
    // Sicherstellen, das min kleiner ist als max
    if(this.min[0] > this.max[0]) {
      temp = this.max[0];
      this.max[0] = this.min[0];
      this.min[0] = temp;
    }
    if(this.min[1] > this.max[1]) {
      temp = this.max[1];
      this.max[1] = this.min[1];
      this.min[1] = temp;
    }
    // Bereich für die Werte berechnen
    this.range[0] = (Math.abs(this.min[0]) + Math.abs(this.max[0]));
    this.range[1] = (Math.abs(this.min[1]) + Math.abs(this.max[1]));
    // Range darf nicht null sein
    if(this.range[0] === 0) this.range[0] = 1;
    if(this.range[1] === 0) this.range[1] = 1;
    // Die Standardsize soll nicht zu klein sein -> range/20 -> max 20 Gitterlinien
    this.size = [
      (this.range[0]/5),
      (this.range[1]/5)    ];
    // offset des Achsenkreuzes
    let offset = [0,0];
    // Wenn die Verteilung ungleich ist, wird das Kreuz entsprechend verschoben
    if(this.min[0] < 0 && this.max[0] > 0){
      offset[0] = Math.abs(this.min[0]) / this.range[0];
    } else if(this.min[0] < 0 && this.max[0] < 0){
      offset[0] = 1;
    }
    if(this.min[1] < 0 && this.max[1] > 0){
      offset[1] = 1 - (Math.abs(this.min[1]) / this.range[1]);
    } else if(this.min[1] > 0 && this.max[1] > 0){
      offset[1] = 1;
    }


    // Werte für die Mittellinien
    this.mitte[0] = Math.round(this.width * offset[0]);
    this.mitte[1] = Math.round(this.height * offset[1]);
    // Zeichnen
      this.ctx.moveTo(this.mitte[0], this.height);
      this.ctx.lineTo(this.mitte[0], 0);
      this.ctx.moveTo(this.width, this.mitte[1]);
      this.ctx.lineTo(0, this.mitte[1]);
    this.ctx.stroke();
  }

  //Gitterlinien erstellen
  grid(sizeX, sizeY, minX, minY, maxX, maxY){
    // Leeren des Zeichenfeldes
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.axis(minX, minY, maxX, maxY);
    // Testen, ob size eine Zahl ist
    sizeX = Number(sizeX);
    sizeY = Number(sizeY);
    let expX = "", expY = "";
    let powX = 0, powY = 0;
    if(!isNaN(sizeX)) this.size[0] = Math.abs(sizeX);
    if(!isNaN(sizeY)) this.size[1] = Math.abs(sizeY);
    // Sicherstellen, dass size nicht zu klein wird -> max 50 Gitterlinien
    if(this.size[0] < this.range[0]/10)   this.size[0] = this.range[0]/10;
    if(this.size[1] < this.range[1]/10)   this.size[1] = this.range[1]/10;
    // Verhältnis zwischen der Canvas und den Werten -> Umrechnung
    this.gridSize = [
      ((this.width/this.range[0])),
      ((this.height/this.range[1]))
    ];
    // console.log(this.gridSize, this.size, this.delta);
    // Size ausgabe erstellen
    // X-Richtung
    if(this.size[0] < 0.001 && this.size[0] > 0){
      //Zähle die Nullen nach dem Komma, bis zur ersten Zahl ungleich 0 ->
      // size[0] * Anzahl der Nullen - 1 -> size[0].tofixed(1) *eAnzahl der Nullen
      // String in Array -> ab index 2 testen, ob index +1 != 0
      sizeX = String(this.size[0]).split("");
      for(let i = 3; i < sizeX.length; i++){
        if(sizeX[i+1] !== "0"){
          powX = i;
          break;
        }
      }
      sizeX = (this.size[0] * Math.pow(10, powX)).toFixed(1);
      expX = `e-${powX}`;
    } else if(this.size[0] > 1000){
      // Zähle die Zahlen bis zur 0 ->
      // size[0] / Anzahl der Zahlen-1 -> size[0].tofixed(1) *eAnzahl der Zahlen-1
      sizeX = String(this.size[0]).split("");
      // console.log(sizeX.length);
      for(let i = 2; i < sizeX.length; i++){
        if(sizeX[i] == "."){
          break;
        }
        powX = i;
      }
      sizeX = (this.size[1] * Math.pow(10, (-powX))).toFixed(1);
      expX = `e${powX}`;
      // console.log(this.size[0]);
      // console.log(sizeX);
    } else {
      sizeX = this.size[0].toFixed(1);
    }
    // Y-Richtung
    if(this.size[1] < 0.001 && this.size[1] > 0){
      //Zähle die Nullen nach dem Komma, bis zur ersten Zahl ungleich 0 ->
      // size[0] * Anzahl der Nullen - 1 -> size[0].tofixed(1) *eAnzahl der Nullen
      // String in Array -> ab index 2 testen, ob index +1 != 0
      sizeY = String(this.size[1]).split("");
      for(let i = 3; i < sizeY.length; i++){
        if(sizeY[i+1] !== "0"){
          powY = i;
          break;
        }
      }
      sizeY = (this.size[1] * Math.pow(10, powY)).toFixed(1);
      expY = `e-${powY}`;
    } else if(this.size[1] > 1000){
      // Zähle die Zahlen bis zur 0 ->
      // size[0] / Anzahl der Zahlen-1 -> size[0].tofixed(1) *eAnzahl der Zahlen-1
      sizeY = String(this.size[1]).split("");
      // console.log(sizeY.length);
      for(let i = 2; i < sizeY.length; i++){
        if(sizeY[i] == "."){
          break;
        }
        powY = i;
      }
      sizeY = (this.size[1] * Math.pow(10, (-powY))).toFixed(1);
      expY = `e${powY}`;
    } else {
      sizeY = this.size[1].toFixed(1);
    }
    // Gitterweite
    this.delta = [
      (this.gridSize[0]*this.size[0]),
      (this.gridSize[1]*this.size[1])
    ];
    console.log("grid delta: ",this.delta);
    // vertikale Streifen definieren
    for(let x = 1; x < this.width/this.delta[0]; x++){
      // Zeichnen beginnen
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = "#b3daff";
      this.ctx.moveTo(this.mitte[0] + x * this.delta[0], this.height);
      this.ctx.lineTo(this.mitte[0] + x * this.delta[0], 0);
      this.ctx.moveTo(this.mitte[0] - x * this.delta[0], this.height);
      this.ctx.lineTo(this.mitte[0] - x * this.delta[0], 0);
      // einzeichnen
      this.ctx.stroke();
      if(x % 2 === 0){
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#000000";
        this.ctx.moveTo(this.mitte[0] + x * this.delta[0], this.mitte[1]-5);
        this.ctx.lineTo(this.mitte[0] + x * this.delta[0], this.mitte[1]+5);
        this.ctx.moveTo(this.mitte[0] - x * this.delta[0], this.mitte[1]-5);
        this.ctx.lineTo(this.mitte[0] - x * this.delta[0], this.mitte[1]+5);
        // einzeichnen
        this.ctx.stroke();
        //Zeichne Werte am Ende bei DrawValues ein -> Eigene Funktion

        if(this.mitte[1] >= this.height){
          this.ctx.fillText(`${(sizeX * x).toFixed(1)}${expX}`,
              this.mitte[0] + x * this.delta[0] - 6, this.mitte[1] - 15);
          this.ctx.fillText(`${(sizeX * -x).toFixed(1)}${expX}`,
              this.mitte[0] - x * this.delta[0] - 6, this.mitte[1] - 15);
        } else {
          this.ctx.fillText(`${(sizeX * x).toFixed(1)}${expX}`,
              this.mitte[0] + x * this.delta[0] - 6, this.mitte[1] + 15);
          this.ctx.fillText(`${(sizeX * -x).toFixed(1)}${expX}`,
              this.mitte[0] - x * this.delta[0] - 6, this.mitte[1] + 15);
        }

      }
    }
    // horizontale Streifen definieren
    for(let y = 1; y < this.height/this.delta[1]; y++){
      // Zeichnen beginnen
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = "#b3daff";
      this.ctx.moveTo(this.width, this.mitte[1] + y * this.delta[1]);
      this.ctx.lineTo(0, this.mitte[1] + y * this.delta[1]);
      this.ctx.moveTo(this.width, this.mitte[1] - y * this.delta[1]);
      this.ctx.lineTo(0, this.mitte[1] - y * this.delta[1]);
      // einzeichnen
      this.ctx.stroke();
      if(y % 2 === 0){
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#000000";
        this.ctx.moveTo(this.mitte[0]-5, this.mitte[1] + y * this.delta[1]);
        this.ctx.lineTo(this.mitte[0]+5, this.mitte[1] + y * this.delta[1]);
        this.ctx.moveTo(this.mitte[0]-5, this.mitte[1] - y * this.delta[1]);
        this.ctx.lineTo(this.mitte[0]+5, this.mitte[1] - y * this.delta[1]);
        // einzeichnen
        if(this.mitte[0] >= this.width){
          this.ctx.stroke();
          this.ctx.fillText(`${(sizeY * -y).toFixed(1)}${expY}`,
              this.mitte[0] - 60, this.mitte[1] + 3 + y * this.delta[1]);
          this.ctx.fillText(`${(sizeY * y).toFixed(1)}${expY}`,
              this.mitte[0] - 60, this.mitte[1] + 3 - y * this.delta[1]);
        }else {
          this.ctx.stroke();
          this.ctx.fillText(`${(sizeY * -y).toFixed(1)}${expY}`,
              this.mitte[0] + 10, this.mitte[1] + 3 + y * this.delta[1]);
          this.ctx.fillText(`${(sizeY * y).toFixed(1)}${expY}`,
              this.mitte[0] + 10, this.mitte[1] + 3 - y * this.delta[1]);
        }
      }
    }
  }

  // Values in das Value-Objekt überführen
  // Es wird nur bis 2.dimensionalem Array geprüft
  getValues(valX, valY, resultX, resultY){
    let index, index2;
    console.log("Hinweis: Leere Arrays werden als 0 interpretiert");
    // Wenn es zahlen sind
    if(!isNaN(Number(valX)) && !isNaN(Number(valY)) )
    {
      resultX.push(Number(valX));
      resultY.push(Number(valY));
    }
    // Wenn es Arrays sind
    else if(Array.isArray(valX) && Array.isArray(valY)){
      // console.log("Es wurden Arrays eingegeben");
      // Testen, welcher Array kürzer ist
      if(valX.length <= valY.length){
        // Für jedes Element testen
        for(index in valX){
          // Wenn es eine Zahl ist, dann einfügen
          if(!isNaN(Number(valX[index])) && !isNaN(Number(valY[index]))){
            resultX.push(Number(valX[index]));
            resultY.push(Number(valY[index]));
          }
          // Wenn es ein Array ist, dann überprüfen, ob die Elemente zahlen sind
          else if (Array.isArray(valX[index])){
            let xArray = [];
            let yArray = [];
            for(index2 in valX[index]){
              if(!isNaN(Number(valX[index][index2]))
                    && !isNaN(Number(valY[index][index2])))
                {
                  xArray.push(Number(valX[index][index2]));
                  yArray.push(Number(valY[index][index2]));
                }
            }
            resultX.push(xArray);
            resultY.push(yArray);
          }
        }
      } else{
        for(index in valY){
          // Wenn es eine Zahl ist, dann einfügen
          if(!isNaN(Number(valX[index])) && !isNaN(Number(valY[index]))){
            resultY.push(Number(valY[index]));
            resultX.push(Number(valX[index]));
          }
          // Wenn es ein Array ist, dann überprüfen, ob die Elemente zahlen sind
          else if (Array.isArray(valY[index])){
            let xArray = [];
            let yArray = [];
            for(index2 in valY[index]){
              if(!isNaN(Number(valX[index][index2]))
                  && !isNaN(Number(valY[index][index2])))
                {
                  xArray.push(Number(valX[index][index2]));
                  yArray.push(Number(valY[index][index2]));
                }
            }
            resultX.push(xArray);
            resultY.push(yArray);
          }
        }
      }
    } //Ende der Arrays
    else {
      console.log("In getValues gibt es Probleme in den Werten: x:", valX, " | y: ", valY);
    }
    console.log("Values: ", this.values);
  }

  // Funktion um min und max zu finden
  testMinMax(wert1, wert2){
    let index;
    //console.log(wert1, wert2);
    // Testen, ob es eine Nummer ist
    if(!isNaN(Number(wert1)) && !isNaN(Number(wert2)) ){
      wert1 = Number(wert1);
      wert2 = Number(wert2);
      if(wert1 < this.min[0] ) this.min[0] = wert1;
      if(wert2 < this.min[1] ) this.min[1] = wert2;
      if(wert1 > this.max[0] ) this.max[0] = wert1;
      if(wert2 > this.max[1] ) this.max[1] = wert2;
    }
    // testen, ob es ein Array ist
    else if(Array.isArray(wert1) && Array.isArray(wert2)){
      // testen, ob die Elemente der Arrays nummern sind
        if(wert1.length <= wert2.length){
          for(index in wert1){
            if(!isNaN(Number(wert1[index]))
                && !isNaN(Number(wert2[index])) ){
              wert1[index] = Number(wert1[index]);
              wert2[index] = Number(wert2[index]);
              if(wert1[index] < this.min[0] ) this.min[0] = wert1[index];
              if(wert2[index] < this.min[1] ) this.min[1] = wert2[index];
              if(wert1[index] > this.max[0] ) this.max[0] = wert1[index];
              if(wert2[index] > this.max[1] ) this.max[1] = wert2[index];
            }
          }
        } else {
          for(index in wert1){
            if(!isNaN(Number(wert1[index]))
                && !isNaN(Number(wert2[index])) ){
              wert1[index] = Number(wert1[index]);
              wert2[index] = Number(wert2[index]);
              if(wert1[index] < this.min[0] ) this.min[0] = wert1[index];
              if(wert2[index] < this.min[1] ) this.min[1] = wert2[index];
              if(wert1[index] > this.max[0] ) this.max[0] = wert1[index];
              if(wert2[index] > this.max[1] ) this.max[1] = wert2[index];
            }
          }
        }
    }
    else{
      console.log("In testMinMax gibt es Probleme: x: ", wert1, " | y:", wert2);
    }
  }

  getValuesMinMax(){
    //console.log("getValuesMinMax");
    if(this.values.x.length > 0 && this.values.y.length > 0){
      let index;
      let x = this.values.x;
      let y = this.values.y;
      this.min = [Infinity, Infinity];
      this.max = [-Infinity, -Infinity];
      // Wenn nur eine Zahl in den Values steckt
      if(!isNaN(Number(x)) && !isNaN(Number(y))){
        // console.log("Zahl ",x, y);
        this.min = [x, y];
        this.max = [x, y];
      }
      // Wenn Values Arrays sind, jedes Element testen
      else if(Array.isArray(x) && Array.isArray(y)){
        // console.log("Array ",x, y);
        // Wenn ein Array kürzer ist als das andere,
        // dann werden nur bis zum ende des kürzeren Arrays geprüft
        if(x.length <= y.length){
          for(index in x){
            this.testMinMax(x[index], y[index]);
          }
        } else {
          for(index in y){
            this.testMinMax(x[index], y[index]);
          }
        }
      } //Ende der Arrays
      else{
        console.log("In GetValuesMinMax gibt es Probleme: ", this.values);
      }
    } //Wenn values-längen > 0
    // Sicherstellen, dass es alles nummern sind
    this.min[0] = Number(this.min[0]);
    this.min[1] = Number(this.min[1]);
    this.max[0] = Number(this.max[0]);
    this.max[1] = Number(this.max[1]);
    // Wenn min und Max ungleich sind
    if(this.min[0] != this.max[0]){
      // wenn min und max > 0 sind, dann soll min -1/10 max sein
      if(this.min[0] > 0 && this.max[0] > 0){
        this.max[0] *= 1.3;
        this.min[0] *= 0.7;
      }
      else if(this.min[0] < 0 && this.max[0] < 0){
        this.max[0] *= 0.7;
        this.min[0] *= 1.3;
      }
      else if(this.min[0] == 0 && this.max[0] != 0){
        this.min[0] = parseFloat(this.max[0]) * -0.3;
      }
      else if(this.min[0] != 0 && this.max[0] == 0){
        this.max[0] = parseFloat(this.min[0]) * -0.3;
      } else{
        this.max[0] *= 1.2;
        this.min[0] *= 1.2;
      }

    } else {
      // console.log(this.min, this.max);
      if(this.max[0] >= 0) this.max[0] += 1;
      else this.max[0] -= 1;
      this.min[0] = this.max[0] * -0.3;
    }
    if(this.min[1] != this.max[1]){
      if(this.min[1] > 0 && this.max[1] > 0){
        this.min[1] *= 0.7;
        this.max[1] *= 1.3;
      }
      else if(this.min[1] < 0 && this.max[1] < 0){
        this.max[1] *= 0.7;
        this.min[1] *= 1.3;
      }
      else if(this.min[1] == 0 && this.max[1] != 0){
        this.min[1] = parseFloat(this.max[1]) * -0.3;
      }
      else if(this.min[1] != 0 && this.max[1] == 0){
        this.max[1] = parseFloat(this.min[1]) * -0.3;
      }
      else{
        this.max[1] *= 1.2;
        this.min[1] *= 1.2;
      }
    }else {
      // console.log(this.min, this.max);
      if(this.max[1] >= 0) this.max[1] += 1;
      else this.max[1] -= 1;
      this.min[1] = this.max[1] * -0.3;
    }
    // console.log(this.min, this.max);
  }

  // Punkte einzeichnen
  drawValues(valX, valY, format ,sizeX, sizeY,minX, minY, maxX, maxY){
    this.clearValues();
    let lineW = 2;
    // Testet auf Zahlen oder Arrays (max. 2 dimenionales Array)
    this.getValues(valX, valY, this.values.x, this.values.y);
    this.getValuesMinMax();
    console.log("min: ", this.min, "max: ", this.max);
      // Achse und Gitter zeichnen -> gridSize wird hier berechnet
      this.grid(sizeX, sizeY, minX, minY, maxX, maxY);
      let x = this.values.x;
      let y = this.values.y;
      if(x.length > 0 && y.length > 0){
        // Alle Elemente überprüfen
        for(let index = 0; index < x.length; index++){
          // console.log(this.gridSize);
          if(!isNaN(Number(x[index])) && !isNaN(Number(y[index]))){
            this.ctx.beginPath();
            this.ctx.lineWidth = lineW;
            this.ctx.strokeStyle = this.strokeColor();
            // console.log(xCalculated, yCalculated);
            this.crossPointer(x[index], y[index]);
            this.ctx.stroke();
            // this.ctx.fillText(`(${x[index]}, ${y[index]})`,
            //     xCalculated+10, yCalculated-10);
          }
          else if(Array.isArray(x[index]) && Array.isArray(y[index])){
            this.ctx.beginPath();
            this.ctx.lineWidth = lineW;
            this.ctx.strokeStyle = this.strokeColor();
            for(let index2 = 0; index2 < x[index].length; index2++){
              let x0 = x[index][index2];
              let y0 = y[index][index2];
              let x1 = x[index][index2+1];
              let y1 = y[index][index2+1];
              // console.log(this.gridSize);
              if(!isNaN(Number(x0)) && !isNaN(Number(y0))){
                switch(format){
                  case "cross":
                    this.crossPointer(x0, y0);
                    break;
                  case "line":
                    if(!isNaN(Number(x1)) && !isNaN(Number(y1))){
                      this.linePointer(x0, y0, x1, y1);
                    }

                    break;
                  case "arrow":
                    if(!isNaN(Number(x1)) && !isNaN(Number(y1))){
                      this.arrowPointer(x0, y0, x1, y1);
                    }
                    break;
                  case "histo":
                    this.histogramm(x0, y0);
                    break;
                  default:
                    this.crossPointer(x0, y0);
                }
                this.ctx.stroke();
                // this.ctx.fillText(`(${x[index][index2]}, ${y[index][index2]})`,
                //     xCalculated+10, yCalculated-10);
              } else {
                console.log("Es gibt einen Fehler bei den Werten x: ", x[index][index2], " | y: ", y[index][index2]);
              }
            }
          } else {
            console.log("Es gibt einen Fehler bei den Werten x: ", x[index], " | y: ", y[index]);
          }
        }
      } else {
        console.log("Es gibt ein Problem in drawValues: x: ", valX, " y: ", valY);
      }
  }

  drawArrows(x0, y0 , x1, y1){
    let lineW = 2;
    this.ctx.beginPath();
    this.ctx.lineWidth = lineW;
    this.ctx.strokeStyle = this.strokeColor();
    if(!isNaN(Number(x0)) &&  !isNaN(Number(y0)) && !isNaN(Number(x1)) && !isNaN(Number(y1)))
    {
      this.arrowPointer(x0, y0, x1, y1);
      this.ctx.stroke();
    }
  }


  // Funktion, damit die einzelnen Elemente verschiedene Farben bekommen
  strokeColor(){
     let r = Math.floor(Math.random()*240 + 10);
     let g = Math.floor(Math.random()*240 + 10);
     let b = Math.floor(Math.random()*240 + 10);
     return `rgb(${r}, ${g}, ${b})`;
  }

  // Kreuz zeichnen
  crossPointer(x, y){
    let xCalculated = Math.ceil(this.mitte[0] + (Number(x) * this.gridSize[0]));
    let yCalculated = Math.ceil(this.mitte[1] - (Number(y) * this.gridSize[1]));
    this.ctx.moveTo(xCalculated-7,yCalculated);
    this.ctx.lineTo(xCalculated+7,yCalculated);
    this.ctx.moveTo(xCalculated,yCalculated-7);
    this.ctx.lineTo(xCalculated,yCalculated+7);
  }

  // Kreuz zeichnen
  histogramm(x, y){
    let xCalculated = Math.ceil(this.mitte[0] + (Number(x) * this.gridSize[0]));
    let yCalculated = Math.ceil(this.mitte[1] - (Number(y) * this.gridSize[1]));
    this.ctx.moveTo(xCalculated, this.mitte[1]);
    this.ctx.lineTo(xCalculated, yCalculated);
  }

  // Linie zeichnen
  linePointer(x0, y0, x1, y1){
    if(!isNaN(Number(x0)) &&  !isNaN(Number(y0)) && !isNaN(Number(x1)) && !isNaN(Number(y1)))
    {
      let xCalculated0 = Math.ceil(this.mitte[0]  + (Number(x0) * this.gridSize[0]));
      let yCalculated0 = Math.ceil(this.mitte[1]  - (Number(y0) * this.gridSize[1]));
      let xCalculated1 = Math.ceil(this.mitte[0]  + (Number(x1) * this.gridSize[0]));
      let yCalculated1 = Math.ceil(this.mitte[1]  - (Number(y1) * this.gridSize[1]));
      this.ctx.moveTo(xCalculated0,yCalculated0);
      this.ctx.lineTo(xCalculated1,yCalculated1);
    }
  }

  arrowPointer(x0, y0, x1, y1){
    let xCalculated0 = Math.ceil(this.mitte[0] + (Number(x0) * this.gridSize[0]));
    let yCalculated0 = Math.ceil(this.mitte[1] - (Number(y0) * this.gridSize[1]));
    let xCalculated1 = Math.ceil(this.mitte[0] + (Number(x1) * this.gridSize[0]));
    let yCalculated1 = Math.ceil(this.mitte[1] - (Number(y1) * this.gridSize[1]));
    let diffX = xCalculated1 - xCalculated0;
    let diffY = yCalculated1 - yCalculated0;
    let hypotenuse = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
    if(hypotenuse == 0) return;
    let alphaX = Math.asin(diffX / hypotenuse);
    let alphaY = Math.acos(diffY / hypotenuse);
    alphaX = alphaX * 180/ Math.PI; //Grad
    alphaY = alphaY * 180/ Math.PI; //Grad
    let newHypotenuse = hypotenuse * 0.85;
    // Winkel +/- 10 Grad und dann die neuen Punke berechnen
    let newDiffX_1 = Math.sin((alphaX + 3) * Math.PI / 180) * newHypotenuse;
    let newDiffX_2 = Math.sin((alphaX - 3) * Math.PI / 180) * newHypotenuse;
    let newDiffY_1 = Math.cos((alphaY + 3) * Math.PI / 180) * newHypotenuse;
    let newDiffY_2 = Math.cos((alphaY - 3) * Math.PI / 180) * newHypotenuse;
    let newX1_1 = newDiffX_1 + xCalculated0;
    let newX1_2 = newDiffX_2 + xCalculated0;
    let newY1_1 = newDiffY_1 + yCalculated0;
    let newY1_2 = newDiffY_2 + yCalculated0;
    this.ctx.moveTo(xCalculated0,yCalculated0);
    this.ctx.lineTo(xCalculated1,yCalculated1);
    this.ctx.moveTo(xCalculated1,yCalculated1);
    this.ctx.lineTo(newX1_1,newY1_1);
    this.ctx.moveTo(xCalculated1,yCalculated1);
    this.ctx.lineTo(newX1_2,newY1_2);
  }

  // Alles zurücksetzen
  clear(){
    // Achsen-Grenze
    this.min = [-10, -10];
    this.max = [10, 10],
    // Achsen Kreuz
    this.mitte = [0, 0];
    // Gesamter Bereich -> min bis max
    this.range = [20 , 20];
    // Gitterlinien
    this.size = [1, 1];
    // Gitter-Wert, um das Gitter anzupassen -> width/range
    this.gridSize = [0, 0];
    // Werte die eingezeichnet werden sollen
    this.values = {x: [], y: []};
    // initialisiert die Canvas
    this.init();
    // Zeichnet die Gitterlinien
    this.grid();
  }

  // Werte zurücksetzen
  clearValues(){
    this.values = {x: [], y: []};
  }
};

// Funktioniert nur bei local Server -> wegen same-origin-policy
export default MathGraph;
// module.exports = MathGraph;
