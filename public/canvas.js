
let canvas=document.querySelector("canvas");
canvas.width=window.innerWidth; // 
canvas.height =window.innerHeight;

let pencilColor =document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download");
let redo =document.querySelector(".redo");
let undo =document.querySelector(".undo");
let penColor ="red";
let eraserColor ="white";
let penWidth =pencilWidthElem.value;
let eraserWidth=eraserWidthElem.value;


// variable for undo and redo feature
let undoRedoTracker =[];
let track =0; //  on redo move forward and on undo moves backward in tracker array

let mouseDown=false; // mouse is not in down condition
let tool =canvas.getContext("2d");

tool.strokeStyle=penColor; // default value
tool.lineWidth=penWidth;   // default value

// moudown start new path,mousemove --> fill graphics 
canvas.addEventListener("mousedown",(e)=>{

    mouseDown=true;
    // beginPath({
    //     x:e.clientX,
    //     y: e.clientY
    // })
    let data ={
        x:e.clientX,
       y: e.clientY
    }
    socket.emit("beginPath",data);
})

canvas.addEventListener("mousemove",(e)=>{

//     if(mouseDown) drawStroke({
//    x : e.clientX,
//    y : e.clientY,
//    color : eraserFlag?eraserColor : penColor,
//    width : eraserFlag ? eraserWidth : penWidth
//     })
if (mouseDown) {
    let data = {
        x: e.clientX,
        y: e.clientY,
        color: eraserFlag ? eraserColor : penColor,
        width: eraserFlag ? eraserWidth : penWidth
    }
    socket.emit("drawStroke", data);
}
})

canvas.addEventListener("mouseup",(e)=>{
    mouseDown=false;

    let url =canvas.toDataURL();
    undoRedoTracker.push(url);
    track = undoRedoTracker.length -1;
})
// undo and redo feature
undo.addEventListener("click",(e)=>{

    if (track > 0) track--;
    // track action
    let data = {
        trackValue: track,
        undoRedoTracker
    }
    // undoRedoCanvas(trackObj);
    socket.emit("redoUndo", data);
    
})

redo.addEventListener("click",(e)=>{

    if(track<undoRedoTracker.length-1)
    track++;
    //action
    let data ={
        trackValue  : track,
        undoRedoTracker
    }
    // undoRedoCanvas(trackObj);
    socket.emit("redoUndo", data);
})

function undoRedoCanvas(trackObj){

    track = trackObj.trackValue;
  undoRedoTracker = trackObj.undoRedoTracker;

  let url = undoRedoTracker[track];
  let img= new Image();
  canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);
  img.src = url;
  img.onload = (e)=>{
    tool.drawImage(img,0,0,canvas.width,canvas.height);      //starting coordinate and ending coordinate
  }
}

function beginPath(strokeObj)
{
    tool.beginPath();
    tool.moveTo(strokeObj.x,strokeObj.y)
}

function drawStroke(strokeObj)
{
    tool.strokeStyle=strokeObj.color;
    tool.lineWidth=strokeObj.width;
    tool.lineTo(strokeObj.x,strokeObj.y);
    tool.stroke();
}

// changing pencil color

pencilColor.forEach(colorElem => {
   
    colorElem.addEventListener("click",(e)=>{

        let color = colorElem.classList[0];
        penColor=color;
        tool.strokeStyle=penColor;
    })
});

// changing pencil size 

pencilWidthElem.addEventListener("change",(e)=>{
    penWidth=pencilWidthElem.value;
    tool.lineWidth = penWidth;
})

// changing eraser size
eraserWidthElem.addEventListener("change",(e)=>{
    eraserWidth =eraserWidthElem.value;
    tool.lineWidth=eraserWidth;

})

eraser.addEventListener("click",(e)=>{
    if(eraserFlag)
    {
        tool.strokeStyle=eraserColor;
        tool.lineWidth=eraserWidth;
    }
    else{
        tool.strokeStyle=pencilColor;
        tool.lineWidth=penWidth
    }
})

// download feature

download.addEventListener("click",(e)=>{

    let url = canvas.toDataURL();
    let a =document.createElement("a");
    a.href =url;
    a.download = "board.jpg";
    a.click();
})

socket.on("beginPath", (data) => {
    // data -> data from server
    beginPath(data);
})
socket.on("drawStroke", (data) => {
    drawStroke(data);
})
socket.on("redoUndo", (data) => {
    undoRedoCanvas(data);
})