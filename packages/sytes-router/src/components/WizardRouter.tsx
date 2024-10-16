import React from 'react';

import { Route, Routes } from 'react-router-dom';
import Navigate from './Navigate';

export default function WizardRouter() {
    console.log('WizardRouter');

    return (
        <Routes>
            <Route path='/' element={<Navigate to='edit-wedding-info' />} />
            <Route path='/contact' element={<Navigate to='edit-contact' />} />
            <Route path='/customer' element={<Navigate to='edit-customer' />} />
            <Route path='/overview' element={<Navigate to='purchase-overview' />} />
            <Route path='/result' element={<Navigate to='payment-result' />} />
        </Routes>
    );
}
