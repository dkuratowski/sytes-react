import React from 'react';
import FrontendStream from './FrontendStream';

function DirectFrontendStream({name, map, inputName, outputName}) {
    if (map) {
        return (
            <FrontendStream name={name}>
                <FrontendStream.Pipe>
                    <FrontendStream.Entry name={inputName} />
                    <FrontendStream.Map project={([...inputs]) => map(...inputs)} />
                    <FrontendStream.Exit name={outputName} />
                </FrontendStream.Pipe>
            </FrontendStream>
        );
    }
    else {
        return (
            <FrontendStream name={name}>
                <FrontendStream.Pipe>
                    <FrontendStream.Entry name={inputName} />
                    <FrontendStream.Exit name={outputName} />
                </FrontendStream.Pipe>
            </FrontendStream>
        );
    }
}

export default DirectFrontendStream;