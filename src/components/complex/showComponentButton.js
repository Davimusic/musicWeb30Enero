import ExpandIcon from "./expandIcon"

export default function ShowComponentButton({setShowComponent, showComponent} ){
    return <ExpandIcon size={50} onClick={() => setShowComponent(showComponent === 'audio' ? 'video' : 'audio')} />
}