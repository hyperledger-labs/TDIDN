import VerifyDIDCallback from './components/VerifyDIDCallback';
import VerifySimCard from './components/VerifySimCard';
import PrivateRoute from './components/PrivateRoutes';
import IssueSimCard from './components/IssueSimCard'
import Authentication from './pages/Authentication'
import { Routes, Route } from 'react-router-dom'
import Index from './pages/Index.js'
import { Toaster } from 'sonner'
import React from 'react'

const App = () => {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<Authentication />} />
        <Route path="/verifyDIDCallback" element={<VerifyDIDCallback />} />
        <Route element={<PrivateRoute />}>
          <Route path="/issueSimCard" element={<IssueSimCard />} />
          <Route path="/verifySimCard" element={<VerifySimCard />} />
          <Route path="/*" element={<Index />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
