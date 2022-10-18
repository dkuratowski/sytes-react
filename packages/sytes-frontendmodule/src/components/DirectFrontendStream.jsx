import React from 'react';
import FrontendStream from './FrontendStream';

function DirectFrontendStream({name, map, inputNames, inputMaps, outputNames, outputMaps}) {
    const entryPipes = inputNames.map(inputName => {
        if (inputMaps && inputMaps[inputName]) {
            return (
                <FrontendStream.Pipe>
                    <FrontendStream.Entry name={inputName} />
                    <FrontendStream.Map project={inputMaps[inputName]} />
                </FrontendStream.Pipe>
            );
        }
        else {
            return (
                <FrontendStream.Pipe>
                    <FrontendStream.Entry name={inputName} />
                </FrontendStream.Pipe>
            );
        }
    });

    const exitPipes = outputNames.map(outputName => {
        if (outputMaps && outputMaps[outputName]) {
            return (
                <FrontendStream.Pipe>
                    <FrontendStream.Entry />
                    <FrontendStream.Map project={outputMaps[outputName]} />
                    <FrontendStream.Exit name={outputName} />
                </FrontendStream.Pipe>
            );
        }
        else {
            return (
                <FrontendStream.Pipe>
                    <FrontendStream.Entry />
                    <FrontendStream.Exit name={outputName} />
                </FrontendStream.Pipe>
            );
        }
    });

    if (map) {
        return (
            <FrontendStream name={name}>
                <FrontendStream.Pipe>
                    <FrontendStream.Merge>
                        {entryPipes}
                    </FrontendStream.Merge>
                    <FrontendStream.Map project={map} />
                    <FrontendStream.Exit>
                        {exitPipes}
                    </FrontendStream.Exit>
                </FrontendStream.Pipe>        
            </FrontendStream>
        );
    }
    else {
        return (
            <FrontendStream name={name}>
                <FrontendStream.Pipe>
                    <FrontendStream.Merge>
                        {entryPipes}
                    </FrontendStream.Merge>
                    <FrontendStream.Exit>
                        {exitPipes}
                    </FrontendStream.Exit>
                </FrontendStream.Pipe>        
            </FrontendStream>
        );
    }
}

export default DirectFrontendStream;