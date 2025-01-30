import importAllFunctions from "./importAllLocalFunctions";

export default function evaluteAction(fun, trueCase, falseCase){
    if(fun){
        console.log('entra true');
        trueCase()
    } else {
        console.log('entra false');
        falseCase()
    }
}