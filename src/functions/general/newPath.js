import { useRouter } from 'next/navigation';

export function newRoute() {
    const router = useRouter();

    const useNewRoute = (path) => {
        router.push(path);
    };

    return useNewRoute;
}
