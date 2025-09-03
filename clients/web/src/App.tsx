import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import IssueManagement from './pages/IssueManagement'
// import MapView from './pages/MapView'
import TechnicianManagement from './pages/TechnicianManagement'
import IssueDetails from './pages/IssueDetails'
import { AuthProvider } from './context/AuthContext'
import { IssueProvider } from './context/IssueContext'
import { WorkerProvider } from './context/WorkerContext'
import './App.css'

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
  components: {
    Container: {
      baseStyle: {
        maxW: 'container.xl',
      },
    },
  },
})

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <IssueProvider>
          <WorkerProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/issues" element={<IssueManagement />} />
                  <Route path="/issues/:id" element={<IssueDetails />} />
                  {/* <Route path="/map" element={<MapView />} /> */}
                  <Route path="/technicians" element={<TechnicianManagement />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </WorkerProvider>
        </IssueProvider>
      </AuthProvider>
    </ChakraProvider>
  )
}

export default App
