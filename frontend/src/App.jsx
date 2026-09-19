import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import Suppliers from './pages/Suppliers';
import Warehouses from './pages/Warehouses';
import Requests from './pages/Requests';
import StockMovements from './pages/StockMovements';
import Production from './pages/Production';
import Login from './pages/Login';
import AdminUsers from './pages/AdminUsers';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="items" element={<Items />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="requests" element={<Requests />} />
          <Route path="stock" element={<StockMovements />} />
          <Route path="production" element={<Production />} />
          <Route path="admin/users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}