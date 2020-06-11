export class SelectionManagerUnbound{
    private selectionIndexArr: number[] = []
    constructor(){}

    public select(selectionIndex: number, multi?: boolean){
        let index = this.selectionIndexArr.indexOf(selectionIndex)
        if(multi){
            if(index > -1){
                this.selectionIndexArr.splice(index,1)
            } else {
                this.selectionIndexArr.push(selectionIndex)
            }
        } else {
            if(index > -1){
                this.selectionIndexArr = []
            } else {
                this.selectionIndexArr = [selectionIndex]
            }
        }
    }

    public getSelectionIndexes(): number[]{
        return this.selectionIndexArr
    }
}