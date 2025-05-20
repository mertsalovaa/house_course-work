import { useEffect, useState } from 'react';
import Loader from './components/loader';
import styled from 'styled-components';
import connection from './signalRService';
import { Navigate, Route, Routes } from 'react-router-dom';
import SignIn from './pages/auth/sign-in';
import MainLayout from './components/layout/main-layout';
import DevicesTest from './pages/profile/devices';
import SignUp from './pages/auth/sign-up';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/sign-in" replace={true} />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/devices" element={<DevicesTest />} />
        {/* <Route
        path={`${langPathOptional}/skin-analysis`}
        element={<SkinAnalysis />}
      />
      <Route path={`${langPathOptional}/contact-us`} element={<ContactUs />} /> */}
      </Routes>
  );
}

export default App;


//-		All	{Microsoft.AspNetCore.SignalR.Internal.AllClientProxy<House.API.hubs.PairingHub>}	Microsoft.AspNetCore.SignalR.IClientProxy {Microsoft.AspNetCore.SignalR.Internal.AllClientProxy<House.API.hubs.PairingHub>}
