export default function localStorageAcces(method, path, inf){
    if (typeof window !== 'undefined') {
        if(method === 'POST'){
            //console.log('POST localStorageAcces');
            return      localStorage.setItem(path, JSON.stringify(inf));
        } else if(method === 'GET'){
            //console.log(JSON.parse(localStorage.getItem(path)));
            return JSON.parse(localStorage.getItem(path));
        }
    }
}