import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import SignIn from './pages/auth/sign-in';
import Devices from './pages/user/devices';
import SignUp from './pages/auth/sign-up';
import DeviceDetails from './pages/user/device-detail';
import NotFoundPage from './pages/404';
import ModalWindow from './components/elements/modal-window';
import { SubHeadline1 } from './components/typography';
import { useState } from 'react';
import { PrivateRoute } from './private-route';
import MainUserPage from './pages/user/main';

function App() {
  const [modalText, setModalText] = useState('');
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-in" replace={true} />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route
          path="/user"
          element={
            <PrivateRoute setModalText={setModalText}>
              <Outlet />
            </PrivateRoute>
          }
        >
          <Route index element={<Devices />} />
          <Route path='main' element={<MainUserPage />} />
          <Route path='devices' >
            <Route index element={<Devices />} />
            <Route path=":id" element={<DeviceDetails />} />
          </Route>
        </Route>
      </Routes>
      <ModalWindow show={modalText !== ''} isImportant={true} onClose={() => setModalText("")} autoClose={null}>
        <SubHeadline1>{modalText}</SubHeadline1>
      </ModalWindow>
    </>
  );
}

export default App;