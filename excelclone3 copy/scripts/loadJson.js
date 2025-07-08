export default class jsonLoader{

    constructor(grid){
        this.grid = grid
        this.uploadButton = document.createElement("input")
        this.uploadButton.type = "file"
        this.uploadButton.onchange = this.loadFile()
    }
    loadFile(){
        if ('files' in this.uploadButton ){
          if(this.uploadButton.files.length == 0){
            return
          }else{
            
          }
        }
    }
}