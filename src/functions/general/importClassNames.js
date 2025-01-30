export default function importClassNames(){
    return (
        {
            "borders1": { "borderRadius": "0.5em" },
            "borders2": { "borderRadius": "0.3em" },
            "color1": { "background": "#f0ece1" },
            "color2": { "background": "#3c3c3a" },
            "color3": { "background": "#4ea72e" },
            "color4": { "background": "#0f9ed5" },
            "color5": { "background": "#f4f5f5" },
            "colorTranparencia": { "background": "#771212d0" },
            "colorLetra1": { "color": "#ffffff" },
            "transparencia": { "backgroundColor": "#00000041" },
            "width100": { "width": "100%" },
            "block": { "display": "block" },
            "maxWidth400": { "maxWidth": "400px" },
            "borderNone": { "border": "none" },
            "verticalCenter": { "display": "flex", "justifyContent": "center", "alignItems": "center", "height": "100vh" },
            "horizontalCenter": { "display": "flex", "justifyContent": "center", "alignItems": "center", "height": "90.25vh" },
            "fixSpace": { "boxSizing": "border-box", "maxWidth": "50vw", "maxHeight": "50vh" },
            "halfLengthHorizontalAvailable": { "boxSizing": "border-box", "maxWidth": "50vw", "maxHeight": "50vh" },
            "quarterLengthOfAvailableVerticalSpace": { "boxSizing": "border-box", "maxWidth": "25vw", "maxHeight": "25vh" },
            "responsiveContainer": { "display": "flex", "flexWrap": "wrap", "justifyContent": "center" },
            "halfHeightScreen": { "height": "6vh" },
            "@media (max-width: 1000px)": {
                ".responsiveContainer": { "flexDirection": "column" },
                ".fixSpace": { "boxSizing": "border-box", "maxWidth": "100%", "maxHeight": "100%" },
                ".halfLengthHorizontalAvailable": { "boxSizing": "border-box", "maxWidth": "100%", "maxHeight": "100%" },
                ".quarterLengthOfAvailableVerticalSpace": { "boxSizing": "border-box", "maxWidth": "100%" }
            },
            "equalSpace": { "display": "flex", "justifyContent": "space-around" },
            "center": { "display": "flex", "justifyContent": "center", "alignItems": "center" },
            "rotate": { "transition": "transform 0.5s ease" },
            "rotate:hover": { "transform": "rotate(180deg)" },
            "margin1": { "margin": "20px" },
            "marginTop1": { "marginTop": "20px" },
            "marginRight1": { "marginRight": "20px" },
            "marginLeft1": { "marginLeft": "20px" },
            "marginBottom1": { "marginBottom": "20px" },
            "margin2": { "margin": "40px" },
            "marginTop2": { "marginTop": "40px" },
            "marginRight2": { "marginRight": "40px" },
            "marginLeft2": { "marginLeft": "40px" },
            "marginBottom2": { "marginBottom": "40px" },
            "padding1": { "padding": "10px" },
            "buttonImage": { "maxWidth": "100%", "maxHeight": "100%", "width": "auto", "height": "auto" },
            "boxShadow1": { "boxShadow": "0 0 10px rgba(0,0,0,0.1)" },
            "scroll": { "overflowX": "auto", "overflowY": "auto", "scrollbarWidth": "none", "-msOverflowStyle": "none", "padding": "10px" },
            ".scroll::-webkit-scrollbar": { "width": "8px", "height": "8px" }, 
            ".scroll::-webkit-scrollbar-track": { "background": "rgba(0,0,0,0.1)" }, 
            ".scroll::-webkit-scrollbar-thumb": { "backgroundColor": "rgba(0,0,0,0.5)", "borderRadius": "10px" },
            "cursor": { "cursor": "pointer" },
            "@keyframes pulse": {
                "0%, 100%": { "transform": "scale(1)" },
                "50%": { "transform": "scale(1.1)" }
            },
            "hoverBounce": { "display": "inline-block", "transition": "transform 2s ease" },
            "hoverBounce:hover": { "animation": "pulse 2s infinite" },
            'transition': {
                'transition': 'height 0.5s ease, width 0.5s ease; overflow: hidden;'
            }
        }
    )
}





  





/*export default function importClassNames(){//debe ser dinamico, no he encontrado como
    const classNames = [
        'borders1',
        'borders2',
        'color1',
        'color2',
        'color3',
        'color4',
        'color5',
        'colorTranparencia',
        'colorLetra1',
        'transparencia',
        'width100',
        'block',
        'maxWidth400',
        'borderNone',
        'verticalCenter',
        'horizontalCenter',
        'fixSpace',
        'halfLengthHorizontalAvailable',
        'quarterLengthOfAvailableVerticalSpace',
        'responsiveContainer',
        'halfHeightScreen',
        'equalSpace',
        'center',
        'rotate',
        'margin1',
        'marginTop1',
        'marginRight1',
        'marginLeft1',
        'marginBottom1',
        'margin2',
        'marginTop2',
        'marginRight2',
        'marginLeft2',
        'marginBottom2',
        'padding1',
        'buttonImage',
        'boxShadow1',
        'scroll',
        'cursor',
        'hoverBounce'
    ];

    return classNames
}*/