import { useRouter } from 'next/navigation';
import handleMultipleFunctions from '../general/handleMultipleFunctions';
import localStorageAcces from '../security/localStorageAcces';

export default function CmsMenuContent(){
    const router = useRouter();

    return( <>
                <button className="botones" onClick={() => { window.location.href = 'https://apu-kappa.vercel.app/' }}>APU</button>
                <button className="botones" onClick={() => { window.location.href = 'https://gannt-blush.vercel.app/' }}>GANNT</button>
                <button className="botones" onClick={handleMultipleFunctions(
                () => localStorageAcces('POST', 'loggingStatus', false),                     
                () => router.push('/')
                )}>SALIR</button>
            </>
    )
}