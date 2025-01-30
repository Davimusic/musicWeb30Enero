const renderFile = (file, resourceType, externalFunctionActivationInterface, actionFunction) => {
    
    const fileUrl = file.secure_url;
    const style = {
        minWidth: '300px',
        maxWidth: '25vw',
        overflow: 'auto',
    };

    const url = <div onClick={()=> actionFunction(file)}>{externalFunctionActivationInterface}</div>
    switch (resourceType) {
        case 'image':
            return  <div style={{display: 'block'}}>
                        <img style={style} src={fileUrl} alt={file.public_id} width="100" />
                        {url}
                    </div>
        case 'video':
            return  <div style={{display: 'block'}}>
                        <video style={style} src={fileUrl} controls width="100" />
                        {url}
                    </div>
        case 'raw':
            return (
                <div style={{display: 'block'}}>
                    <iframe
                        src={`https://docs.google.com/gview?url=${fileUrl}&embedded=true`}
                        style={{ width: '80vw', height: '80vh', border: 'none', backgroundColor: 'transparent' }}
                        title="Word Document Viewer"
                    ></iframe>
                    {url}
                </div>
            );
        default:
            return <p>Unsupported file type</p>;
    }
};

export default renderFile