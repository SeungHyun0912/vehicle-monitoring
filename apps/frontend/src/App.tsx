import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './services/graphql/client';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import VehicleAdmin from './pages/VehicleAdmin';

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/admin" element={<VehicleAdmin />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
