import onlyFrontend from '../security/onlyFrontend';

export default function Prueva(message) {
    return onlyFrontend(() => alert(message))
}