import localStorageAcces from "./localStorageAcces";

export default function validateMultipurposeAccess(key, value){
    if (typeof window !== 'undefined') {
        const storedMultipurpose = localStorageAcces('GET', key)// JSON.parse(localStorage.getItem(key));
        if(storedMultipurpose === value){
            return true
        } else {
            return false
        }
    }
    return false;
};