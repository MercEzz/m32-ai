import { Routes, Route } from "react-router-dom";
import Authentication from "./screens/Authentication";
import Dashboard from "./screens/Dashboard";

function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Routes>
          <Route path="/" element={<Authentication />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
