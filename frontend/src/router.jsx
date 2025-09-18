import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import App from './App';
import VennSupport from './pages/VennSupport';
import Installer from './pages/Installer';
import Warehouse from './pages/Warehouse';
import Customer from './pages/Customer';
import VennLayout from './VennLayout';
import AdminDBPage from './pages/AdminDBPage';


// Wrapper to extract code from URL and pass as prop
function WithCodePage(PageComponent) {
  return function Wrapper(props) {
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code') || '';
    return <PageComponent code={code} {...props} />;
  };
}

export default function Router() {
  const AppWithCode = WithCodePage(App);
  const VennSupportWithCode = WithCodePage(VennSupport);
  const InstallerWithCode = WithCodePage(Installer);
  const WarehouseWithCode = WithCodePage(Warehouse);
  const CustomerWithCode = WithCodePage(Customer);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VennLayout><AppWithCode /></VennLayout>} />
        <Route path="/support" element={<VennLayout><VennSupportWithCode /></VennLayout>} />
        <Route path="/installer" element={<VennLayout><InstallerWithCode /></VennLayout>} />
        <Route path="/warehouse" element={<VennLayout><WarehouseWithCode /></VennLayout>} />
        <Route path="/customer" element={<VennLayout><CustomerWithCode /></VennLayout>} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/admin-db" element={<VennLayout><AdminDBPage /></VennLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
