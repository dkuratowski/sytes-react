import React from 'react';
import FSMArray from './FSMArray';

export const GoTo = ({state}) => <FSMArray.Transition transition={(target, transition) => state} />;
