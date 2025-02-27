import VideoIcon from "./videoIcon";
import AudioIcon from "./audioIcon";


export default function ShowComponentButton({ setShowComponent, showComponent }) {
    const IconComponent = showComponent === 'audio' ? VideoIcon : AudioIcon;

    return <IconComponent size={40} onClick={() => setShowComponent(showComponent === 'audio' ? 'video' : 'audio')} />;
}







/*import VideoIcon from "./videoIcon"
import AudioIcon from "./audioIcon"

export default function ShowComponentButton({setShowComponent, showComponent} ){
    return <ExpandIcon size={50} onClick={() => setShowComponent(showComponent === 'audio' ? 'video' : 'audio')} />
}*/