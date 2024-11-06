// import MainRoute from './Route/MainRoute';
import './App.css';
import AuthProvider from './Context/AuthProvider';
import Layouts from './components/Layout/Layout';

function App() {
  return (
    <div className="App">
    <AuthProvider>
      <Layouts />
    </AuthProvider>
    </div>
  );
}

export default App;
