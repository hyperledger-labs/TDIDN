import CreateInvitation from './components/CreateInvitation';
import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoutes';
import Authentication from './pages/Authentication'
import VerifyDID from './components/VerifyDID';
import Index from './pages/Index.js'
import { Toaster } from 'sonner'
import React from 'react'

const App = () => {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/signup" element={<Authentication />} />
        <Route path="/signin" element={<Authentication />} />
        <Route element={<PrivateRoute />}>
          <Route path="/verifyDID" element={<VerifyDID />} />
          <Route path="/createInvitation" element={<CreateInvitation />} />
          <Route path="/*" element={<Index />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
