import React from 'react';
import FSMArray from './FSMArray';

export const HandleTransition = ({handler}) => <FSMArray.Action action={(target, transition) => { handler(transition); }}/>;