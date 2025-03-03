import VideoIcon from "./videoIcon";
import AudioIcon from "./audioIcon";


export default function ShowComponentButton({ setShowComponent, showComponent, isHybridView }) {
    if(isHybridView){
        const IconComponent = showComponent === 'audio' ? VideoIcon : AudioIcon;
        return <IconComponent size={40} onClick={() => setShowComponent(showComponent === 'audio' ? 'video' : 'audio')} />;
    } else{
        return null
    }
}







